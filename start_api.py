#!/usr/bin/env python3
"""
ReqRev API Startup Script
Quick way to start the API server with proper configuration.
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn
    from api.config import settings
    
    print("=" * 60)
    print("🚀 Starting ReqRev API Server")
    print("=" * 60)
    print(f"🤖 LLM Provider: OpenAI")
    print(f"📊 Model: {settings.OPENAI_MODEL}")
    print(f"🌐 API URL: http://{settings.API_HOST}:{settings.API_PORT}")
    print(f"📚 API Docs: http://{settings.API_HOST}:{settings.API_PORT}/docs")
    print(f"🔍 Health Check: http://{settings.API_HOST}:{settings.API_PORT}/health")
    print("=" * 60)
    
    uvicorn.run(
        "api.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )
