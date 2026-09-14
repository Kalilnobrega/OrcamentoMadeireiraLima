from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class MadeiraBase(BaseModel):
    nome: str = Field(min_length=1)
    largura_cm: float = Field(gt=0)
    espessura_cm: float = Field(gt=0)
    preco_metro_normal: float = Field(gt=0)
    preco_metro_aparelhado: float = Field(gt=0)


class MadeiraCreate(MadeiraBase):
    pass


class MadeiraUpdate(MadeiraBase):
    ativo: bool = True


class Madeira(MadeiraBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ativo: bool


class ItemOrcamentoEntrada(BaseModel):
    madeira_id: int
    quantidade: float = Field(gt=0)
    comprimento_m: float = Field(gt=0)
    aparelhado: bool = False


class OrcamentoEntrada(BaseModel):
    cliente: Optional[str] = None
    desconto_percentual: Optional[float] = Field(default=None, ge=0, le=100)
    desconto_valor: Optional[float] = Field(default=None, ge=0)
    itens: List[ItemOrcamentoEntrada]


class ItemOrcamentoSaida(BaseModel):
    madeira_nome: str
    largura_cm: float
    espessura_cm: float
    aparelhado: bool
    preco_metro: float
    quantidade: float
    comprimento_m: float
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
