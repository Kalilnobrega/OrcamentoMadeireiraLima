from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import orcamento, schemas

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(title="Orçamento Madeireira Lima")


@app.middleware("http")
async def revalidar_estaticos(request: Request, call_next):
    response = await call_next(request)
    if request.url.path == "/" or request.url.path.startswith("/static/"):
        response.headers["Cache-Control"] = "no-cache"
    return response


@app.post("/api/orcamento/calcular", response_model=schemas.OrcamentoSaida)
def calcular_orcamento(entrada: schemas.OrcamentoEntrada):
    return orcamento.calcular_orcamento(entrada)


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html")
