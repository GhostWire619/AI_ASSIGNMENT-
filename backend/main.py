"""
FastAPI backend for the University Student Support Assistant.

Pipeline:  frontend  ->  this API (/ask)  ->  llm_client  ->  local Ollama model.

Endpoints:
    GET  /         - service info and endpoint list
    GET  /health   - liveness + whether the local model is reachable/installed
    POST /ask      - answer a student question (the main endpoint)
    POST /feedback - record a Good/Average/Poor rating (Bonus Option E)

Run:  uvicorn main:app --reload      (from the backend/ folder)
  or: python main.py
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

import llm_client
import rag
from config import settings

# ── Logging (Task 8) ────────────────────────────────────────────────────────
# Records every question, answer, error, and timestamp to backend/logs/app.log
# as well as the console.
settings.LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(settings.LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("student-support")


# ── Prompt design (Task 6: original vs improved) ────────────────────────────
# ORIGINAL_PROMPT is the naive first version: it sends the bare question with no
# role, scope, or guard-rails, so the model rambles and answers off-topic.
ORIGINAL_PROMPT = "{question}"

# IMPROVED_SYSTEM_PROMPT gives the model a role, scopes it to university student
# services, fixes the tone, and tells it to admit when it does not know - which
# produces shorter, on-topic, safer answers.
IMPROVED_SYSTEM_PROMPT = (
    "You are the University Student Support Assistant. You help students with "
    "university services only: course registration, examination rules, library "
    "services, ICT support, hostel application, fee payment, the academic "
    "calendar, and student conduct.\n"
    "Guidelines:\n"
    "- Answer clearly and concisely in plain language.\n"
    "- If reference information is provided below, base your answer on it.\n"
    "- If you are not sure or the question is outside university services, say "
    "so and advise the student to contact the relevant office.\n"
    "- Do not invent specific dates, fees, or policies that you were not given."
)


def build_prompt(question: str) -> tuple[str, str | None]:
    """Assemble the improved prompt, injecting a FAQ section when RAG is on.

    Returns (prompt, faq_heading_used_or_None).
    """
    context_block = ""
    faq_used: str | None = None
    if settings.USE_RAG:
        hit = rag.retrieve(question)
        if hit:
            faq_used = hit["heading"]
            context_block = (
                f"\n\nReference information (University FAQ - {hit['heading']}):\n"
                f"{hit['text']}\n"
            )

    prompt = (
        f"{IMPROVED_SYSTEM_PROMPT}"
        f"{context_block}\n\n"
        f"Student question: {question}\n\n"
        f"Answer:"
    )
    return prompt, faq_used


# ── Request/response models ─────────────────────────────────────────────────
class QuestionRequest(BaseModel):
    question: str = Field(..., description="The student's question.")
    temperature: float = Field(
        default=settings.DEFAULT_TEMPERATURE, ge=0.0, le=1.0,
        description="Sampling temperature (0 = focused, 1 = creative).",
    )

    @field_validator("question")
    @classmethod
    def _not_blank(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Question must not be empty.")
        if len(value) > settings.MAX_QUESTION_CHARS:
            raise ValueError(
                f"Question is too long (max {settings.MAX_QUESTION_CHARS} characters)."
            )
        return value.strip()


class AnswerResponse(BaseModel):
    question: str
    answer: str
    tokens_used: int
    generation_time: float
    timestamp: str
    model: str
    faq_section: str | None = None  # which FAQ section grounded the answer (RAG)


class HealthResponse(BaseModel):
    status: str
    model: str
    ollama_reachable: bool
    model_installed: bool


class FeedbackRequest(BaseModel):
    question: str
    answer: str
    rating: str = Field(..., description="One of: Good, Average, Poor.")

    @field_validator("rating")
    @classmethod
    def _valid_rating(cls, value: str) -> str:
        allowed = {"Good", "Average", "Poor"}
        if value not in allowed:
            raise ValueError(f"rating must be one of {sorted(allowed)}.")
        return value


# ── Application ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="University Student Support Assistant",
    description="A self-hosted LLM application that answers student questions "
    "about university services (IS 365 assignment).",
    version="1.0.0",
)

# Permissive CORS for local development / Swagger / any browser frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict:
    return {
        "service": "University Student Support Assistant",
        "model": settings.OLLAMA_MODEL_NAME,
        "endpoints": {
            "health": "GET /health",
            "ask": "POST /ask",
            "feedback": "POST /feedback",
            "docs": "GET /docs",
        },
    }


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Report whether the API is up and the local model is reachable."""
    info = llm_client.check_health()
    reachable = bool(info.get("ollama_reachable"))
    installed = bool(info.get("model_installed"))
    status = "ok" if reachable and installed else "degraded"
    return HealthResponse(
        status=status,
        model=settings.OLLAMA_MODEL_NAME,
        ollama_reachable=reachable,
        model_installed=installed,
    )


@app.post("/ask", response_model=AnswerResponse)
def ask(request: QuestionRequest) -> AnswerResponse:
    """Answer a student's question using the local LLM."""
    logger.info("Question received: %s", request.question)

    prompt, faq_used = build_prompt(request.question)

    try:
        result = llm_client.generate(prompt, temperature=request.temperature)
    except llm_client.LLMUnavailableError as exc:
        logger.error("LLM unavailable: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))
    except llm_client.LLMTimeoutError as exc:
        logger.error("LLM timeout: %s", exc)
        raise HTTPException(status_code=504, detail=str(exc))
    except llm_client.LLMError as exc:
        logger.error("LLM error: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))

    answer = AnswerResponse(
        question=request.question,
        answer=result["answer"],
        tokens_used=result["tokens_used"],
        generation_time=result["generation_time"],
        timestamp=datetime.now(timezone.utc).isoformat(),
        model=result["model"],
        faq_section=faq_used,
    )
    logger.info(
        "Answer generated (model=%s, tokens=%s, %.2fs, faq=%s): %s",
        answer.model, answer.tokens_used, answer.generation_time,
        faq_used, answer.answer[:120].replace("\n", " "),
    )
    return answer


@app.post("/feedback")
def feedback(request: FeedbackRequest) -> dict:
    """Record a user rating of an answer (Bonus Option E)."""
    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "rating": request.rating,
        "question": request.question,
        "answer": request.answer,
    }
    with settings.FEEDBACK_FILE.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, ensure_ascii=False) + "\n")
    logger.info("Feedback recorded: %s for question: %s", request.rating, request.question)
    return {"status": "saved", "rating": request.rating}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True,
    )
