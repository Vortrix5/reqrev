# Smelly Requirements Dataset

This folder contains **synthetic smelly requirements** generated from the clean base set in `../clean`.

Each requirement in this dataset is derived from a clean requirement and has **one or more intentional requirement smells** injected according to our taxonomy. This provides a controlled benchmark with **known ground truth** for:

- Evaluating smell detection models (primary LLM),
- Evaluating the LLM-as-judge,
- Comparing with human expert annotations.

---

## Origin

The smelly requirements are generated from:

- `../clean/requirements_clean.csv`

using an automated smell-injection script:

- `smell_injection_full.py`

The process is fully synthetic and reproducible: you can regenerate the exact same dataset from the clean base file and this script.

---

## Generation process

### 1. Base set

We start from the 60 curated, smell-free requirements in `requirements_clean.csv`.  
Each row contains:

- `id` – base requirement ID (e.g. `B-001`)
- `domain` – domain label
- `requirement_text` – clean requirement

These are the **“gold clean”** requirements.

### 2. Smell injection script

Smelly variants are produced by the script:

- `smell_injection_full.py`

This script:

1. Reads `base_requirements_clean_60.csv` from `../clean`.
2. Defines one or more **injection templates** for each smell type.
3. For each base requirement, generates multiple **mutated variants** with 1–4 smells.
4. Balances usage so that each smell type appears in a similar number of variants.
5. Writes the combined dataset to `requirements_with_smells.csv`.

#### Variant pattern

For each clean base requirement, the script creates **8 variants**, with the following numbers of smells:

- Variant 1: **1** smell
- Variant 2: **2** smells
- Variant 3: **2** smells
- Variant 4: **3** smells
- Variant 5: **3** smells
- Variant 6: **3** smells
- Variant 7: **4** smells
- Variant 8: **4** smells

This gives a mix of:

- **Single-smell** variants (simple cases),
- **Multi-smell** variants (2–4 smells) to test more complex situations.

A global `smell_usage` counter ensures that **each smell type appears in a roughly similar number of variants**, i.e., coverage is balanced across the taxonomy.

---

## Smell types and injection templates

**For complete smell definitions**, see [../../../docs/TAXONOMY.md](../../../docs/TAXONOMY.md).

Below is a summary of the **templates** used by `smell_injection_full.py` for each smell ID.
(See the script for the exact wording and implementation.)

### Morphological – shape & readability

- `too_long_sentence`  
  - Appends a long chain with repeated “and then the system shall …” actions, making the sentence overly long and complex.  
  - Rule: `too_long_sentence:add_and_then_chain`

- `too_short_sentence`  
  - Replaces the requirement with a fragment such as “Lock account.”  
  - Rule: `too_short_sentence:replace_with_fragment`

- `unreadable_structure`  
  - Adds a nested relative clause (“which, when combined with other operations that may occur during processing, …”), making the structure hard to follow.  
  - Rule: `unreadable_structure:add_nested_clause`

- `punctuation_issue`  
  - Removes some commas and doubles the final period, creating punctuation problems.  
  - Rule: `punctuation_issue:remove_commas_and_double_period`

- `acronym_overuse_or_abbrev`  
  - Appends unexplained acronyms like “KYC AML PCI DSS”.  
  - Rule: `acronym_overuse_or_abbrev:add_unexplained_acronyms`

---

### Lexical – word choice & vague terms

- `non_atomic_requirement`  
  - Adds an additional independent action (e.g., “and send a notification email to the administrator”).  
  - Rule: `non_atomic_requirement:add_notification_action`

- `negative_formulation`  
  - Replaces “shall prevent” with “shall not allow” or adds a “shall not allow unauthorized access” clause.  
  - Rule: `negative_formulation:replace_prevent_with_not_allow` or `negative_formulation:add_shall_not_allow`

- `vague_pronoun_or_reference`  
  - Adds an ambiguous reference like “and this shall be handled later”.  
  - Rule: `vague_pronoun_or_reference:add_this_reference`

- `subjective_language`  
  - Adds subjective adjectives like “user-friendly and intuitive interface”.  
  - Rule: `subjective_language:add_user_friendly_interface`

- `vague_or_implicit_terms`  
  - Adds vague modifiers such as “under normal conditions and as appropriate”.  
  - Rule: `vague_or_implicit_terms:add_normal_conditions`

- `non_verifiable_qualifier`  
  - Appends non-testable qualifiers like “with minimal delay whenever possible”.  
  - Rule: `non_verifiable_qualifier:add_minimal_delay`

- `loophole_or_open_ended`  
  - Introduces open-ended phrasing such as “for at least a short period of time”.  
  - Rule: `loophole_or_open_ended:add_at_least`

- `superlative_or_comparative_without_reference`  
  - Uses superlatives/comparatives like “the best and more secure method” with no baseline.  
  - Rule: `superlative_or_comparative_without_reference:add_best_method`

- `quantifier_without_unit_or_range`  
  - Adds vague quantifiers like “for a large number of users”.  
  - Rule: `quantifier_without_unit_or_range:add_large_number`

