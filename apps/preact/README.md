<!-- start_header -->
<h1 align="center">💜 Weather Front - Preact</h1>

<p align="center">
  <img width="64" src="https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/main/assets/favicon.png" /><br>
  <i>A tiny weather app</i>
  <br>
  <b><a href="/">🚀 Demo</a> ● <a href="https://frontend-framework-benchmarks.as93.net">📊 Results</a></b>
  <br><br>
  <img src="https://img.shields.io/badge/Framework-Preact-673AB8?logo=preact&logoColor=fff&labelColor=673AB8" />
  <img src="https://img.shields.io/badge/License-MIT-AE56FF?logo=googledocs&logoColor=fff&labelColor=8A2BE2" />
  <img src="https://img.shields.io/badge/Author-Lissy93-EA4AAA?logo=githubsponsors&logoColor=fff&labelColor=E31591" />
</p>
<!-- end_header -->

<!-- start_about -->

## About

<img align="right" src="/assets/screenshot.png" width="400">

This is a simple weather app, built in [Preact](https://preactjs.com/) (as well as also [10 other frontend frameworks](/)) in order to review, compare and benchmark frontend web frameworks.

- 🌦️ Live weather conditions
- 📅 7-day weather forecast
- 🔍 City search functionality
- 📍 Geolocation support
- 💾 Persistent location storage
- 📱 Responsive design
- ♿ Accessible interface
- 🎨 Multi-theme support
- 🧪 Fully unit tested
- 🌐 Internationalized

<!-- end_about -->

<!-- start_status -->

## Status

| Task | Status |
|---|---|
| **Test** - Executes all e2e and unit tests | [![Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/test-preact.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/test.yml) |
| **Lint** - Verifies code style and quality | [![Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/lint-preact.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/lint.yml) |
| **Build** - Builds and deploys the app | [![Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/build-preact.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/build.yml) |

<!-- end_status -->

<!-- start_usage -->

## Usage

First, follow the [repo setup instructions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#usage). Then `cd apps/preact` and use the following commands:

```bash
npm run dev    # Start dev server (vite)
npm test       # Run tests
npm run lint   # Run lint checks
npm build      # Build for production (vite build)
npm start      # Serve built prod app (from ./dist)
```

For troubleshooting, use `npm run verify` from the root of the project.

<!-- end_usage -->

## Preact Implementation
<!-- start_framework_specific -->
- `src/App.jsx` - Main component with familiar React-style hooks
- `src/hooks/useWeatherData.js` - Custom hook for weather state and API calls
- `src/components/` - Standard functional components with hooks
- `src/services/WeatherService.js` - API service using native fetch
<!-- end_framework_specific -->


## About Preact
<!-- start_framework_description -->
<!-- end_framework_description -->

## My Thoughts on Preact
<!-- start_my_thoughts -->
If you love React but hate the bundle size, Preact is your best friend. It's essentially React, but 3KB instead of 40KB. Same hooks, same JSX, same mental model - just way more efficient. You can literally take a React component, change the import from `react` to `preact`, and it'll work.

For our weather app, switching from React to Preact required basically zero changes. The `useWeatherData` custom hook works identically, functional components behave the same, and `useState` does exactly what you'd expect. But the compiled bundle is drastically smaller and noticeably faster.

Preact's secret sauce is smart optimizations under the hood. It skips unnecessary work that React's virtual DOM usually does, and includes automatic component memoization that you'd have to add manually in React with `memo()`. The reconciliation algorithm is also more direct, making updates snappier.

The developer experience is identical to React. Hot refresh works perfectly, the dev tools are solid, and you can use most React libraries via `preact/compat`. Really, the only difference is your bundle analyzer will make you smile.

I didn't need Preact's router or state management libraries for this simple app, but they follow the same lightweight philosophy. For anything bigger, you'd probably reach for the React ecosystem anyway via the compat layer.
<!-- end_my_thoughts -->


<!-- start_real_world_app -->

## Real-World App
Since the weather app is very simple, it may be helpful to see a more practical implementation of a Preact app. So, checkout:

<a href=""><img align="left" src="" width="96"></a>

> **** - __<br>
> 🐙 Get it on GitHub at []()<br>
> 🌐 View the website at []()

<br>
<!-- end_real_world_app -->

<!-- start_license -->

## License

Weather-Front is licensed under [MIT](https://github.com/lissy93/framework-benchmarks/blob/main/LICENSE) © Alicia Sykes 2025.<br>
View [Attributions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#attributions) for credits, thanks and contributors.

<!-- end_license -->
