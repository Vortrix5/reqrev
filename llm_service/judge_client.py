"""
Judge Client
LLM-as-Judge evaluation using OpenAI models.
"""

import json
import logging
import re
from typing import Any, Dict, List, Optional
from openai import AsyncOpenAI

from llm_service.smell_taxonomy import FLAT_SMELL_LABELS, TAXONOMY_TEXT


logger = logging.getLogger(__name__)


class JudgeClient:
    """
    Client for OpenAI API to evaluate requirement smell analysis.
    
    Uses OpenAI models (e.g., gpt-4o, o1) as an independent judge to assess
    the quality of smell detection performed by the primary model.
    """
    
    # Build system prompt by concatenating strings (avoid f-string to prevent format errors)
    JUDGE_SYSTEM_PROMPT = """You are an expert evaluator in software requirements engineering and ISO/IEC 29148 standards.

Your task is to evaluate the quality of requirement smell detection performed by another AI model.

You receive:
- the requirement text,
- the smells predicted by the primary model (list of IDs),
- and (optionally) ground-truth smell IDs for evaluation.

Use the smell taxonomy below as the single source of truth.
Only the listed smell IDs are valid. The primary model must use only labels from this taxonomy.
When suggesting corrections, always refer to these IDs (e.g., "add `non_atomic_requirement`", "remove `subjective_language`").

""" + TAXONOMY_TEXT + """

**IMPORTANT CLARIFICATIONS – Use smells conservatively**

Apply the taxonomy **strictly and conservatively**. Only flag a smell if it **clearly and directly** matches the definition. Do **not** speculate about hidden technical details, missing background documentation, time zones, infrastructure, or implementation mechanisms that are not the requirement's responsibility.

**Specific guidance for commonly over-flagged smells:**

- `missing_unit_of_measurement`  
  - Only use this when a **number appears without any unit** (for example "within 5" with no unit of time).  
  - Do **not** add this smell when the unit is already present in the requirement, e.g. "ten minutes", "30 seconds", "5 hours", "two hours".

- `passive_voice`  
  - Only use this when the **actor is missing or unclear**, for example "Data shall be stored in the database" with no clear subject.  
  - Do **not** flag sentences where the actor is explicitly present, such as "The system shall prevent a user from registering…" or "The system shall lock a user account…". These are active voice with "system" as the clear actor.

- `non_atomic_requirement`  
  - Only use this when the requirement contains **multiple independent actions or obligations** that should normally be split into separate requirements (e.g. "The system shall validate input, log errors, send an email, and restart the service.").  
  - Do **not** flag requirements that describe a **single action** with multiple attributes or values, e.g. "create a user account with username, password, and role" or "change the status of an order to Pending, Confirmed, Shipped, or Cancelled."

- `incomplete_requirement` and `missing_system_response`  
  - Use these only when the requirement is genuinely **missing a key element** such as actor, main system action, or basic system response (for example a pure condition without any "shall …" action).  
  - Do **not** assume a requirement is incomplete just because it does not mention every possible error path, UI detail, or corner case. A requirement that clearly states what the system shall do in normal conditions should **not** be flagged as incomplete.

- `vague_or_implicit_terms`  
  - Reserve this for truly vague modifiers like "normally", "usually", "as appropriate", "etc.", "and so on", "if necessary" that hide precise behaviour.  
  - Do **not** use this for phrases that are standard domain concepts or that are clearly configurable elsewhere, such as "configured capacity", "specific time each day", or "weekly report".

- `ambiguous_plurality`  
  - Only use this when it is genuinely unclear whether the requirement applies to one, some, or all instances and this affects interpretation.  
  - Do **not** flag phrases like "one or more documents" or "each event" as smells on their own; these are standard ways to express cardinality.

- `vague_pronoun_or_reference`  
  - Use this only when pronouns like "it", "this", "that", "they" do **not** have a clear, unambiguous referent in the same sentence or immediate context.  
  - Do **not** flag pronouns whose referent is obvious in the requirement (for example, "that user" clearly refers to the user mentioned earlier in the same sentence).

- `undefined_term`  
  - Only use this when the requirement depends on a genuinely **unclear project-specific term** that is not standard and whose meaning is impossible to infer (for example an unexplained internal acronym).  
  - Do **not** treat common domain words like "user", "authorized user", "parameters", "Finance role", or "configured capacity" as undefined by default. Assume there is a glossary in the project.

- `implicit_requirement`  
  - Use this only when important **system behaviour** is merely hinted at and never actually described in any requirement.  
  - Do **not** add `implicit_requirement` just because the requirement assumes obvious supporting capabilities (for example, tracking event start times, storing timestamps, or having a reporting mechanism).

- `negative_formulation`  
  - Use this for clearly avoidable negative phrasing such as "shall not allow X" when a positive rephrasing would obviously be clearer.  
  - Do **not** use this for negative conditions that are the *natural* way to express a constraint (e.g. "prevent stock quantity from falling below zero" or "display an error when the user does not have permission").

**Examples of clean requirements (no smells):**

Example 1 – Clean requirement with time expression:
Requirement: "The system shall terminate a user session after thirty minutes of inactivity."
Primary model smells: []
Correct judgement:
- verdict: "accept"
- score: 1.0
- suggested_corrections: []
Explanation: This requirement has a clear actor ("the system"), a clear action ("terminate"), and a clear condition ("after thirty minutes of inactivity"). No `missing_unit_of_measurement` smell because the unit "minutes" is explicit. No other smells present.

Example 2 – Clean requirement with status tracking:
Requirement: "The system shall record the date and time when the status of a dispute record changes."
Primary model smells: []
Correct judgement:
- verdict: "accept"
- score: 1.0
- suggested_corrections: []
Explanation: This requirement has a clear actor ("the system"), a clear action ("record"), and a clear condition ("when the status of a dispute record changes"). It does not contain vague terms, missing units, non-atomic actions, or any other smell from the taxonomy.

Example 3 – Clean requirement with prevention action:
Requirement: "The system shall prevent a user from registering for an event after the event start time."
Primary model smells: []
Correct judgement:
- verdict: "accept"
- score: 1.0
- suggested_corrections: []
Explanation: This is active voice with "system" as the clear actor. No `passive_voice` smell. The requirement clearly states what the system shall do (prevent registration) and the condition (after event start time). Not incomplete.

**EVALUATION CRITERIA:**

1. **Accuracy**: Are the predicted smells actually present in the requirement?
2. **Completeness**: Are there obvious smells that were missed?
3. **Precision**: Are the smell labels correctly applied (not mislabeled)?
4. **Explanation Quality**: Does the explanation justify the detected smells?

**YOUR TASK:**

Given:
- Original requirement text
- List of predicted smells
- Model's explanation

Evaluate and return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "verdict": "accept",
  "score": 0.85,
  "justification": "The detected smells are accurate. The requirement uses weak modal verbs...",
  "suggested_corrections": ["Add smell 'X' because...", "Remove smell 'Y' because..."]
}

**CRITICAL: Your entire response must be valid JSON. Do not wrap it in markdown code blocks. Do not add explanatory text before or after the JSON.**

**VERDICT GUIDELINES:**
- **ACCEPT**: Use this when, under the strict rules above, the primary model's smell list is **consistent with the taxonomy** and you do not see any clear missing or spurious smells. If the requirement appears clean and you cannot confidently identify a smell from the taxonomy, you should treat this as **no smells present** and return `ACCEPT`.
- **REVIEW**: Use this only when you can identify at least **one clear smell** according to the strict rules OR when the requirement is genuinely ambiguous and different reasonable readers could disagree. In `REVIEW`, you should explain exactly which smell IDs you believe are missing or incorrect and why.
- **REJECT**: Use this when the primary model's output is clearly invalid (wrong format, not JSON, completely off-topic, or using smell labels not in the taxonomy).

Do not search for "possible" or "hypothetical" smells based on implementation guesses or missing background information. If a smell is not clearly present according to the taxonomy, treat the requirement as clean and return `ACCEPT`.

**SCORE SCALE (0.0-1.0):**
- 1.0: Perfect detection, all smells correct, none missed
- 0.8-0.99: Very good, minor issues
- 0.5-0.79: Acceptable but needs review
- 0.3-0.49: Poor, significant problems
- 0.0-0.29: Completely wrong

**SUGGESTED_CORRECTIONS:**
Provide specific, actionable suggestions:
- If smells were missed: "Add smell 'X' because..."
- If wrong smell detected: "Remove smell 'Y' - not applicable because..."
- If explanation incomplete: "Explanation should mention..."

Be precise, objective, and constructive in your evaluation."""
    
    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4o",
        max_tokens: int = 1000,
        temperature: float = 0.2,
        timeout: float = 30.0
    ):
        """
        Initialize OpenAI judge client.
        
        Args:
            api_key: OpenAI API key
            model: Model to use (e.g., "gpt-4o", "o1", "gpt-4-turbo")
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature (lower = more deterministic)
            timeout: Request timeout in seconds
        """
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.timeout = timeout
        
    async def evaluate_requirement_analysis(
        self,
        requirement_text: str,
        smells: List[str],
        explanation: Optional[str],
    ) -> Dict[str, Any]:
        """
        Evaluate a requirement smell analysis using OpenAI judge model.
        
        Args:
            requirement_text: The original requirement text
            smells: List of detected smells from primary model
            explanation: Explanation from primary model
            
        Returns:
            Dictionary with evaluation results (same format as OpenRouter version)
        """
        logger.info(f"Evaluating analysis with OpenAI model: {self.model}")
        
        user_prompt = self._build_evaluation_prompt(
            requirement_text=requirement_text,
            smells=smells,
            explanation=explanation
        )
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.JUDGE_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                response_format={"type": "json_object"},  # Enforce JSON
                timeout=self.timeout
            )
            
            content = response.choices[0].message.content
            logger.debug(f"OpenAI judge raw response: {content}")
            
            # Parse JSON response
            evaluation = self._extract_json_from_response(content)
            
            # Normalize and validate
            normalized = self._normalize_evaluation(evaluation)
            
            # Add raw output
            normalized["raw_judge_output"] = {
                "model": self.model,
                "content": evaluation,
                "usage": response.usage.model_dump() if response.usage else None
            }
            
            logger.info(
                f"Judge evaluation complete: verdict={normalized['verdict']}, "
                f"score={normalized['score']:.2f}"
            )
            
            return normalized
            
        except Exception as e:
            logger.error(f"OpenAI judge error: {str(e)}", exc_info=True)
            raise
    
    def _extract_json_from_response(self, content: str) -> Dict[str, Any]:
        """
        Extract JSON from response with robust fallback strategies.
        
        Args:
            content: Raw response content
            
        Returns:
            Parsed JSON object (or fallback dict if parsing fails)
        """
        content_clean = content.strip()
        
        # Try 1: Direct JSON parsing
        try:
            return json.loads(content_clean)
        except json.JSONDecodeError:
            pass
        
        # Try 2: Extract from ```json markdown blocks
        if "```json" in content_clean:
            start = content_clean.find("```json") + 7
            end = content_clean.find("```", start)
            if end != -1:
                json_str = content_clean[start:end].strip()
                try:
                    return json.loads(json_str)
                except json.JSONDecodeError:
                    pass
        
        # Try 3: Extract from ``` generic code blocks
        if content_clean.startswith("```"):
            lines = content_clean.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            json_str = "\n".join(lines).strip()
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass
        
        # Try 4: Find JSON object using regex
        json_pattern = r'\{(?:[^{}]|(?:\{[^{}]*\}))*\}'
        matches = re.findall(json_pattern, content_clean, re.DOTALL)
        for match in sorted(matches, key=len, reverse=True):
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
        
        # Fallback: Return safe default
        logger.warning("All JSON parsing failed, using fallback result")
        return {
            "verdict": "review",
            "score": 0.5,
            "justification": content_clean[:500] if content_clean else "Failed to parse judge response",
            "suggested_corrections": []
        }
    
    def _build_evaluation_prompt(
        self,
        requirement_text: str,
        smells: List[str],
        explanation: Optional[str]
    ) -> str:
        """Build the evaluation prompt for the judge model."""
        smells_str = json.dumps(smells) if smells else "[]"
        explanation_str = explanation or "No explanation provided"
        
        return f"""Evaluate this requirement smell analysis:

**ORIGINAL REQUIREMENT:**
{requirement_text}

**PREDICTED SMELLS:**
{smells_str}

**MODEL EXPLANATION:**
{explanation_str}

**YOUR EVALUATION:**
Analyze whether these predicted smells are accurate and complete. Consider:
1. Are the detected smells actually present?
2. Are there obvious smells that were missed?
3. Is the explanation correct and helpful?
4. Are the smell labels correctly applied?

Return your evaluation as a JSON object following the specified schema."""
    
    def _normalize_evaluation(self, evaluation: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize and validate judge evaluation output."""
        verdict = evaluation.get("verdict", "review")
        if verdict not in ["accept", "review", "reject"]:
            logger.warning(f"Invalid verdict '{verdict}', defaulting to 'review'")
            verdict = "review"
        
        score = evaluation.get("score", 0.5)
        try:
            score = float(score)
            score = max(0.0, min(1.0, score))
        except (TypeError, ValueError):
            logger.warning(f"Invalid score '{score}', defaulting to 0.5")
            score = 0.5
        
        justification = evaluation.get("justification", "")
        if not justification:
            justification = "No justification provided by judge model"
        
        corrections = evaluation.get("suggested_corrections", [])
        if not isinstance(corrections, list):
            logger.warning("suggested_corrections is not a list, converting")
            corrections = []
        
        return {
            "verdict": verdict,
            "score": score,
            "justification": justification,
            "suggested_corrections": corrections
        }
