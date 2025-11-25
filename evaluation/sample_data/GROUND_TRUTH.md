# Comprehensive Requirements Dataset - Ground Truth

This dataset contains 36 synthetic requirements designed to evaluate requirement smell detection systems. The requirements are inspired by quality attributes discussed in systematic literature reviews (ambiguity, completeness, singularity, verifiability, etc.).

## Dataset Structure

- **30 Smelly Requirements** (R1-R30): Each contains 1-3 intentional smells
- **6 Clean Requirements** (R31-R36): Well-formed requirements with no smells

## Usage Guidelines

1. **Feed only the requirement text** to your smell detector and judge
2. **Treat "Intended smells" as hidden ground truth** for analysis and validation
3. **Use for prompt engineering** - compare detected smells vs. intended smells
4. **Use for evaluation metrics** - calculate precision, recall, F1-score
5. **Rename smell labels** to match your schema if needed

---

## Group A: Conditional / Weak / Non-Assertive (R1-R5)

### R1
**Text**: "The system should maybe allow users to log in with some sort of secure method."

**Intended Smells**:
- `conditional_or_non_assertive_requirement` - Uses "should maybe" (weak modal + uncertainty)
- `vague_or_implicit_terms` - "some sort of secure method" is unspecified

---

### R2
**Text**: "The mobile app might send notifications when it thinks something important has happened."

**Intended Smells**:
- `conditional_or_non_assertive_requirement` - "might" is weak modal
- `subjective_language` / `non_verifiable_qualifier` - "important" lacks objective criteria

---

### R3
**Text**: "The website should, where possible, prevent users from making obvious mistakes during checkout."

**Intended Smells**:
- `conditional_or_non_assertive_requirement` - "where possible" weakens commitment
- `vague_or_implicit_terms` - "obvious mistakes" is subjective and undefined

---

### R4
**Text**: "The system may try to back up data every night if it is convenient."

**Intended Smells**:
- `conditional_or_non_assertive_requirement` - "may try" + "if convenient" are weak
- `vague_or_implicit_terms` - "convenient" is undefined

---

### R5
**Text**: "The report generation feature should generally respond quickly."

**Intended Smells**:
- `conditional_or_non_assertive_requirement` - "should generally" weakens requirement
- `non_verifiable_qualifier` - "quickly" lacks measurable threshold

---

## Group B: Subjective / Emotional / Opinionated (R6-R10)

### R6
**Text**: "The user interface shall be extremely intuitive and look modern at all times."

**Intended Smells**:
- `subjective_language` - "extremely intuitive" and "modern" are subjective
- `non_verifiable_qualifier` - Cannot objectively measure "intuitive" or "modern"

---

### R7
**Text**: "The dashboard must make users feel confident and happy about their financial decisions."

**Intended Smells**:
- `subjective_language` - "feel confident and happy" are emotional states
- `non_verifiable_qualifier` - Cannot objectively verify emotional responses
- Possibly `incomplete_requirement` - System cannot control user feelings (requirement is unimplementable as stated)

---

### R8
**Text**: "The system shall avoid annoying the user with too many pop-ups."

**Intended Smells**:
- `subjective_language` - "annoying" is subjective
- `vague_or_implicit_terms` - "too many" lacks specific threshold

---

### R9
**Text**: "The help messages should be friendly and not too technical."

**Intended Smells**:
- `subjective_language` - "friendly" is subjective
- `vague_or_implicit_terms` - "too technical" lacks clear definition

---

### R10
**Text**: "The mobile app must be beautiful and pleasant to use on all devices."

**Intended Smells**:
- `subjective_language` - "beautiful" and "pleasant" are subjective aesthetic judgments
- `non_verifiable_qualifier` - Cannot objectively measure beauty or pleasantness

---

## Group C: Vague / Underspecified / Non-Verifiable NFRs (R11-R15)

### R11
**Text**: "The system shall load pages fast even under heavy usage."

**Intended Smells**:
- `non_verifiable_qualifier` - "fast" lacks numeric threshold
- `vague_or_implicit_terms` - "heavy usage" is undefined
- Missing measurable performance thresholds

---

### R12
**Text**: "The API response time should be acceptable for all customers."

**Intended Smells**:
- `vague_or_implicit_terms` / `non_verifiable_qualifier` - "acceptable" is undefined
- No numeric threshold provided

---

### R13
**Text**: "The server shall handle a large number of concurrent users."

**Intended Smells**:
- `vague_or_implicit_terms` - "large number" is unspecified
- `incomplete_requirement` - Missing numeric target

---

### R14
**Text**: "The application must provide high security for user data."

**Intended Smells**:
- `vague_or_implicit_terms` - "high security" lacks concrete definition
- `non_verifiable_qualifier` - Cannot verify without specific security criteria

---

### R15
**Text**: "The system shall rarely crash during normal operation."

**Intended Smells**:
- `vague_or_implicit_terms` - "rarely" and "normal operation" are undefined
- `non_verifiable_qualifier` - Cannot measure "rarely" without threshold

---

## Group D: Multiple / Non-Atomic / Mixed Concerns (R16-R20)

### R16
**Text**: "The system shall authenticate the user and display the dashboard and send a welcome email after login."

**Intended Smells**:
- `non_atomic_requirement` - Three distinct actions in one requirement

---

### R17
**Text**: "The report screen shall show the chart, export to PDF, update live data, and allow admins to add new metrics."

**Intended Smells**:
- `non_atomic_requirement` - Four separate functional requirements combined

---

### R18
**Text**: "The system shall back up the database every night and restore it automatically if anything goes wrong."

**Intended Smells**:
- `non_atomic_requirement` - Backup + restore are separate requirements
- `vague_or_implicit_terms` - "anything goes wrong" is undefined

