from __future__ import annotations

import logging
import re
from contextlib import asynccontextmanager

from fastapi import FastAPI, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers.auth import router as auth_router
from routers.flights import router as flights_router
from ws_handler import websocket_handler


# Redact JWT tokens from all logs
class _TokenRedactFilter(logging.Filter):
    _pattern = re.compile(r"(token=)[^\s&\"']+")

    def filter(self, record: logging.LogRecord) -> bool:
        record.msg = self._pattern.sub(r"\1[REDACTED]", str(record.msg))
        if record.args:
            record.args = tuple(
                self._pattern.sub(r"\1[REDACTED]", str(a)) if isinstance(a, str) else a
                for a in (record.args if isinstance(record.args, tuple) else (record.args,))
            )
        return True


for _logger_name in ("uvicorn", "uvicorn.access", "uvicorn.error"):
    logging.getLogger(_logger_name).addFilter(_TokenRedactFilter())


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    await init_db()
    yield


app = FastAPI(title="SkyPulse", version="1.0.0", lifespan=lifespan, redirect_slashes=False)

# CORS - allow all for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routes
app.include_router(auth_router)
app.include_router(flights_router)


# WebSocket route — token passed as query param
@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket, token: str = Query(None)):
    await websocket_handler(websocket, token)
