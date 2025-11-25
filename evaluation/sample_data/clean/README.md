# Clean Base Requirements Dataset

This folder contains a curated set of **clean software requirements** that serve as the baseline for:

- Generating synthetic **smelly variants** (see `../smelly`),
- Evaluating **false positives** of requirement smell detectors,
- Providing **examples of “good” requirements** for prompts, documentation, and human annotators.

The key property of this dataset is that each requirement is intended to be **free of all smells** defined in our smell taxonomy.

---

## Origin and extraction process

The clean requirements are **derived from** the publicly available:

> Vaibhav, I. *Software Requirements Dataset*, Kaggle  
> <https://www.kaggle.com/datasets/iamvaibhav100/software-requirements-dataset>

We used the extended version of this dataset (`software_requirements_extended.csv`) as a starting point and applied the following pipeline.

### 1. Automatic pre-filtering

From the original data, we selected **functional requirements** that look structurally sound. Filters included:

- `Type` ∈ {`FR`, `F`} (functional-only),
- Length between ~8 and 40 words,
- At most one sentence-ending punctuation mark (`.`, `?`, `!`),
- Contains at least one modal verb like `shall`, `must`, or `will`.

This produced a pool of “likely-good” requirement candidates.

### 2. Manual cleaning and normalization

From this pool, we manually curated and normalized a subset of **60 base requirements**. Changes included:

- Standardizing the form to **“The system shall …”** with a single clear actor and action.
- Splitting non-atomic requirements into multiple single-responsibility requirements when needed.
- Removing subjective or vague terms (e.g., *fast*, *user-friendly*, *intuitive*, *normally*, *etc.*).
- Removing implementation details (e.g., specific DBs, frameworks, file paths) to keep a **what, not how** focus.
- Ensuring each requirement is a **complete, grammatical sentence**.

The result is `base_requirements_clean_60.csv` — a compact, multi-domain set of requirements that are intentionally smell-free.

---

## Smell taxonomy (what these are clean **from**)

These requirements were checked against our taxonomy of requirement smells and are intended to be free of all of them.

**For complete definitions and examples**, see [../../../docs/TAXONOMY.md](../../../docs/TAXONOMY.md).

**Summary of 30 smells across 5 categories:**

- **Morphological** (5) – shape & readability
- **Lexical** (11) – word choice & vague terms
- **Analytical** (5) – grammar & sentence structure
- **Relational** (3) – dependencies & coupling
- **Incompleteness & language errors** (10)

---

## Files

- `base_requirements_clean_60.csv`

  Columns:

  - `id` – internal requirement ID (e.g. `B-001`)
  - `domain` – short domain label (e.g. `User Management System`)
  - `requirement_text` – the cleaned, smell-free requirement
  - `source_dataset` – provenance label (e.g. derived from Kaggle)
  - `notes` – curation/version notes

---

## Usage

Typical use cases:

- As a **reference set of clean requirements** to measure false positives of smell detectors (LLMs or tools).
- As the **starting point** for generating smelly variants (see `../smelly` and `smell_injection_full.py`).
- As input for human expert review to validate our notion of “smell-free” requirements.

If you modify or extend this dataset, please document changes here and/or in the `notes` column.