---

### R19
**Text**: "The app must track the user's location and battery usage while providing accurate recommendations."

**Intended Smells**:
- `non_atomic_requirement` - Three different responsibilities combined

---

### R20
**Text**: "The payment module shall calculate taxes correctly and be very fast and be easy to maintain."

**Intended Smells**:
- `non_atomic_requirement` - Functional + performance + maintainability combined
- `subjective_language` / `non_verifiable_qualifier` - "very fast" and "easy to maintain"

---

## Group E: Ambiguity / Pronouns / References / Inconsistent Terms (R21-R25)

### R21
**Text**: "The system shall send it to the user once they approve it."

**Intended Smells**:
- `ambiguous_pronoun` - "it" is unclear (what is being sent?)
- `incomplete_reference` - Missing antecedent

---

### R22
**Text**: "If the device is disconnected, it shall notify the operator before it stops."

**Intended Smells**:
- `ambiguous_pronoun` - "it" could refer to device or system
- Potential logical ambiguity about order of events

---

### R23
**Text**: "The application shall log all important events etc. for later analysis."

**Intended Smells**:
- `vague_or_implicit_terms` - "important events" lacks definition
- `partial_content_or_incomplete_enumeration` - "etc." leaves requirement incomplete

---

### R24
**Text**: "Customer information shall be stored in the Client Table while the customer data is processed in the User module."

**Intended Smells**:
- `undefined_term` - Customer / Client / User used interchangeably without clear definitions
- Potential semantic inconsistency

---

### R25
**Text**: "The system shall follow the company security policy document where applicable."

**Intended Smells**:
- `weak_reference_to_external_document` - "where applicable" weakens requirement
- `incomplete_requirement` - Which parts apply? How is applicability determined?

---

## Group F: Design / Implementation Detail (R26-R29)

### R26
**Text**: "The system shall store all user profiles in a single PostgreSQL database running on port 5432."

**Intended Smells**:
- `design_or_implementation_detail` - Specifies technology (PostgreSQL) and configuration (port)

---

### R27
**Text**: "The application shall use a React front-end and a Node.js back-end for all user-facing features."

**Intended Smells**:
- `design_or_implementation_detail` - Specifies technologies (React, Node.js)

---

### R28
**Text**: "Passwords must be hashed using exactly SHA-1 and saved in a 'passwords' table."

**Intended Smells**:
- `design_or_implementation_detail` - Specifies algorithm and table name
- Note: SHA-1 is also deprecated for security (but that's a domain smell, not syntax)

---

### R29
**Text**: "The logistics service shall communicate with the warehouse through a daily CSV file placed in /tmp/inbox."

**Intended Smells**:
- `design_or_implementation_detail` - Specifies file format, schedule, and path
- Possibly operational detail / fragility smell

---

## Group G: Negative / Incomplete / TBD (R30-R36)

### R30
**Text**: "The system shall not allow any unauthorized or suspicious activities."

**Intended Smells**:
- `negative_requirement` - Specifies what system shall NOT do
- `vague_or_implicit_terms` - "suspicious activities" is undefined

---

### R31
**Text**: "The app shall never lose important data."

**Intended Smells**:
- `negative_requirement` - Specifies what shall NOT happen
- `non_verifiable_qualifier` - "never" is absolute and untestable
- `vague_or_implicit_terms` - "important data" lacks definition

---

### R32
**Text**: "The user profile page shall display all relevant information about the user."

**Intended Smells**:
- `vague_or_implicit_terms` - "relevant information" is undefined
- `incomplete_requirement` - What information is relevant?

---

### R33
**Text**: "The reporting module shall implement the KP-Alpha algorithm as described in the internal wiki."

**Intended Smells**:
- `design_or_implementation_detail` - Specifies algorithm implementation
- `weak_reference_to_external_document` - Wiki is mutable and may change

---

### R34
**Text**: "The audit trail shall capture everything that happened in the system."

**Intended Smells**:
- `vague_or_implicit_terms` - "everything that happened" is too broad
- `non_verifiable_qualifier` - Cannot verify "everything"

---

### R35
**Text**: "The system shall provide GDPR-compliant processing of user data (details TBD)."

**Intended Smells**:
- `TBD_placeholder` / `explicit_incompleteness` - "details TBD" admits incompleteness
- `weak_reference_to_external_document` - References GDPR without concrete mapping

---

### R36
**Text**: "The notification service must retry failed messages a few times before giving up."

**Intended Smells**:
- `vague_or_implicit_terms` - "a few times" lacks specific number
- `incomplete_requirement` - "giving up" behavior undefined

---

## Notes on Usage

### For Prompt Engineering
Compare your detector's output against these intended smells:
- **True Positive (TP)**: Detected smell matches intended smell
- **False Positive (FP)**: Detected smell not in intended list
- **False Negative (FN)**: Intended smell not detected
- **True Negative (TN)**: Clean requirement correctly identified

### For Evaluation Metrics
```
Precision = TP / (TP + FP)
Recall = TP / (TP + FN)
F1-Score = 2 * (Precision * Recall) / (Precision + Recall)
```

### For Judge Validation
Use the judge to:
1. Validate detector output against ground truth
2. Identify systematic detection errors
3. Improve prompt based on patterns in false positives/negatives

### Smell Label Mapping
Your schema might use different names. Map as needed:
- `conditional_or_non_assertive_requirement` ↔ weak_modal_verbs
- `vague_or_implicit_terms` ↔ ambiguity / underspecification
- `non_verifiable_qualifier` ↔ unmeasurable / untestable
- etc.

---

**Dataset Version**: 1.0  
**Last Updated**: November 2025  
**License**: Synthetic data for research and evaluation purposes
