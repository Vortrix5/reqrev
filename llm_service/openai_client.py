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
- vague_or_implicit_terms: "normally", "usually", "as appropriate", "if possible", "etc.", OR vague nouns lacking specificity like "functionality", "capability", "feature", "information", "data", "system", "process" used without concrete details about what/how/when
- non_verifiable_qualifier: Vague performance terms WITHOUT any metrics: "as soon as possible", "minimal delay", "high performance", "quickly", "efficiently". DO NOT flag if specific numeric metrics are provided (e.g., "500 milliseconds", "2 seconds" are verifiable even if context could be better)
- loophole_or_open_ended: "at least", "up to", "including but not limited to", "minimum of", "no less than" with no upper/lower bounds or clear limits. Example: "at least 1000 TPS" (no upper limit defined) → FLAG
- superlative_or_comparative_without_reference: "best", "most", "better", "faster" with no baseline
- quantifier_without_unit_or_range: "many", "few", "several", numbers without units, OR overly broad/vague quantifiers like "all", "any", "every" without explicit scope boundaries (e.g., "all user data" - which data types? "all users" - which user categories?)
- design_or_implementation_detail: Specifies HOW instead of WHAT. Flag if requirement mentions: specific technologies ("OAuth 2.0", "MySQL"), specific algorithms ("AES-256", "SHA-256"), implementation mechanisms ("database", "cache", "queue"), or technical architecture details. Requirements should state the capability/behavior needed, not the solution approach.
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
- incomplete_requirement: Missing essential details like WHAT specifically (e.g., "provide backup functionality" - backup what? when? how often?), WHO (actor), WHEN (trigger/conditions), or WHERE (scope/boundary). If a requirement is too vague to implement without making major assumptions, it's incomplete.
- incomplete_reference_or_condition: References undefined things or incomplete conditions
- missing_system_response: States condition but not what system should do
- incorrect_or_confusing_order: Steps in confusing order
- missing_unit_of_measurement: Numeric values without units
- partial_content_or_incomplete_enumeration: Uses "etc." or incomplete lists
- embedded_rationale_or_justification: Mixes "why" into "what"
- undefined_term: Specialized terms not defined, ambiguous in context
- language_error_or_grammar_issue: Grammar/spelling errors affecting clarity
- ambiguous_plurality: Unclear if applies to all, some, or one instance

**DETECTION GUIDELINES:**

1. **Implementation Details** (design_or_implementation_detail): 
   - Flag if mentions: specific technology/protocol names (OAuth 2.0, AES-256), specific vendors (MySQL, AWS), implementation mechanisms (database, cache), technical architecture
   - ALWAYS FLAG: References to databases, caches, specific algorithms, protocols by name
   - Example: "validate against database" → flag (mentions "database" = HOW); "validate credentials" → OK (states WHAT)

2. **Vague Terms** (vague_or_implicit_terms): 
   - Generic nouns like "functionality", "capability", "feature", "information", "data", "system", "process" WITHOUT concrete specifics
   - Flag ESPECIALLY when these terms are the main object: "provide X functionality", "have X capability"
   - ALWAYS FLAG: "[verb] functionality/capability/feature" without explaining what specifically
   - **CRITICAL**: Undefined operational/environmental terms like "normal load", "typical conditions", "regular usage", "standard configuration", "average load", "peak load", "normal operations"
   - **ALWAYS CHECK**: Any requirement with performance metrics must define the operational context
   - Example: "backup functionality" → flag (what gets backed up?); "backup user profiles daily" → OK (specific); "under normal load" → **MUST FLAG** (what is normal?); "process 1000 TPS under normal load" → **FLAG vague_or_implicit_terms** for "normal load"

3. **Broad Quantifiers** (quantifier_without_unit_or_range): 
   - "all", "any", "every", "each" used without explicit scope boundaries
   - **CRITICAL**: Flag ONLY when BOTH conditions are met: (1) broad quantifier + (2) vague/ambiguous noun
   - **FLAG**: "all data" (what data?), "all information" (what information?), "any records" (which records?)
   - **DO NOT FLAG**: "all user data" when encryption/security context makes it clear (comprehensive coverage intended), "all transactions" in performance context (clear scope)
   - Must ask: Is the scope genuinely ambiguous, or is it intentionally comprehensive?
   - Example: "encrypt all user data" → DO NOT FLAG (comprehensive coverage is the point); "backup all data" → FLAG (which data systems/databases?)

