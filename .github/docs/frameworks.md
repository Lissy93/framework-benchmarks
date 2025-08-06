# 🏗️ Framework Management

This project uses a centralized configuration system to manage all framework definitions, eliminating hardcoded framework lists throughout the codebase.

## 📋 Central Configuration

All framework definitions are stored in [`frameworks.json`](./frameworks.json):

```json
{
  "frameworks": [
    {
      "id": "vanilla",
      "name": "Vanilla JS",
      "displayName": "Vanilla JavaScript", 
      "icon": "🧪",
      "dir": "vanilla",
      "hasNodeModules": false,
      "buildCommand": "echo 'No build step required'",
      "devCommand": "python3 -m http.server 3000 || python -m http.server 3000",
      "testCommand": "playwright test --config=tests/config/playwright-vanilla.config.js"
    }
    // ... more frameworks
  ]
}
```

## 🔧 Framework Properties

- **`id`**: Unique identifier used in scripts and file names
- **`name`**: Display name for logs and UI
- **`displayName`**: Full formal name
- **`icon`**: Emoji for visual identification
- **`dir`**: Directory name in `apps/`
- **`hasNodeModules`**: Whether the framework needs `npm install`
- **`buildCommand`**: Production build command
- **`devCommand`**: Development server command  
- **`testCommand`**: Test command with config path

## 🚀 Usage

### Generate Scripts
After modifying `frameworks.json`, regenerate all dependent files:

```bash
# Update package.json scripts
npm run generate-scripts

# Or run directly
node scripts/generate-scripts.js
```

### Available Commands

```bash
# List all frameworks with details
node scripts/generate-scripts.js list

# Get framework IDs only (comma-separated)
node scripts/generate-scripts.js ids

# Get framework list for GitHub Actions
node scripts/generate-scripts.js github
```

### Adding a New Framework

1. **Add to `frameworks.json`**:
   ```json
   {
     "id": "vue",
     "name": "Vue.js",
     "displayName": "Vue.js",
     "icon": "💚",
     "dir": "vue",
     "hasNodeModules": true,
     "buildCommand": "vite build",
     "devCommand": "vite dev --port 3000",
     "testCommand": "playwright test --config=tests/config/playwright-vue.config.js"
   }
   ```

2. **Regenerate scripts**:
   ```bash
   npm run generate-scripts
   ```

3. **Create required files**:
   - `apps/vue/` - Framework app directory
   - `tests/config/playwright-vue.config.js` - Test configuration

4. **That's it!** All scripts, GitHub Actions, and tooling will automatically include the new framework.

## 📁 What Gets Generated

The centralized config automatically updates:

### `package.json`
- `test:frameworkId` scripts
- `dev:frameworkId` scripts  
- Main `test` script that runs all frameworks

### GitHub Actions (`.github/workflows/test.yml`)
- Framework list detection
- Dynamic workflow inputs

### Scripts
- `scripts/run-all-tests.js` - Test runner
- `scripts/sync-assets.js` - Asset synchronization (already dynamic)

## 🎯 Benefits

✅ **Single source of truth** - One place to manage all frameworks  
✅ **No more hardcoded lists** - Automatic synchronization  
✅ **Easy to add frameworks** - Just update config + regenerate  
✅ **Consistent naming** - All scripts follow same patterns  
✅ **Less maintenance** - No manual updates in multiple files  
✅ **Self-documenting** - Config includes all metadata  

## ⚡ Quick Commands

```bash
# See all frameworks
npm run generate-scripts -- list

# Add new framework and regenerate everything
# 1. Edit frameworks.json
# 2. Run:
npm run generate-scripts

# Run tests for all frameworks  
npm test

# Run specific framework tests
npm run test:vue    # (after adding vue)
```

## 🔍 File Locations

- **Config**: `frameworks.json`
- **Generator**: `scripts/generate-scripts.js` 
- **Package scripts**: Auto-generated in `package.json`
- **GitHub workflow**: `.github/workflows/test.yml`
- **Test runner**: `scripts/run-all-tests.js`