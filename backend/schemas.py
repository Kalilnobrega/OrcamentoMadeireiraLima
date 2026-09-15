from typing import List, Optional

from pydantic import BaseModel, Field


class ItemOrcamentoEntrada(BaseModel):
    descricao: str = Field(min_length=1)
    quantidade: float = Field(gt=0)
    medidas_m: float = Field(gt=0)
    valor_metro: float = Field(gt=0)


class OrcamentoEntrada(BaseModel):
    cliente: Optional[str] = None
    desconto_percentual: Optional[float] = Field(default=None, ge=0, le=100)
    desconto_valor: Optional[float] = Field(default=None, ge=0)
    itens: List[ItemOrcamentoEntrada]


class ItemOrcamentoSaida(BaseModel):
    descricao: str
    quantidade: float
    medidas_m: float
    valor_metro: float
    valor_unitario: float
    metros_totais: float
    subtotal: float


class OrcamentoSaida(BaseModel):
    cliente: Optional[str]
    itens: List[ItemOrcamentoSaida]
    subtotal_geral: float
    desconto_aplicado: float
    desconto_percentual: float
    total_final: float
    texto_whatsapp: str
