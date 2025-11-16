"""
ReqRev FastAPI Main Application
Provides secure API endpoints for requirement smell analysis.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from api.config import settings
from api.routers import requirements


# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("🚀 Starting ReqRev API...")
    logger.info(f"🤖 LLM Provider: OpenAI")
    logger.info(f"📊 Model: {settings.OPENAI_MODEL}")
    logger.info(f"🔒 CORS Origins: {settings.get_cors_origins()}")
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down ReqRev API...")


# Create FastAPI application
app = FastAPI(
    title="ReqRev API",
    description="Backend API for requirement smell detection using LLM analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS to allow extension requests
# This is secure because browser extensions need explicit permission
# to access these origins, and no sensitive data is exposed
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=False,  # No cookies/auth tokens
    allow_methods=["*"],  # Allow all methods including OPTIONS for preflight
    allow_headers=["*"],  # Allow all headers
    max_age=3600  # Cache preflight requests for 1 hour
)

# Register routers
app.include_router(
    requirements.router,
    prefix="/api/v1",
    tags=["requirements"]
)


@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "service": "ReqRev API",
        "version": "1.0.0",
        "status": "healthy",
        "provider": "openai",
        "model": settings.OPENAI_MODEL
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "provider": "openai",
        "model": settings.OPENAI_MODEL
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "api.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )
