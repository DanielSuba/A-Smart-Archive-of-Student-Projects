from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

_BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(_BACKEND_DIR.parent / ".env")
load_dotenv(_BACKEND_DIR / ".env")


# Funkcja sluzy do uruchamiania zadan startowych aplikacji i inicjalizacji bazy.
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB."""
    try:
        from database import init_db
        init_db()
    except Exception as e:
        logger.error(f"Blad inicjalizacji DB: {e}")

    yield  # app is running


app = FastAPI(
    title="Inteligentne Archiwum Projektow Studenta",
    description="System zarzadzania archiwum prac projektowych z analiza technologii",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers.auth import router as auth_router
from routers.projects import router as projects_router
from routers.portfolio import profile_router, portfolio_router
from routers.technologies import router as tech_router

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(profile_router)
app.include_router(portfolio_router)
app.include_router(tech_router)

_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(_UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=_UPLOAD_DIR), name="uploads")


# Funkcja sluzy do zwracania statusu dzialania API.
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Archiwum Projektow"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
