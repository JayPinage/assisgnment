"""Ticket model and status definitions."""

from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, String, Text, event, func, select
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TicketStatus(str, Enum):
    """Allowed ticket status values."""

    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    ticket_id: Mapped[str] = mapped_column(
        String(20), unique=True, index=True, nullable=False
    )
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=TicketStatus.OPEN.value
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    notes = relationship("Note", back_populates="ticket", cascade="all, delete-orphan")


@event.listens_for(Ticket, "before_insert")
def assign_ticket_id(_mapper, _connection, target: Ticket) -> None:
    """Assign the next sequential ticket ID before insert."""

    if target.ticket_id:
        return

    statement = select(Ticket.ticket_id).order_by(Ticket.id.desc()).limit(1)
    last_ticket_id = _connection.execute(statement).scalar_one_or_none()

    if not last_ticket_id:
        target.ticket_id = "TKT-001"
        return

    current_number = int(last_ticket_id.split("-")[-1])
    target.ticket_id = f"TKT-{current_number + 1:03d}"
