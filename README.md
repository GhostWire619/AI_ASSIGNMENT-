# University Student Support Assistant

A self-hosted Large Language Model (LLM) application that answers student
questions about university services: course registration, examination rules,
library services, ICT support, hostel application, fee payment, the academic
calendar, and student conduct.

Built for **IS 365 - Full-Stack Pipeline for Deploying a Self-Hosted LLM
Application**. The whole pipeline runs locally:

```
User -> Streamlit frontend -> FastAPI backend -> local Ollama model -> answer
                                   |
                                   +-> logging (backend/logs/app.log)
```

## Features

- FastAPI backend with `/health`, `/ask`, and auto-generated Swagger docs at `/docs`.
- Local LLM served by **Ollama** (default `llama3.2:3b`, changeable in one line).
- Streamlit chat frontend with a temperature control and error handling.
- Configuration via environment variables (`.env`), so the model/host/port are
  swappable without touching code.
- Logging of every question, answer, error, and timestamp.
- API test script.
- **Bonus features:** a simple FAQ retrieval step (RAG, Option B) and a
  Good/Average/Poor answer rating saved to a file (Option E).

## Project structure

```
.
├── backend/
│   ├── main.py              # FastAPI app: /health, /ask, /feedback
│   ├── llm_client.py        # talks to the local Ollama model
│   ├── config.py            # env-driven settings
│   ├── rag.py               # simple FAQ retrieval (bonus)
│   ├── university_faq.md     # FAQ knowledge base (edit with your own info)
│   └── logs/app.log         # created at runtime
├── frontend/
│   └── app.py               # Streamlit UI
├── tests/
│   └── test_api.py          # API test script
├── docs/
│   ├── report.md            # technical report + reflection answers
│   ├── SCREENSHOTS.md       # checklist of required screenshots
│   └── screenshots/         # put your screenshots here
├── requirements.txt
├── .env.example
└── README.md
```

## Prerequisites

- Python 3.10+ (tested on 3.12).
- [Ollama](https://ollama.ai/download) installed and running.
- A pulled model, e.g. `ollama pull llama3.2:3b` (or the lighter `llama3.2:1b`).

## Setup

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. (Optional) configure
copy .env.example .env          # Windows  (cp on macOS/Linux)
#   edit .env to change OLLAMA_MODEL_NAME, ports, etc.

# 4. Make sure the model is available
ollama pull llama3.2:3b
```

## Running

Open two terminals (with the virtual environment activated in each).

**Terminal 1 - backend:**
```bash
cd backend
uvicorn main:app --reload
# API:     http://localhost:8000
# Swagger: http://localhost:8000/docs
# Health:  http://localhost:8000/health
```

**Terminal 2 - frontend:**
```bash
cd frontend
streamlit run app.py
# UI: http://localhost:8501
```

## Testing

With the backend running:

```bash
python tests/test_api.py        # prints a PASS/FAIL summary
# or
pytest tests/test_api.py -v
```

## Configuration

All settings live in `.env` (see `.env.example`). The most useful ones:

| Variable | Default | Purpose |
|---|---|---|
| `OLLAMA_MODEL_NAME` | `llama3.2:3b` | Which local model to use (e.g. `llama3.2:1b`, `phi3`). |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Where Ollama is served. |
| `DEFAULT_TEMPERATURE` | `0.7` | Default sampling temperature. |
| `API_PORT` | `8000` | Backend port. |
| `USE_RAG` | `true` | Toggle the FAQ retrieval step. |
| `API_BASE_URL` | `http://localhost:8000` | Backend URL used by the frontend. |

## Error handling

| Situation | Behaviour |
|---|---|
| Backend not running | Frontend shows a clear connection error. |
| Model not running | Backend returns a 503 with a clear message; the frontend surfaces it. |
| Empty question | Frontend asks for a question; backend also rejects it (422). |
| Slow response | Frontend shows a loading spinner. |

## Notes

This project was built independently as a class assignment. The application
pipeline is self-contained in this repository.
