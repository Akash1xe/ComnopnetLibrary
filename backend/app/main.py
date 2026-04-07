from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy import text

from app import __version__
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.logging import configure_logging
from app.core.redis import redis_client
from app.middleware.cors import add_cors
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_id import RequestIDMiddleware


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    async with AsyncSessionLocal() as session:
        await session.execute(text("SELECT 1"))
    await redis_client.ping()
    yield
    await redis_client.aclose()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=__version__,
        debug=settings.debug,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    add_cors(app)
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.include_router(api_router, prefix=settings.api_v1_prefix)
    Instrumentator().instrument(app).expose(app, include_in_schema=False)

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "request_id": getattr(request.state, "request_id", None)},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "detail": exc.errors(),
                "request_id": getattr(request.state, "request_id", None),
            },
        )

    @app.get("/health", tags=["health"])
    async def health():
        db_status = "ok"
        redis_status = "ok"
        try:
            async with AsyncSessionLocal() as session:
                await session.execute(text("SELECT 1"))
        except Exception:
            db_status = "error"
        try:
            await redis_client.ping()
        except Exception:
            redis_status = "error"
        return {"status": "ok", "db": db_status, "redis": redis_status, "version": __version__}

    return app


app = create_app()
