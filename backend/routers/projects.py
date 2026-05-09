from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import Optional, List
from datetime import datetime
import os, shutil, uuid, math

from database import get_db, User, Project, Technology, ProjectTechnology, UserRole
from auth import require_auth, get_current_user
from schemas import ProjectCreate, ProjectUpdate, ProjectOut, ProjectListOut, TechExtractionResult
from services.tech_extractor import extract_technologies
from services.difficulty_scorer import calculate_difficulty
from services.doc_ai_evaluator import evaluate_documentation
import json

router = APIRouter(prefix="/api/projects", tags=["projects"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _build_project_out(project: Project, db: Session) -> ProjectOut:
    tech_list = []
    for pt in project.technologies:
        tech = db.query(Technology).filter(Technology.id == pt.tech_id).first()
        if tech:
            tech_list.append({
                "id": tech.id,
                "name": tech.name,
                "category": tech.category,
                "confidence_level": pt.confidence_level,
                "bytes_count": pt.bytes_count,
            })
    return ProjectOut(
        id=project.id,
        user_id=project.user_id,
        title=project.title,
        description=project.description,
        year=project.year,
        role=project.role,
        repo_url=project.repo_url,
        doc_file_path=project.doc_file_path,
        difficulty_score=project.difficulty_score,
        difficulty_level=project.difficulty_level,
        has_cicd=project.has_cicd,
        github_repo_created_at=project.github_repo_created_at,
        github_last_commit_at=project.github_last_commit_at,
        github_stars=project.github_stars,
        github_file_count=project.github_file_count,
        ai_doc_status=project.ai_doc_status,
        ai_doc_evaluation=_json_or_none(project.ai_doc_evaluation),
        created_at=project.created_at,
        updated_at=project.updated_at,
        owner=project.owner,
        technologies=tech_list,
    )


async def _save_technologies(project: Project, extraction: dict, db: Session):
    """Save extracted technologies to DB."""
    db.query(ProjectTechnology).filter(ProjectTechnology.project_id == project.id).delete()

    for tech_data in extraction.get("technologies", []):
        tech_name = tech_data["name"]
        tech = db.query(Technology).filter(Technology.name == tech_name).first()
        if not tech:
            tech = Technology(name=tech_name, category=tech_data.get("category"))
            db.add(tech)
            db.flush()

        pt = ProjectTechnology(
            project_id=project.id,
            tech_id=tech.id,
            confidence_level=tech_data.get("confidence", 50.0),
            bytes_count=tech_data.get("bytes", 0),
        )
        db.add(pt)


@router.post("", response_model=ProjectOut)
async def create_project(
    title: str = Form(...),
    description: str = Form(...),
    year: Optional[int] = Form(None),
    role: str = Form(...),
    repo_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    if not repo_url or not repo_url.strip():
        raise HTTPException(status_code=400, detail="Musisz podać link do repozytorium")

    # Save uploaded file
    file_path = None
    file_content = None
    file_type = None
    if file:
        ext = os.path.splitext(file.filename)[1]
        fname = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, fname)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        if file.filename.endswith(".json"):
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                file_content = f.read()
            file_type = "package.json"

    # Extract technologies
    extraction = await extract_technologies(
        repo_url=repo_url,
        file_content=file_content,
        file_type=file_type,
        description=description,
    )

    github_meta = extraction.get("github", {})
    repo_created_at = _parse_github_datetime(github_meta.get("repo_created_at"))
    last_commit_at = _parse_github_datetime(github_meta.get("last_commit_at"))

    # Create project record
    project = Project(
        user_id=current_user.id,
        title=title,
        description=description,
        year=year or (last_commit_at.year if last_commit_at else datetime.utcnow().year),
        role=role,
        repo_url=repo_url,
        doc_file_path=file_path,
        github_repo_created_at=repo_created_at,
        github_last_commit_at=last_commit_at,
        github_stars=github_meta.get("stars"),
        github_file_count=github_meta.get("file_count"),
    )
    db.add(project)
    db.flush()

    # Save technologies
    await _save_technologies(project, extraction, db)

    # Calculate difficulty
    tech_list = extraction.get("technologies", [])
    diff = calculate_difficulty(tech_list, description, extraction.get("has_cicd", False), repo_url)
    project.difficulty_score = diff["score"]
    project.difficulty_level = diff["level"]
    project.has_cicd = extraction.get("has_cicd", False)
    await _evaluate_project_documentation(project)

    db.commit()
    db.refresh(project)
    return _build_project_out(project, db)


@router.get("", response_model=ProjectListOut)
def list_projects(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    search: Optional[str] = Query(None),
    technology: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    difficulty: Optional[str] = Query(None),
    mine: Optional[bool] = Query(False),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    query = db.query(Project).options(joinedload(Project.owner))

    if mine and current_user:
        query = query.filter(Project.user_id == current_user.id)

    if search:
        query = query.filter(
            or_(
                Project.title.ilike(f"%{search}%"),
                Project.description.ilike(f"%{search}%"),
            )
        )

    if year:
        query = query.filter(Project.year == year)

    if difficulty:
        query = query.filter(Project.difficulty_level == difficulty)

    if technology:
        query = (
            query.join(ProjectTechnology, Project.id == ProjectTechnology.project_id)
            .join(Technology, ProjectTechnology.tech_id == Technology.id)
            .filter(Technology.name.ilike(f"%{technology}%"))
        )

    total = query.count()
    items = query.order_by(Project.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    pages = math.ceil(total / per_page) if per_page else 1

    return ProjectListOut(
        items=[_build_project_out(p, db) for p in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/my", response_model=ProjectListOut)
def my_projects(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    query = db.query(Project).filter(Project.user_id == current_user.id)
    total = query.count()
    items = query.order_by(Project.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    pages = math.ceil(total / per_page) if per_page else 1

    return ProjectListOut(
        items=[_build_project_out(p, db) for p in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projekt nie istnieje")
    return _build_project_out(project, db)


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projekt nie istnieje")

    if project.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Brak dostępu")

    if data.title is not None:
        project.title = data.title
    if data.description is not None:
        project.description = data.description
    if data.year is not None:
        project.year = data.year
    if data.role is not None:
        project.role = data.role
    if data.repo_url is not None:
        project.repo_url = data.repo_url

    # Re-extract technologies if repo changed
    if data.repo_url:
        extraction = await extract_technologies(repo_url=data.repo_url, description=project.description)
        await _save_technologies(project, extraction, db)
        tech_list = extraction.get("technologies", [])
        diff = calculate_difficulty(tech_list, project.description, extraction.get("has_cicd", False), project.repo_url)
        project.difficulty_score = diff["score"]
        project.difficulty_level = diff["level"]
        project.has_cicd = extraction.get("has_cicd", False)
        _apply_github_metadata(project, extraction)

    db.commit()
    db.refresh(project)
    return _build_project_out(project, db)


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projekt nie istnieje")

    if project.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Brak dostępu")

    db.delete(project)
    db.commit()
    return {"message": "Projekt usunięty"}


@router.post("/{project_id}/analyze", response_model=TechExtractionResult)
async def analyze_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projekt nie istnieje")

    extraction = await extract_technologies(
        repo_url=project.repo_url,
        description=project.description,
    )
    await _save_technologies(project, extraction, db)

    tech_list = extraction.get("technologies", [])
    diff = calculate_difficulty(tech_list, project.description, extraction.get("has_cicd", False), project.repo_url)
    project.difficulty_score = diff["score"]
    project.difficulty_level = diff["level"]
    project.has_cicd = extraction.get("has_cicd", False)
    _apply_github_metadata(project, extraction)
    await _evaluate_project_documentation(project)

    db.commit()
    return TechExtractionResult(
        technologies=tech_list,
        source=extraction.get("source", "unknown"),
        has_cicd=extraction.get("has_cicd", False),
    )


def _parse_github_datetime(value: Optional[str]):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
    except ValueError:
        return None


def _apply_github_metadata(project: Project, extraction: dict):
    github_meta = extraction.get("github", {})
    project.github_repo_created_at = _parse_github_datetime(github_meta.get("repo_created_at"))
    project.github_last_commit_at = _parse_github_datetime(github_meta.get("last_commit_at"))
    project.github_stars = github_meta.get("stars")
    project.github_file_count = github_meta.get("file_count")
    if project.github_last_commit_at:
        project.year = project.github_last_commit_at.year


def _json_or_none(value: Optional[str]):
    if not value:
        return None
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        return None


async def _evaluate_project_documentation(project: Project):
    if not project.doc_file_path:
        project.ai_doc_status = "no_documentation"
        project.ai_doc_evaluation = None
        return

    status, evaluation = await evaluate_documentation(project.doc_file_path)
    project.ai_doc_status = status
    project.ai_doc_evaluation = json.dumps(evaluation, ensure_ascii=False) if evaluation else None
