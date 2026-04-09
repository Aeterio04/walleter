# Walleter Backend API

FastAPI backend for the Walleter finance dashboard.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Seed Database

```bash
python seed.py
```

This creates:
- Demo user: `demo@walleter.app` / `demo123`
- 15 sample transactions
- 6 budget categories
- 4 investments
- Emergency fund: ₹3,000 / ₹15,000

### 3. Run Server

```bash
uvicorn main:app --reload --port 8000
```

API runs at: `http://localhost:8000`  
Docs at: `http://localhost:8000/docs`

## API Endpoints

### Auth
- `POST /auth/signup` - Create account
- `POST /auth/login` - Login (returns access + refresh tokens)
- `POST /auth/refresh` - Get new access token
- `POST /auth/logout` - Invalidate refresh token

### Users
- `GET /users/me` - Get profile
- `PATCH /users/me` - Update profile (name, plan, emergency fund)

### Transactions
- `GET /transactions` - List all (filters: type, category)
- `POST /transactions` - Create
- `PATCH /transactions/{id}` - Update
- `DELETE /transactions/{id}` - Delete

### Budgets
- `GET /budgets` - List all (includes computed `spent` field)
- `POST /budgets` - Create
- `PATCH /budgets/{id}` - Update
- `DELETE /budgets/{id}` - Delete

### Investments
- `GET /investments` - List all
- `POST /investments` - Create
- `PATCH /investments/{id}` - Update
- `DELETE /investments/{id}` - Delete

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

Access tokens expire in 30 minutes.  
Refresh tokens expire in 7 days.

## Database

SQLite: `walleter.db` (created automatically)

Tables: `users`, `refresh_tokens`, `transactions`, `budgets`, `investments`

## Environment Variables

Copy `.env.example` to `.env` and customize:

```env
DATABASE_URL=sqlite:///./walleter.db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

## Tech Stack

- FastAPI 0.109
- SQLAlchemy 2.0
- Pydantic v2
- python-jose (JWT)
- passlib + bcrypt (password hashing)
- uvicorn (ASGI server)
