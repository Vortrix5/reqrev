# Sample Requirements Data

This folder contains example requirement datasets for testing the batch evaluation tool.

## Files

### requirements_sample.csv

CSV format with 10 example requirements ranging from very poor quality (vague, subjective) to excellent quality (specific, measurable).

**Columns:**

- `requirement_id`: Unique identifier
- `description`: Requirement text

**Usage:**

```python
requirements = load_requirements_from_csv("sample_data/requirements_sample.csv")
```

### requirements_sample.json

Same 10 requirements in JSON format for programmatic loading.

**Structure:**

```json
[
  {
    "requirement_id": "REQ-1",
    "description": "Requirement text..."
  }
]
```

**Usage:**

```python
requirements = load_requirements_from_json("sample_data/requirements_sample.json")
```

## Creating Your Own Dataset

### From CSV

Create a CSV file with the same structure:

```csv
requirement_id,description
YOUR-REQ-1,"Your requirement text here"
YOUR-REQ-2,"Another requirement"
```

### From JSON

Create a JSON file with array of objects:

```json
[
  {"requirement_id": "YOUR-REQ-1", "description": "Your requirement text"},
  {"requirement_id": "YOUR-REQ-2", "description": "Another requirement"}
]
```

## Sample Requirements Quality Range

The sample dataset includes:

**Poor Quality (Expected low scores):**

- REQ-1: Vague + weak words ("should maybe", "some kind of")
- REQ-3: Ambiguous + subjective ("simple", "fast")
- REQ-5: Incomplete ("provide backup" - no details)
- REQ-7: Subjective + vague ("good performance")
- REQ-9: Vague ("relevant information")

**Medium Quality (Expected moderate scores):**

- REQ-4: Composite (multiple requirements in one)
- REQ-6: Weak requirement ("may optionally")

**Good Quality (Expected high scores):**

- REQ-2: Specific, measurable, clear
- REQ-8: Concrete, testable, unambiguous
- REQ-10: Quantified, measurable, clear success criteria

Use this dataset to verify that your judge is working correctly by checking if scores correlate with quality.
