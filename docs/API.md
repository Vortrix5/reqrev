# ReqRev API Documentation

## Base URL

```
http://localhost:8000/api/v1
```

In production, replace with your deployed API URL.

## Authentication

Currently, no authentication is required. The API uses CORS to restrict access to browser extensions only.

## Endpoints

### 1. Analyze Requirement

Analyzes a software requirement for quality issues (smells) based on ISO 29148 standards.

**Endpoint**: `POST /api/v1/analyze_requirement`

**Request Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "requirement_id": "string",
  "description": "string",
  "activity_points": 85  // optional, integer 0-100
}
```

**Request Schema**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requirement_id` | string | Yes | Unique identifier for the requirement (e.g., "REQ-1") |
| `description` | string | Yes | The requirement text to analyze (min 1 character) |
| `activity_points` | integer | No | Activity score from 0-100 (currently not used in analysis) |

**Response**: `200 OK`

```json
{
  "requirement_id": "REQ-1",
  "description": "The system shall provide secure user authentication using OAuth 2.0 or similar industry-standard protocols.",
  "smells": [
    "ambiguity",
    "weak_verb"
  ],
  "explanation": "The requirement contains ambiguous terms ('similar') and uses weak verbs ('provide') instead of 'shall'.",
  "raw_model_output": {
    "model": "gpt-4o-mini",
    "content": {...},
    "usage": {...}
  }
}
```

**Response Schema**:

| Field | Type | Description |
|-------|------|-------------|
| `requirement_id` | string | The requirement identifier from the request |
| `description` | string | The analyzed requirement text |
| `smells` | array[string] | List of detected requirement smells |
| `explanation` | string \| null | Human-readable explanation of detected issues |
| `raw_model_output` | object \| null | Raw output from the LLM (for debugging) |

**Smell Types (36 Labels Across 5 Categories)**:

**Morphological (5)**: Shape and readability

- `too_long_sentence` - Requirement spans >30-40 tokens with multiple "and/or" chains
- `too_short_sentence` - Very short fragment missing context
- `unreadable_structure` - Complex syntax, heavy nesting, confusing punctuation
- `punctuation_issue` - Excessive or missing punctuation
- `acronym_overuse_or_abbrev` - Heavy acronyms without introduction

**Lexical (11)**: Word choice and vague terms

- `non_atomic_requirement` - Multiple actions/concerns combined, should be split
- `negative_formulation` - Uses "must not"/"shall not" where positive is clearer
- `vague_pronoun_or_reference` - Uses "it"/"this"/"that" without clear referent
- `subjective_language` - "user-friendly", "simple", "fast" without measurable criteria
- `vague_or_implicit_terms` - "normally", "usually", "as appropriate", "etc."
- `non_verifiable_qualifier` - "as soon as possible", "minimal delay" without metrics
- `loophole_or_open_ended` - "at least", "up to" with no bounds
- `superlative_or_comparative_without_reference` - "best", "faster" with no baseline
- `quantifier_without_unit_or_range` - "many", "few", numbers without units
- `design_or_implementation_detail` - Describes HOW (technology) instead of WHAT
- `implicit_requirement` - Significant behavior only implied, not explicit

**Analytical (5)**: Grammar and structure

- `overuse_imperative_form` - Long list of commands without conditions/actors
- `missing_imperative_verb` - No clear action verb, just descriptive statement
- `conditional_or_non_assertive_requirement` - Weak modals ("may", "might", "maybe") OR excessive "if...then" obscuring obligation
- `passive_voice` - Unclear who performs action
- `domain_term_imbalance` - Too much jargon or missing expected domain terms

**Relational (3)**: Dependencies and coupling

- `too_many_dependencies_or_versions` - References many requirements
- `excessive_or_insufficient_coupling` - Overly entangled or floating with no relations
- `deep_nesting_or_structure_issue` - Deeply nested hierarchy

**Incompleteness (12)**: Missing information and errors

- `incomplete_requirement` - Missing trigger, actor, response, or success criteria
- `incomplete_reference_or_condition` - References undefined things or incomplete conditions
- `missing_system_response` - States condition but not what system should do
- `incorrect_or_confusing_order` - Steps in confusing order
- `missing_unit_of_measurement` - Numeric values without units
- `partial_content_or_incomplete_enumeration` - Uses "etc." or incomplete lists
- `embedded_rationale_or_justification` - Mixes "why" into "what"
- `undefined_term` - Specialized terms not defined
- `language_error_or_grammar_issue` - Grammar/spelling errors affecting clarity
- `ambiguous_plurality` - Unclear if applies to all, some, or one instance

