"""
Requirement Smell Taxonomy
==========================

This module defines the official flat list of smell IDs and the hierarchical
taxonomy description for use in prompts and documentation.

The flat list (FLAT_SMELL_LABELS) is the single source of truth for all:
- Code validation
- Dataset labels
- Model outputs
- API schemas

The taxonomy block (TAXONOMY_TEXT) provides the structured documentation for:
- LLM system prompts (primary and judge)
- Human-readable documentation
- Research papers

References:
- Alemneh & Berhanu (2024): Software Requirement Smells and Detection Techniques: A Systematic Literature Review
- Paska: Automated Smell Detection and Recommendation in Natural Language Requirements
- ISO/IEC 29148: Systems and software engineering — Requirements engineering
"""

# Flat list of smell IDs - use these exact strings everywhere in code
FLAT_SMELL_LABELS = [
    # Morphological
    "too_long_sentence",
    "too_short_sentence",
    "unreadable_structure",
    "punctuation_issue",
    "acronym_overuse_or_abbrev",

    # Lexical
    "non_atomic_requirement",
    "negative_formulation",
    "vague_pronoun_or_reference",
    "subjective_language",
    "vague_or_implicit_terms",
    "non_verifiable_qualifier",
    "loophole_or_open_ended",
    "superlative_or_comparative_without_reference",
    "quantifier_without_unit_or_range",
    "design_or_implementation_detail",
    "implicit_requirement",

    # Analytical
    "overuse_imperative_form",
    "missing_imperative_verb",
    "conditional_or_non_assertive_requirement",
    "passive_voice",
    "domain_term_imbalance",

    # Relational
    "too_many_dependencies_or_versions",
    "excessive_or_insufficient_coupling",
    "deep_nesting_or_structure_issue",

    # Incompleteness & language
    "incomplete_requirement",
    "incomplete_reference_or_condition",
    "missing_system_response",
    "incorrect_or_confusing_order",
    "missing_unit_of_measurement",
    "partial_content_or_incomplete_enumeration",
    "embedded_rationale_or_justification",
    "undefined_term",
    "language_error_or_grammar_issue",
    "ambiguous_plurality",
]

