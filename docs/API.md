# ReqRev API Documentation

**Related Documentation:**

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[TAXONOMY.md](TAXONOMY.md)** - Complete smell taxonomy (30 smells)
- **[LLM_JUDGE.md](LLM_JUDGE.md)** - LLM-as-Judge evaluation
- **[../evaluation/README.md](../evaluation/README.md)** - Batch evaluation tools

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
  "description": "string"
}
```

**Request Schema**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requirement_id` | string | Yes | Unique identifier for the requirement (e.g., "REQ-1") |
| `description` | string | Yes | The requirement text to analyze (min 1 character) |

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

**Smell Types**:

The API detects **30 requirement smells across 5 categories**:

- 🟣 **Morphological** (5): Shape and readability
- 🟠 **Lexical** (11): Word choice and vague terms
- 🔵 **Analytical** (5): Grammar and structure
- 🟢 **Relational** (3): Dependencies and coupling
- 🔴 **Incompleteness** (10): Missing information and errors

**For complete definitions and examples**, see [TAXONOMY.md](TAXONOMY.md).

**Detection Accuracy**: The system uses enhanced prompts with conservative detection rules to minimize false positives. Simple conditional requirements with clear "shall" statements (e.g., "When X happens, the system shall do Y") are acceptable and won't be flagged.

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
    "description": "The system should maybe provide some kind of user-friendly authentication."
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
    description: 'The system shall authenticate users using OAuth 2.0.'
  })
});

const result = await response.json();
console.log('Detected smells:', result.smells);
```

### 1b. Analyze Requirement with LLM-as-Judge

Analyzes a requirement using the primary OpenAI model AND evaluates the results with a secondary LLM-as-judge.

**Endpoint**: `POST /api/v1/analyze_requirement_with_judge`

**Purpose**: Research and evaluation of smell detection quality. The browser extension does NOT need to use this endpoint.

**For complete judge documentation**, see [LLM_JUDGE.md](LLM_JUDGE.md).

**Request Body**: Same as `/analyze_requirement`

**Response**: Same as `/analyze_requirement` plus additional `judge_evaluation` object with verdict, score, justification, and suggested corrections.

**Example Request (cURL)**:

```bash
curl -X POST http://localhost:8000/api/v1/analyze_requirement_with_judge \
  -H "Content-Type: application/json" \
  -d '{
    "requirement_id": "REQ-1",
    "description": "The system should maybe provide some kind of user-friendly authentication."
  }'
```

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

Returns information about the configured LLM-as-Judge model.

**Endpoint**: `GET /api/v1/judge_model`

**For complete judge configuration details**, see [LLM_JUDGE.md](LLM_JUDGE.md).

**Example Request (cURL)**:

```bash
curl http://localhost:8000/api/v1/judge_model
```

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

The API uses OpenAI for both primary smell detection and LLM-as-Judge evaluation.

### Primary Model Configuration (Required)

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini  # or your fine-tuned model ID
OPENAI_MAX_TOKENS=1500
OPENAI_TEMPERATURE=0.1
```

**Fine-Tuned Models**: For production use, train a fine-tuned model on the comprehensive smell taxonomy and set `OPENAI_MODEL` to your model ID (format: `ft:gpt-4o-mini:org:id:suffix`).

### Judge Model Configuration (Optional - Research Only)

```bash
JUDGE_MODEL=gpt-4o
JUDGE_MAX_TOKENS=1000
JUDGE_TEMPERATURE=0.0  # Use 0.0 for deterministic evaluation
LLM_JUDGE_ENABLED=true
```

**For complete judge configuration and usage**, see [LLM_JUDGE.md](LLM_JUDGE.md).

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
        description: req.description
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