4. **Performance Without Context** (non_verifiable_qualifier): 
   - Time/performance constraints that are truly unverifiable due to missing critical context
   - **FLAG**: "as soon as possible", "quickly", "high performance" (no metrics at all)
   - **FLAG**: Performance metrics without ANY context: "within 2 seconds" with NO mention of conditions, environment, or triggers
   - **DO NOT FLAG**: "within X seconds" when the requirement already provides sufficient context through trigger conditions or environmental description
   - Example: "When user clicks login... within 2 seconds" → DO NOT FLAG (trigger provides context); "Response time: 2 seconds" alone → FLAG (missing all context)

5. **Open-Ended Bounds** (loophole_or_open_ended):
   - **CRITICAL**: ALWAYS check for unbounded quantifiers in performance/capacity requirements
   - **FLAG**: "at least X" (no upper bound), "up to X" (no lower bound), "minimum of X" (no maximum), "maximum of X" (no minimum) when bounds matter
   - **ESPECIALLY FLAG**: Performance metrics with "at least" - this creates ambiguity about upper limits
   - Example: "at least 1000 TPS" → **MUST FLAG** (what's the upper limit?); "between 1000-5000 TPS" → OK (bounded); "support a minimum of 100 users" → FLAG (what's the maximum?)

6. **Missing System Response** (missing_system_response):
   - Requirement describes error/failure conditions but not success conditions, or vice versa
   - **CHECK**: If requirement mentions "if X fails" or "if validation fails", ensure it also describes what happens on success
   - Example: "display error if validation fails" → CHECK: does it say what happens on success? If not, FLAG

7. **Incomplete Requirements** (incomplete_requirement):
   - Missing critical details: WHAT specifically, WHO (actor), WHEN (trigger), WHERE (scope)
   - Too vague to implement without major assumptions
   - Example: "provide backup" → flag (backup what? when?); "backup database nightly at 2am" → OK (complete)

8. **Multiple Smells**: A single requirement can have multiple smells. Systematically check ALL categories and detect ALL that apply.

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
- Be thorough: Check ALL categories systematically for EVERY requirement
- **Check for multiple smells**: A requirement can have 2-3+ smells

**CRITICAL CHECKS (commonly missed):**
- loophole_or_open_ended: **ALWAYS** scan for "at least", "up to", "minimum of", "maximum of" - these almost always indicate unbounded requirements
- vague_or_implicit_terms: **ALWAYS** scan for undefined operational terms: "normal load", "typical conditions", "standard configuration", "average usage", "peak load"
- **Performance requirements**: If you see performance metrics (TPS, response time, throughput), CHECK FOR BOTH:
  1. loophole_or_open_ended: "at least X" without upper bound
  2. vague_or_implicit_terms: "normal load" or similar undefined context

**CONTEXTUAL RULES:**
- conditional_or_non_assertive_requirement: ONLY flag if weak modals (may/might/could/should/maybe) are used, OR if complex nested if-then logic obscures the obligation. DO NOT flag simple conditional requirements with clear "shall" statements (e.g., "When X, the system shall Y" is fine).
- non_atomic_requirement: ONLY flag if multiple DISTINCT concerns/actions that should be tested separately. A single action with multiple details is acceptable.
- quantifier_without_unit_or_range: Flag ONLY when scope is genuinely ambiguous. "all user data" in encryption context → DO NOT FLAG (comprehensive is intentional)
- non_verifiable_qualifier: Context matters! "within X seconds" with a trigger/condition → DO NOT FLAG (context is implicit in the scenario)

- Be specific and concise in your explanation"""
    
    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4o-mini",
        max_tokens: int = 1000,
        temperature: float = 0.0  # Deterministic detection
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
