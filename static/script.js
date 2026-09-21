const corpoTabela = document.getElementById("corpo-tabela");
const template = document.getElementById("template-linha-item");
const btnAddItem = document.getElementById("btn-add-item");
const btnCalcular = document.getElementById("btn-calcular");
const btnCopiar = document.getElementById("btn-copiar");
const btnWhatsapp = document.getElementById("btn-whatsapp");
const resultado = document.getElementById("resultado");
const resumoValores = document.getElementById("resumo-valores");
const textoResultado = document.getElementById("texto-resultado");
const mensagemErro = document.getElementById("mensagem-erro");

const CONFIG_UNIDADE = {
  m: { qtdPlaceholder: "1", qtdLabel: "Qtd (peças)", valorPlaceholder: "40,00", mostraMedida: true },
  kg: { qtdPlaceholder: "5,00", qtdLabel: "Peso (kg)", valorPlaceholder: "12,00", mostraMedida: false },
  un: { qtdPlaceholder: "10", qtdLabel: "Qtd (un)", valorPlaceholder: "8,50", mostraMedida: false },
};

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mostrarErro(texto) {
  mensagemErro.textContent = texto;
  mensagemErro.hidden = false;
}

function limparErro() {
  mensagemErro.hidden = true;
  mensagemErro.textContent = "";
}

function atualizarLinhaPorUnidade(linha) {
  const unidade = linha.querySelector(".input-unidade").value;
  const config = CONFIG_UNIDADE[unidade];
  const inputMedida = linha.querySelector(".input-medida");
  const inputQtd = linha.querySelector(".input-qtd");
  const inputValor = linha.querySelector(".input-valor");

  inputMedida.disabled = !config.mostraMedida;
  inputMedida.placeholder = config.mostraMedida ? "3,00" : "não se aplica";
  if (!config.mostraMedida) {
    inputMedida.value = "";
    marcarCampo(inputMedida, true);
  }

  inputQtd.placeholder = config.qtdPlaceholder;
  inputQtd.title = config.qtdLabel;
  inputValor.placeholder = config.valorPlaceholder;
}

function adicionarLinha() {
  const clone = template.content.cloneNode(true);
  const linha = clone.querySelector("tr");

  linha.querySelector(".botao-remover").addEventListener("click", (e) => {
    e.target.closest("tr").remove();
  });

  linha.querySelector(".input-unidade").addEventListener("change", () => atualizarLinhaPorUnidade(linha));

  linha.querySelectorAll(".input-qtd, .input-descricao, .input-medida, .input-valor").forEach((input) => {
    input.addEventListener("input", () => input.classList.remove("campo-invalido"));
  });

  corpoTabela.appendChild(clone);
  atualizarLinhaPorUnidade(corpoTabela.lastElementChild);
}

btnAddItem.addEventListener("click", adicionarLinha);

function marcarCampo(input, valido) {
  input.classList.toggle("campo-invalido", !valido);
}

function coletarItens() {
  const linhas = corpoTabela.querySelectorAll("tr");
  const itens = [];
  let primeiroCampoInvalido = null;

  linhas.forEach((linha) => {
    const inputQtd = linha.querySelector(".input-qtd");
    const inputDescricao = linha.querySelector(".input-descricao");
    const inputMedida = linha.querySelector(".input-medida");
    const inputValor = linha.querySelector(".input-valor");
    const unidade = linha.querySelector(".input-unidade").value;

    const quantidade = parseFloat(inputQtd.value);
    const descricao = inputDescricao.value.trim();
    const medida = parseFloat(inputMedida.value);
    const valor = parseFloat(inputValor.value);

    const linhaVazia = !inputQtd.value && !descricao && !inputMedida.value && !inputValor.value;
    if (linhaVazia) {
      marcarCampo(inputQtd, true);
      marcarCampo(inputDescricao, true);
      marcarCampo(inputMedida, true);
      marcarCampo(inputValor, true);
      return;
    }

    const medidaValida = unidade !== "m" || Boolean(medida);
    marcarCampo(inputQtd, Boolean(quantidade));
    marcarCampo(inputDescricao, Boolean(descricao));
    marcarCampo(inputMedida, medidaValida);
    marcarCampo(inputValor, Boolean(valor));

    if (!quantidade || !descricao || !valor || !medidaValida) {
      if (!primeiroCampoInvalido) {
        primeiroCampoInvalido = !quantidade
          ? inputQtd
          : !descricao
          ? inputDescricao
          : !medidaValida
          ? inputMedida
          : inputValor;
      }
      return;
    }

    itens.push({
      quantidade,
      descricao,
      unidade,
      medida_m: unidade === "m" ? medida : null,
      valor,
    });
  });

  return { itens, primeiroCampoInvalido };
}

async function calcularOrcamento() {
  limparErro();
  const { itens, primeiroCampoInvalido } = coletarItens();

  if (itens.length === 0) {
    mostrarErro(
      "Preencha ao menos um item completo: quantidade, descrição e valor (e comprimento em metros para itens vendidos por metro). Os números cinza nos campos são apenas exemplos, não valores preenchidos."
    );
    if (primeiroCampoInvalido) {
      primeiroCampoInvalido.focus();
      primeiroCampoInvalido.scrollIntoView({ behavior: "smooth", block: "center" });
    }
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

  let resp;
  try {
    resp = await fetch("/api/orcamento/calcular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    mostrarErro("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    return;
  }

  if (!resp.ok) {
    const erro = await resp.json().catch(() => ({ detail: "Erro ao calcular orçamento." }));
    mostrarErro(erro.detail || "Erro ao calcular orçamento.");
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
