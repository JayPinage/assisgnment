"""FastAPI application entry point."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes.ai import router as ai_router
from app.routes.tickets import router as tickets_router

app = FastAPI(title="Customer Support Ticketing CRM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://assignment.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets_router)
app.include_router(ai_router)


@app.on_event("startup")
def create_database_tables() -> None:
    """Create tables automatically for local development."""

    Base.metadata.create_all(bind=engine)


@app.get("/")
def health_check() -> dict[str, str]:
    return {"message": "Customer Support Ticketing CRM API is running"}
