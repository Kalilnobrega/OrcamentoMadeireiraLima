from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import models, schemas


def list_madeiras(db: Session, apenas_ativas: bool = False) -> List[models.Madeira]:
    query = db.query(models.Madeira)
    if apenas_ativas:
        query = query.filter(models.Madeira.ativo.is_(True))
    return query.order_by(models.Madeira.nome, models.Madeira.largura_cm, models.Madeira.espessura_cm).all()


def get_madeira(db: Session, madeira_id: int) -> Optional[models.Madeira]:
    return db.query(models.Madeira).filter(models.Madeira.id == madeira_id).first()


def create_madeira(db: Session, madeira: schemas.MadeiraCreate) -> models.Madeira:
    db_madeira = models.Madeira(**madeira.model_dump())
    db.add(db_madeira)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(db_madeira)
    return db_madeira


def update_madeira(db: Session, madeira_id: int, madeira: schemas.MadeiraUpdate) -> Optional[models.Madeira]:
    db_madeira = get_madeira(db, madeira_id)
    if db_madeira is None:
        return None

    for campo, valor in madeira.model_dump().items():
        setattr(db_madeira, campo, valor)

    db.commit()
    db.refresh(db_madeira)
    return db_madeira


def delete_madeira(db: Session, madeira_id: int) -> bool:
    db_madeira = get_madeira(db, madeira_id)
    if db_madeira is None:
        return False

    db.delete(db_madeira)
    db.commit()
    return True
