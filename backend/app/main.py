import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.config import settings
from app.database import Base, engine
from app.routers import customers, inventory, orders, products

logger = logging.getLogger(__name__)


def init_db(retries: int = 15, delay: float = 3.0) -> None:
    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables ready")
            return
        except OperationalError as exc:
            logger.warning("Database not ready (attempt %s/%s): %s", attempt, retries, exc)
            if attempt == retries:
                raise
            time.sleep(delay)


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Inventory & Order Management API",
    description="API for managing products, customers, orders, and inventory tracking",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Inventory & Order Management API", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
