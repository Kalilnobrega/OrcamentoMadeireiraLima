from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from . import crud, schemas


def _formatar_moeda(valor: float) -> str:
    texto = f"{valor:,.2f}"
    texto = texto.replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {texto}"


def _formatar_numero(valor: float, casas: int = 2) -> str:
    texto = f"{valor:,.{casas}f}"
    texto = texto.replace(",", "X").replace(".", ",").replace("X", ".")
    return texto


def calcular_orcamento(db: Session, entrada: schemas.OrcamentoEntrada) -> schemas.OrcamentoSaida:
    if not entrada.itens:
        raise HTTPException(status_code=400, detail="Adicione ao menos um item ao orçamento.")

    itens_saida = []
    subtotal_geral = 0.0

    for item in entrada.itens:
        madeira = crud.get_madeira(db, item.madeira_id)
        if madeira is None:
            raise HTTPException(status_code=404, detail=f"Madeira id={item.madeira_id} não encontrada.")

        preco_metro = madeira.preco_metro_aparelhado if item.aparelhado else madeira.preco_metro_normal
        metros_totais = item.quantidade * item.comprimento_m
        subtotal_item = metros_totais * preco_metro
        subtotal_geral += subtotal_item

        itens_saida.append(
            schemas.ItemOrcamentoSaida(
                madeira_nome=madeira.nome,
                largura_cm=madeira.largura_cm,
                espessura_cm=madeira.espessura_cm,
                aparelhado=item.aparelhado,
                preco_metro=preco_metro,
                quantidade=item.quantidade,
                comprimento_m=item.comprimento_m,
                metros_totais=metros_totais,
                subtotal=subtotal_item,
            )
        )

    desconto_aplicado = 0.0
    desconto_percentual = 0.0
    if entrada.desconto_percentual:
        desconto_percentual = entrada.desconto_percentual
        desconto_aplicado = subtotal_geral * (desconto_percentual / 100)
    elif entrada.desconto_valor:
        desconto_aplicado = min(entrada.desconto_valor, subtotal_geral)
        desconto_percentual = (desconto_aplicado / subtotal_geral * 100) if subtotal_geral > 0 else 0.0

    total_final = subtotal_geral - desconto_aplicado

    texto_whatsapp = _montar_texto_whatsapp(
        entrada.cliente, itens_saida, subtotal_geral, desconto_aplicado, desconto_percentual, total_final
    )

    return schemas.OrcamentoSaida(
        cliente=entrada.cliente,
        itens=itens_saida,
        subtotal_geral=subtotal_geral,
        desconto_aplicado=desconto_aplicado,
        desconto_percentual=desconto_percentual,
        total_final=total_final,
        texto_whatsapp=texto_whatsapp,
    )


def _montar_texto_whatsapp(cliente, itens, subtotal_geral, desconto_aplicado, desconto_percentual, total_final) -> str:
    data_atual = datetime.now().strftime("%d/%m/%Y")
    linhas = ["*ORÇAMENTO - MADEIREIRA LIMA*", f"Data: {data_atual}"]

    if cliente:
        linhas.append(f"Cliente: {cliente}")

    linhas.append("")
    linhas.append("*Itens:*")

    for i, item in enumerate(itens, start=1):
        acabamento = "aparelhada" if item.aparelhado else "normal"
        bitola = f"{_formatar_numero(item.largura_cm, 0)}x{_formatar_numero(item.espessura_cm, 0)}"
        linhas.append(
            f"{i}. {item.madeira_nome} {bitola} ({acabamento}) - {_formatar_numero(item.quantidade, 0)} peça(s) "
            f"x {_formatar_numero(item.comprimento_m, 2)}m"
        )
        linhas.append(
            f"   {_formatar_numero(item.metros_totais)} m x {_formatar_moeda(item.preco_metro)}/m = "
            f"{_formatar_moeda(item.subtotal)}"
        )
        linhas.append("")

    linhas.append("")
    linhas.append(f"Subtotal: {_formatar_moeda(subtotal_geral)}")
    if desconto_aplicado > 0:
        linhas.append(
            f"Desconto: {_formatar_moeda(desconto_aplicado)} ({_formatar_numero(desconto_percentual, 1)}%)"
        )
    linhas.append(f"*Total: {_formatar_moeda(total_final)}*")

    return "\n".join(linhas)
