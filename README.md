# ReqRev - Requir### Backend API

- 🤖 **LLM-Powered Analysis**: Detect requirement smells using OpenAI models
- 🔒 **Secure**: No API keys in browser extension - all handled server-side
- 📊 **Comprehensive Taxonomy**: 36 smell labels across 5 categories (Morphological, Lexical, Analytical, Relational, Incompleteness)
- 🎯 **ISO 29148 Standards**: Based on international requirements engineering standards
- 🚀 **Fast & Async**: Built with FastAPI for high performance Analysis Platform

A complete requirements management and analysis platform consisting of:

1. **Browser Extension** - Adds a Requirements tab to GitHub repositories
2. **Backend API** - FastAPI service with LLM-powered requirement smell detection

![ReqRev Screenshot](https://img.shields.io/badge/Manifest-V3-blue) ![React](https://img.shields.io/badge/React-18.2-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6) ![Python](https://img.shields.io/badge/Python-3.11+-3776ab) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)

## ✨ Features

### Browser Extension

- 🔖 **GitHub Integration**: Seamlessly injects a "Requirements" tab into the GitHub navbar
- 📝 **CRUD Operations**: Create, read, update, and delete requirements
- 🔢 **Auto-incremented IDs**: Requirements automatically get unique IDs (REQ-1, REQ-2, etc.)
- 💾 **Local Storage**: All requirements persist per repository using Chrome's storage API
- 🎨 **GitHub Dark Mode**: Matches GitHub's dark theme with ReqRev's design language
- 🔍 **AI-Powered Analysis**: One-click smell detection with detailed explanations
- 🎯 **Visual Smell Badges**: Color-coded severity indicators (Green → Yellow → Orange → Red)
- 📋 **Comprehensive Details Panel**: Full descriptions, fix suggestions, and before/after examples for all 36 smells

### Backend API

- 🤖 **LLM-Powered Analysis**: Detect requirement smells using OpenAI GPT models
- 🔒 **Secure**: No API keys in browser extension - all handled server-side
- 📊 **Comprehensive Taxonomy**: 36 smell labels across 5 categories (Morphological, Lexical, Analytical, Relational, Incompleteness)
- 🎯 **ISO 29148 Standards**: Based on international requirements engineering standards
- 🚀 **Fast & Async**: Built with FastAPI for high performance
- ✅ **Enhanced Accuracy**: Conservative detection rules to minimize false positives

## 🏗️ Architecture

```
┌─────────────────┐
│   Browser       │
│   Extension     │  HTTPS
│  (TypeScript)   ├────────┐
└─────────────────┘        │
                           ▼
                    ┌─────────────┐
                    │   FastAPI   │
                    │   Backend   │
                    │  (Python)   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   OpenAI    │
                    │  Fine-tuned │
                    │    Model    │
                    └─────────────┘
                    
   36 Smell Labels Across 5 Categories:
   • Morphological (shape, readability)
   • Lexical (word choice, vague terms)
   • Analytical (grammar, structure)
   • Relational (dependencies, coupling)
   • Incompleteness (missing info, errors)
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## 📁 Project Structure

```
reqrev/
├── extension/              # Browser Extension
│   ├── manifest.json      # Chrome Extension Manifest V3
│   ├── package.json       # Node dependencies
│   ├── webpack.config.js  # Webpack bundler config
│   ├── tsconfig.json      # TypeScript configuration
│   ├── src/              # Extension source code
│   │   ├── contentScript.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── dist/             # Built extension (generated)
│
├── api/                   # FastAPI Backend
│   ├── main.py           # FastAPI app & CORS
│   ├── config.py         # Environment configuration
│   ├── routers/          # API endpoints
│   │   └── requirements.py
│   └── services/         # Business logic
│       └── analyzer.py
│
├── llm_service/          # LLM Integration Layer
│   ├── iso29148_detector.py    # Facade
│   ├── openai_client.py        # OpenAI client
│   ├── judge_client.py         # OpenRouter judge client
│   └── models/
│       └── requirement_smell_result.py
│
├── evaluation/           # Research & Evaluation Tools
│   ├── README.md        # Evaluation guide
│   ├── batch_evaluate.py # Batch evaluation script
│   ├── test_judge.py    # Simple judge test
│   ├── sample_data/     # Example datasets
│   │   ├── requirements_sample.csv
│   │   └── requirements_sample.json
│   └── results/         # Generated reports (gitignored)
│
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md   # System architecture
│   ├── API.md           # API documentation
│   ├── LLM_JUDGE.md     # LLM-as-Judge guide
│   └── JUDGE_IMPLEMENTATION.md
│
├── requirements.txt      # Python dependencies
├── .env.example         # Environment template
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

**For Browser Extension:**

- Node.js (v16 or higher)
- npm or yarn
- Google Chrome or Edge browser

**For Backend API:**

- Python 3.11+
- pip
- OpenAI API Key

## Extension Setup

### 1. Install Dependencies

```bash
cd extension/
npm install
```

### 2. Build the Extension

For development with watch mode:

```bash
npm run dev
```

For production build:

```bash
npm run build
```

This will create a `dist/` folder with the compiled extension.

### 3. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `extension/dist/` folder from your project directory
5. The ReqRev extension icon should appear in your extensions toolbar

### 4. Test on GitHub

1. Navigate to any GitHub repository (e.g., `https://github.com/facebook/react`)
2. Look for the new **Requirements** tab in the repository navbar
3. Click it to open the requirements panel
4. Start managing requirements! 🎉

## Backend API Setup

### 1. Install Python Dependencies

```bash
# From the project root
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use your favorite editor
```

**Required Configuration:**

```bash
# Required: OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Model to use (default: gpt-4o-mini)
# For fine-tuned model: ft:gpt-4o-mini:your-org:model-id:suffix
OPENAI_MODEL=gpt-4o-mini

# Model parameters
OPENAI_MAX_TOKENS=1500
OPENAI_TEMPERATURE=0.1
```

Get your OpenAI API key at: <https://platform.openai.com/api-keys>

> 💡 **Tip:** For production use, train a fine-tuned model on the comprehensive smell taxonomy and set `OPENAI_MODEL` to your fine-tuned model ID.

### 3. Run the API Server

```bash
python -m api.main
```

The API will start at `http://localhost:8000`

You can test it:

```bash
curl http://localhost:8000/health
```

### 4. View API Documentation

Open your browser to:

- Interactive API docs: <http://localhost:8000/docs>
- Alternative docs: <http://localhost:8000/redoc>

See [docs/API.md](docs/API.md) for detailed API documentation.

## 🎮 Usage

### Adding a Requirement

1. Click the **"+ New Requirement"** button
2. The form opens with auto-generated ID (e.g., REQ-4)
3. Edit the title and description
4. Click **Save**

### Editing a Requirement

1. Click the edit icon (pencil) on any requirement card
2. Modify the title and/or description
3. Click **Save** to persist changes

### Analyzing Requirements

1. Click the **"Analyze"** button on any requirement row
2. The system sends the requirement to the backend API for smell detection
3. Results appear in the **"Smells Detected"** column with a color-coded badge:
   - 🟢 **Green (0)**: Perfect - no smells detected
   - 🟡 **Yellow (1-2)**: Minor issues
   - 🟠 **Orange (3-5)**: Moderate issues
   - 🔴 **Red (6+)**: Serious issues
4. Click the **"Details"** button to open a comprehensive side panel showing:
   - All detected smells with their categories
   - What each smell means and why it matters
   - Step-by-step fix suggestions
   - Before/after examples

### Deleting a Requirement

1. Click the delete icon (trash) on any requirement card
2. Confirm the deletion in the dialog
3. The requirement is permanently removed

### Storage

- Each repository's requirements are stored separately
- Storage key format: `requirements:<org>/<repo>`
- Data persists across browser sessions
- All data is stored locally in Chrome (not synced)

## 🔧 Development

### Extension Development

**Scripts:**

```bash
cd extension/

# Install dependencies
npm install

# Development mode with watch
npm run dev

# Production build
npm run build

# Clean dist folder
npm run clean
```

**File Watching:**

When running `npm run dev`, Webpack watches for file changes and automatically rebuilds. After changes:

1. Go to `chrome://extensions/`
2. Click the refresh icon on the ReqRev extension
3. Reload the GitHub page to see updates

**Debugging:**

Open Chrome DevTools on any GitHub repo page:

- Console logs are prefixed with `[ReqRev]`
- Check Application → Storage → Local Storage → chrome-extension://...
- Inspect the injected elements using the Elements panel

### API Development

**Running the API:**

```bash
# Run with auto-reload for development
API_RELOAD=true python -m api.main

# Or use uvicorn directly
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

**Testing the API:**

```bash
# Health check
curl http://localhost:8000/health

# List models
curl http://localhost:8000/api/v1/models

# Analyze a requirement
curl -X POST http://localhost:8000/api/v1/analyze_requirement \
  -H "Content-Type: application/json" \
  -d '{"requirement_id":"REQ-1","description":"The system shall authenticate users."}'
```

**Viewing Logs:**

All logs include timestamps and log levels. Set `LOG_LEVEL=DEBUG` in `.env` for detailed logging.

## 🤖 Using the API for Requirement Analysis

Once the API is running, you can analyze requirements for quality issues:

### Example: Analyze a Requirement

```bash
curl -X POST http://localhost:8000/api/v1/analyze_requirement \
  -H "Content-Type: application/json" \
  -d '{
    "requirement_id": "REQ-1",
    "description": "The system should maybe provide some user-friendly features.",
    "activity_points": 45
  }'
