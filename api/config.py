"""
Configuration management for ReqRev API
Loads environment variables and validates configuration.
"""

import os
import logging
from typing import Literal, Optional
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    No secrets are hardcoded - everything comes from the environment.
    """
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = False
    
    # CORS Configuration
    # Note: GitHub.com is needed because content scripts run in the page context
    CORS_ORIGINS: str = "chrome-extension://*,moz-extension://*,http://localhost:*,https://github.com"
    
    # LLM Provider Configuration (OpenAI only)
    # Set OPENAI_MODEL to your fine-tuned model, e.g. "ft:gpt-4o-mini:org:model-id:smells"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"  # Default to base model; override with fine-tuned model in env
    OPENAI_MAX_TOKENS: int = 1500
    OPENAI_TEMPERATURE: float = 0.0  # Deterministic detection
    
    # Judge Configuration (LLM-as-Judge for evaluation)
    JUDGE_MODEL: str = "gpt-4o"
    JUDGE_MAX_TOKENS: int = 1000
    JUDGE_TEMPERATURE: float = 0.0  # Deterministic evaluation
    LLM_JUDGE_ENABLED: bool = True
    
    # Application Configuration
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
    
    def validate_llm_config(self) -> None:
        """
        Validate that required API keys are present for OpenAI.
        Raises ValueError if configuration is invalid.
        """
        if not self.OPENAI_API_KEY:
            raise ValueError(
                "OPENAI_API_KEY is required. "
                "Please set OPENAI_API_KEY in your environment or .env file."
            )
    
    def validate_judge_config(self) -> bool:
        """
        Check if judge configuration is valid.
        
        Returns:
            True if judge is properly configured, False otherwise
        """
        if not self.LLM_JUDGE_ENABLED:
            return False
        
        if not self.OPENAI_API_KEY:
            logger.warning(
                "LLM_JUDGE_ENABLED=true but OPENAI_API_KEY is not set. "
                "Judge functionality will be disabled."
            )
            return False
        
        return True
    
    def is_judge_available(self) -> bool:
        """
        Check if judge functionality is available.
        
        Returns:
            True if judge can be used, False otherwise
        """
        return self.LLM_JUDGE_ENABLED and bool(self.OPENAI_API_KEY)
    
    def get_cors_origins(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Global settings instance
settings = Settings()

# Validate configuration on startup
try:
    settings.validate_llm_config()
except ValueError as e:
    print(f"⚠️  Configuration Warning: {e}")
    print("The API will start but LLM analysis will fail until configuration is fixed.")
