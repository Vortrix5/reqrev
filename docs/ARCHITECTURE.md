# ReqRev Architecture

**Related Documentation:**

- **[API.md](API.md)** - API endpoints and usage
- **[TAXONOMY.md](TAXONOMY.md)** - Complete smell taxonomy (30 smells)
- **[LLM_JUDGE.md](LLM_JUDGE.md)** - LLM-as-Judge evaluation
- **[../evaluation/README.md](../evaluation/README.md)** - Batch evaluation tools

## Overview

ReqRev is a comprehensive requirements analysis system consisting of two tightly integrated components:

1. **Browser Extension** - A Chrome/Edge extension that adds a Requirements tab to GitHub repositories with AI-powered smell detection and detailed guidance
2. **Backend API** - A FastAPI service that provides LLM-powered requirement smell detection using a comprehensive 36-label taxonomy based on ISO 29148 standards

## High-Level Architecture

```
┌─────────────────────────────────────────────┐
│         Browser Extension (React)           │
│  ┌────────────┐  ┌──────────────────────┐   │
│  │ CRUD Panel │  │ Smell Details Panel  │   │
│  │            │  │ • Descriptions       │   │
│  │ • Create   │  │ • Fix suggestions    │   │
│  │ • Edit     │  │ • Examples           │   │
│  │ • Delete   │  │ • Color-coded badges │   │
│  └────────────┘  └──────────────────────┘   │
│         │                   ▲              │
│         │ Chrome Storage API│              │
│         ▼                   │              │
│  ┌──────────────────────────┴───────────┐   │
│  │   useRequirements Hook               │   │
│  │   • State management                 │   │
│  │   • API integration                  │   │
│  │   • Analysis orchestration           │   │
│  └──────────────┬───────────────────────┘   │
└─────────────────┼───────────────────────────┘
                  │ HTTPS
                  │ POST /api/v1/analyze_requirement
                  ▼
         ┌─────────────────┐
         │   FastAPI       │
         │   Backend       │
         │   (Python)      │
         └────────┬────────┘
                  │
                  │ Call
                  ▼
         ┌─────────────────┐
         │  LLM Service    │
         │   Layer         │
         │  (Facade)       │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │   OpenAI API    │
         │   GPT-4o-mini   │
         │                 │
         │  36 Smell Labels│
         │  5 Categories   │
         │  ISO 29148      │
         └─────────────────┘
```

## Component Details

### 1. Browser Extension (`extension/`)

**Purpose**: Provides a user interface for managing requirements within GitHub repositories.

**Technology Stack**:

- TypeScript
- React for UI components
- Chrome Extension APIs
- Webpack for bundling

**Key Features**:

- Injects a "Requirements" tab into GitHub repository pages
- Stores requirements in Chrome local storage (per repository)
- Provides CRUD operations for requirements
- **Integrated smell detection**: One-click analysis with backend API
- **Visual feedback**: Color-coded smell count badges (Green → Yellow → Orange → Red)
- **Comprehensive guidance**: Detailed side panel with descriptions, fix suggestions, and examples for all 36 smells
- **Professional UI**: Matches GitHub's design language and dark mode

**Files**:

- `manifest.json` - Extension configuration (Manifest V3)
- `src/contentScript.tsx` - Main entry point and GitHub integration
- `src/components/` - React UI components
  - `requirements/` - CRUD interface (panel, table, forms)
  - `ui/` - Analysis UI (SmellCountBadge, SmellDetailsPanel)
- `src/hooks/` - React hooks for state management
  - `useRequirements.ts` - Main hook with API integration
- `src/utils/` - Utility functions
  - `smellCategories.ts` - 36-label taxonomy mapping
  - `smellDetails.ts` - Comprehensive smell descriptions (400+ lines)
- `src/services/` - API client
  - `requirementAnalysisService.ts` - Backend integration
- `src/styles/` - CSS styling
  - `reqrev.css` - 17KB of professional styling

### 2. Backend API (`api/`)

**Purpose**: Provides secure, scalable requirement analysis services.

**Technology Stack**:

- FastAPI (Python web framework)
- Pydantic for data validation
- Uvicorn ASGI server

**Security Features**:

