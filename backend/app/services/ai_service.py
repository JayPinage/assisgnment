"""AI provider abstraction and validation layer."""

from __future__ import annotations

import json
import re
import urllib.error
import urllib.request

from fastapi import HTTPException, status

from app.config import settings
from app.models.ticket import Ticket
from app.schemas.ai import AIAnalysisResponse, Priority, Sentiment


class AIService:
    """Analyze tickets using a replaceable backend AI provider."""

    def analyze_ticket(self, ticket: Ticket) -> AIAnalysisResponse:
        provider_output = None

        if settings.groq_api_key:
            provider_output = self._call_groq(ticket)
        elif settings.gemini_api_key:
            provider_output = self._call_gemini(ticket)

        if provider_output is None:
            return self._fallback_analysis(ticket)

        return self._validate_response(provider_output, ticket)

    def _fallback_analysis(self, ticket: Ticket) -> AIAnalysisResponse:
        text_blob = f"{ticket.subject} {ticket.description}".lower()

        if any(
            word in text_blob
            for word in ["refund", "broken", "failed", "urgent", "cancel"]
        ):
            sentiment = Sentiment.Negative
            priority = Priority.High
        elif any(word in text_blob for word in ["thanks", "resolved", "great", "good"]):
            sentiment = Sentiment.Positive
            priority = Priority.Low
        else:
            sentiment = Sentiment.Neutral
            priority = Priority.Medium

        summary = f"Customer {ticket.customer_name} raised a support issue about {ticket.subject.lower()}."
        suggested_response = (
            "Thank you for reaching out. We are reviewing your request and will update you "
            "shortly with the next steps."
        )

        return AIAnalysisResponse(
            summary=summary,
            sentiment=sentiment,
            priority=priority,
            suggested_response=suggested_response,
        )

    def _validate_response(
        self, raw_output: object, ticket: Ticket
    ) -> AIAnalysisResponse:
        if not isinstance(raw_output, dict):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI provider returned an invalid response.",
            )

        try:
            return AIAnalysisResponse.model_validate(raw_output)
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI provider response could not be validated.",
            ) from exc

    def _call_groq(self, ticket: Ticket) -> dict | None:
        prompt = self._build_prompt(ticket)
        payload = {
            "model": "llama-3.1-70b-versatile",
            "messages": [
                {"role": "system", "content": "Return valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
        }

        request = urllib.request.Request(
            "https://api.groq.com/openai/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=25) as response:
                response_body = json.loads(response.read().decode("utf-8"))
        except urllib.error.URLError:
            return None

        content = response_body["choices"][0]["message"]["content"]
        return self._extract_json(content)

    def _call_gemini(self, ticket: Ticket) -> dict | None:
        prompt = self._build_prompt(ticket)
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}],
                }
            ],
            "generationConfig": {"temperature": 0.2},
        }

        request = urllib.request.Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.gemini_api_key}",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=25) as response:
                response_body = json.loads(response.read().decode("utf-8"))
        except urllib.error.URLError:
            return None

        candidates = response_body.get("candidates", [])
        if not candidates:
            return None

        parts = candidates[0].get("content", {}).get("parts", [])
        content = "".join(part.get("text", "") for part in parts)
        return self._extract_json(content)

    def _build_prompt(self, ticket: Ticket) -> str:
        return (
            "Analyze this customer support ticket and return only a JSON object with the keys "
            '"summary", "sentiment", "priority", and "suggested_response". '
            "sentiment must be one of Positive, Neutral, or Negative. priority must be one of "
            "Low, Medium, or High. Keep the summary concise and the suggested response professional. "
            f"\n\nTicket ID: {ticket.ticket_id}\nCustomer: {ticket.customer_name}\nEmail: {ticket.customer_email}\n"
            f"Subject: {ticket.subject}\nDescription: {ticket.description}"
        )

    def _extract_json(self, content: str) -> dict | None:
        candidate_content = content.strip()

        if candidate_content.startswith("```"):
            candidate_content = re.sub(
                r"^```(?:json)?|```$", "", candidate_content
            ).strip()

        start_index = candidate_content.find("{")
        end_index = candidate_content.rfind("}")
        if start_index == -1 or end_index == -1:
            return None

        json_text = candidate_content[start_index : end_index + 1]

        try:
            parsed = json.loads(json_text)
        except json.JSONDecodeError:
            return None

        if not isinstance(parsed, dict):
            return None

        return parsed
