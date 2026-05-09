from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid, io
from typing import Optional

from database import get_db, User, Project, Portfolio, PortfolioProject
from auth import require_auth, get_current_user
from schemas import SkillProfileOut, UserOut, PortfolioCreate, PortfolioOut
from services.skill_builder import build_skill_profile

profile_router = APIRouter(prefix="/api/profile", tags=["profile"])
portfolio_router = APIRouter(prefix="/api/portfolios", tags=["portfolios"])


# Funkcja służy do zwracania profilu kompetencji aktualnego użytkownika.
@profile_router.get("", response_model=SkillProfileOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    data = build_skill_profile(current_user.id, db)
    return SkillProfileOut(
        user=UserOut.model_validate(current_user),
        **data,
    )


# Funkcja służy do zwracania profilu kompetencji wybranego użytkownika.
@profile_router.get("/{user_id}", response_model=SkillProfileOut)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie istnieje")
    data = build_skill_profile(user_id, db)
    return SkillProfileOut(
        user=UserOut.model_validate(user),
        **data,
    )


# Funkcja służy do tworzenia portfolio z wybranych projektów.
@portfolio_router.post("", response_model=PortfolioOut)
def create_portfolio(
    data: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    if not data.project_ids:
        raise HTTPException(status_code=400, detail="Wybierz co najmniej jeden projekt")

    slug = str(uuid.uuid4())[:12]
    portfolio = Portfolio(
        user_id=current_user.id,
        public_slug=slug,
        title=data.title,
        description=data.description,
    )
    db.add(portfolio)
    db.flush()

    for idx, pid in enumerate(data.project_ids):
        proj = db.query(Project).filter(Project.id == pid).first()
        if not proj:
            continue
        pp = PortfolioProject(portfolio_id=portfolio.id, project_id=pid, order_index=idx)
        db.add(pp)

    db.commit()
    db.refresh(portfolio)
    return _portfolio_out(portfolio, db)


# Funkcja służy do pobierania portfolio aktualnego użytkownika.
@portfolio_router.get("/my", response_model=list)
def my_portfolios(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    portfolios = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()
    return [_portfolio_out(p, db) for p in portfolios]


# Funkcja służy do pobierania publicznego portfolio po slugu.
@portfolio_router.get("/{slug}", response_model=PortfolioOut)
def get_portfolio(slug: str, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.public_slug == slug).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio nie istnieje")
    return _portfolio_out(portfolio, db)


# Funkcja służy do usuwania portfolio użytkownika.
@portfolio_router.delete("/{portfolio_id}")
def delete_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio nie istnieje")
    if portfolio.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Brak dostępu")
    db.delete(portfolio)
    db.commit()
    return {"message": "Portfolio usunięte"}


# Funkcja służy do składania danych portfolio do odpowiedzi API.
def _portfolio_out(portfolio: Portfolio, db: Session) -> dict:
    from routers.projects import _build_project_out
    items = []
    for pp in sorted(portfolio.projects, key=lambda x: x.order_index):
        proj = db.query(Project).filter(Project.id == pp.project_id).first()
        if proj:
            items.append({
                "id": pp.id,
                "order_index": pp.order_index,
                "project": _build_project_out(proj, db).model_dump(),
            })
    return {
        "id": portfolio.id,
        "user_id": portfolio.user_id,
        "public_slug": portfolio.public_slug,
        "title": portfolio.title,
        "description": portfolio.description,
        "created_at": portfolio.created_at,
        "owner": UserOut.model_validate(portfolio.owner).model_dump(),
        "projects": items,
    }
