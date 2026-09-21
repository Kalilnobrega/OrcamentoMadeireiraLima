from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, model_validator


class UnidadeMedida(str, Enum):
    METRO = "m"
    KG = "kg"
    UNIDADE = "un"


class ItemOrcamentoEntrada(BaseModel):
    descricao: str = Field(min_length=1)
    unidade: UnidadeMedida
    quantidade: float = Field(gt=0)
    medida_m: Optional[float] = Field(default=None, gt=0)
    valor: float = Field(gt=0)

    @model_validator(mode="after")
    def _validar_medida(self):
        if self.unidade == UnidadeMedida.METRO and not self.medida_m:
            raise ValueError("Informe o comprimento (m) para itens vendidos por metro.")
        return self


class OrcamentoEntrada(BaseModel):
    cliente: Optional[str] = None
    desconto_percentual: Optional[float] = Field(default=None, ge=0, le=100)
    desconto_valor: Optional[float] = Field(default=None, ge=0)
    itens: List[ItemOrcamentoEntrada]


class ItemOrcamentoSaida(BaseModel):
    descricao: str
    unidade: UnidadeMedida
    quantidade: float
    medida_m: Optional[float]
    valor: float
    valor_unitario: float
    quantidade_total: float
    subtotal: float


class OrcamentoSaida(BaseModel):
    cliente: Optional[str]
    itens: List[ItemOrcamentoSaida]
    subtotal_geral: float
    desconto_aplicado: float
    desconto_percentual: float
    total_final: float
    texto_whatsapp: str