- CORS configured for browser extensions only
- No API keys exposed to client
- Environment-based configuration
- Input validation on all endpoints

**Structure**:

```
api/
├── main.py              # FastAPI application & CORS setup
├── config.py            # Environment configuration
├── routers/
│   └── requirements.py  # API endpoints
└── services/
    └── analyzer.py      # Business logic
```

**Key Endpoints**:

- `POST /api/v1/analyze_requirement` - Analyze a requirement for smells
- `GET /api/v1/models` - List available models
- `GET /health` - Health check

### 3. LLM Service Layer (`llm_service/`)

**Purpose**: Abstract LLM provider interactions and provide unified interface.

**Design Pattern**: Facade pattern with strategy selection

**Structure**:

```
llm_service/
├── iso29148_detector.py      # Facade - provider selection
├── huggingface_client.py     # HuggingFace implementation
├── openai_client.py          # OpenAI implementation
└── models/
    └── requirement_smell_result.py  # Data model
```

**Primary Provider**: **OpenAI**

- **Model**: GPT-4o-mini (default, configurable to fine-tuned models)
- **Taxonomy**: Comprehensive 30-smell detection across 5 categories (see [TAXONOMY.md](TAXONOMY.md))
- **Output**: Structured JSON with smell labels and explanations
- **Accuracy**: Enhanced prompts with conservative detection rules to minimize false positives
- **Cost**: ~$0.001-0.003 per requirement analyzed
- **Judge Model**: Optional OpenAI model for research evaluation (see [LLM_JUDGE.md](LLM_JUDGE.md))

**Detection Enhancements**:

- Conservative rule set to reduce false positives
- Context-aware analysis (e.g., simple "when...shall" conditionals are acceptable)
- Detailed prompt engineering with explicit examples
- Clear distinction between acceptable patterns and actual smells

## Data Flow

### Requirement Analysis Flow

**Complete UI-to-Backend Workflow**:

```
1. User creates/edits requirement in extension CRUD Panel
   └─> Requirement stored locally in Chrome storage
   └─> SmellCountBadge shows "Not analyzed" state

2. User clicks "Analyze" button in Requirements Table
   └─> useRequirements hook initiates analysis
   └─> Extension sends POST to /api/v1/analyze_requirement
       {
         "requirement_id": "REQ-123",
         "description": "The system shall maybe be encrypted..."
       }

3. API Backend receives request
   └─> Validates input (routers/requirements.py)
       └─> Calls analyzer service (services/analyzer.py)
           └─> Gets detector instance (llm_service/iso29148_detector.py)
               └─> Routes to OpenAI client (llm_service/openai_client.py)
                   └─> Sends prompt with 36 smell definitions
                   └─> OpenAI GPT-4o-mini analyzes with conservative rules

4. LLM performs detection
   └─> Analyzes against 36 smells across 5 categories
   └─> Returns structured JSON with detected smells
   └─> Example: ["conditional_or_non_assertive_requirement", "vague_pronoun_or_reference"]

5. API returns response to extension
   {
     "requirement_id": "REQ-123",
     "description": "The system shall maybe be encrypted...",
     "smells": ["conditional_or_non_assertive_requirement"],
     "explanation": "Uses weak modal 'maybe' which weakens obligation",
     "raw_model_output": {...}
   }

6. Extension displays results in UI
   └─> SmellCountBadge updates with color-coded count
       ├─> Green (0 smells)
       ├─> Yellow (1-2 smells)
       ├─> Orange (3-5 smells)
       └─> Red (6+ smells)
   └─> User can click badge to open SmellDetailsPanel
       └─> Shows comprehensive guidance for each detected smell
           ├─> Description and category
           ├─> Why it matters
           ├─> How to fix (bullet list)
           ├─> Before/after examples
           └─> Professional styling with color-coded headers

7. User can edit requirement based on guidance
   └─> Re-analyze to verify fixes
   └─> Iterative improvement workflow
```

**Key Improvements**:

- **Real-time UI feedback**: Instant badge updates after analysis
- **Comprehensive guidance**: 36 smells fully documented with fixes
- **Fallback handling**: Unknown smells display gracefully
- **State management**: React hooks prevent stale data issues

## Configuration

### Environment Variables