```

**Response:**

```json
{
  "requirement_id": "REQ-1",
  "description": "The system should maybe provide some user-friendly features.",
  "smells": ["weak_verb", "subjective", "vagueness"],
  "explanation": "The requirement uses weak modal verbs ('should', 'maybe'), contains subjective language ('user-friendly'), and is vague.",
  "raw_model_output": {...}
}
```

### Requirement Smells Detected (36 Labels Across 5 Categories)

**🟣 Morphological (5 smells)**: Shape and readability issues

- `too_long_sentence` - Spans >30-40 tokens with multiple "and/or" chains
- `too_short_sentence` - Very short fragment missing context
- `unreadable_structure` - Complex syntax, heavy nesting
- `punctuation_issue` - Excessive or missing punctuation
- `acronym_overuse_or_abbrev` - Heavy acronyms without introduction

**🟠 Lexical (11 smells)**: Word choice and vague terms

- `non_atomic_requirement` - Multiple actions combined, should be split
- `negative_formulation` - Uses "shall not" where positive is clearer
- `vague_pronoun_or_reference` - Uses "it"/"this" without clear referent
- `subjective_language` - "user-friendly", "fast" without criteria
- `vague_or_implicit_terms` - "normally", "usually", "etc."
- `non_verifiable_qualifier` - "as soon as possible" without metrics
- `loophole_or_open_ended` - "at least" with no bounds
- `superlative_or_comparative_without_reference` - "faster" with no baseline
- `quantifier_without_unit_or_range` - "many", numbers without units
- `design_or_implementation_detail` - Describes HOW instead of WHAT
- `implicit_requirement` - Behavior only implied, not explicit

**🔵 Analytical (5 smells)**: Grammar and structure

- `overuse_imperative_form` - Long list of commands without conditions
- `missing_imperative_verb` - No clear action verb
- `conditional_or_non_assertive_requirement` - Weak modals ("may", "maybe") or excessive "if...then"
- `passive_voice` - Unclear who performs action
- `domain_term_imbalance` - Too much jargon or missing domain terms

**🟢 Relational (3 smells)**: Dependencies and coupling

- `too_many_dependencies_or_versions` - References many requirements
- `excessive_or_insufficient_coupling` - Overly entangled or floating
- `deep_nesting_or_structure_issue` - Deeply nested hierarchy

**🔴 Incompleteness (12 smells)**: Missing information and errors

- `incomplete_requirement` - Missing trigger, actor, response
- `incomplete_reference_or_condition` - References undefined things
- `missing_system_response` - States condition but not action
- `incorrect_or_confusing_order` - Steps in confusing order
- `missing_unit_of_measurement` - Numeric values without units
- `partial_content_or_incomplete_enumeration` - Uses "etc."
- `embedded_rationale_or_justification` - Mixes "why" into "what"
- `undefined_term` - Specialized terms not defined
- `language_error_or_grammar_issue` - Grammar/spelling errors
- `ambiguous_plurality` - Unclear if applies to all or some

**Detection Accuracy**: Enhanced prompts with conservative rules minimize false positives. Simple conditional requirements with clear "shall" statements (e.g., "When X, the system shall Y") won't be flagged.

## � Research & Evaluation Tools

ReqRev includes a comprehensive evaluation framework for assessing model quality using **LLM-as-Judge** methodology:

### Quick Start

```bash
# 1. Start the API
python start_api.py

