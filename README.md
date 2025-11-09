# ReqRev - GitHub Requirements Tab Chrome Extension

A Chrome extension that adds a **Requirements** tab to GitHub repository pages, allowing teams to manage project requirements directly within GitHub.

![ReqRev Screenshot](https://img.shields.io/badge/Manifest-V3-blue) ![React](https://img.shields.io/badge/React-18.2-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6)

## ✨ Features

- 🔖 **GitHub Integration**: Seamlessly injects a "Requirements" tab into the GitHub navbar
- 📝 **CRUD Operations**: Create, read, update, and delete requirements
- 🔢 **Auto-incremented IDs**: Requirements automatically get unique IDs (REQ-1, REQ-2, etc.)
- 💾 **Local Storage**: All requirements persist per repository using Chrome's storage API
- 🎨 **GitHub Dark Mode**: Matches GitHub's dark theme with ReqRev's design language
- 🚀 **Sample Data**: Preloaded with 3 sample requirements on first install
- 🔮 **Future-Ready**: Placeholder functions for AI-powered requirement analysis

## 🎯 Design Philosophy

ReqRev follows GitHub's dark mode aesthetic with custom accent colors:

- **Background**: `#0d1117`
- **Text**: `#f2f5ff`
- **Accent Blue**: `#7aa2ff`
- **Accent Green**: `#64e1ab`

## 📁 Project Structure

```
reqrev/
├── manifest.json              # Chrome Extension Manifest V3
├── package.json              # Node dependencies
├── webpack.config.js         # Webpack bundler config
├── tsconfig.json            # TypeScript configuration
├── src/
│   ├── contentScript.tsx    # Main injection script
│   ├── types.ts            # TypeScript type definitions
│   ├── components/
│   │   └── RequirementsPanel.tsx  # Main React component
│   └── styles/
│       └── reqrev.css       # Custom styles
└── dist/                    # Built extension (generated)
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Chrome browser

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Build the Extension

For development with watch mode:

```bash
npm run dev
```

For production build:

```bash
npm run build
```

This will create a `dist/` folder with the compiled extension.

### Step 3: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `dist/` folder from your project directory
5. The ReqRev extension icon should appear in your extensions toolbar

### Step 4: Test on GitHub

1. Navigate to any GitHub repository (e.g., `https://github.com/facebook/react`)
2. Look for the new **Requirements** tab in the repository navbar
3. Click it to open the requirements panel
4. Start managing requirements! 🎉

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

### Scripts

```bash
# Install dependencies
npm install

# Development mode with watch
npm run dev

# Production build
npm run build

# Clean dist folder
npm run clean
```

### File Watching

When running `npm run dev`, Webpack watches for file changes and automatically rebuilds. After changes, you'll need to:

1. Go to `chrome://extensions/`
2. Click the refresh icon on the ReqRev extension
3. Reload the GitHub page to see updates

### Debugging

Open Chrome DevTools on any GitHub repo page:

- Console logs are prefixed with `[ReqRev]`
- Check Application → Storage → Local Storage → chrome-extension://...
- Inspect the injected elements using the Elements panel

## 🔮 Future Enhancements (Placeholders)

The extension includes placeholder functions for AI-powered features:

```typescript
// Flag potentially ambiguous requirements
flagRequirement(text: string)

// Evaluate requirement clarity score
evaluateClarity(text: string)
```

These currently log to console but are ready for backend integration.

### Planned Features

- 🤖 AI-powered requirement analysis
- 🔗 Link requirements to GitHub issues
- 📊 Requirement traceability matrix
- 👥 Multi-user collaboration
- 📈 Requirement metrics dashboard
- 🔍 Advanced search and filtering
- 📤 Export to PDF/Markdown
- 🔔 Change notifications

## 🛠️ Technical Stack

- **React 18.2**: UI component framework
- **TypeScript 5.3**: Type-safe JavaScript
- **Webpack 5**: Module bundler
- **Chrome Extension Manifest V3**: Latest extension standard
- **Chrome Storage API**: Local data persistence

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
