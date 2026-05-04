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
    year: int
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