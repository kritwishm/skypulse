from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers.auth import router as auth_router
from routers.flights import router as flights_router
from ws_handler import websocket_handler


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