# Taxonomy documentation for prompts and human consumption
TAXONOMY_TEXT = """
Taxonomy of requirement smells
===============================

Use the **ID in backticks** as the label in code, data and model outputs.
Categories are for documentation only.

Morphological — shape and readability
--------------------------------------
- `too_long_sentence` – Requirement is a very long sentence (roughly >30–40 tokens) or contains long chains of "and/or" clauses that should be split into separate requirements.
- `too_short_sentence` – Requirement is a very short fragment (e.g., heading-like) missing key context such as actor, action, or object.
- `unreadable_structure` – Structure is hard to follow due to complex syntax, heavy nesting, unusual word order, or many embedded clauses.
- `punctuation_issue` – Missing, incorrect, or excessive punctuation that affects clarity or changes the meaning.
- `acronym_overuse_or_abbrev` – Heavy use of acronyms/abbreviations, especially when not defined at first use or used inconsistently.

Lexical — word choice and vague terms
--------------------------------------
- `non_atomic_requirement` – Multiple independent actions or concerns are combined in one requirement (e.g., several system responses joined with "and/or" instead of separate requirements).
- `negative_formulation` – Avoidable negative wording such as "shall not/must not" or double negatives where a positive formulation would be clearer.
- `vague_pronoun_or_reference` – Uses "it", "this", "that", "they", "above", etc. with no clear, unambiguous referent in the requirement text.
- `subjective_language` – Uses subjective terms like "user-friendly", "intuitive", "simple", "easy", "convenient" without measurable or testable criteria.
- `vague_or_implicit_terms` – Uses vague modifiers like "normally", "usually", "as appropriate", "if necessary", "some kind of", "and so on" that hide precise behavior.
- `non_verifiable_qualifier` – Uses non-testable qualifiers like "as soon as possible", "with minimal delay", "quickly", "high performance" without a concrete threshold.
- `loophole_or_open_ended` – Uses open-ended phrases like "at least…", "up to…", "no more than necessary" without clear lower/upper bounds or ranges.
- `superlative_or_comparative_without_reference` – Uses "best", "better", "faster", "more secure", etc. without specifying a baseline, comparison system, or metric.
- `quantifier_without_unit_or_range` – Uses vague quantifiers ("many", "few", "several") or numbers without units or ranges (e.g., "respond within 5").
- `design_or_implementation_detail` – Describes HOW to implement (specific technologies, algorithms, UI widgets, database schemas) instead of externally visible WHAT.
- `implicit_requirement` – Important behavior is only implied rather than explicitly stated (e.g., assumes logging, authentication, or validation that is not itself clearly specified).

Analytical — grammar and sentence structure
--------------------------------------------
- `overuse_imperative_form` – Requirement is written as a long list of bare commands (imperatives) without explicit actors or conditions (e.g., "Validate input, log error, retry request…").
- `missing_imperative_verb` – No clear action or modal verb; the sentence is purely descriptive or nominal and does not clearly state what the system shall do.
- `conditional_or_non_assertive_requirement` – Uses weak or non-committal modal verbs ("may", "might", "could") or overly complex if/then phrasing that obscures the obligation.
- `passive_voice` – Uses passive voice in a way that hides who performs the action (e.g., "Data shall be stored…" with no clear actor).
- `domain_term_imbalance` – Either overloaded with jargon and domain-specific terms that harm understandability, or unexpectedly generic with no relevant domain terms.

Relational — dependencies and coupling
---------------------------------------
(These smells often depend on nearby requirements or numbering; the model should flag them when clear clues are present in the text.)

- `too_many_dependencies_or_versions` – Requirement references many other requirements, versions, or documents (e.g., "as defined in REQ-3, REQ-7, REQ-12 and the latest SLA"), making it fragile.
- `excessive_or_insufficient_coupling` – Requirement is either overly entangled with other requirements ("as described above/below…") or obviously depends on others but never states the relation.
- `deep_nesting_or_structure_issue` – Requirement appears deeply nested in a hierarchy or list (e.g., 1.2.3.4.5) or uses complex multi-level bulleting that makes its scope unclear.

Incompleteness & language errors — missing information
-------------------------------------------------------
- `incomplete_requirement` – Requirement is missing a key element such as actor, trigger/condition, system response, or success criteria (it feels unfinished as a requirement).
- `incomplete_reference_or_condition` – Refers to a condition or situation without enough detail to evaluate it (e.g., "in the normal case", "when the process is complete" with no clear process).
- `missing_system_response` – Describes a condition, trigger, or scenario but does not state what the system shall do in response.
- `incorrect_or_confusing_order` – Describes events or segments in an order that conflicts with the logical/temporal sequence (e.g., system response stated before its condition in a confusing way).
- `missing_unit_of_measurement` – Numeric values lack units or context (e.g., "respond within 5", "store 1000" with no time/size/unit).
- `partial_content_or_incomplete_enumeration` – Uses "etc.", "…", "and so on", or clearly incomplete lists where the completeness of the set matters.
- `embedded_rationale_or_justification` – Mixes rationale ("in order to…", "because of GDPR…") into the normative requirement text instead of separating the "why" from the "what".
- `undefined_term` – Uses specialized domain terms or project-specific concepts that are not standard and not defined in the shared glossary.
- `language_error_or_grammar_issue` – Grammar or spelling issues that materially affect clarity or could change the interpretation (more than just cosmetic typos).
- `ambiguous_plurality` – Unclear whether the requirement applies to one, some, or all instances (e.g., "the system shall show errors on screens" with unclear scope of "screens").
""".strip()


# Helper function to validate smell labels
def is_valid_smell(smell: str) -> bool:
    """Check if a smell label is in the official taxonomy."""
    return smell in FLAT_SMELL_LABELS


def validate_smells(smells: list[str]) -> tuple[list[str], list[str]]:
    """
    Validate a list of smell labels.
    
    Args:
        smells: List of smell labels to validate
        
    Returns:
        Tuple of (valid_smells, invalid_smells)
    """
    valid = [s for s in smells if is_valid_smell(s)]
    invalid = [s for s in smells if not is_valid_smell(s)]
    return valid, invalid
