# 🏗️ Framework Management

Every framework is defined once, in `frameworks.json`. The scripts, GitHub Actions workflows, website and READMEs all read from it, so there are no framework lists to keep in sync by hand.

## 📋 Configuration

```json
{
  "frameworks": [
    {
      "id": "vue",
      "name": "Vue",
      "displayName": "Vue 3",
      "dir": "vue",
      "assetsDir": "public",
      "build": {
        "buildCommand": "vite build",
        "hasNodeModules": true,
        "devCommand": "vite --port 3000",
        "lintFiles": ["js", "vue"]
      },
      "meta": {
        "emoji": "💚",
        "iconName": "vuedotjs",
        "website": "https://vuejs.org/",
        "docs": "https://vuejs.org/guide/",
        "github": "https://github.com/vuejs/core",
        "npmPackage": "vue",
        "color": "#4FC08D",
        "accentColor": "#4FC08D",
        "logo": "https://.../vue.png",
        "description": "One-line summary shown in lists",
        "longDescription": "Longer summary shown on the framework page",
        "video": "YouTube video ID"
      },
      "exampleRealApp": {
        "title": "Dashy",
        "description": "Highly configurable self-hostable server dashboard",
        "repo": "https://github.com/Lissy93/dashy",
        "website": "https://dashy.to",
        "logo": "https://.../dashy.png"
      }
    }
  ]
}
```

## 🔧 Properties

- **`id`**: Unique identifier, used in script names, file names and URLs
- **`name`**: Display name (**`displayName`** optionally overrides it in the READMEs)
- **`dir`**: Directory under `apps/`
- **`assetsDir`**: Directory inside the app that shared assets are synced to (usually `public`)
- **`buildDir`**: Build output directory, if it isn't `dist` (`.` for apps with no build step)
- **`build.buildCommand`** / **`build.devCommand`**: Run from the app directory. `npx` is added automatically for the tools listed under `buildTools.requiresNpx` in `config.json`
- **`build.hasNodeModules`**: Whether the app needs `npm install`
- **`build.lintFiles`**: File extensions ESLint should check
- **`meta`**: Links, branding and descriptions used by the website and READMEs
- **`exampleRealApp`**: Optional real-world app built with the framework, shown on its website page

The full schema is `scripts/verify/frameworks-schema.json`. `npm run verify` validates `frameworks.json` against it.

## ➕ Adding a Framework

1. Build the app in `apps/<id>/`
2. Add its entry to `frameworks.json`
3. Run `npm run generate-scripts`, which regenerates the `package.json` scripts and creates `tests/config/playwright-<id>.config.js`
4. Run `npm run setup` to install its dependencies and sync the shared assets

The GitHub Actions matrices, website and READMEs pick the new framework up automatically.

## ⚡ Useful Commands

```bash
npm run generate-scripts           # Regenerate package.json scripts and test configs
python scripts/get_frameworks.py   # Comma-separated framework IDs (used by the CI matrices)
npm run verify                     # Validate frameworks.json and config.json, then check, test and lint
npm run test:vue                   # Run the tests against one framework
```