**Detection Accuracy**: The system uses enhanced prompts with conservative detection rules to minimize false positives. Simple conditional requirements with clear "shall" statements (e.g., "When X happens, the system shall do Y") are acceptable and won't be flagged.

See the main README.md for more details on the taxonomy.

**Error Responses**:

**400 Bad Request** - Invalid input

```json
{
  "detail": "Validation error message"
}
```

**500 Internal Server Error** - Server error

```json
{
  "detail": "Failed to analyze requirement. Please check server logs."
}
```

**Example Request (cURL)**:

```bash
curl -X POST http://localhost:8000/api/v1/analyze_requirement \
  -H "Content-Type: application/json" \
  -d '{
    "requirement_id": "REQ-1",
    "description": "The system should maybe provide some kind of user-friendly authentication.",
    "activity_points": 45
  }'
```

**Example Response**:

```json
{
  "requirement_id": "REQ-1",
  "description": "The system should maybe provide some kind of user-friendly authentication.",
  "smells": [
    "conditional_or_non_assertive_requirement",
    "subjective_language",
    "vague_or_implicit_terms",
    "non_verifiable_qualifier"
  ],
  "explanation": "The requirement uses weak modal verbs ('should', 'maybe'), contains subjective language ('user-friendly'), and vague terms ('some kind of'), making it unclear and unmeasurable.",
  "raw_model_output": {
    "model": "gpt-4o-mini",
    "content": {
      "smells": ["conditional_or_non_assertive_requirement", "subjective_language", "vague_or_implicit_terms", "non_verifiable_qualifier"],
      "explanation": "..."
    },
    "usage": {
      "prompt_tokens": 851,
      "completion_tokens": 78,
      "total_tokens": 929
    }
  }
}
```

**Example Request (JavaScript/Fetch)**:

```javascript
const response = await fetch('http://localhost:8000/api/v1/analyze_requirement', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    requirement_id: 'REQ-1',
    description: 'The system shall authenticate users using OAuth 2.0.',
    activity_points: 90
  })
});

const result = await response.json();
console.log('Detected smells:', result.smells);
```

### 1b. Analyze Requirement with LLM-as-Judge

Analyzes a requirement using the primary OpenAI model AND evaluates the results with a secondary LLM-as-judge on OpenRouter.

**Endpoint**: `POST /api/v1/analyze_requirement_with_judge`

**Purpose**: Research and evaluation of smell detection quality. The browser extension does NOT need to use this endpoint.

**Request Headers**:

```
Content-Type: application/json
```

**Request Body**: Same as `/analyze_requirement`

```json
{
  "requirement_id": "string",
  "description": "string",
  "activity_points": 85  // optional, integer 0-100
}
```

**Response**: `200 OK`

```json
{
  "requirement_id": "REQ-1",
  "description": "The system should maybe provide some kind of user-friendly authentication.",
  "smells": [
    "conditional_or_non_assertive_requirement",
    "subjective_language",
    "vague_or_implicit_terms",
    "non_verifiable_qualifier"
  ],
  "explanation": "The requirement uses weak modal verbs ('should', 'maybe'), contains subjective language ('user-friendly'), and vague terms ('some kind of'), making it unclear and unmeasurable.",
  "raw_model_output": {
    "model": "gpt-4o-mini",
    "content": {...},
    "usage": {...}
  },
  "judge_evaluation": {
    "verdict": "review",
    "score": 0.78,
    "justification": "The predicted smells are mostly appropriate but miss the 'implicit_requirement' smell; the explanation is correct but could mention missing units.",
    "suggested_corrections": [
      "Consider adding 'implicit_requirement' - authentication method is implied but not explicit",
      "Explanation should clarify that 'user-friendly' lacks measurable criteria"
    ],
    "raw_judge_output": {
      "model": "meta-llama/llama-3.3-70b-instruct:free",
      "content": {...},
      "usage": {...}
    }
  }
}
```

**Response Schema Extension**:

In addition to all fields from `/analyze_requirement`, this endpoint adds:

