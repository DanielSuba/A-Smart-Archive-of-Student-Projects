from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Technology

router = APIRouter(prefix="/api/technologies", tags=["technologies"])


# Funkcja służy do zwracania listy dostępnych technologii.
@router.get("")
def list_technologies(db: Session = Depends(get_db)):
    techs = db.query(Technology).order_by(Technology.name).all()
    return [{"id": t.id, "name": t.name, "category": t.category} for t in techs]
