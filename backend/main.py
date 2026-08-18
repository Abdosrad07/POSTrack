"""
Point d'entrée de l'API POSTrack.
Jour 1 : squelette minimal + endpoint /health pour valider la connexion DB en sync 17h30.
Les routers (auth, partenaires, dsm, pos, ...) seront branchés au fur et à mesure
des jours suivants dans app/api/.
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.api import auth, partenaires, dsm, bts, pos, primes, analytics, hierarchy

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API de gestion de la chaîne Partenaire → DSM → POS → Client",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Vérifie que l'API répond ET que la connexion MySQL fonctionne."""
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}


# --- Routers actifs (Jours 3 à 5) ---
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(partenaires.router, prefix="/api/partenaires", tags=["partenaires"])
app.include_router(dsm.router, prefix="/api/dsm", tags=["dsm"])
app.include_router(bts.router, prefix="/api/bts", tags=["bts"])
app.include_router(pos.router, prefix="/api/pos", tags=["pos"])
app.include_router(primes.router, prefix="/api/primes", tags=["primes"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(hierarchy.router, prefix="/api/hierarchy", tags=["hierarchy"])

# --- Routers à brancher au fil des jours suivants ---
# ...


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
