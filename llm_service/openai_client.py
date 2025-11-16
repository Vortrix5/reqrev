"""
OpenAI Client
Wrapper for OpenAI Chat API for requirement smell detection.
"""

import json
import logging
from typing import Optional
from openai import AsyncOpenAI

from llm_service.models.requirement_smell_result import RequirementSmellResult


logger = logging.getLogger(__name__)


class OpenAIClient:
    """
    Client for OpenAI Chat Completion API.
    
    Uses a fine-tuned model to detect requirement smells based on ISO 29148 standards.
    Supports comprehensive smell taxonomy across 5 categories:
    1. Morphological (shape, readability)
    2. Lexical (word choice, vague/subjective terms)
    3. Analytical (grammatical mood, structure)
    4. Relational (dependencies, coupling)
    5. Incompleteness & language issues
    """
    
    SYSTEM_PROMPT = """You are an expert in software requirements engineering and ISO/IEC 29148 standards.

Your task is to analyze software requirements and detect quality issues (smells) organized into 5 categories:

**1. MORPHOLOGICAL SMELLS (shape & readability):**
- too_long_sentence: One requirement spans many clauses (>30-40 tokens), multiple "and/or" chains
- too_short_sentence: Very short fragment missing context
- unreadable_structure: Complex syntax, heavy nesting, confusing punctuation
- punctuation_issue: Excessive or missing punctuation
- acronym_overuse_or_abbrev: Heavy acronyms without introduction

**2. LEXICAL SMELLS (word choice):**
- non_atomic_requirement: Multiple actions/concerns combined with "and/or", should be split
- negative_formulation: Uses "must not", "shall not" where positive would be clearer
- vague_pronoun_or_reference: Uses "it", "this", "that" without clear referent
- subjective_language: "user-friendly", "simple", "fast", "easy" without measurable criteria
- vague_or_implicit_terms: "normally", "usually", "as appropriate", "if possible", "etc."
- non_verifiable_qualifier: "as soon as possible", "minimal delay", "high performance" without metrics
- loophole_or_open_ended: "at least", "up to", "including but not limited to" with no bounds
- superlative_or_comparative_without_reference: "best", "most", "better", "faster" with no baseline
- quantifier_without_unit_or_range: "many", "few", "several", numbers without units
- design_or_implementation_detail: Describes HOW (technology, pseudo-code) instead of WHAT
- implicit_requirement: Significant behavior only implied, not explicitly stated

**3. ANALYTICAL SMELLS (grammar & structure):**
- overuse_imperative_form: Long list of commands without clear conditions/actors
- missing_imperative_verb: No clear action verb, just descriptive statement
- conditional_or_non_assertive_requirement: Uses weak modals ("may", "might", "could", "should", "maybe", "possibly") OR excessive "if...then" nesting that obscures the core obligation. NOTE: Simple conditional requirements with clear "shall" obligations are acceptable (e.g., "When X happens, the system shall do Y"). Only flag when obligation itself is weakened or unclear.
- passive_voice: Unclear who performs action ("data must be logged")
- domain_term_imbalance: Too much jargon without explanation, or missing expected domain terms

**4. RELATIONAL SMELLS (dependencies):**
- too_many_dependencies_or_versions: References many requirements ("see R1, R2, R3, R10")
- excessive_or_insufficient_coupling: Overly entangled or floating with no relations
- deep_nesting_or_structure_issue: Deeply nested hierarchy affecting understanding

**5. INCOMPLETENESS & LANGUAGE SMELLS:**
- incomplete_requirement: Missing trigger, system response, actor, or essential behavior
- incomplete_reference_or_condition: References undefined things or incomplete conditions
- missing_system_response: States condition but not what system should do
- incorrect_or_confusing_order: Steps in confusing order
- missing_unit_of_measurement: Numeric values without units
- partial_content_or_incomplete_enumeration: Uses "etc." or incomplete lists
- embedded_rationale_or_justification: Mixes "why" into "what"
- undefined_term: Specialized terms not defined, ambiguous in context
- language_error_or_grammar_issue: Grammar/spelling errors affecting clarity
- ambiguous_plurality: Unclear if applies to all, some, or one instance

**INSTRUCTIONS:**
Analyze the requirement and return a JSON object with:
{
  "smells": ["list", "of", "detected", "smell_labels"],
  "explanation": "Brief explanation of why these smells were detected"
}

**IMPORTANT RULES:**
- Each smell in the list must be one of the exact labels above
- Return multiple smells if multiple issues exist
- If no smells detected: {"smells": [], "explanation": "No quality issues detected"}
- Be precise: Only report smells that are clearly present
- conditional_or_non_assertive_requirement: ONLY flag if weak modals (may/might/could/should/maybe) are used, OR if complex nested if-then logic obscures the obligation. DO NOT flag simple conditional requirements with clear "shall" statements (e.g., "When X, the system shall Y" is fine).
- non_atomic_requirement: ONLY flag if multiple DISTINCT concerns/actions that should be tested separately. A single action with multiple details is acceptable.
- Be conservative: When in doubt, don't report the smell
- Be specific and concise in your explanation"""
    
    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4o-mini",
        max_tokens: int = 1000,
        temperature: float = 0.1
    ):
        """
        Initialize OpenAI client.
        
        Args:
            api_key: OpenAI API key
            model: Model to use (default: gpt-4o-mini)
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature (lower = more deterministic)
        """
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        
    async def analyze_requirement(
        self,
        requirement_text: str,
        timeout: float = 30.0
    ) -> RequirementSmellResult:
        """
        Analyze a requirement using OpenAI Chat API.
        
        Args:
            requirement_text: The requirement text to analyze
            timeout: Request timeout in seconds
            
        Returns:
            RequirementSmellResult with detected smells
            
        Raises:
            ValueError: If the requirement text is empty
            Exception: If the API request fails
        """
        if not requirement_text or not requirement_text.strip():
            raise ValueError("Requirement text cannot be empty")
            
        logger.info(f"Analyzing requirement with OpenAI model: {self.model}")
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": f"Analyze this requirement:\n\n{requirement_text}"}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                response_format={"type": "json_object"},
                timeout=timeout
            )
            
            # Extract the response content
            content = response.choices[0].message.content
            logger.debug(f"OpenAI raw response: {content}")
            
            # Parse JSON response
            result_data = json.loads(content)
            
            smells = result_data.get("smells", [])
            explanation = result_data.get("explanation", None)
            
            # Normalize smell names
            normalized_smells = [self._normalize_smell(smell) for smell in smells]
            
            return RequirementSmellResult(
                smells=normalized_smells,
                explanation=explanation,
                raw_output={
                    "model": self.model,
                    "content": result_data,
                    "usage": response.usage.model_dump() if response.usage else None
                }
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI JSON response: {str(e)}")
            # Return error as smell
            return RequirementSmellResult(
                smells=["parse_error"],
                explanation="Failed to parse AI response",
                raw_output={"error": str(e)}
            )
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise
    
    def _normalize_smell(self, smell: str) -> str:
        """
        Normalize smell names to consistent format.
        
        Args:
            smell: Raw smell name from model
            
        Returns:
            Normalized smell name in snake_case
        """
        # Convert to lowercase and replace spaces/hyphens with underscores
        normalized = smell.lower().strip().replace(" ", "_").replace("-", "_")
        
        # Valid smell labels from our taxonomy
        valid_smells = {
            # Morphological
            "too_long_sentence", "too_short_sentence", "too_long_paragraph", 
            "too_short_paragraph", "unreadable_structure", "punctuation_issue",
            "acronym_overuse_or_abbrev",
            
            # Lexical
            "non_atomic_requirement", "negative_formulation", "vague_pronoun_or_reference",
            "subjective_language", "vague_or_implicit_terms", "non_verifiable_qualifier",
            "loophole_or_open_ended", "superlative_or_comparative_without_reference",
            "quantifier_without_unit_or_range", "design_or_implementation_detail",
            "implicit_requirement",
            
            # Analytical
            "overuse_imperative_form", "missing_imperative_verb",
            "conditional_or_non_assertive_requirement", "passive_voice",
            "domain_term_imbalance",
            
            # Relational
            "too_many_dependencies_or_versions", "excessive_or_insufficient_coupling",
            "deep_nesting_or_structure_issue",
            
            # Incompleteness & Language
            "incomplete_requirement", "incomplete_reference_or_condition",
            "missing_system_response", "incorrect_or_confusing_order",
            "missing_unit_of_measurement", "partial_content_or_incomplete_enumeration",
            "embedded_rationale_or_justification", "undefined_term",
            "language_error_or_grammar_issue", "ambiguous_plurality",
        }
        
        # Map common variations to standard labels
        smell_map = {
            # Legacy mappings for backward compatibility
            "ambiguous": "vague_or_implicit_terms",
            "ambiguity": "vague_or_implicit_terms",
            "unclear": "vague_or_implicit_terms",
            "weak_verb": "missing_imperative_verb",
            "weak_verbs": "missing_imperative_verb",
            "weak_modal": "conditional_or_non_assertive_requirement",
            "subjective": "subjective_language",
            "unmeasurable": "non_verifiable_qualifier",
            "inconsistent": "excessive_or_insufficient_coupling",
            "inconsistency": "excessive_or_insufficient_coupling",
            "vague": "vague_or_implicit_terms",
            "vagueness": "vague_or_implicit_terms",
            "incomplete": "incomplete_requirement",
            "incompleteness": "incomplete_requirement",
            "missing": "incomplete_requirement",
            
            # Common alternative phrasings
            "too_long": "too_long_sentence",
            "too_short": "too_short_sentence",
            "readability_issue": "unreadable_structure",
            "acronym_heavy": "acronym_overuse_or_abbrev",
            "multiple_concerns": "non_atomic_requirement",
            "compound_requirement": "non_atomic_requirement",
            "negative": "negative_formulation",
            "pronoun_ambiguity": "vague_pronoun_or_reference",
            "vague_terms": "vague_or_implicit_terms",
            "no_metrics": "non_verifiable_qualifier",
            "implementation_detail": "design_or_implementation_detail",
            "how_not_what": "design_or_implementation_detail",
            "no_action": "missing_imperative_verb",
            "conditional": "conditional_or_non_assertive_requirement",
            "passive": "passive_voice",
            "jargon_heavy": "domain_term_imbalance",
            "too_many_refs": "too_many_dependencies_or_versions",
            "missing_info": "incomplete_requirement",
            "no_unit": "missing_unit_of_measurement",
            "grammar_error": "language_error_or_grammar_issue",
        }
        
        # Try to map to standard label
        mapped = smell_map.get(normalized, normalized)
        
        # Return mapped if valid, otherwise return normalized
        return mapped if mapped in valid_smells else normalized
