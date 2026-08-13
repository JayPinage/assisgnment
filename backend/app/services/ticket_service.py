"""Ticket business logic service."""

from __future__ import annotations

from collections.abc import Sequence

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.note import Note
from app.models.ticket import Ticket, TicketStatus
from app.schemas.ticket import TicketCreate, TicketUpdate


class TicketService:
    """Encapsulates ticket CRUD operations."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create_ticket(self, payload: TicketCreate) -> Ticket:
        ticket = Ticket(
            customer_name=payload.customer_name,
            customer_email=payload.customer_email,
            subject=payload.subject,
            description=payload.description,
            status=TicketStatus.OPEN.value,
        )
        self.db.add(ticket)
        self.db.commit()
        self.db.refresh(ticket)
        return ticket

    def list_tickets(
        self,
        status_filter: TicketStatus | None = None,
        search: str | None = None,
    ) -> list[Ticket]:
        statement = select(Ticket).order_by(Ticket.created_at.desc())

        conditions = []
        if status_filter is not None:
            conditions.append(Ticket.status == status_filter.value)

        if search:
            search_term = f"%{search.strip()}%"
            conditions.append(
                or_(
                    Ticket.ticket_id.ilike(search_term),
                    Ticket.customer_name.ilike(search_term),
                    Ticket.customer_email.ilike(search_term),
                    Ticket.subject.ilike(search_term),
                    Ticket.description.ilike(search_term),
                )
            )

        if conditions:
            statement = statement.where(*conditions)

        return list(self.db.scalars(statement).all())

    def get_ticket_by_ticket_id(self, ticket_id: str) -> Ticket:
        statement = (
            select(Ticket)
            .where(Ticket.ticket_id == ticket_id)
            .options(selectinload(Ticket.notes))
        )
        ticket = self.db.scalars(statement).first()
        if ticket is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
            )
        return ticket

    def update_ticket(self, ticket_id: str, payload: TicketUpdate) -> Ticket:
        ticket = self.get_ticket_by_ticket_id(ticket_id)
        ticket.status = payload.status.value

        note = Note(ticket_id=ticket.id, note_text=payload.notes)
        self.db.add(note)
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
