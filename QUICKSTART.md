# 🚀 Quick Start Guide - ReqRev Chrome Extension

## You're Ready to Go! ✅

Your extension has been built successfully. The `dist/` folder contains everything you need.

## Next Steps (3 minutes)

### 1. Load the Extension in Chrome

1. Open Chrome browser
2. Navigate to: `chrome://extensions/`
3. Toggle **"Developer mode"** ON (top-right corner)
4. Click **"Load unpacked"**
5. Select the `dist/` folder from this project
6. ✅ Extension loaded!

### 2. Test It Out

1. Go to any GitHub repository, for example:
   - https://github.com/facebook/react
   - https://github.com/microsoft/vscode
   - Or any of your own repos!

2. Look for the new **"Requirements"** tab in the navbar (next to Code, Issues, etc.)

3. Click the Requirements tab

4. 🎉 You should see the panel with 3 sample requirements!

### 3. Try These Actions

- **Add**: Click "+ New Requirement" to create REQ-4
- **Edit**: Click the pencil icon ✏️ to modify a requirement
- **Delete**: Click the trash icon 🗑️ to remove one

All changes persist automatically in Chrome's local storage!

## 🐛 Troubleshooting

**Don't see the Requirements tab?**
- Make sure you're on a repository page (not github.com homepage)
- Try refreshing the page
- Check the console (F12) for `[ReqRev]` logs

**Build errors?**
```bash
npm run clean
npm install
npm run build
```

## 📝 Development Mode

To work on the extension with auto-rebuild:

```bash
npm run dev
```

Then after each change:
1. Go to `chrome://extensions/`
2. Click the refresh icon 🔄 on ReqRev
3. Reload your GitHub page

## 🎨 Customization

All files are ready to modify:
- **Colors**: Edit `src/styles/reqrev.css`
- **UI Logic**: Edit `src/components/RequirementsPanel.tsx`
- **Tab Injection**: Edit `src/contentScript.tsx`
- **Data Model**: Edit `src/types.ts`

## 📚 Full Documentation

See `README.md` for complete details on:
- Architecture
- Storage format
- Future AI features
- Contributing guidelines

---

**Enjoy managing requirements in GitHub!** 🎯
