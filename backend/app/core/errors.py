"""
Exceptions metier et gestionnaires d'erreurs centralises.

Toutes les regles metier de POSTrack (contexte Partenaire, transitions
POS, eligibilite des primes, import Excel...) levent une sous-classe de
AppError plutot qu'une HTTPException directe, afin de garder les
services independants de la couche HTTP.
"""
from fastapi import Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    status_code = 400

    def __init__(self, message: str, field: str | None = None):
        self.message = message
        self.field = field
        super().__init__(message)


class NotFoundError(AppError):
    status_code = 404


class ForbiddenError(AppError):
    status_code = 403


class ConflictError(AppError):
    status_code = 409


class ValidationErrorApp(AppError):
    status_code = 422


class UnauthorizedError(AppError):
    status_code = 401


async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "field": exc.field},
    )
