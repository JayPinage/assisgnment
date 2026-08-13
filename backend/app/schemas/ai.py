"""AI analysis schemas."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class Sentiment(str, Enum):
    Positive = "Positive"
    Neutral = "Neutral"
    Negative = "Negative"


class Priority(str, Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"


class AIAnalysisResponse(BaseModel):
    summary: str = Field(min_length=1)
    sentiment: Sentiment
    priority: Priority
    suggested_response: str = Field(min_length=1)
