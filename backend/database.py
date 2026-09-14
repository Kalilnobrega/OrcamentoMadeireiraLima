from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "orcamento.db"

engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from . import models

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(models.Madeira).count() == 0:
            db.add_all(
                [
                    models.Madeira(nome="Massaranduba", largura_cm=11, espessura_cm=5, preco_metro_normal=40.00, preco_metro_aparelhado=50.00),
                    models.Madeira(nome="Mista", largura_cm=11, espessura_cm=6, preco_metro_normal=25.00, preco_metro_aparelhado=31.50),
                    models.Madeira(nome="Mista", largura_cm=14, espessura_cm=6, preco_metro_normal=32.00, preco_metro_aparelhado=40.00),
                    models.Madeira(nome="Mista", largura_cm=19, espessura_cm=6, preco_metro_normal=50.00, preco_metro_aparelhado=62.50),
                ]
            )
            db.commit()
    finally:
        db.close()
