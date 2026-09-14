from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

from . import crud, orcamento, schemas  # noqa: E402
from .auth import verificar_admin  # noqa: E402
from .database import get_db, init_db  # noqa: E402

STATIC_DIR = BASE_DIR / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Orçamento Madeireira Lima", lifespan=lifespan)


@app.get("/api/madeiras", response_model=list[schemas.Madeira])
def listar_madeiras(apenas_ativas: bool = False, db: Session = Depends(get_db)):
    return crud.list_madeiras(db, apenas_ativas=apenas_ativas)


@app.post("/api/admin/verificar", dependencies=[Depends(verificar_admin)])
def verificar_senha_admin():
    return {"ok": True}


@app.post("/api/madeiras", response_model=schemas.Madeira, status_code=201, dependencies=[Depends(verificar_admin)])
def criar_madeira(madeira: schemas.MadeiraCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_madeira(db, madeira)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Já existe uma madeira com esse nome e bitola.") from exc


@app.put("/api/madeiras/{madeira_id}", response_model=schemas.Madeira, dependencies=[Depends(verificar_admin)])
def atualizar_madeira(madeira_id: int, madeira: schemas.MadeiraUpdate, db: Session = Depends(get_db)):
    row = crud.update_madeira(db, madeira_id, madeira)
    if row is None:
        raise HTTPException(status_code=404, detail="Madeira não encontrada.")
    return row


@app.delete("/api/madeiras/{madeira_id}", status_code=204, dependencies=[Depends(verificar_admin)])
def remover_madeira(madeira_id: int, db: Session = Depends(get_db)):
    if not crud.delete_madeira(db, madeira_id):
        raise HTTPException(status_code=404, detail="Madeira não encontrada.")


@app.post("/api/orcamento/calcular", response_model=schemas.OrcamentoSaida)
def calcular_orcamento(entrada: schemas.OrcamentoEntrada, db: Session = Depends(get_db)):
    return orcamento.calcular_orcamento(db, entrada)


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/admin")
def admin():
    return FileResponse(STATIC_DIR / "admin.html")
