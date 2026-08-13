"""Ticket API routes."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.ticket import (
    TicketCreate,
    TicketCreateResponse,
    TicketDetail,
    TicketListItem,
    TicketStatus,
    TicketUpdate,
    TicketUpdateResponse,
)
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.post(
    "", response_model=TicketCreateResponse, status_code=status.HTTP_201_CREATED
)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    ticket = TicketService(db).create_ticket(payload)
    return TicketCreateResponse(
        ticket_id=ticket.ticket_id, created_at=ticket.created_at
    )


@router.get("", response_model=list[TicketListItem])
def list_tickets(
    db: Session = Depends(get_db),
    status_filter: TicketStatus | None = Query(default=None, alias="status"),
    search: Annotated[str | None, Query(min_length=1)] = None,
):
    tickets = TicketService(db).list_tickets(status_filter=status_filter, search=search)
    return tickets


@router.get("/{ticket_id}", response_model=TicketDetail)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = TicketService(db).get_ticket_by_ticket_id(ticket_id)
    return ticket


@router.put("/{ticket_id}", response_model=TicketUpdateResponse)
def update_ticket(ticket_id: str, payload: TicketUpdate, db: Session = Depends(get_db)):
    ticket = TicketService(db).update_ticket(ticket_id, payload)
    return TicketUpdateResponse(success=True, updated_at=ticket.updated_at)
