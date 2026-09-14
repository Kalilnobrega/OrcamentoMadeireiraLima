import os
import secrets

from fastapi import Header, HTTPException

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "madeiralima123")


def verificar_admin(x_admin_password: str | None = Header(default=None, alias="X-Admin-Password")) -> None:
    if not x_admin_password or not secrets.compare_digest(x_admin_password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Senha de administrador incorreta.")
