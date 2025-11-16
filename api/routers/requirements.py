"""
Requirements Router
Handles requirement analysis endpoints.
"""

from typing import Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import logging

from api.services.analyzer import analyze_requirement


logger = logging.getLogger(__name__)

router = APIRouter()


# Request/Response Models
class AnalyzeRequirementRequest(BaseModel):
    """Request model for requirement analysis."""
    requirement_id: str = Field(..., description="Unique requirement identifier (e.g., REQ-1)")
    description: str = Field(..., min_length=1, description="The requirement text to analyze")
    activity_points: Optional[int] = Field(None, ge=0, le=100, description="Optional activity score")
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "requirement_id": "REQ-1",
                    "description": "The system shall provide secure user authentication using OAuth 2.0 or similar industry-standard protocols.",
                    "activity_points": 85
                }
            ]
        }
    }


class AnalyzeRequirementResponse(BaseModel):
    """Response model for requirement analysis."""
    requirement_id: str = Field(..., description="The requirement identifier from the request")
    description: str = Field(..., description="The analyzed requirement text")
    smells: list[str] = Field(default_factory=list, description="List of detected requirement smells")
    explanation: Optional[str] = Field(None, description="Human-readable explanation of the analysis")
    raw_model_output: Optional[Any] = Field(None, description="Raw output from the LLM model")
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "requirement_id": "REQ-1",
                    "description": "The system shall provide secure user authentication using OAuth 2.0 or similar industry-standard protocols.",
                    "smells": ["ambiguity", "weak_verb"],
                    "explanation": "The requirement contains ambiguous terms ('similar') and weak verbs ('provide').",
                    "raw_model_output": None
                }
            ]
        }
    }


@router.post(
    "/analyze_requirement",
    response_model=AnalyzeRequirementResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze a requirement for smells",
    description="Analyzes a requirement using LLM to detect potential quality issues (smells) based on ISO 29148 standards."
)
async def analyze_requirement_endpoint(request: AnalyzeRequirementRequest) -> AnalyzeRequirementResponse:
    """
    Analyze a requirement for potential quality issues.
    
    This endpoint uses LLM analysis to detect requirement smells such as:
    - Ambiguity
    - Incompleteness
    - Weak verbs
    - Subjective language
    - And other ISO 29148 quality criteria
    
    Args:
        request: The requirement analysis request
        
    Returns:
        Analysis results including detected smells and explanations
        
    Raises:
        HTTPException: If analysis fails due to configuration or service errors
    """
    try:
        logger.info(f"Analyzing requirement: {request.requirement_id}")
        
        # Call the analyzer service
        result = await analyze_requirement(
            requirement_id=request.requirement_id,
            description=request.description,
            activity_points=request.activity_points
        )
        
        logger.info(f"Analysis complete for {request.requirement_id}: {len(result.smells)} smells detected")
        
        return AnalyzeRequirementResponse(
            requirement_id=request.requirement_id,
            description=request.description,
            smells=result.smells,
            explanation=result.explanation,
            raw_model_output=result.raw_output
        )
        
    except ValueError as e:
        logger.error(f"Validation error analyzing {request.requirement_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error analyzing {request.requirement_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze requirement. Please check server logs."
        )


@router.get(
    "/models",
    summary="Get model information",
    description="Returns information about the currently configured OpenAI model."
)
async def list_models():
    """Get current OpenAI model configuration."""
    from api.config import settings
    
    return {
        "provider": "openai",
        "model": settings.OPENAI_MODEL,
        "configured": bool(settings.OPENAI_API_KEY),
        "max_tokens": settings.OPENAI_MAX_TOKENS,
        "temperature": settings.OPENAI_TEMPERATURE
    }
