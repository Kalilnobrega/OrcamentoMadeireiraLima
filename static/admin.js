const cartaoLogin = document.getElementById("cartao-login");
const areaProtegida = document.getElementById("area-protegida");
const inputSenha = document.getElementById("senha-admin");
const btnEntrar = document.getElementById("btn-entrar");
const erroLogin = document.getElementById("erro-login");

const corpoTabelaMadeiras = document.getElementById("corpo-tabela-madeiras");
const inputId = document.getElementById("madeira-id");
const inputNome = document.getElementById("nome");
const inputLargura = document.getElementById("largura");
const inputEspessura = document.getElementById("espessura");
const inputPrecoNormal = document.getElementById("preco-normal");
const inputPrecoAparelhado = document.getElementById("preco-aparelhado");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const tituloForm = document.getElementById("titulo-form");

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function senhaSalva() {
  return sessionStorage.getItem("admin_password");
}

function headersAdmin() {
  return {
    "Content-Type": "application/json",
    "X-Admin-Password": senhaSalva() || "",
  };
}

async function tentarLogin(senha) {
  const resp = await fetch("/api/admin/verificar", {
    method: "POST",
    headers: { "X-Admin-Password": senha },
  });
  return resp.ok;
}

async function entrar() {
  const senha = inputSenha.value;
  if (!senha) {
    return;
  }

  const ok = await tentarLogin(senha);
  if (!ok) {
    erroLogin.hidden = false;
    return;
  }

  sessionStorage.setItem("admin_password", senha);
  erroLogin.hidden = true;
  mostrarAreaProtegida();
}

function mostrarAreaProtegida() {
  cartaoLogin.hidden = true;
  areaProtegida.hidden = false;
  carregarMadeiras();
}

function sessaoInvalida() {
  sessionStorage.removeItem("admin_password");
  areaProtegida.hidden = true;
  cartaoLogin.hidden = false;
  erroLogin.textContent = "Sessão expirada. Digite a senha novamente.";
  erroLogin.hidden = false;
}

btnEntrar.addEventListener("click", entrar);
inputSenha.addEventListener("keydown", (e) => {
  if (e.key === "Enter") entrar();
});

async function carregarMadeiras() {
  const resp = await fetch("/api/madeiras");
  const madeiras = await resp.json();
  renderizarTabela(madeiras);
}

function renderizarTabela(madeiras) {
  corpoTabelaMadeiras.innerHTML = "";

  madeiras.forEach((m) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.nome}</td>
      <td>${m.largura_cm}x${m.espessura_cm}</td>
      <td>${formatarMoeda(m.preco_metro_normal)}</td>
      <td>${formatarMoeda(m.preco_metro_aparelhado)}</td>
      <td>${m.ativo ? "Sim" : "Não"}</td>
      <td>
        <button type="button" class="botao secundario btn-editar">Editar</button>
        <button type="button" class="botao-remover btn-excluir" title="Excluir">✕</button>
      </td>
    `;

    tr.querySelector(".btn-editar").addEventListener("click", () => preencherFormulario(m));
    tr.querySelector(".btn-excluir").addEventListener("click", () => excluirMadeira(m.id));

    corpoTabelaMadeiras.appendChild(tr);
  });
}

function preencherFormulario(m) {
  inputId.value = m.id;
  inputNome.value = m.nome;
  inputLargura.value = m.largura_cm;
  inputEspessura.value = m.espessura_cm;
  inputPrecoNormal.value = m.preco_metro_normal;
  inputPrecoAparelhado.value = m.preco_metro_aparelhado;
  tituloForm.textContent = `Editando: ${m.nome} ${m.largura_cm}x${m.espessura_cm}`;
  btnCancelar.hidden = false;
}

function limparFormulario() {
  inputId.value = "";
  inputNome.value = "";
  inputLargura.value = "";
  inputEspessura.value = "";
  inputPrecoNormal.value = "";
  inputPrecoAparelhado.value = "";
  tituloForm.textContent = "Nova peça";
  btnCancelar.hidden = true;
}

btnCancelar.addEventListener("click", limparFormulario);

btnSalvar.addEventListener("click", async () => {
  const nome = inputNome.value.trim();
  const largura = parseFloat(inputLargura.value);
  const espessura = parseFloat(inputEspessura.value);
  const precoNormal = parseFloat(inputPrecoNormal.value);
  const precoAparelhado = parseFloat(inputPrecoAparelhado.value);
  const id = inputId.value;

  if (!nome || !largura || !espessura || !precoNormal || !precoAparelhado) {
    alert("Preencha nome, largura, espessura, preço normal e preço aparelhado.");
    return;
  }

  const payload = {
    nome,
    largura_cm: largura,
    espessura_cm: espessura,
    preco_metro_normal: precoNormal,
    preco_metro_aparelhado: precoAparelhado,
  };

  let resp;
  if (id) {
    resp = await fetch(`/api/madeiras/${id}`, {
      method: "PUT",
      headers: headersAdmin(),
      body: JSON.stringify({ ...payload, ativo: true }),
    });
  } else {
    resp = await fetch("/api/madeiras", {
      method: "POST",
      headers: headersAdmin(),
      body: JSON.stringify(payload),
    });
  }

  if (resp.status === 401) {
    sessaoInvalida();
    return;
  }

  if (!resp.ok) {
    const erro = await resp.json().catch(() => ({ detail: "Erro ao salvar peça." }));
    alert(erro.detail || "Erro ao salvar peça.");
    return;
  }

  limparFormulario();
  carregarMadeiras();
});

async function excluirMadeira(id) {
  if (!confirm("Tem certeza que deseja excluir esta peça?")) {
    return;
  }

  const resp = await fetch(`/api/madeiras/${id}`, {
    method: "DELETE",
    headers: headersAdmin(),
  });

  if (resp.status === 401) {
    sessaoInvalida();
    return;
  }

  if (!resp.ok) {
    alert("Erro ao excluir peça.");
    return;
  }

  carregarMadeiras();
}

(function init() {
  if (senhaSalva()) {
    mostrarAreaProtegida();
  }
})();
