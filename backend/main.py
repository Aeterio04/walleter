from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import Base, engine
from routers import auth, users, transactions, budgets, investments, insights, copilot

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Walleter API",
    description="Backend API for Walleter finance dashboard",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(investments.router)
app.include_router(insights.router)
app.include_router(copilot.router)


@app.get("/")
def root():
    return {"message": "Walleter API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
