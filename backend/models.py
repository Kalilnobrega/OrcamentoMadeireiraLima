from sqlalchemy import Boolean, Column, Float, Integer, String, UniqueConstraint

from .database import Base


class Madeira(Base):
    __tablename__ = "madeiras"
    __table_args__ = (
        UniqueConstraint("nome", "largura_cm", "espessura_cm", name="uq_madeira_bitola"),
    )

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    largura_cm = Column(Float, nullable=False)
    espessura_cm = Column(Float, nullable=False)
    preco_metro_normal = Column(Float, nullable=False)
    preco_metro_aparelhado = Column(Float, nullable=False)
    ativo = Column(Boolean, nullable=False, default=True)
