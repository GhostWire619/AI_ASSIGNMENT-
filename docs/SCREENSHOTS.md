# Screenshot Checklist (Submission Evidence)

Save each screenshot into `docs/screenshots/` with the suggested filename. The
assignment asks for the following evidence (Tasks 1-8 and Final Deliverables).

| # | What to capture | How to produce it | Suggested filename |
|---|---|---|---|
| 1 | Activated virtual environment | In the terminal after `.venv\Scripts\activate` (prompt shows `(.venv)`), run `python --version` | `01-venv-activated.png` |
| 2 | Successful library install | The tail of `pip install -r requirements.txt` | `02-pip-install.png` |
| 3 | Model being pulled | `ollama pull llama3.2:3b` | `03-ollama-pull.png` |
| 4 | Model running / available | `ollama list` (shows the model) | `04-ollama-list.png` |
| 5 | Direct LLM API response | `curl http://localhost:11434/api/generate -d "{\"model\":\"llama3.2:3b\",\"prompt\":\"hello\",\"stream\":false}"` | `05-ollama-api.png` |
| 6 | FastAPI backend running | The `uvicorn main:app --reload` startup output | `06-backend-running.png` |
| 7 | Swagger UI | Open `http://localhost:8000/docs` in the browser | `07-swagger-docs.png` |
| 8 | Successful `/health` | `http://localhost:8000/health` in the browser, or `curl` | `08-health.png` |
| 9 | Successful `/ask` | In Swagger `/docs`, try `/ask` with `{"question": "How do I register for courses?"}` | `09-ask.png` |
| 10 | Frontend | The Streamlit app at `http://localhost:8501` | `10-frontend.png` |
| 11 | Question-and-answer interaction | Ask a question in the frontend and capture the answer | `11-frontend-qa.png` |
| 12 | Test script output | `python tests/test_api.py` (with the backend running) | `12-test-output.png` |
| 13 | Improved prompt comparison | Capture one answer with `USE_RAG=true` vs the bare model, or paste both prompts | `13-prompt-comparison.png` |
| 14 | Error handling | Stop the backend, then ask in the frontend to show the connection error | `14-error-handling.png` |
| 15 | Log file | Open `backend/logs/app.log` after a few interactions | `15-logs.png` |
| 16 | Rating bonus (Option E) | Click Good/Average/Poor in the frontend; show `backend/feedback.jsonl` | `16-feedback.png` |

Tip: take the screenshots in order while the system is running, so the demo flows
naturally for the report's appendix.
