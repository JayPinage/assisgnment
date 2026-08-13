"""AI analysis API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.ai import AIAnalysisResponse
from app.services.ai_service import AIService
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/api/tickets", tags=["ai"])


@router.post("/{ticket_id}/ai-analysis", response_model=AIAnalysisResponse)
def analyze_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = TicketService(db).get_ticket_by_ticket_id(ticket_id)
    return AIService().analyze_ticket(ticket)
