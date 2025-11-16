"""
ISO29148 Requirement Smell Detector
Uses OpenAI fine-tuned model for requirement smell detection.
"""

import logging
from typing import Optional

from api.config import settings
from llm_service.models.requirement_smell_result import RequirementSmellResult
from llm_service.openai_client import OpenAIClient


logger = logging.getLogger(__name__)


class ISO29148Detector:
    """
    Requirement smell detector using OpenAI fine-tuned model.
    
    This class provides a unified interface for requirement analysis
    based on ISO 29148 standards and comprehensive smell taxonomy.
    """
    
    def __init__(self):
        """Initialize the detector with OpenAI client."""
        self._client: Optional[OpenAIClient] = None
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize the OpenAI client."""
        logger.info("Initializing ISO29148 detector with OpenAI")
        
        try:
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY not configured")
            
            self._client = OpenAIClient(
                api_key=settings.OPENAI_API_KEY,
                model=settings.OPENAI_MODEL,
                max_tokens=settings.OPENAI_MAX_TOKENS,
                temperature=settings.OPENAI_TEMPERATURE
            )
            logger.info(f"OpenAI client initialized with model: {settings.OPENAI_MODEL}")
                
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {str(e)}")
            raise
    
    async def analyze_requirement(
        self,
        requirement_text: str,
        timeout: float = 30.0
    ) -> RequirementSmellResult:
        """
        Analyze a requirement for quality smells.
        
        Args:
            requirement_text: The requirement text to analyze
            timeout: Request timeout in seconds
            
        Returns:
            RequirementSmellResult with detected smells
            
        Raises:
            ValueError: If client not initialized or requirement text is empty
            Exception: If analysis fails
        """
        if not self._client:
            raise ValueError("LLM client not initialized. Check configuration.")
        
        logger.info("Analyzing requirement for ISO29148 compliance")
        
        try:
            result = await self._client.analyze_requirement(
                requirement_text=requirement_text,
                timeout=timeout
            )
            
            logger.info(f"Analysis complete: {len(result.smells)} smells detected")
            return result
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise
    
    def get_provider_info(self) -> dict:
        """Get information about the current provider configuration."""
        return {
            "provider": "openai",
            "model": settings.OPENAI_MODEL,
            "configured": self._client is not None
        }


# Singleton instance
_detector_instance: Optional[ISO29148Detector] = None


def get_detector() -> ISO29148Detector:
    """
    Get the singleton detector instance.
    
    Returns:
        ISO29148Detector instance
    """
    global _detector_instance
    
    if _detector_instance is None:
        _detector_instance = ISO29148Detector()
    
    return _detector_instance
