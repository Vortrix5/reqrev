"""
Full smell injection script for LLM4RE experiments.

This script:
- reads a CSV of clean base requirements (e.g. base_requirements_clean_60.csv),
- generates multiple smelly variants for each clean requirement,
- tries to balance usage so that each smell type appears in a similar number of variants,
- writes out a CSV requirements_with_smells.csv with variant metadata.

Expected input CSV format:
    id,domain,requirement_text
(other columns will be preserved or ignored as needed).

Generated output CSV columns:
    base_id,variant_id,variant_index,domain,requirement_text,smells,applied_rules

- `smells` is a JSON array of smell IDs (from the taxonomy)
- `applied_rules` is a JSON array of rule IDs of the form "<smell_id>:<rule_name>"
"""

import json
from pathlib import Path
from typing import List, Tuple, Dict

import pandas as pd
import re


# ---------------- Helpers ----------------


def append_before_period(text: str, tail: str) -> str:
    """
    Append a phrase just before the final period. If there is no period,
    simply append with a space.
    """
    text = text.rstrip()
    if text.endswith("."):
        return text[:-1] + " " + tail.strip() + "."
    else:
        return text + " " + tail.strip()


def prepend_clause(text: str, head: str) -> str:
    """
    Prepend a clause before the requirement. Ensures spacing and punctuation.
    """
    text = text.lstrip()
    head = head.strip()
    if not head.endswith(","):
        head = head + ", "
    return head + text


# ---------------- Smell injection functions ----------------
# Each function:
#   - takes a clean requirement text,
#   - returns (mutated_text, applied_rule_id)
# applied_rule_id should be smell_id + ":" + some short rule name.


# === Morphological ===

def inject_too_long_sentence(text: str) -> Tuple[str, str]:
    tail = (
        "and then the system shall log the operation in the audit trail "
        "and then the system shall update the internal statistics"
    )
    return append_before_period(text, tail), "too_long_sentence:add_and_then_chain"


def inject_too_short_sentence(text: str) -> Tuple[str, str]:
    mutated = "Lock account."
    return mutated, "too_short_sentence:replace_with_fragment"


def inject_unreadable_structure(text: str) -> Tuple[str, str]:
    tail = (
        "which, when combined with other operations that may occur during processing, "
        "shall be handled in accordance with the internal procedures"
    )
    return append_before_period(text, tail), "unreadable_structure:add_nested_clause"


def inject_punctuation_issue(text: str) -> Tuple[str, str]:
    # Remove some commas and duplicate a period
    mutated = text.replace(", ", " ")
    if mutated.endswith("."):
        mutated = mutated + "."
    return mutated, "punctuation_issue:remove_commas_and_double_period"


def inject_acronym_overuse_or_abbrev(text: str) -> Tuple[str, str]:
    tail = "according to internal policies KYC AML and PCI DSS"
    return append_before_period(text, tail), "acronym_overuse_or_abbrev:add_unexplained_acronyms"


# === Lexical ===

def inject_non_atomic_requirement(text: str) -> Tuple[str, str]:
    tail = "and send a notification email to the administrator"
    return append_before_period(text, tail), "non_atomic_requirement:add_notification_action"


def inject_negative_formulation(text: str) -> Tuple[str, str]:
    lowered = text.lower()
    if "shall prevent" in lowered:
        mutated = re.sub(r"shall prevent", "shall not allow", text, flags=re.IGNORECASE)
        return mutated, "negative_formulation:replace_prevent_with_not_allow"
    else:
        tail = "and shall not allow unauthorized access"
        return append_before_period(text, tail), "negative_formulation:add_shall_not_allow"


def inject_vague_pronoun_or_reference(text: str) -> Tuple[str, str]:
    tail = "and this shall be handled later"
    return append_before_period(text, tail), "vague_pronoun_or_reference:add_this_reference"


def inject_subjective_language(text: str) -> Tuple[str, str]:
    tail = "through a user-friendly and intuitive interface"
    return append_before_period(text, tail), "subjective_language:add_user_friendly_interface"


def inject_vague_or_implicit_terms(text: str) -> Tuple[str, str]:
    tail = "under normal conditions and as appropriate"
    return append_before_period(text, tail), "vague_or_implicit_terms:add_normal_conditions"


def inject_non_verifiable_qualifier(text: str) -> Tuple[str, str]:
    tail = "with minimal delay whenever possible"
    return append_before_period(text, tail), "non_verifiable_qualifier:add_minimal_delay"