All configuration is done through environment variables (`.env` file):

**API Configuration**:

- `API_HOST` - Server host binding (default: "127.0.0.1")
- `API_PORT` - Server port (default: 8000)
- `CORS_ORIGINS` - Allowed origins for CORS (comma-separated)

**LLM Configuration**:

- `MODEL_PROVIDER` - LLM provider to use (default: "openai")
  - Primary: "openai" (recommended for production)
  - Legacy: "huggingface" (limited support)
- `OPENAI_API_KEY` - **Required** - Your OpenAI API key
- `OPENAI_MODEL` - Model to use (default: "gpt-4o-mini")
  - Supports custom fine-tuned models
- `HF_API_TOKEN` - HuggingFace API token (legacy, if using HuggingFace provider)

**Extension Configuration**:

- API endpoint: Hardcoded to `http://localhost:8000` in `extension/src/constants.ts`
- No environment variables needed for extension
- Change API URL in constants file if backend runs on different host/port

**Security Best Practices**:

- All API keys loaded from environment at runtime
- Never commit `.env` file to version control
- Use `.env.example` template for required variables

## Security Considerations

1. **No Client-Side Secrets**
   - Extension contains zero API keys
   - All LLM calls go through backend

2. **CORS Protection**
   - Only browser extension origins allowed
   - No credentials required

3. **Input Validation**
   - Pydantic models validate all inputs
   - SQL injection not applicable (no database yet)

4. **Rate Limiting**
   - Should be added in production
   - Consider per-user limits

## Deployment

### Local Development

1. **Extension**:

   ```bash
   cd extension/
   npm install
   npm run dev
   # Load unpacked extension in Chrome
   ```

2. **API**:

   ```bash
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your API keys
   python -m api.main
   ```

### Production Considerations

- **Extension**: Publish to Chrome Web Store
- **API**:
  - Deploy to cloud (AWS, GCP, Azure)
  - Use managed secrets (AWS Secrets Manager, etc.)
  - Add rate limiting
  - Enable HTTPS only
  - Monitor LLM costs

## Future Enhancements

### Completed Features ✅

1. **Comprehensive UI System** ✅
   - Color-coded smell count badges with 4-tier severity
   - Comprehensive smell details panel with slide-in animation
   - Complete documentation for all 36 smells (descriptions, fixes, examples)
   - Professional styling with category-specific color coding
   - Fallback handling for unmapped smells

2. **Enhanced Detection Accuracy** ✅
   - Conservative detection rules to minimize false positives
   - Detailed prompt engineering with explicit examples
   - Context-aware analysis (distinguishes acceptable patterns from smells)
   - 36-smell taxonomy across 5 categories based on ISO 29148

3. **Robust State Management** ✅
   - React hooks with proper state updater pattern
   - Chrome storage API integration
   - Prevention of stale closure bugs
   - Real-time UI updates after analysis

### Planned Enhancements

1. **Database Layer**
   - Store analysis history per project
   - Cache results to reduce API costs
   - User accounts for multi-user teams
   - Analytics dashboard for smell trends

2. **Additional LLM Providers**
   - Anthropic Claude integration
   - Local models (Ollama) for offline use
   - Azure OpenAI for enterprise customers
   - Google Gemini support

3. **Advanced Features**
   - Batch analysis for multiple requirements
   - Custom smell definitions and rules
   - Training feedback loop to improve detection
   - Export analysis reports (PDF, CSV)

4. **Extension Features**
   - Inline smell highlighting directly in GitHub textarea
   - Auto-fix suggestions with one-click apply
   - Requirements templates library
   - Browser-native notifications for analysis completion
   - Dark mode support

## Technology Choices

### Why FastAPI?

- Modern, async Python framework
- Automatic OpenAPI documentation
- Great performance
- Type safety with Pydantic

### Why Separate Backend?

- Security: Keep API keys server-side
- Scalability: Backend can scale independently
- Flexibility: Swap LLM providers without extension updates
- Cost Control: Monitor and limit LLM usage

### Why TypeScript?

- Type safety for browser extension
- Better IDE support
- Catches errors at compile time

## References

- [ISO/IEC 29148:2018 - Requirements Engineering](https://www.iso.org/standard/72089.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