| Field | Type | Description |
|-------|------|-------------|
| `judge_evaluation` | object | Independent evaluation by judge model |
| `judge_evaluation.verdict` | string | "accept", "review", or "reject" |
| `judge_evaluation.score` | float | Quality score 0.0-1.0 |
| `judge_evaluation.justification` | string | Detailed evaluation explanation |
| `judge_evaluation.suggested_corrections` | array[string] | Specific improvement suggestions |
| `judge_evaluation.raw_judge_output` | object | Raw judge model output |

**Judge Verdict Meanings**:

- **accept** (score ≥ 0.8): Smells are accurate and complete, no significant issues
- **review** (score 0.5-0.79): Mostly correct but has minor issues or omissions worth checking
- **reject** (score < 0.5): Significant errors, wrong smells, or major omissions

**Example Request (cURL)**:

```bash
curl -X POST http://localhost:8000/api/v1/analyze_requirement_with_judge \
  -H "Content-Type: application/json" \
  -d '{
    "requirement_id": "REQ-1",
    "description": "The system should maybe provide some kind of user-friendly authentication.",
    "activity_points": 45
  }'
```

**Error Responses**:

**400 Bad Request** - Judge not configured

```json
{
  "detail": "LLM Judge is not available. Please set OPENROUTER_API_KEY and ensure LLM_JUDGE_ENABLED=true in your environment."
}
```

**500 Internal Server Error** - Analysis or evaluation failed

```json
{
  "detail": "Failed to analyze requirement with judge. Please check server logs."
}
```

**Usage Notes**:

1. **Research/Evaluation Only**: This endpoint is designed for evaluating smell detection quality, not for production use by the extension.
2. **Performance**: Takes ~2-5 seconds longer than regular analysis due to the additional judge step.
3. **Independence**: The judge model is completely separate from the primary model to provide unbiased evaluation.
4. **Correlation**: Judge scores should be correlated with human expert evaluations for validation.

### 2. Get Model Information

Returns information about the configured OpenAI model.

**Endpoint**: `GET /api/v1/models`

**Response**: `200 OK`

```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "configured": true,
  "max_tokens": 1500,
  "temperature": 0.1
}
```

**Example Request (cURL)**:

```bash
curl http://localhost:8000/api/v1/models
```

### 3. Get Judge Model Information

Returns information about the configured LLM-as-Judge model on OpenRouter.

**Endpoint**: `GET /api/v1/judge_model`

**Response**: `200 OK`

```json
{
  "provider": "openrouter",
  "model": "meta-llama/llama-3.3-70b-instruct:free",
  "configured": true,
  "enabled": true,
  "max_tokens": 1000,
  "temperature": 0.2,
  "base_url": "https://openrouter.ai/api/v1/chat/completions"
}
```

**Example Request (cURL)**:

```bash
curl http://localhost:8000/api/v1/judge_model
```

**Fields**:

| Field | Description |
|-------|-------------|
| `provider` | Always "openrouter" |
| `model` | The OpenRouter model identifier |
| `configured` | True if API key is set and judge is available |
| `enabled` | Value of LLM_JUDGE_ENABLED setting |
| `max_tokens` | Maximum tokens for judge responses |
| `temperature` | Sampling temperature for judge |
| `base_url` | OpenRouter API endpoint |

### 4. Health Check

Simple health check endpoint.

**Endpoint**: `GET /health`

**Response**: `200 OK`

```json
{
  "status": "healthy",
  "provider": "openai",
  "model": "gpt-4o-mini"
}
```

### 5. Root / Service Info

Returns basic service information.

**Endpoint**: `GET /`

**Response**: `200 OK`

```json
{
  "service": "ReqRev API",
  "version": "1.0.0",
  "status": "healthy",
  "provider": "openai",
  "model": "gpt-4o-mini"
}
```

## Interactive API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

These interfaces allow you to:

- View all endpoints and schemas
- Try out API calls directly in the browser
- See request/response examples

## Rate Limiting

⚠️ **Not yet implemented** - Consider implementing rate limiting in production to:

- Prevent abuse
- Control LLM API costs
- Ensure fair usage

## Error Handling

The API uses standard HTTP status codes:

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

All error responses include a `detail` field with a human-readable message.

## CORS Configuration

The API is configured to accept requests from:

- Chrome extensions: `chrome-extension://*`
- Firefox extensions: `moz-extension://*`
- Local development: `http://localhost:*`

This is configured via the `CORS_ORIGINS` environment variable.

## LLM Provider Configuration

The API uses two LLM providers:

