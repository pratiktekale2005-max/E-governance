# AI Citizen OS - Backend Service

Production-ready FastAPI backend providing AI-driven citizen services, authentication, RAG pipelines, scheme eligibility checks, and database management.

## 🚀 Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Server**: [Uvicorn](https://www.uvicorn.org/)
- **Database**: PostgreSQL with [SQLAlchemy](https://www.sqlalchemy.org/) & [Alembic](https://alembic.sqlalchemy.org/)
- **Configuration**: `pydantic-settings` & `python-dotenv`
- **Logging**: [Loguru](https://github.com/Delgan/loguru)
- **Rate Limiting**: [SlowAPI](https://github.com/laurents/slowapi)
- **Authentication**: PyJWT / python-jose & Passlib (Bcrypt)
- **Containerization**: Docker & Docker Compose

---

## 📁 Project Structure

```text
backend/
├── app/
│   ├── api/
│   │   ├── routes/          # API endpoints (health, auth, chat, schemes, user)
│   │   └── dependencies.py  # FastAPI dependency injection helpers
│   │
│   ├── auth/                # JWT generation, token verification, password hashing
│   ├── database/            # SQLAlchemy engine, session management, ORM models
│   ├── ai/                  # RAG pipeline, LLM integration, prompts, embeddings
│   ├── services/            # Business logic (chat, schemes, user management)
│   ├── models/              # Pydantic schemas for request & response validation
│   ├── utils/               # Logger, rate limiter, app configuration
│   └── main.py              # Application entrypoint & middleware setup
│
├── logs/                    # Automated application log directory
├── .env                     # Local environment variables
├── requirements.txt         # Pinned python dependencies
├── Dockerfile               # Production multi-stage Docker build
└── docker-compose.yml       # Local development stack (FastAPI + PostgreSQL)
```

---

## ⚙️ Quick Start

### 1. Local Setup (Virtual Environment)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Docker Setup

```bash
# Build and launch all services (Backend + PostgreSQL)
docker compose up --build
```

---

## 📖 API Documentation

Once the server is running:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
