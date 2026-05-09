from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
import re


class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    role: Optional[str] = "STUDENT"


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TechnologyOut(BaseModel):
    id: int
    name: str
    category: Optional[str]
    confidence_level: float
    bytes_count: int
    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    title: str
    description: str
    year: Optional[int] = None
    role: str
    repo_url: Optional[str] = None

    @field_validator("description")
    @classmethod
    def description_min_sentences(cls, v):
        sentences = [s.strip() for s in re.split(r'[.!?]+', v) if s.strip()]
        if len(sentences) < 3:
            raise ValueError("Opis musi zawierać co najmniej 3 zdania")
        return v

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v):
        if not v or len(v.strip()) < 3:
            raise ValueError("Tytuł musi mieć co najmniej 3 znaki")
        return v


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    year: Optional[int] = None
    role: Optional[str] = None
    repo_url: Optional[str] = None

    @field_validator("description")
    @classmethod
    def description_min_sentences(cls, v):
        if v is not None:
            sentences = [s.strip() for s in re.split(r'[.!?]+', v) if s.strip()]
            if len(sentences) < 3:
                raise ValueError("Opis musi zawierać co najmniej 3 zdania")
        return v


class ProjectOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    year: int
    role: str
    repo_url: Optional[str]
    doc_file_path: Optional[str]
    difficulty_score: float
    difficulty_level: str
    has_cicd: bool
    github_last_commit_at: Optional[datetime] = None
    github_stars: Optional[int] = None
    github_file_count: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    owner: Optional[UserOut]
    technologies: List[TechnologyOut] = []
    class Config:
        from_attributes = True


class ProjectListOut(BaseModel):
    items: List[ProjectOut]
    total: int
    page: int
    per_page: int
    pages: int


class PortfolioCreate(BaseModel):
    title: Optional[str] = "Moje Portfolio"
    description: Optional[str] = ""
    project_ids: List[int]


class PortfolioProjectOut(BaseModel):
    id: int
    order_index: int
    project: ProjectOut
    class Config:
        from_attributes = True


class PortfolioOut(BaseModel):
    id: int
    user_id: int
    public_slug: str
    title: Optional[str]
    description: Optional[str]
    created_at: datetime
    owner: UserOut
    projects: List[PortfolioProjectOut] = []
    class Config:
        from_attributes = True


class SkillProfileItem(BaseModel):
    technology: str
    category: Optional[str]
    weight: float
    project_count: int
    avg_difficulty: float


class SkillProfileOut(BaseModel):
    user: UserOut
    skills: List[SkillProfileItem]
    total_projects: int
    top_technologies: List[str]
    recommendations: List[str]


class TechExtractionResult(BaseModel):
    technologies: List[dict]
    source: str
    has_cicd: bool
