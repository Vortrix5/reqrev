"""
Requirement Smell Result Model
Data model for LLM analysis results.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field


class RequirementSmellResult(BaseModel):
    """
    Result of requirement smell analysis.
    
    This model encapsulates the output from any LLM provider,
    providing a consistent interface for the API layer.
    """
    
    smells: list[str] = Field(
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