- `design_or_implementation_detail`  
  - Injects technology details (e.g., “using a PostgreSQL database and a React-based web interface”).  
  - Rule: `design_or_implementation_detail:add_tech_stack`

- `implicit_requirement`  
  - Adds a “so that …” clause implying additional behaviour like notifying stakeholders, without specifying it explicitly.  
  - Rule: `implicit_requirement:add_so_that_notification`

---

### Analytical – grammar & sentence structure

- `overuse_imperative_form`  
  - Replaces the requirement with a command list like “Validate input, log the error, send a notification, restart the service.”  
  - Rule: `overuse_imperative_form:replace_with_command_list`

- `missing_imperative_verb`  
  - Removes `shall` so the sentence loses a clear imperative verb.  
  - Rule: `missing_imperative_verb:remove_shall`

- `conditional_or_non_assertive_requirement`  
  - Replaces `shall` with `may` and adds a hedge like “if possible”.  
  - Rule: `conditional_or_non_assertive_requirement:replace_shall_with_may_if_possible`

- `passive_voice`  
  - Turns “The system shall …” into “The system shall be …” or adds a generic passive phrase “It shall be ensured that this requirement is fulfilled.”  
  - Rule: `passive_voice:system_shall_be_pattern` / `passive_voice:add_it_shall_be_ensured`

- `domain_term_imbalance`  
  - Appends multiple domain acronyms like “KYC AML PCI DSS SOX” to overload the requirement with jargon.  
  - Rule: `domain_term_imbalance:add_many_domain_acronyms`

---

### Relational – dependencies & coupling

- `too_many_dependencies_or_versions`  
  - Adds many requirement cross-references such as “as defined in REQ-101, REQ-204, REQ-305, and REQ-409”.  
  - Rule: `too_many_dependencies_or_versions:add_many_req_refs`

- `excessive_or_insufficient_coupling`  
  - Introduces vague linkage like “and behaves in the same way as described above”.  
  - Rule: `excessive_or_insufficient_coupling:add_as_described_above`

- `deep_nesting_or_structure_issue`  
  - Adds deep section references like “section 2.1.3.4.2.1 of the design document”.  
  - Rule: `deep_nesting_or_structure_issue:add_deep_section_reference`

---

### Incompleteness & language errors

- `incomplete_requirement`  
  - Removes the main action, keeping only the part before `shall`, or removes the actor.  
  - Rule: `incomplete_requirement:remove_main_action` / `incomplete_requirement:remove_actor`

- `incomplete_reference_or_condition`  
  - Adds vague phrases like “during normal operation when appropriate conditions are met”.  
  - Rule: `incomplete_reference_or_condition:add_vague_condition`

- `missing_system_response`  
  - Keeps only the condition (after/when/if …) and drops the system response, or replaces the full requirement with “If the described condition occurs.”  
  - Rule: `missing_system_response:keep_condition_only` / `missing_system_response:replace_with_if_only`

- `incorrect_or_confusing_order`  
  - Swaps condition and main action order or prepends an “After …” clause in a confusing way.  
  - Rule: `incorrect_or_confusing_order:swap_condition_and_action` / `incorrect_or_confusing_order:prepend_after_clause`

- `missing_unit_of_measurement`  
  - Adds a bare number without units (e.g., “within 5”).  
  - Rule: `missing_unit_of_measurement:add_bare_number`

- `partial_content_or_incomplete_enumeration`  
  - Adds incomplete lists like “user identifier, timestamp, action, etc.”  
  - Rule: `partial_content_or_incomplete_enumeration:add_etc_list`

- `embedded_rationale_or_justification`  
  - Mixes rationale into the requirement with “in order to support auditing and regulatory compliance”.  
  - Rule: `embedded_rationale_or_justification:add_in_order_to`

- `undefined_term`  
  - Introduces an undefined project-specific concept like “Compliance Index”.  
  - Rule: `undefined_term:add_compliance_index`

- `language_error_or_grammar_issue`  
  - Injects a noticeable grammar issue (e.g., wrong plural, changed modal).  
  - Rule: `language_error_or_grammar_issue:introduce_grammar_error`

- `ambiguous_plurality`  
  - Adds unclear plurality like “display the message on screens” without specifying which screens.  
  - Rule: `ambiguous_plurality:add_screens_scope`

---

## Files

- `requirements_with_smells.csv`  
  Synthetic smelly variants with metadata.

  Columns:

  - `base_id` – ID of the clean requirement (from `../clean`)
  - `variant_id` – ID of the smelly variant (e.g. `B-001-S01`)
  - `variant_index` – 1..8 (position among the variants for that base)
  - `domain` – domain label
  - `requirement_text` – mutated requirement text containing smells
  - `smells` – JSON array of smell IDs (ground truth labels)
  - `applied_rules` – JSON array of rule IDs (which template was used for each smell)

- `smell_injection_full.py`  
  Script used to generate the smelly dataset.

---

## Reproducing the dataset

To regenerate the smelly requirements, run:

   ```bash
   python smell_injection_full.py
