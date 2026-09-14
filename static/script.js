const corpoTabela = document.getElementById("corpo-tabela");
const template = document.getElementById("template-linha-item");
const btnAddItem = document.getElementById("btn-add-item");
const btnCalcular = document.getElementById("btn-calcular");
const btnCopiar = document.getElementById("btn-copiar");
const btnWhatsapp = document.getElementById("btn-whatsapp");
const resultado = document.getElementById("resultado");
const resumoValores = document.getElementById("resumo-valores");
const textoResultado = document.getElementById("texto-resultado");

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function adicionarLinha() {
  const clone = template.content.cloneNode(true);

  clone.querySelector(".botao-remover").addEventListener("click", (e) => {
    e.target.closest("tr").remove();
  });

  corpoTabela.appendChild(clone);
}

btnAddItem.addEventListener("click", adicionarLinha);

function coletarItens() {
  const linhas = corpoTabela.querySelectorAll("tr");
  const itens = [];

  linhas.forEach((linha) => {
    const quantidade = parseFloat(linha.querySelector(".input-qtd").value);
    const descricao = linha.querySelector(".input-descricao").value.trim();
    const medidas = parseFloat(linha.querySelector(".input-medidas").value);
    const valorMetro = parseFloat(linha.querySelector(".input-valor-metro").value);

    if (!quantidade || !descricao || !medidas || !valorMetro) {
      return;
    }

    itens.push({
      quantidade,
      descricao,
      medidas_m: medidas,
      valor_metro: valorMetro,
    });
  });

  return itens;
}

async function calcularOrcamento() {
  const itens = coletarItens();

  if (itens.length === 0) {
    alert("Preencha ao menos um item completo (quantidade, descrição, medidas e valor do metro).");
    return;
  }

  const cliente = document.getElementById("cliente").value.trim() || null;
  const descontoPercentualRaw = document.getElementById("desconto-percentual").value;
  const descontoValorRaw = document.getElementById("desconto-valor").value;

  const payload = {
    cliente,
    desconto_percentual: descontoPercentualRaw ? parseFloat(descontoPercentualRaw) : null,
    desconto_valor: descontoValorRaw ? parseFloat(descontoValorRaw) : null,
    itens,
  };

  const resp = await fetch("/api/orcamento/calcular", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const erro = await resp.json().catch(() => ({ detail: "Erro ao calcular orçamento." }));
    alert(erro.detail || "Erro ao calcular orçamento.");
    return;
  }

  const dados = await resp.json();
  exibirResultado(dados);
}

function exibirResultado(dados) {
  const percentual = dados.desconto_percentual.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  resumoValores.innerHTML = `
    <p>Subtotal: <strong>${formatarMoeda(dados.subtotal_geral)}</strong></p>
    <p>Desconto: <strong>${formatarMoeda(dados.desconto_aplicado)} (${percentual}%)</strong></p>
    <p>Total final: <strong>${formatarMoeda(dados.total_final)}</strong></p>
  `;

  textoResultado.value = dados.texto_whatsapp;
  btnWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(dados.texto_whatsapp)}`;

  resultado.hidden = false;
  resultado.scrollIntoView({ behavior: "smooth" });
}

btnCalcular.addEventListener("click", calcularOrcamento);

btnCopiar.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textoResultado.value);
    btnCopiar.textContent = "Copiado!";
    setTimeout(() => (btnCopiar.textContent = "Copiar texto"), 1500);
  } catch (e) {
    textoResultado.select();
  }
});

adicionarLinha();
