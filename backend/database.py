from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import get_settings
from models import Base

settings = get_settings()

if settings.DB_HOST and settings.DB_USER:
    DATABASE_URL = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
else:
    DATABASE_URL = settings.DATABASE_URL

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
