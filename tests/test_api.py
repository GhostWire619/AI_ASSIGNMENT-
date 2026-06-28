"""
API test script (Task 5).

Tests the running backend over HTTP:
  - GET  /health         returns a status and model
  - POST /ask            returns the required fields with a non-empty answer
  - POST /ask (empty)    is rejected with a 4xx error

Run with the backend up:
    python tests/test_api.py          # prints a PASS/FAIL summary
    pytest tests/test_api.py -v       # same checks under pytest

If the backend is not reachable, pytest skips (so CI does not hard-fail) and the
script prints a clear message.
"""

from __future__ import annotations

import os
import sys

import pytest
import requests

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
REQUIRED_FIELDS = ["question", "answer", "tokens_used", "generation_time", "timestamp", "model"]


def _backend_up() -> bool:
    try:
        requests.get(f"{API_BASE_URL}/health", timeout=5)
        return True
    except requests.RequestException:
        return False


pytestmark = pytest.mark.skipif(
    not _backend_up(),
    reason=f"backend not reachable at {API_BASE_URL}; start it before running tests",
)


def test_health():
    resp = requests.get(f"{API_BASE_URL}/health", timeout=10)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "status" in data and "model" in data


def test_ask_returns_required_fields():
    resp = requests.post(
        f"{API_BASE_URL}/ask",
        json={"question": "How do I register for courses?", "temperature": 0.2},
        timeout=180,
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    for field in REQUIRED_FIELDS:
        assert field in data, f"missing field: {field}"
    assert len(data["answer"]) > 0, "answer is empty"


def test_empty_question_is_rejected():
    resp = requests.post(
        f"{API_BASE_URL}/ask",
        json={"question": "   ", "temperature": 0.2},
        timeout=30,
    )
    assert resp.status_code >= 400, "empty question should be rejected"


def _run_as_script() -> int:
    if not _backend_up():
        print(f"[SKIP] Backend not reachable at {API_BASE_URL}. Start it first:")
        print("       cd backend && uvicorn main:app --reload")
        return 1

    checks = [
        ("GET /health", test_health),
        ("POST /ask (valid)", test_ask_returns_required_fields),
        ("POST /ask (empty -> rejected)", test_empty_question_is_rejected),
    ]
    failures = 0
    for name, fn in checks:
        try:
            fn()
            print(f"[PASS] {name}")
        except AssertionError as exc:
            failures += 1
            print(f"[FAIL] {name}: {exc}")
        except requests.RequestException as exc:
            failures += 1
            print(f"[FAIL] {name}: request error: {exc}")
    print(f"\n{len(checks) - failures}/{len(checks)} checks passed.")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(_run_as_script())
