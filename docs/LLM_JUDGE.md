# LLM-as-Judge for Requirement Smell Detection

## Overview

**LLM-as-Judge** is an evaluation approach where one language model assesses the quality of another model's output. In ReqRev, we use OpenAI's GPT-4 models to evaluate how well our primary model (typically gpt-4o-mini) detects requirement smells.

### Why LLM-as-Judge?

1. **Scalability**: Manual expert evaluation is expensive and time-consuming. LLM-as-judge provides scalable automated evaluation.

2. **Quality Evaluation**: Using a more powerful judge model (e.g., gpt-4o judging gpt-4o-mini) provides critical evaluation perspective.

3. **Research Validation**: Judge scores can be correlated with human expert evaluations to validate smell detection accuracy.

4. **Continuous Improvement**: Helps identify patterns in detection errors to improve prompts and fine-tuning.

5. **Reliable**: Uses OpenAI's API with your paid tier for consistent, rate-limit-free evaluation.

### What It Does

The judge model evaluates the primary model's smell detection on four criteria:

- **Accuracy**: Are the predicted smells actually present in the requirement?
- **Completeness**: Are there obvious smells that were missed?
- **Precision**: Are the smell labels correctly applied (not mislabeled)?
- **Explanation Quality**: Does the explanation justify the detected smells?

### What It Does NOT Do

- ❌ Replace the primary model - the judge only evaluates, it doesn't detect smells
- ❌ Provide ground truth - judge output is still AI-generated and should be validated
- ❌ Change extension behavior - browser extension only uses the primary model

## Configuration

### Environment Variables

```bash
# OpenAI API Key (required - used for both primary and judge)
OPENAI_API_KEY=sk-proj-...

# Primary Model Configuration
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1500
OPENAI_TEMPERATURE=0.0  # 0.0 for deterministic detection (recommended)

# Judge Configuration
JUDGE_MODEL=gpt-4o
JUDGE_MAX_TOKENS=1000
JUDGE_TEMPERATURE=0.0  # 0.0 for deterministic evaluation (recommended)
LLM_JUDGE_ENABLED=true
```

**Note**: Both models use the same OpenAI API key. The judge model is typically a more powerful model (e.g., gpt-4o) evaluating a faster/cheaper primary model (e.g., gpt-4o-mini).

### Recommended Model Combinations

| Use Case | Primary Model | Judge Model | Reasoning |
|----------|--------------|-------------|-----------|
| **Production** | gpt-4o-mini | gpt-4o | Cost-effective primary, high-quality judge |
| **High Quality** | gpt-4o | gpt-4o | Same model for consistency |
| **Research** | gpt-4o-mini | o1 | Fast primary, deep reasoning judge |
| **Budget** | gpt-4o-mini | gpt-4o-mini | Same model (less independent) |

**Recommended Setup:**

- Primary model: `gpt-4o-mini` (fast, cost-effective for real-time use)
- Judge model: `gpt-4o` (higher quality for evaluation and research)

## Usage

### Quick Test

```bash
curl -X POST http://localhost:8000/api/v1/analyze_requirement_with_judge \
  -H "Content-Type: application/json" \
  -d '{
    "requirement_id": "REQ-1",
    "description": "The system should maybe provide some kind of user-friendly authentication."
  }'
```

### Batch Evaluation

For evaluating multiple requirements:

```bash
cd evaluation/
python batch_evaluate.py
```

This generates comprehensive statistics and reports in JSON, CSV, and Markdown formats.

See `evaluation/README.md` for details.

## Judge Output Format

### Verdict

- **accept**: Smells are accurate and complete (score >= 0.8)
- **review**: Mostly correct but has minor issues (score 0.5-0.79)
- **reject**: Significant errors or omissions (score < 0.5)

### Score Scale (0.0-1.0)

- **1.0**: Perfect detection
- **0.8-0.99**: Very good, minor issues
- **0.5-0.79**: Acceptable but needs review
- **0.3-0.49**: Poor, significant problems
- **0.0-0.29**: Completely wrong

### Suggested Corrections

Specific, actionable feedback like:

- "Add smell 'X' because..."
- "Remove smell 'Y' - not applicable because..."

## Example Evaluations

### Example 1: Good Detection (Accept)

**Requirement**: "The system should maybe provide some kind of user-friendly authentication."

