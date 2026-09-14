const corpoTabela = document.getElementById("corpo-tabela");
const template = document.getElementById("template-linha-item");
const btnAddItem = document.getElementById("btn-add-item");
const btnCalcular = document.getElementById("btn-calcular");
const btnCopiar = document.getElementById("btn-copiar");
const btnWhatsapp = document.getElementById("btn-whatsapp");
const resultado = document.getElementById("resultado");
const resumoValores = document.getElementById("resumo-valores");
const textoResultado = document.getElementById("texto-resultado");

let madeiras = [];

async function carregarMadeiras() {
  const resp = await fetch("/api/madeiras?apenas_ativas=true");
  madeiras = await resp.json();
  if (madeiras.length === 0) {
    alert("Nenhuma madeira cadastrada ainda. Acesse 'Cadastrar madeiras' para adicionar os tipos e preços.");
  }
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function rotuloMadeira(m) {
  const bitola = `${m.largura_cm}x${m.espessura_cm}`;
  return `${m.nome} ${bitola} - normal ${formatarMoeda(m.preco_metro_normal)}/m | aparelhada ${formatarMoeda(m.preco_metro_aparelhado)}/m`;
}

function preencherSelectMadeira(select) {
  select.innerHTML = "";
  madeiras.forEach((m) => {
    const option = document.createElement("option");
    option.value = m.id;
    option.textContent = rotuloMadeira(m);
    select.appendChild(option);
  });
}

function adicionarLinha() {
  const clone = template.content.cloneNode(true);
  const select = clone.querySelector(".input-madeira");
  preencherSelectMadeira(select);

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
    const madeiraId = parseInt(linha.querySelector(".input-madeira").value, 10);
    const comprimento = parseFloat(linha.querySelector(".input-comprimento").value);
    const aparelhado = linha.querySelector(".input-aparelhado").checked;

    if (!quantidade || !madeiraId || !comprimento) {
      return;
    }

    itens.push({
      madeira_id: madeiraId,
      quantidade,
      comprimento_m: comprimento,
      aparelhado,
    });
  });

  return itens;
}

async function calcularOrcamento() {
  const itens = coletarItens();

  if (itens.length === 0) {
    alert("Preencha ao menos um item completo (quantidade, peça e comprimento).");
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
    document.execCommand("copy");
  }
});

(async function init() {
  await carregarMadeiras();
  adicionarLinha();
})();
