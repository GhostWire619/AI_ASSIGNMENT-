# IS 365 Technical Report: University Student Support Assistant

**Project:** Full-Stack Pipeline for Deploying a Self-Hosted LLM Application
**Use case:** University Student Support Assistant

---

## 1. Introduction

This report describes the design, implementation, testing, and deployment
considerations of a self-hosted Large Language Model (LLM) application. The
application is a University Student Support Assistant: a question-and-answer
service that helps students with common university services. The goal of the
assignment was not to build a perfect chatbot, but to demonstrate understanding
of the full pipeline that turns a local language model into a working
application, including the development environment, a backend API, a frontend
interface, logging, error handling, testing, and documentation.

The system runs entirely on a local machine. No question or answer is sent to an
external cloud service, which keeps student data on the device and removes any
per-request cost.

## 2. System Use Case

Students often need quick answers to routine questions about university
processes. The assistant covers eight service areas: course registration,
examination rules, library services, ICT support, hostel application, fee
payment, the academic calendar, and student conduct. A student types a question
in plain language and receives a concise, on-topic answer. When a small
university FAQ contains relevant information, the system uses that information to
ground its answer; otherwise it answers from the model's general knowledge and is
instructed to admit uncertainty rather than invent specific dates or fees.

## 3. Tools and Technologies Used

| Component | Tool | Why |
|---|---|---|
| Language | Python 3.12 | Standard for AI tooling; required by the assignment. |
| Backend API | FastAPI | Fast to build, async-capable, and auto-generates Swagger docs. |
| Web server | Uvicorn | Lightweight ASGI server for FastAPI. |
| Local LLM | Ollama | Simple local serving of open models over an HTTP API. |
| Model | llama3.2:3b (configurable) | A small model that runs on a laptop; swappable via `.env`. |
| Frontend | Streamlit | A full chat UI from one Python file, ideal for a fast prototype. |
| Config | python-dotenv | Environment-variable configuration. |
| Testing | requests + pytest | Tests the live API over HTTP. |

## 4. System Architecture

The system follows a simple request flow:

```
User -> Streamlit frontend (8501)
          -> FastAPI backend (8000): /ask
              -> Ollama LLM server (11434): /api/generate
          <- answer + metadata
     <- rendered answer
```

The backend is the orchestrator. It validates the question, optionally retrieves
a relevant FAQ section, builds the prompt, calls the local model through a thin
client, logs the interaction, and returns a structured response. The model server
(Ollama) only performs inference. The frontend only collects input and displays
output. This separation of concerns keeps each part small and independently
testable. Configuration is read from environment variables, so the model, host,
and ports can be changed without editing code.

## 5. Implementation Steps

**Environment.** A Python virtual environment isolates the project's
dependencies, which are pinned in `requirements.txt`. Ollama serves the model
locally and the chosen model is pulled once.

**Backend.** `config.py` centralises all settings. `llm_client.py` wraps Ollama's
`/api/generate` and `/api/tags` endpoints and converts network failures into a
small set of explicit exceptions. `main.py` defines the FastAPI app with three
endpoints: `/health` (reports whether the model is reachable and installed),
`/ask` (the main endpoint), and `/feedback` (records a rating). Pydantic models
validate every request and shape every response, so a malformed or empty question
is rejected before it reaches the model.

**Prompt design (original vs improved).** The first version of the prompt sent the
student's question to the model with no context:

> Original prompt: `{question}`

This produced long, rambling, sometimes off-topic answers, because the model had
no role and no boundaries. The improved prompt gives the model a clear role,
scopes it to university services, sets the tone, tells it to use any provided FAQ
text, and instructs it to admit uncertainty instead of inventing details:

> Improved prompt (system instructions): "You are the University Student Support
> Assistant. You help students with university services only ... Answer clearly
> and concisely ... If you are not sure or the question is outside university
> services, say so ... Do not invent specific dates, fees, or policies that you
> were not given."

For a question such as "How do I register for courses?", the original prompt
returned a generic, multi-paragraph essay about course registration in general,
while the improved prompt (with the FAQ retrieval step) returned a short answer
grounded in the university's own registration window, online process, and
fee-clearance requirement. The improved prompt is therefore shorter, on-topic,
and safer.

**Frontend.** The Streamlit app provides a question box, a temperature slider, a
status indicator that calls `/health`, and a conversation history. It shows a
loading spinner while waiting, surfaces a clear message if the backend is down,
and offers a Good/Average/Poor rating under each answer.

**Logging.** The backend writes every received question, generated answer, error,
and timestamp to `backend/logs/app.log`.

