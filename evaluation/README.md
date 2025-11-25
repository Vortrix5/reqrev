# Evaluation Tools

Research tools for evaluating requirement smell detection quality using LLM-as-Judge.

## Quick Start

```bash
# 1. Start API
python start_api.py

# 2. Run batch evaluation
cd evaluation
python batch_evaluate.py

# 3. Review results in results/ directory
```

## What's Included

- **batch_evaluate.py**: Evaluate multiple requirements at once
- **test_judge.py**: Simple test with 4 example requirements
- **sample_data/**: Example datasets:
  - `requirements_comprehensive.csv/json` - **36 requirements with ground truth** (recommended)
  - `requirements_sample.csv/json` - 10 quick test requirements
  - `GROUND_TRUTH.md` - Intended smells for each requirement (for validation)
- **results/**: Generated evaluation reports (gitignored)

## Usage

### Load Your Requirements

Edit `batch_evaluate.py`:

```python
# Option 1: Comprehensive dataset (36 requirements with ground truth - DEFAULT)
requirements = load_requirements_from_csv("sample_data/requirements_comprehensive.csv")

# Option 2: Quick test (10 requirements)
requirements = load_requirements_from_csv("sample_data/requirements_sample.csv")

# Option 3: Your own file
requirements = load_requirements_from_csv("your_file.csv")
requirements = load_requirements_from_json("your_file.json")

# Option 4: Hardcode for quick tests
requirements = [
    {"requirement_id": "REQ-1", "description": "Your requirement..."}
]
```

### Understanding Ground Truth

The comprehensive dataset includes **intended smells** for each requirement. See `sample_data/GROUND_TRUTH.md` to:
- Compare detected vs. intended smells
- Calculate precision, recall, F1-score
- Validate prompt improvements
- Identify systematic detection errors

## Understanding Results

**Verdicts:**
- ✅ **Accept** (≥0.8): Detection is accurate
- ⚠️ **Review** (0.5-0.79): Minor issues
- ❌ **Reject** (<0.5): Significant problems

**Key Metrics:**
- Average score (higher = better detection quality)
- Verdict distribution
- Smells per requirement
- Suggested corrections per requirement

## Configuration

Edit `.env` in project root:

```bash
# Judge model (uses OpenAI)
JUDGE_MODEL=gpt-4o
JUDGE_MAX_TOKENS=1000
JUDGE_TEMPERATURE=0.2
LLM_JUDGE_ENABLED=true

# Adjust rate limiting in batch_evaluate.py if needed
delay_between_requests=1.0  # seconds
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | Start API: `python start_api.py` |
| "Judge not available" | Check `OPENAI_API_KEY` and `LLM_JUDGE_ENABLED=true` in `.env` |
| All errors | Check `.env` has `OPENAI_API_KEY` set |

## Documentation

- **[../docs/LLM_JUDGE.md](../docs/LLM_JUDGE.md)** - Complete LLM-as-Judge guide
- **[../docs/TAXONOMY.md](../docs/TAXONOMY.md)** - 30 smell definitions  
- **[../docs/API.md](../docs/API.md)** - API reference including `/analyze_requirement_with_judge`
- **[sample_data/clean/README.md](sample_data/clean/README.md)** - Clean requirements dataset
- **[sample_data/smelly/README.md](sample_data/smelly/README.md)** - Synthetic smelly requirements with ground truth