def inject_loophole_or_open_ended(text: str) -> Tuple[str, str]:
    tail = "for at least a short period of time"
    return append_before_period(text, tail), "loophole_or_open_ended:add_at_least"


def inject_superlative_or_comparative_without_reference(text: str) -> Tuple[str, str]:
    tail = "using the best and more secure method"
    return append_before_period(text, tail), "superlative_or_comparative_without_reference:add_best_method"


def inject_quantifier_without_unit_or_range(text: str) -> Tuple[str, str]:
    tail = "for a large number of users"
    return append_before_period(text, tail), "quantifier_without_unit_or_range:add_large_number"


def inject_design_or_implementation_detail(text: str) -> Tuple[str, str]:
    tail = "using a PostgreSQL database and a React-based web interface"
    return append_before_period(text, tail), "design_or_implementation_detail:add_tech_stack"


def inject_implicit_requirement(text: str) -> Tuple[str, str]:
    tail = "so that all relevant stakeholders are notified appropriately"
    return append_before_period(text, tail), "implicit_requirement:add_so_that_notification"


# === Analytical ===

def inject_overuse_imperative_form(text: str) -> Tuple[str, str]:
    mutated = "Validate input, log the error, send a notification, restart the service."
    return mutated, "overuse_imperative_form:replace_with_command_list"


def inject_missing_imperative_verb(text: str) -> Tuple[str, str]:
    mutated = re.sub(r"\bshall\b", "", text, flags=re.IGNORECASE)
    return mutated, "missing_imperative_verb:remove_shall"


def inject_conditional_or_non_assertive(text: str) -> Tuple[str, str]:
    mutated = re.sub(r"\bshall\b", "may", text, flags=re.IGNORECASE)
    tail = "if possible"
    mutated = append_before_period(mutated, tail)
    return mutated, "conditional_or_non_assertive_requirement:replace_shall_with_may_if_possible"


def inject_passive_voice(text: str) -> Tuple[str, str]:
    match = re.match(r"(The system shall )(.+)", text)
    if match:
        _, rest = match.groups()
        rest = rest.strip()
        if rest.endswith("."):
            rest = rest[:-1]
        mutated = "The system shall be " + rest
        if not mutated.endswith("."):
            mutated += "."
        return mutated, "passive_voice:system_shall_be_pattern"
    else:
        tail = "It shall be ensured that this requirement is fulfilled"
        return append_before_period(text, tail), "passive_voice:add_it_shall_be_ensured"


def inject_domain_term_imbalance(text: str) -> Tuple[str, str]:
    tail = "in accordance with KYC AML PCI DSS and SOX requirements"
    return append_before_period(text, tail), "domain_term_imbalance:add_many_domain_acronyms"


# === Relational ===

def inject_too_many_dependencies_or_versions(text: str) -> Tuple[str, str]:
    tail = "as defined in REQ-101, REQ-204, REQ-305, and REQ-409"
    return append_before_period(text, tail), "too_many_dependencies_or_versions:add_many_req_refs"


def inject_excessive_or_insufficient_coupling(text: str) -> Tuple[str, str]:
    tail = "and behaves in the same way as described above"
    return append_before_period(text, tail), "excessive_or_insufficient_coupling:add_as_described_above"


def inject_deep_nesting_or_structure_issue(text: str) -> Tuple[str, str]:
    tail = "as specified in section 2.1.3.4.2.1 of the design document"
    return append_before_period(text, tail), "deep_nesting_or_structure_issue:add_deep_section_reference"


# === Incompleteness & language ===

def inject_incomplete_requirement(text: str) -> Tuple[str, str]:
    parts = re.split(r"\bshall\b", text, flags=re.IGNORECASE)
    if len(parts) >= 2:
        mutated = parts[0].strip()
        if not mutated.endswith("."):
            mutated += "."
        return mutated, "incomplete_requirement:remove_main_action"
    else:
        mutated = re.sub(r"^The system\s+", "", text)
        return mutated, "incomplete_requirement:remove_actor"


def inject_incomplete_reference_or_condition(text: str) -> Tuple[str, str]:
    tail = "during normal operation when appropriate conditions are met"
    return append_before_period(text, tail), "incomplete_reference_or_condition:add_vague_condition"


