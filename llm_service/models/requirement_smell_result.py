"""
Requirement Smell Result Model
Data model for LLM analysis results.
"""

from typing import Any, Optional, List, Dict
try:
    from typing import Literal
except ImportError:
    from typing_extensions import Literal
from pydantic import BaseModel, Field


class RequirementSmellResult(BaseModel):
    """
    Result of requirement smell analysis.
    
    This model encapsulates the output from any LLM provider,
    providing a consistent interface for the API layer.
    """
    
    smells: List[str] = Field(
        default_factory=list,
        description="List of detected requirement smells/quality issues"
    )
    
    explanation: Optional[str] = Field(
        None,
        description="Human-readable explanation of the detected smells"
    )
    
    raw_output: Optional[Any] = Field(
        None,
        description="Raw output from the LLM for debugging/analysis"
    )
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "smells": ["ambiguity", "weak_verb", "subjective"],
                    "explanation": "The requirement contains ambiguous terms and weak modal verbs that reduce clarity.",
                    "raw_output": {"confidence": 0.85, "model": "roberta-base"}
                }
            ]
        }
    }
    
    def has_smells(self) -> bool:
        """Check if any smells were detected."""
        return len(self.smells) > 0
    
    def smell_count(self) -> int:
        """Get the number of detected smells."""
        return len(self.smells)


class JudgeEvaluation(BaseModel):
    """
    LLM-as-Judge evaluation of requirement smell analysis.
    
    An independent model evaluates the quality of smell detection
    performed by the primary model.
    """
    
    verdict: Literal["accept", "review", "reject"] = Field(
        ...,
        description=(
            "Overall verdict: 'accept' (accurate & complete), "
            "'review' (mostly OK, minor issues), "
            "'reject' (significant errors or omissions)"
        )
    )
    
    score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Quality score from 0.0 (completely wrong) to 1.0 (perfect)"
    )
    
    justification: str = Field(
        ...,
        description="Detailed explanation of the evaluation and score"
    )
    
    suggested_corrections: List[str] = Field(
        default_factory=list,
        description="Specific suggestions for improving the smell detection"
    )
    
    raw_judge_output: Optional[Dict[str, Any]] = Field(
        None,
        description="Raw output from the judge model for debugging"
    )
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "verdict": "review",
                    "score": 0.75,
                    "justification": "The detected smells are mostly appropriate but the analysis missed 'implicit_requirement'.",
                    "suggested_corrections": [
                        "Add 'implicit_requirement' smell - authentication method is implied but not explicit",
                        "Consider 'non_verifiable_qualifier' for 'user-friendly' which lacks measurable criteria"
                    ],
                    "raw_judge_output": {
                        "model": "meta-llama/llama-3.3-70b-instruct:free",
                        "content": {},
                        "usage": {}
                    }
                }
            ]
        }
    }


class RequirementAnalysisWithJudgeResult(RequirementSmellResult):
    """
    Extended result that includes LLM-as-Judge evaluation.
    
    This model extends the base RequirementSmellResult with an additional
    judge_evaluation field containing the independent assessment.
    """
    
    judge_evaluation: JudgeEvaluation = Field(
        ...,
        description="Independent evaluation of the smell detection quality"
    )
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "smells": ["subjective_language", "vague_or_implicit_terms"],
                    "explanation": "The requirement uses subjective terms like 'user-friendly' and vague phrases.",
                    "raw_output": {
                        "model": "gpt-4o-mini",
                        "content": {},
                        "usage": {}
                    },
                    "judge_evaluation": {
                        "verdict": "accept",
                        "score": 0.85,
                        "justification": "Smells are correctly identified and explained.",
                        "suggested_corrections": [],
                        "raw_judge_output": {}
                    }
                }
            ]
        }
    }
