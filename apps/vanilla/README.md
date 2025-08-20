<!-- start_header -->
<h1 align="center">🧪 Weather Front - Vanilla JavaScript</h1>

<p align="center">
  <img width="64" src="https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/main/assets/favicon.png" /><br>
  <i>A tiny weather app</i>
  <br>
  <b><a href="/">🚀 Demo</a> ● <a href="https://frontend-framework-benchmarks.as93.net">📊 Results</a></b>
  <br><br>
  <img src="https://img.shields.io/badge/Framework-Vanilla_JavaScript-F7DF1E?logo=javascript&logoColor=fff&labelColor=F7DF1E" />
  <img src="https://img.shields.io/badge/License-MIT-AE56FF?logo=googledocs&logoColor=fff&labelColor=8A2BE2" />
  <img src="https://img.shields.io/badge/Author-Lissy93-EA4AAA?logo=githubsponsors&logoColor=fff&labelColor=E31591" />
</p>
<!-- end_header -->

<!-- start_about -->
Sometimes the best framework is no framework. Vanilla JavaScript forces you to understand what's actually happening under the hood of all those fancy abstractions. No magic, no build steps, no dependency hell - just the web platform as intended.

For our weather app, vanilla JS is surprisingly capable. `fetch()` handles API calls, `document.querySelector()` finds elements, and `addEventListener()` manages interactions. Modern browser APIs like `localStorage`, `geolocation`, and CSS custom properties give you most of what you need without any external dependencies.

The challenge is organization and state management. Without a framework's structure, you're responsible for everything - keeping the DOM in sync with data, organizing code sensibly, and avoiding spaghetti. Our weather app uses a simple pub/sub pattern and functional organization, but it requires discipline.

The performance is excellent since there's no framework overhead, and the bundle size is minimal. Everything loads fast, and you're not shipping someone else's code to your users. For simple applications or when performance is critical, vanilla JS can be the right choice.

But you'll miss the conveniences of modern frameworks - automatic updates, component organization, and developer experience. What takes one line in React might take ten in vanilla JS. It's a trade-off between control and convenience.
<!-- end_about -->

<!-- start_status -->

## Status

| Task | Status |
|---|---|
| **Test** - Executes all e2e and unit tests | [![Test Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/test-vanilla.svg)](https://github.com/Lissy93/weather-front/actions/workflows/test.yml) |
| **Lint** - Verifies code style and quality | [![Lint Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/lint-vanilla.svg)](https://github.com/Lissy93/weather-front/actions/workflows/lint.yml) |
| **Build** - Builds and deploys the app | [![Build Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/build-vanilla.svg)](https://github.com/Lissy93/weather-front/actions/workflows/build.yml) |

<!-- end_status -->

<!-- start_usage -->

## Usage

First, follow the [repo setup instructions](https://github.com/Lissy93/weather-front?tab=readme-ov-file#usage). Then `cd apps/vanilla` and use the following commands:

```bash
npm run dev    # Start dev server (python3 -m http.server 3000 || python -m http.server 3000)
npm test       # Run tests
npm run lint   # Run lint checks
npm build      # Build for production (echo 'No build step required')
npm start      # Serve built prod app (from ./dist)
```

For troubleshooting, use `npm run verify` from the root of the project.

<!-- end_usage -->

## Vanilla JavaScript Implementation

<!-- start_framework_specific -->
### Notable files
- `src/main.js` - Application initialization and DOM manipulation
- `src/weather-service.js` - API calls using native fetch
- `src/weather-utils.js` - Utility functions for data processing
- `index.html` - Pure HTML structure without framework dependencies
<!-- end_framework_specific -->


<!-- start_real_world_app -->

## Real-World App
Since the weather app is very simple, it may be helpful to see a more practical implementation of a Vanilla JavaScript app. So, checkout:

<a href=""><img align="left" src="" width="96"></a>

> **** - __<br>
> 🐙 Get it on GitHub at []()<br>
> 🌐 View the website at []()

<br>
<!-- end_real_world_app -->

<!-- start_license -->

## License

Weather-Front is licensed under [MIT](https://github.com/Lissy93/weather-front/blob/main/LICENSE) © Alicia Sykes 2025.<br>
View [Attributions](https://github.com/Lissy93/weather-front?tab=readme-ov-file#attributions) for credits, thanks and contributors.

<!-- end_license -->