def inject_missing_system_response(text: str) -> Tuple[str, str]:
    m = re.search(r"\b(after|when|if)\b.+", text, flags=re.IGNORECASE)
    if m:
        mutated = m.group(0).strip()
        if not mutated.endswith("."):
            mutated += "."
        return mutated, "missing_system_response:keep_condition_only"
    else:
        mutated = "If the described condition occurs."
        return mutated, "missing_system_response:replace_with_if_only"


def inject_incorrect_or_confusing_order(text: str) -> Tuple[str, str]:
    # Move condition to the end or beginning in a confusing way
    m = re.search(r"\bafter\b.+", text, flags=re.IGNORECASE)
    if m:
        condition = m.group(0).strip().rstrip(".")
        main_part = text[: m.start()].strip()
        mutated = f"{condition}, {main_part}."
        return mutated, "incorrect_or_confusing_order:swap_condition_and_action"
    else:
        head = "After processing is complete"
        mutated = prepend_clause(text, head)
        return mutated, "incorrect_or_confusing_order:prepend_after_clause"


def inject_missing_unit_of_measurement(text: str) -> Tuple[str, str]:
    tail = "within 5"
    return append_before_period(text, tail), "missing_unit_of_measurement:add_bare_number"


def inject_partial_content_or_incomplete_enumeration(text: str) -> Tuple[str, str]:
    tail = "including user identifier, timestamp, action, etc."
    return append_before_period(text, tail), "partial_content_or_incomplete_enumeration:add_etc_list"


def inject_embedded_rationale(text: str) -> Tuple[str, str]:
    tail = "in order to support auditing and regulatory compliance"
    return append_before_period(text, tail), "embedded_rationale_or_justification:add_in_order_to"


def inject_undefined_term(text: str) -> Tuple[str, str]:
    tail = "and update the internal Compliance Index"
    return append_before_period(text, tail), "undefined_term:add_compliance_index"


def inject_language_error(text: str) -> Tuple[str, str]:
    mutated = text
    if "attempts" in mutated:
        mutated = mutated.replace("attempts", "attempt", 1)
    else:
        mutated = mutated.replace("The system shall", "The system will", 1)
    return mutated, "language_error_or_grammar_issue:introduce_grammar_error"


def inject_ambiguous_plurality(text: str) -> Tuple[str, str]:
    tail = "and display the message on screens"
    return append_before_period(text, tail), "ambiguous_plurality:add_screens_scope"


# ---------------- Smell mapping ----------------

SMELL_FUNCTIONS = {
    # Morphological
    "too_long_sentence": inject_too_long_sentence,
    "too_short_sentence": inject_too_short_sentence,
    "unreadable_structure": inject_unreadable_structure,
    "punctuation_issue": inject_punctuation_issue,
    "acronym_overuse_or_abbrev": inject_acronym_overuse_or_abbrev,
    # Lexical
    "non_atomic_requirement": inject_non_atomic_requirement,
    "negative_formulation": inject_negative_formulation,
    "vague_pronoun_or_reference": inject_vague_pronoun_or_reference,
    "subjective_language": inject_subjective_language,
    "vague_or_implicit_terms": inject_vague_or_implicit_terms,
    "non_verifiable_qualifier": inject_non_verifiable_qualifier,
    "loophole_or_open_ended": inject_loophole_or_open_ended,
    "superlative_or_comparative_without_reference": inject_superlative_or_comparative_without_reference,
    "quantifier_without_unit_or_range": inject_quantifier_without_unit_or_range,
    "design_or_implementation_detail": inject_design_or_implementation_detail,
    "implicit_requirement": inject_implicit_requirement,
    # Analytical
    "overuse_imperative_form": inject_overuse_imperative_form,
    "missing_imperative_verb": inject_missing_imperative_verb,
    "conditional_or_non_assertive_requirement": inject_conditional_or_non_assertive,
    "passive_voice": inject_passive_voice,
    "domain_term_imbalance": inject_domain_term_imbalance,
    # Relational
    "too_many_dependencies_or_versions": inject_too_many_dependencies_or_versions,
    "excessive_or_insufficient_coupling": inject_excessive_or_insufficient_coupling,
    "deep_nesting_or_structure_issue": inject_deep_nesting_or_structure_issue,
    # Incompleteness & language
    "incomplete_requirement": inject_incomplete_requirement,
    "incomplete_reference_or_condition": inject_incomplete_reference_or_condition,
    "missing_system_response": inject_missing_system_response,
    "incorrect_or_confusing_order": inject_incorrect_or_confusing_order,
    "missing_unit_of_measurement": inject_missing_unit_of_measurement,
    "partial_content_or_incomplete_enumeration": inject_partial_content_or_incomplete_enumeration,
    "embedded_rationale_or_justification": inject_embedded_rationale,
    "undefined_term": inject_undefined_term,
    "language_error_or_grammar_issue": inject_language_error,
    "ambiguous_plurality": inject_ambiguous_plurality,
}