**Bonus features.** Two optional extensions were added. A simple FAQ retrieval
step (Option B) splits a small university FAQ into sections and injects the most
relevant section into the prompt by keyword overlap, with no external vector
database. An answer-rating feature (Option E) stores Good/Average/Poor feedback
in `backend/feedback.jsonl`.

## 6. Testing and Results

The API was tested with a script (`tests/test_api.py`) that exercises the running
service over HTTP. It checks that `/health` returns a status and model, that a
valid question to `/ask` returns all required fields with a non-empty answer, and
that an empty question is rejected with a 4xx error. The Swagger UI at `/docs` was
also used for manual testing. All checks pass when the backend and Ollama are
running. The error situations required by the assignment were verified manually:
stopping the backend produces a connection error in the frontend, stopping the
model produces a clear backend error, an empty question is refused, and a slow
response shows the spinner.

## 7. Challenges Encountered

The main challenges were keeping the system simple while still covering the full
pipeline, handling the case where the model server is not running so the user sees
a helpful message rather than a stack trace, and tuning the prompt so answers stay
short and on topic. Latency was also a consideration: a small model was chosen so
responses return in a reasonable time on a laptop, and the model name was made
configurable so a lighter model can be used on weaker hardware.

## 8. Production Readiness Discussion

This is a prototype. The difference between this prototype and a production
deployment is discussed in the reflection below. In short, a production version
would add authentication and rate limiting, run behind a process manager and a
reverse proxy with HTTPS, use a managed or load-balanced model server, ship
structured and centralised logging with monitoring and alerts, redact or protect
student data, and run automated tests in a continuous-integration pipeline.

## 9. Conclusion

The project delivers a complete, self-hosted LLM application: a Streamlit
frontend, a FastAPI backend, and a locally served model, joined into one working
pipeline with configuration, logging, error handling, tests, and two bonus
features. It demonstrates the end-to-end process of turning a local model into a
usable application and shows where the gaps are between a prototype and a
production system.

## 10. Industry Production Reflection (Task 9)

1. **Main components of the system.** A Streamlit frontend, a FastAPI backend
   (request validation, prompt building, logging, error handling), a locally
   hosted LLM served by Ollama, a configuration layer, a logging layer, and a
   small FAQ knowledge base for the retrieval step.

2. **Why FastAPI is useful here.** It is quick to write, validates requests and
   responses with Pydantic, runs efficiently on an async server, and generates
   interactive Swagger documentation automatically, which makes the API easy to
   test and integrate.

3. **Role of the chosen LLM model.** The model performs the actual language
   understanding and answer generation. It reads the prompt (the instructions,
   any retrieved FAQ text, and the question) and produces the natural-language
   answer.

4. **Role of the frontend.** The frontend is how the student interacts with the
   system. It collects the question, sends it to the backend, shows a loading
   state, displays the answer and its metadata, and reports errors clearly.

5. **Local model vs external API.** Running the model locally keeps data on the
   device, removes per-request cost, and works offline, at the price of using the
   local machine's resources and a smaller model. An external API offers larger,
   stronger models and no local hardware burden, but sends data to a third party,
   costs money per request, and needs internet connectivity.

6. **Security risks in an organisation.** Exposure of student questions and
   answers if logs or traffic are not protected, an unauthenticated API that
   anyone on the network can call, prompt-injection or abuse of the model,
   denial of service from unlimited requests, and leakage of sensitive
   information into logs.

7. **Improvements before production.** Add authentication and authorisation, rate
   limiting, HTTPS behind a reverse proxy, a hardened and possibly scaled model
   server, input and output validation, centralised structured logging with
   monitoring and alerting, data-retention and redaction policies, and automated
   tests in CI.

8. **Monitoring in real-world use.** Track request rate, latency (median and
   tail), error rate, and model availability; collect structured logs in a
   central system; set alerts on error spikes and slow responses; and review the
   user ratings to watch answer quality over time.

9. **Protecting sensitive student information.** Avoid logging raw personal data
   (hash or redact it), restrict access with authentication and roles, encrypt
   data in transit (HTTPS) and at rest, set a log-retention period, and keep the
   model self-hosted so data never leaves the institution.

10. **Challenges faced during implementation.** Covering the whole pipeline while
    keeping it simple, handling the model-not-running case gracefully, tuning the
    prompt for short on-topic answers, and managing response latency on modest
    hardware.

## 11. Appendix: Screenshots and Code Snippets

See `docs/screenshots/` for the required evidence (virtual environment, model
running, backend running, Swagger `/docs`, frontend, a sample question and answer,
test output, and the log file). The checklist in `docs/SCREENSHOTS.md` maps each
required screenshot to the exact command or screen. Key code is in `backend/`,
`frontend/app.py`, and `tests/test_api.py`.
