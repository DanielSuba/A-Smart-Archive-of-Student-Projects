from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db, User, UserRole
from auth import verify_password, get_password_hash, create_access_token, require_auth
from schemas import UserCreate, UserLogin, TokenOut, UserOut, ContactsUpdate

router = APIRouter(prefix="/api/auth", tags=["auth"])


# Funkcja służy do rejestrowania użytkownika i zwracania tokenu dostępu.
@router.post("/register", response_model=TokenOut)
def register(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email już istnieje w systemie")

    role = UserRole.ADMIN if data.role == "ADMIN" else UserRole.STUDENT
    user = User(
        email=data.email,
        name=data.name,
        password_hash=get_password_hash(data.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenOut(
        access_token=token,
        user=UserOut.model_validate(user)
    )


# Funkcja służy do logowania użytkownika i wydawania tokenu dostępu.
@router.post("/login", response_model=TokenOut)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Nieprawidłowy email lub hasło")

    token = create_access_token({"sub": str(user.id)})
    return TokenOut(
        access_token=token,
        user=UserOut.model_validate(user)
    )


# Funkcja służy do zwracania danych aktualnie zalogowanego użytkownika.
@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(require_auth)):
    return UserOut.model_validate(current_user)


# Funkcja służy do aktualizacji kontaktów (Facebook/Discord/GitHub/LinkedIn) zalogowanego użytkownika.
@router.put("/me/contacts", response_model=UserOut)
def update_my_contacts(
    data: ContactsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    if data.facebook is not None:
        current_user.facebook = data.facebook.strip() or None
    if data.discord is not None:
        current_user.discord = data.discord.strip() or None
    if data.github is not None:
        current_user.github = data.github.strip() or None
    if data.linkedin is not None:
        current_user.linkedin = data.linkedin.strip() or None
    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)
