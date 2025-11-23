"""
Analyzer Service
Business logic layer for requirement analysis.
"""

import logging
from typing import Optional

from llm_service.iso29148_detector import get_detector
from llm_service.models.requirement_smell_result import (
    RequirementSmellResult,
    RequirementAnalysisWithJudgeResult,
    JudgeEvaluation
)
from api.config import settings


logger = logging.getLogger(__name__)


async def analyze_requirement(
    requirement_id: str,
    description: str,
    activity_points: Optional[int] = None
) -> RequirementSmellResult:
    """
    Analyze a requirement for quality smells.
    
    This is the main business logic function that orchestrates the analysis
    process. It validates inputs, calls the LLM service, and returns results.
    
    Args:
        requirement_id: Unique identifier for the requirement
        description: The requirement text to analyze
        activity_points: Optional activity score (not currently used in analysis)
        
    Returns:
        RequirementSmellResult with detected smells and explanation
        
    Raises:
        ValueError: If inputs are invalid
        Exception: If analysis fails
    """
    # Validate inputs
    if not requirement_id or not requirement_id.strip():
        raise ValueError("requirement_id cannot be empty")
    
    if not description or not description.strip():
        raise ValueError("description cannot be empty")
    
    logger.info(f"Analyzing requirement {requirement_id}")
    logger.debug(f"Description: {description[:100]}...")
    
    try:
        # Get the LLM detector instance
        detector = get_detector()
        
        # Perform analysis
        result = await detector.analyze_requirement(
            requirement_text=description,
            timeout=30.0
        )
        
        # Log results
        logger.info(
            f"Analysis complete for {requirement_id}: "
            f"{len(result.smells)} smells detected"
        )
        
        if result.smells:
            logger.debug(f"Detected smells: {', '.join(result.smells)}")
        
        return result
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Analysis failed for {requirement_id}: {str(e)}", exc_info=True)
        raise


async def analyze_requirement_with_judge(
    requirement_id: str,
    description: str,
    activity_points: Optional[int] = None
) -> RequirementAnalysisWithJudgeResult:
    """
    Analyze a requirement and evaluate the results using LLM-as-Judge.
    
    This function performs two steps:
    1. Analyzes the requirement using the primary OpenAI model
    2. Evaluates the analysis quality using an OpenRouter judge model
    
    Args:
        requirement_id: Unique identifier for the requirement
        description: The requirement text to analyze
        activity_points: Optional activity score (not currently used in analysis)
        
    Returns:
        RequirementAnalysisWithJudgeResult with base analysis + judge evaluation
        
    Raises:
        ValueError: If inputs are invalid or judge is not configured
        Exception: If analysis or evaluation fails
    """
    # Check if judge is enabled and configured
    if not settings.is_judge_available():
        raise ValueError(
            "LLM Judge is not available. Please ensure OPENAI_API_KEY is set and "
            "LLM_JUDGE_ENABLED=true in your environment."
        )
    
    logger.info(f"Analyzing requirement {requirement_id} with judge evaluation")
    
    # Step 1: Perform base analysis with primary model
    base_result = await analyze_requirement(requirement_id, description, activity_points)
    
    # Step 2: Evaluate the analysis with judge model
    try:
        from llm_service.judge_client import JudgeClient
        
        judge_client = JudgeClient(
            api_key=settings.OPENAI_API_KEY,
            model=settings.JUDGE_MODEL,
            max_tokens=settings.JUDGE_MAX_TOKENS,
            temperature=settings.JUDGE_TEMPERATURE
        )
        
        judge_result = await judge_client.evaluate_requirement_analysis(
            requirement_text=description,
            smells=base_result.smells,
            explanation=base_result.explanation
        )
        
        # Create judge evaluation model
        judge_evaluation = JudgeEvaluation(**judge_result)
        
        logger.info(
            f"Judge evaluation complete for {requirement_id}: "
            f"verdict={judge_evaluation.verdict}, score={judge_evaluation.score:.2f}"
        )
        
        # Combine base result with judge evaluation
        return RequirementAnalysisWithJudgeResult(
            smells=base_result.smells,
            explanation=base_result.explanation,
            raw_output=base_result.raw_output,
            judge_evaluation=judge_evaluation
        )
        
    except Exception as e:
        logger.error(f"Judge evaluation failed for {requirement_id}: {str(e)}", exc_info=True)
        # Return a failed evaluation rather than raising
        # This allows the base analysis to still be useful
        failed_evaluation = JudgeEvaluation(
            verdict="review",
            score=0.0,
            justification=f"Judge evaluation failed: {str(e)}",
            suggested_corrections=[],
            raw_judge_output={"error": str(e)}
        )
        
        return RequirementAnalysisWithJudgeResult(
            smells=base_result.smells,
            explanation=base_result.explanation,
            raw_output=base_result.raw_output,
            judge_evaluation=failed_evaluation
        )


async def batch_analyze_requirements(
    requirements: list[tuple[str, str, Optional[int]]]
) -> dict[str, RequirementSmellResult]:
    """
    Analyze multiple requirements in batch.
    
    Args:
        requirements: List of (requirement_id, description, activity_points) tuples
        
    Returns:
        Dictionary mapping requirement_id to RequirementSmellResult
    """
    results = {}
    
    for req_id, description, activity_points in requirements:
        try:
            result = await analyze_requirement(req_id, description, activity_points)
            results[req_id] = result
        except Exception as e:
            logger.error(f"Failed to analyze {req_id}: {str(e)}")
            # Store error result
            results[req_id] = RequirementSmellResult(
                smells=["analysis_error"],
                explanation=f"Analysis failed: {str(e)}",
                raw_output=None
            )
    
    return results