1. **OpenAI** - Primary smell detection model (required)
2. **OpenRouter** - LLM-as-Judge evaluation model (optional, for research)

### OpenAI Configuration (Primary Model)

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini  # or your fine-tuned model ID
OPENAI_MAX_TOKENS=1500
OPENAI_TEMPERATURE=0.1
```

**Characteristics**:

- Supports both base models (gpt-4o-mini) and fine-tuned models
- Comprehensive smell taxonomy (36 labels across 5 categories)
- Structured JSON output with detailed explanations
- Pay-per-use pricing
- Typical response time: 1-3 seconds

**Fine-Tuned Models**:
For production use, train a fine-tuned model on the comprehensive smell taxonomy and set `OPENAI_MODEL` to your model ID (format: `ft:gpt-4o-mini:org:id:suffix`).

### OpenRouter Configuration (LLM-as-Judge)

```bash
# OpenRouter configuration (LLM-as-judge)
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_MAX_TOKENS=1000
OPENROUTER_TEMPERATURE=0.2
LLM_JUDGE_ENABLED=true
```

**Characteristics**:

- Used only for `/analyze_requirement_with_judge` endpoint
- Provides independent evaluation of smell detection quality
- Recommended free models:
  - `meta-llama/llama-3.3-70b-instruct:free`
  - `google/gemini-flash-1.5:free`
  - `mistralai/mistral-7b-instruct:free`
- Get an API key at [openrouter.ai](https://openrouter.ai)
- Browse available models at [openrouter.ai/models](https://openrouter.ai/models)

**Judge vs Primary Model**:

| Aspect | Primary (OpenAI) | Judge (OpenRouter) |
|--------|------------------|-------------------|
| Purpose | Detect requirement smells | Evaluate detection quality |
| Used by | Extension & all API calls | Research endpoint only |
| Required | Yes | No (optional) |
| Endpoint | `/analyze_requirement` | `/analyze_requirement_with_judge` |
| Cost | Pay-per-use | Free models available |

**Important**: The main smell detection always uses OpenAI (`OPENAI_MODEL`). The judge is a secondary model used only by `/analyze_requirement_with_judge` for research purposes.

## Best Practices

1. **Requirement Text**:
   - Provide complete requirement text
   - Include context if available
   - Minimum 1 character, but longer is better for accurate analysis

2. **Error Handling**:
   - Always check HTTP status codes
   - Parse `detail` field for error messages
   - Implement retries for 500 errors

3. **Performance**:
   - Typical response time: 1-3 seconds per requirement
   - Token usage: ~850 prompt tokens + 50-150 completion tokens
   - Consider caching results for identical requirements

4. **Security**:
   - Never expose OpenAI API keys in client code
   - Use environment variables on server
   - All LLM calls must be server-side only

5. **Fine-Tuned Models**:
   - For production, use a fine-tuned model trained on the smell taxonomy
   - Set `OPENAI_MODEL` to your fine-tuned model ID
   - Base models (gpt-4o-mini) work well but fine-tuned is recommended

## Example Integration

### Browser Extension Integration

```typescript
// In your extension code
async function analyzeRequirement(req: Requirement): Promise<AnalysisResult> {
  try {
    const response = await fetch('http://localhost:8000/api/v1/analyze_requirement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requirement_id: req.id,
        description: req.description,
        activity_points: req.activityPoints
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Analysis failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to analyze requirement:', error);
    throw error;
  }
}
```

## Troubleshooting

### Problem: CORS Error

**Solution**: Ensure your extension ID is allowed in `CORS_ORIGINS`, or use `*` for development:

```bash
CORS_ORIGINS=chrome-extension://*,moz-extension://*
```

### Problem: 500 Error on Analysis

**Solution**: Check server logs for LLM provider errors. Common causes:

- Invalid API key
- Rate limit exceeded
- Network connectivity issues

### Problem: Slow Response Times

**Solution**:

- OpenAI: Check your network connection and API status
- Typical response time is 1-3 seconds
- Consider implementing caching for frequently analyzed requirements

### Problem: Empty `smells` Array

**Solution**: This is normal! It means the requirement is well-written with no detected issues.

## Support

For issues or questions:

- Check server logs: `python -m api.main` (console output)
- Review configuration: `GET /api/v1/models`
- Verify health: `GET /health`
- See architecture docs: `docs/ARCHITECTURE.md`
