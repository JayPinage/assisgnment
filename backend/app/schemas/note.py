"""Note request and response schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class NoteCreate(BaseModel):
    note_text: str = Field(min_length=1)


class NoteRead(BaseModel):
    id: int
    note_text: str
    created_at: datetime

    model_config = {"from_attributes": True}
