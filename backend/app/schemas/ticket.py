"""Ticket request and response schemas."""

from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class TicketStatus(str, Enum):
    """Allowed ticket status values for API payloads."""

    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"


class TicketCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=255)
    customer_email: EmailStr
    subject: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)


class TicketUpdate(BaseModel):
    status: TicketStatus
    notes: str = Field(min_length=1)


class TicketListItem(BaseModel):
    ticket_id: str
    customer_name: str
    subject: str
    status: TicketStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class TicketDetail(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    status: TicketStatus
    created_at: datetime
    updated_at: datetime
    notes: list["NoteRead"]

    model_config = {"from_attributes": True}


class TicketCreateResponse(BaseModel):
    ticket_id: str
    created_at: datetime


class TicketUpdateResponse(BaseModel):
    success: bool
    updated_at: datetime


from app.schemas.note import NoteRead