SMELL_IDS: List[str] = list(SMELL_FUNCTIONS.keys())


# ---------------- Variant generation ----------------

# Desired numbers of smells per variant, per base requirement.
# With 60 base requirements and 8 variants per base, this yields:
#   1*0 + 2*2 + 3*3 + 4*3 = 25 smells per base (if we used [2,2,3,3,3,4,4,4])
# Here we use [1,2,2,3,3,3,4,4] to include single-smell variants.
VARIANT_SIZES: List[int] = [1, 2, 2, 3, 3, 3, 4, 4]  # 8 variants / base


def choose_smells_for_variant(smell_usage: Dict[str, int], count: int) -> List[str]:
    """
    Choose `count` smell IDs with the currently lowest global usage, to balance coverage.
    We avoid selecting the same smell twice for the same variant.
    Deterministic: sorts by (usage, smell_id).
    """
    chosen: List[str] = []
    available = smell_usage.copy()
    for _ in range(count):
        # sort by usage then by name
        candidates = sorted(available.items(), key=lambda kv: (kv[1], kv[0]))
        for smell_id, _ in candidates:
            if smell_id not in chosen:
                chosen.append(smell_id)
                # temporarily treat as "used" for this variant to avoid picking again
                available[smell_id] = available[smell_id] + 1
                break
    return chosen


def generate_variant_for_smells(text: str, smell_ids: List[str]) -> Tuple[str, List[str]]:
    """
    Sequentially apply the injection functions for the given smell IDs.
    Returns mutated_text and list of applied_rule_ids.
    """
    mutated = text
    applied_rules: List[str] = []
    for smell_id in smell_ids:
        fn = SMELL_FUNCTIONS.get(smell_id)
        if fn is None:
            continue
        mutated, rule_id = fn(mutated)
        applied_rules.append(rule_id)
    return mutated, applied_rules


def generate_variants(df_base: pd.DataFrame) -> pd.DataFrame:
    """
    For each base requirement, generate multiple variants according to VARIANT_SIZES.
    Uses a global smell_usage counter to balance smell occurrence across the dataset.
    """
    smell_usage: Dict[str, int] = {sid: 0 for sid in SMELL_IDS}
    rows = []

    for _, row in df_base.iterrows():
        base_id = str(row["id"])
        domain = str(row.get("domain", ""))
        text = str(row["requirement_text"])

        for local_index, size in enumerate(VARIANT_SIZES, start=1):
            smell_ids = choose_smells_for_variant(smell_usage, size)

            # Apply smell injections
            mutated_text, applied_rules = generate_variant_for_smells(text, smell_ids)

            # Update global usage counts
            for sid in smell_ids:
                smell_usage[sid] += 1

            variant_id = f"{base_id}-S{local_index:02d}"

            rows.append(
                {
                    "base_id": base_id,
                    "variant_id": variant_id,
                    "variant_index": local_index,
                    "domain": domain,
                    "requirement_text": mutated_text,
                    "smells": smell_ids,
                    "applied_rules": applied_rules,
                }
            )

    # Optional: print summary to console for debugging
    print("Smell usage summary:")
    for sid in sorted(SMELL_IDS):
        print(f"  {sid}: {smell_usage[sid]} variants")

    return pd.DataFrame(rows)


def main():
    base_csv = Path("../clean/requirements_clean.csv")
    if not base_csv.exists():
        raise SystemExit(f"Input file not found: {base_csv}")

    df_base = pd.read_csv(base_csv)

    missing_cols = [c for c in ["id", "requirement_text"] if c not in df_base.columns]
    if missing_cols:
        raise SystemExit(f"Input CSV must contain columns: {missing_cols}")

    df_variants = generate_variants(df_base)

    df_out = df_variants.copy()
    df_out["smells"] = df_out["smells"].apply(lambda xs: json.dumps(xs))
    df_out["applied_rules"] = df_out["applied_rules"].apply(lambda xs: json.dumps(xs))

    out_path = Path("requirements_with_smells.csv")
    df_out.to_csv(out_path, index=False)
    print(f"Wrote {len(df_out)} variants to {out_path}")


if __name__ == "__main__":
    main()