**Primary Model**: Detected `conditional_or_non_assertive_requirement`, `subjective_language`, `vague_or_implicit_terms`

**Judge Evaluation**:

```json
{
  "verdict": "accept",
  "score": 0.90,
  "justification": "All three smells correctly identified. Uses weak modal 'should maybe', subjective term 'user-friendly', and vague phrase 'some kind of'.",
  "suggested_corrections": []
}
```

### Example 2: Missed Smell (Review)

**Requirement**: "The system shall authenticate users using OAuth 2.0 with a maximum response time of 500 milliseconds."

**Primary Model**: No smells detected

**Judge Evaluation**:

```json
{
  "verdict": "review",
  "score": 0.60,
  "justification": "Missed two smells: OAuth 2.0 is implementation detail, and response time lacks operational context.",
  "suggested_corrections": [
    "Add 'design_or_implementation_detail' - specifies OAuth 2.0 technology",
    "Add 'non_verifiable_qualifier' - lacks context about load conditions"
  ]
}
```

## Troubleshooting

### Judge Evaluation Fails

**Error**: "LLM Judge is not available..."

**Solution**:

1. Verify `OPENAI_API_KEY` is set in `.env`
2. Check `LLM_JUDGE_ENABLED=true`
3. Verify `JUDGE_MODEL` is set (e.g., `gpt-4o`)
4. Restart API server

### Low Judge Scores

If judge consistently gives low scores:

- Review primary model prompt in `openai_client.py`
- Adjust `OPENAI_TEMPERATURE` (lower = more conservative)
- Consider fine-tuning the primary model

### API Rate Limits

- Use delays between batch requests (see `batch_evaluate.py`)
- Check your OpenAI tier limits
- Monitor usage at platform.openai.com

## Best Practices

### 1. Use Temperature=0.0 for Deterministic Evaluation

**CRITICAL**: Set both `OPENAI_TEMPERATURE=0.0` and `JUDGE_TEMPERATURE=0.0` to ensure:

- ✅ Same requirement → same smells detected (reproducible results)
- ✅ Consistent judge scores across multiple runs
- ✅ Reliable evaluation metrics for prompt engineering
- ✅ No random variation in batch evaluations

**Why this matters**: Even small temperatures (0.1, 0.2) introduce randomness that causes:

- Different smells detected on identical requirements
- Inconsistent judge verdicts (Accept vs Review)
- Unreliable evaluation metrics
- Difficulty validating prompt improvements

### 2. Use Judge for Research, Not Production

The `/analyze_requirement_with_judge` endpoint is for:

- ✅ Evaluating prompt quality
- ✅ Validating fine-tuning improvements
- ✅ Research and analysis

NOT for:

- ❌ Real-time browser extension analysis
- ❌ Production requirement checking

### 2. Validate Judge Output

Judge scores are AI opinions, not ground truth:

- Correlate with human expert evaluations
- Review "reject" verdicts manually
- Use statistical aggregation for large batches

### 3. Choose Appropriate Judge Models

- **gpt-4o**: Best balance of quality and speed
- **o1**: Deep reasoning for complex patterns
- **gpt-4-turbo**: Fast for large batches

### 4. Iterate Based on Feedback

Use judge feedback to improve:

1. Analyze `suggested_corrections` patterns
2. Update system prompts
3. Add examples to fine-tuning dataset
4. Re-evaluate after changes

## Research Applications

### Prompt Engineering Validation

Compare judge scores before/after prompt changes to measure improvement.

### Fine-Tuning Evaluation

Measure improvement from fine-tuning by comparing:

- Average judge scores
- Verdict distribution (accept/review/reject)
- Suggested corrections frequency

### Model Comparison

Compare different models objectively using judge scores as a metric.

## Related Documentation

- **Smell Taxonomy**: See [TAXONOMY.md](TAXONOMY.md) - Complete list of 30 smells
- **API Documentation**: See [API.md](API.md) - API endpoints including judge endpoint
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md) - System design and data flow
- **Evaluation Tools**: See [../evaluation/README.md](../evaluation/README.md) - Batch evaluation guide

## Additional Resources

- **OpenAI API**: [platform.openai.com/docs](https://platform.openai.com/docs)
- **GPT-4 Models**: [platform.openai.com/docs/models](https://platform.openai.com/docs/models)

---

**Last Updated**: November 2025  
**Status**: ✅ OpenAI-only (simplified configuration)
