"""
Simple FAQ retrieval (optional RAG feature - Bonus Option B).

This is a deliberately lightweight, dependency-free retriever. It splits the
university FAQ markdown into "##" sections and scores each section against the
student's question by keyword overlap (a tiny TF-style weighting). The best
section, if it clears a small relevance threshold, is injected into the prompt so
the model answers from the university's own information rather than its training
data. No embeddings or vector database are needed, which keeps the assignment
easy to run on any machine.
"""

from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path

from config import settings

# Very common words that should not drive retrieval.
_STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are",
    "do", "does", "how", "what", "when", "where", "can", "i", "my", "you",
    "with", "at", "be", "this", "that", "it", "as", "if", "about", "from",
    "me", "we", "our", "your",
}


def _tokenize(text: str) -> list[str]:
    return [t for t in re.findall(r"[a-z0-9]+", text.lower()) if t not in _STOPWORDS]


@lru_cache(maxsize=1)
def _load_sections() -> list[tuple[str, str]]:
    """Parse the FAQ file into (heading, body) sections. Cached after first read."""
    path: Path = settings.FAQ_FILE
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8")
    sections: list[tuple[str, str]] = []
    current_heading: str | None = None
    current_body: list[str] = []
    for line in text.splitlines():
        if line.startswith("## "):
            if current_heading is not None:
                sections.append((current_heading, " ".join(current_body).strip()))
            current_heading = line[3:].strip()
            current_body = []
        elif current_heading is not None:
            current_body.append(line)
    if current_heading is not None:
        sections.append((current_heading, " ".join(current_body).strip()))
    return sections


def retrieve(question: str, min_score: int = 2) -> dict[str, str] | None:
    """Return the most relevant FAQ section for a question, or None.

    Scores each section by how many distinctive question words appear in it
    (heading matches count double). Returns None when nothing clears min_score,
    so the caller falls back to a plain prompt.
    """
    sections = _load_sections()
    if not sections:
        return None

    q_tokens = set(_tokenize(question))
    if not q_tokens:
        return None

    best: tuple[int, str, str] | None = None
    for heading, body in sections:
        heading_tokens = set(_tokenize(heading))
        body_tokens = set(_tokenize(body))
        score = 2 * len(q_tokens & heading_tokens) + len(q_tokens & body_tokens)
        if best is None or score > best[0]:
            best = (score, heading, body)

    if best is None or best[0] < min_score:
        return None
    return {"heading": best[1], "text": best[2]}
