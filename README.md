# University Student Support Assistant

A self-hosted Large Language Model (LLM) application that answers student
questions about university services: course registration, examination rules,
library services, ICT support, hostel application, fee payment, the academic
calendar, and student conduct.

Built for **IS 365 - Full-Stack Pipeline for Deploying a Self-Hosted LLM
Application**. The whole pipeline runs locally:

```
User -> React frontend -> FastAPI backend -> local Ollama model -> answer
                              |
                              +-> logging (backend/logs/app.log)
```

## Features

- **Modern React Frontend** with dark/light mode toggle and theme persistence
- FastAPI backend with `/health`, `/ask`, and auto-generated Swagger docs at `/docs`.
- Local LLM served by **Ollama** (default `llama3.2:3b`, changeable in one line).
- **React + TypeScript + Bootstrap** frontend with responsive design.
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
│   ├── university_faq.md    # FAQ knowledge base (edit with your own info)
│   └── logs/app.log         # created at runtime
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main React app with ThemeProvider
│   │   ├── App.css          # Modern styles with dark mode support
│   │   ├── index.tsx        # Entry point with Bootstrap & dark theme
│   │   ├── index.css        # Global styles and scrollbar
│   │   ├── components/
│   │   │   ├── Header.tsx            # Header with theme toggle button
│   │   │   ├── Sidebar.tsx           # Status & temperature control
│   │   │   ├── QuestionForm.tsx      # Question input with validation
│   │   │   ├── FeedbackButtons.tsx   # Good/Average/Poor rating
│   │   │   └── ConversationHistory.tsx # Chat history display
│   │   ├── context/
│   │   │   └── ThemeContext.tsx      # Dark/light mode context
│   │   ├── services/
│   │   │   └── api.ts                # API calls to backend
│   │   └── types/
│   │       └── index.ts              # TypeScript type definitions
│   ├── index.html          # HTML entry point
│   ├── package.json        # Node dependencies
│   ├── package-lock.json   # Locked dependencies
│   ├── vite.config.ts      # Vite build configuration
│   ├── tsconfig.json       # TypeScript configuration
│   └── .env                # Frontend environment variables
├── tests/
│   └── test_api.py         # API test script
├── docs/
│   ├── report.md           # technical report + reflection answers
│   ├── SCREENSHOTS.md      # checklist of required screenshots
│   └── screenshots/        # put your screenshots here
├── requirements.txt
├── .env.example
└── README.md
```

## Prerequisites

- Python 3.10+ (tested on 3.12).
- [Ollama](https://ollama.ai/download) installed and running.
- A pulled model, e.g. `ollama pull llama3.2:3b` (or the lighter `llama3.2:1b`).
- Node.js 18+ and npm (for the React frontend).

## Setup

### Backend Setup

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate     # macOS / Linux
# .venv\Scripts\activate      # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. (Optional) configure
cp .env.example .env
#   edit .env to change OLLAMA_MODEL_NAME, ports, etc.

# 4. Make sure the model is available
ollama pull llama3.2:3b
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Create .env file (optional)
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
```

## Running

Open three terminals (with the virtual environment activated for the backend).

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload
# API:     http://localhost:8000
# Swagger: http://localhost:8000/docs
# Health:  http://localhost:8000/health
```

**Terminal 2 - React Frontend:**
```bash
cd frontend
npm run dev
# UI: http://localhost:3000
```

**Terminal 3 - (Optional) Streamlit Frontend (legacy):**
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

### Backend Configuration (.env)
All settings live in `.env` (see `.env.example`). The most useful ones:

| Variable | Default | Purpose |
|---|---|---|
| `OLLAMA_MODEL_NAME` | `llama3.2:3b` | Which local model to use (e.g. `llama3.2:1b`, `phi3`). |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Where Ollama is served. |
| `DEFAULT_TEMPERATURE` | `0.7` | Default sampling temperature. |
| `API_PORT` | `8000` | Backend port. |
| `USE_RAG` | `true` | Toggle the FAQ retrieval step. |
| `API_BASE_URL` | `http://localhost:8000` | Backend URL used by the frontend. |

### Frontend Configuration (.env in frontend/)
| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend URL for API calls. |
| `VITE_REQUEST_TIMEOUT` | `180000` | API request timeout in milliseconds. |

## Error handling

| Situation | Behaviour |
|---|---|
| Backend not running | Frontend shows a clear connection error. |
| Model not running | Backend returns a 503 with a clear message; the frontend surfaces it. |
| Empty question | Frontend asks for a question; backend also rejects it (422). |
| Slow response | Frontend shows a loading spinner. |

## UI Features

### Dark/Light Mode
- Toggle between dark and light themes using the button in the header
- Theme preference is saved to localStorage
- Automatically detects system theme preference on first visit

### Modern Design
- Gradient headers and buttons
- Smooth transitions between themes
- Custom scrollbars matching the theme
- Responsive layout for all screen sizes
- Improved typography with Inter font

## Notes

This project was built independently as a class assignment. The application
pipeline is self-contained in this repository.
```

## Key Updates Made:

1. **Updated Pipeline Diagram**: Changed `Streamlit` to `React` in the pipeline flow
2. **Added Frontend Structure**: Detailed the complete React/TypeScript frontend with dark mode
3. **Added Prerequisites**: Included Node.js 18+ requirement
4. **Added Frontend Setup**: Installation steps for React dependencies
5. **Updated Running Instructions**: Added npm commands for React dev server
6. **Added Frontend Configuration**: Documented Vite environment variables
7. **Added UI Features Section**: Described dark/light mode and modern design
8. **Updated Project Structure**: Complete with all React components, context, and config files

The README now accurately reflects your modern React implementation with the dark/light mode toggle and all the components you've built.