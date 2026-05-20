from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from app.core.settings import settings
from collections.abc import Generator

# create database engine, to handle all logic of database
engine = create_engine(
    settings.database_url,
    connect_args=(
        {"check_same_thread": False}
        if settings.database_url.startswith("sqlite")
        else {}
    ),
)

# create database session
SessionLocal = sessionmaker(autocomit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Function to getting the current database
# if not create a database
def get_db() -> Generator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
