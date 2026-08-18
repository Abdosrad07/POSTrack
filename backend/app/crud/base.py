"""
CRUD generique : operations de persistance simples et previsibles
(lecture par identifiant, liste paginee, creation technique, mise a
jour de champs autorises). Un CRUD ne decide jamais d'une regle
metier -- cela reste le role des services (voir app/services).
"""
from typing import Generic, TypeVar, Type
from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")


class CRUDBase(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: int) -> ModelType | None:
        return db.query(self.model).filter(self.model.id == id).first()

    def list(self, db: Session, skip: int = 0, limit: int = 100, **filters) -> list[ModelType]:
        query = db.query(self.model)
        for key, value in filters.items():
            if value is not None:
                query = query.filter(getattr(self.model, key) == value)
        return query.offset(skip).limit(limit).all()

    def list_paginated(self, db: Session, skip: int = 0, limit: int = 100, **filters) -> dict:
        """
        Comme list(), mais renvoie aussi le total et has_next, pour une
        pagination normalisee cote client (voir schemas.pagination.Page).
        """
        query = db.query(self.model)
        for key, value in filters.items():
            if value is not None:
                query = query.filter(getattr(self.model, key) == value)
        total = query.order_by(None).count()
        items = query.offset(skip).limit(limit).all()
        return {
            "items": items,
            "total": total,
            "skip": skip,
            "limit": limit,
            "has_next": skip + len(items) < total,
        }

    def create(self, db: Session, obj_in: dict) -> ModelType:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: ModelType, obj_in: dict) -> ModelType:
        for key, value in obj_in.items():
            if value is not None:
                setattr(db_obj, key, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, db_obj: ModelType) -> None:
        db.delete(db_obj)
        db.commit()