# 2. Run batch evaluation
cd evaluation
python batch_evaluate.py

# 3. Review results
ls results/
```

### What's Included

- **📊 Batch Evaluation**: Process multiple requirements with statistical analysis
- **🧪 Test Scripts**: Simple test cases for quick validation
- **📁 Sample Data**: 10 example requirements (poor → excellent quality)
- **📈 Multiple Output Formats**: JSON, CSV, and Markdown reports
- **🎯 Quality Metrics**: Verdict distribution, average scores, smell patterns

### Output Examples

Results include:
- ✅ **Accept** (score ≥ 0.8): Primary model is accurate
- ⚠️ **Review** (score 0.5-0.79): Minor issues detected
- ❌ **Reject** (score < 0.5): Significant errors or omissions

**See `evaluation/README.md` for complete guide.**

## �🔮 Roadmap

### Completed ✅

- ✅ Browser extension with requirements management (CRUD operations)
- ✅ FastAPI backend with CORS security
- ✅ OpenAI integration with comprehensive smell taxonomy (36 labels)
- ✅ 5-category smell detection (Morphological, Lexical, Analytical, Relational, Incompleteness)
- ✅ Extension-to-API integration for smell analysis
- ✅ Color-coded smell count badges (Green/Yellow/Orange/Red severity levels)
- ✅ Comprehensive smell details panel with descriptions, fix suggestions, and examples
- ✅ Enhanced detection accuracy with conservative prompts to minimize false positives
- ✅ Complete documentation with architecture guides and API references
- ✅ LLM-as-Judge evaluation framework with OpenRouter integration
- ✅ Batch evaluation tools for research and model assessment
- ✅ Comprehensive evaluation documentation and sample datasets

### In Progress 🚧

- 🔄 Result caching for performance optimization

### Planned 📋

- Database layer for analysis history
- User authentication and accounts
- Requirements traceability matrix
- Link requirements to GitHub issues
- Export to PDF/Markdown
- Custom smell definitions
- Self-refinement workflow using judge feedback

## 🛠️ Technical Stack

### Browser Extension

- **React 18.2**: UI component framework
- **TypeScript 5.3**: Type-safe JavaScript
- **Webpack 5**: Module bundler
- **Chrome Extension Manifest V3**: Latest extension standard
- **Chrome Storage API**: Local data persistence

### Backend API

- **FastAPI 0.115**: Modern Python web framework
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server
- **httpx**: Async HTTP client

### LLM Integration

- **OpenAI API**: GPT models (base or fine-tuned)
- **Comprehensive Taxonomy**: 36 smell labels across 5 categories
- **Structured Output**: JSON format with smells and explanations
- **Async/Await**: Non-blocking LLM calls

## 📝 Notes

### GitHub Navigation

- The extension handles GitHub's client-side routing (pushState)
- Tab injection retries if the page isn't fully loaded
- Automatically re-initializes when navigating between repos

### Permissions

- `storage`: Required for chrome.storage.local
- `activeTab`: Required for content script injection
- `https://github.com/*/*`: Only active on GitHub repo pages

### Browser Support

- Currently supports Google Chrome only
- Manifest V3 compatible (future-proof)
- May work on other Chromium-based browsers (Edge, Brave, etc.)

## 🐛 Troubleshooting

**Tab not appearing?**

- Ensure you're on a repository page (not issues, settings, etc.)
- Check the browser console for `[ReqRev]` logs
- Try refreshing the page
- Reload the extension in `chrome://extensions/`

**Requirements not saving?**

- Check Chrome's storage quota hasn't been exceeded
- Verify extension permissions in `chrome://extensions/`
- Look for error messages in the console

**Build errors?**

- Delete `node_modules/` and run `npm install` again
- Clear the `dist/` folder with `npm run clean`
- Ensure Node.js version is 16+

## 📄 License

MIT License - feel free to use this project however you'd like!

## 👥 Contributing

This is an MVP built for the ReqRev project. Contributions, issues, and feature requests are welcome!

## 📧 Contact

For questions or feedback about ReqRev, please open an issue in this repository.

---

**Built with ❤️ for better requirements management on GitHub**
