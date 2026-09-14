# Orçamento Madeireira Lima

Site simples para gerar orçamentos de madeira e enviar direto pelo WhatsApp.

## Funcionalidades

- Orçamento com múltiplos itens, todos digitados na hora: quantidade, descrição, medidas (comprimento em metros) e valor do metro.
- Desconto por **percentual** ou por **valor fixo em R$** — o sistema sempre calcula e mostra os dois (o que você não digitar é calculado a partir do outro).
- Geração de texto formatado, pronto para copiar ou abrir direto no WhatsApp.

Não há cadastro de produtos nem banco de dados: cada orçamento é montado do zero, com o usuário definindo todas as características e preços diretamente na tela.

## Tecnologias

- **Backend:** Python + FastAPI
- **Frontend:** HTML, CSS e JavaScript puros (sem framework)

## Estrutura do projeto

```
backend/
  main.py         # rotas da API e configuração do FastAPI
  schemas.py      # formato dos dados de entrada/saída da API (Pydantic)
  orcamento.py    # cálculo do orçamento e montagem do texto do WhatsApp
static/
  index.html      # página de orçamento (única página do site)
  script.js
  style.css
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

### 3. Iniciar o servidor

```bash
uvicorn backend.main:app --reload
```

### 4. Acessar

http://127.0.0.1:8000

## Uso

1. (Opcional) Informe o nome do cliente.
2. Para cada item: quantidade de peças, descrição livre (ex: "Massaranduba 11x5 aparelhada"), medidas em metros (comprimento) e o valor do metro em R$.
3. O valor da linha é calculado como: `quantidade × medidas (m) × valor do metro`.
4. (Opcional) Informe um desconto em % ou em R$.
5. Clique em "Calcular orçamento".
6. Copie o texto gerado ou clique em "Abrir no WhatsApp" para enviar direto ao cliente.
