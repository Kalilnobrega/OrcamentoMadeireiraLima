# Orçamento Madeireira Lima

Site simples para gerar orçamentos de madeira e enviar direto pelo WhatsApp.

## Funcionalidades

- Cadastro de peças (madeira + bitola) com **dois preços por metro linear**: normal e aparelhado.
- Orçamento com múltiplos itens: quantidade, peça, comprimento e um checkbox para alternar entre preço normal/aparelhado.
- Desconto por **percentual** ou por **valor fixo em R$** — o sistema sempre calcula e mostra os dois (o que você não digitar é calculado a partir do outro).
- Geração de texto formatado, pronto para copiar ou abrir direto no WhatsApp.
- Cadastro de peças protegido por senha (área `/admin`).

## Tecnologias

- **Backend:** Python + FastAPI + SQLAlchemy (ORM) + SQLite
- **Frontend:** HTML, CSS e JavaScript puros (sem framework)

## Estrutura do projeto

```
backend/
  main.py         # rotas da API e configuração do FastAPI
  database.py     # conexão com o banco (SQLAlchemy) e seed inicial
  models.py       # tabelas do banco (ORM)
  schemas.py      # formato dos dados de entrada/saída da API (Pydantic)
  crud.py         # operações de criar/ler/editar/excluir no banco
  orcamento.py    # cálculo do orçamento e montagem do texto do WhatsApp
  auth.py         # verificação da senha de administrador
static/
  index.html      # página de orçamento
  script.js
  admin.html      # página de cadastro de peças (protegida por senha)
  admin.js
  style.css
orcamento.db      # banco SQLite (criado automaticamente, não vai pro git)
.env              # senha de administrador (não vai pro git)
```

## Como rodar

### 1. Criar e ativar o ambiente virtual (só na primeira vez)

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Instalar as dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar a senha de administrador

Edite o arquivo `.env` na raiz do projeto e defina sua própria senha:

```
ADMIN_PASSWORD=sua_senha_aqui
```

Essa senha é exigida para cadastrar, editar ou excluir peças em `/admin`.

### 4. Iniciar o servidor

```bash
uvicorn backend.main:app --reload
```

### 5. Acessar

- Orçamento: http://127.0.0.1:8000
- Cadastro de peças: http://127.0.0.1:8000/admin

## Uso

### Cadastrando peças (`/admin`)

1. Digite a senha de administrador.
2. Preencha nome/espécie, largura (cm), espessura (cm), preço normal (R$/m) e preço aparelhado (R$/m).
3. Salve. A peça passa a aparecer na lista e fica disponível na tela de orçamento.

### Montando um orçamento (`/`)

1. (Opcional) Informe o nome do cliente.
2. Para cada item: quantidade de peças, selecione a peça, informe o comprimento em metros e marque "Aparelhado" se for o caso.
3. (Opcional) Informe um desconto em % ou em R$.
4. Clique em "Calcular orçamento".
5. Copie o texto gerado ou clique em "Abrir no WhatsApp" para enviar direto ao cliente.

## Banco de dados

O SQLite é criado automaticamente (`orcamento.db`) na primeira vez que o servidor roda, já com algumas peças de exemplo cadastradas. Para resetar o banco, basta apagar esse arquivo e reiniciar o servidor.
