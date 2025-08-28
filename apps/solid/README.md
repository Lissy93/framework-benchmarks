<!-- start_header -->
<h1 align="center">🚀 Weather Front - Solid.js</h1>

<p align="center">
  <img width="64" src="https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/main/assets/favicon.png" /><br>
  <i>A tiny weather app</i>
  <br>
  <b><a href="/">🚀 Demo</a> ● <a href="https://frontend-framework-benchmarks.as93.net">📊 Results</a></b>
  <br><br>
  <img src="https://img.shields.io/badge/Framework-Solid.js-2C4F7C?logo=solid&logoColor=fff&labelColor=2C4F7C" />
  <img src="https://img.shields.io/badge/License-MIT-AE56FF?logo=googledocs&logoColor=fff&labelColor=8A2BE2" />
  <img src="https://img.shields.io/badge/Author-Lissy93-EA4AAA?logo=githubsponsors&logoColor=fff&labelColor=E31591" />
</p>
<!-- end_header -->

<!-- start_about -->

## About

<img align="right" src="/assets/screenshot.png" width="400">

This is a simple weather app, built in [Solid.js](https://www.solidjs.com/) (as well as also [10 other frontend frameworks](/)) in order to review, compare and benchmark frontend web frameworks.

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
| **Test** - Executes all e2e and unit tests | [![Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/test-solid.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/test.yml) |
| **Lint** - Verifies code style and quality | [![Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/lint-solid.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/lint.yml) |
| **Build** - Builds and deploys the app | [![Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/build-solid.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/build.yml) |

<!-- end_status -->

<!-- start_usage -->

## Usage

First, follow the [repo setup instructions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#usage). Then `cd apps/solid` and use the following commands:

```bash
npm run dev    # Start dev server (vite)
npm test       # Run tests
npm run lint   # Run lint checks
npm build      # Build for production (vite build)
npm start      # Serve built prod app (from ./dist)
```

For troubleshooting, use `npm run verify` from the root of the project.

<!-- end_usage -->

## Solid Implementation

<!-- start_framework_specific -->
- `src/App.jsx` - Main component using Solid's reactive primitives
- `src/stores/weatherStore.js` - Global state with `createStore`
- `src/services/WeatherService.js` - API integration with `createResource`
- `src/components/` - Reactive components that update precisely
<!-- end_framework_specific -->

## About Solid
<!-- start_framework_description -->
<!-- end_framework_description -->

## My Thoughts on Solid
<!-- start_my_thoughts -->
Solid feels like React, but *actually* reactive. It looks like JSX, but underneath it's magic. While React re-renders entire component trees, Solid surgically updates only the exact DOM nodes that need to change. The result is performance that makes other frameworks look sluggish.

The mental shift from React is subtle but profound. Instead of thinking about re-renders and memoization, you think about signals and reactivity. `createSignal` returns a getter and setter - call `temperature()` to read, `setTemperature(25)` to update, and everything that depends on it automatically updates.

Our weather app showcases this, as the temperature display, the weather icon, the styling - they all react independently when the weather data changes. No `useEffect`, no dependency arrays, no `useMemo` - just pure reactive programming that actually works.

The JSX looks familiar, but `<Show>` and `<For>` components replace your typical `{condition && <div>}` patterns. These aren't just syntactic sugar - they're compiled into efficient conditional rendering that only updates when necessary.

`createResource` handles async data elegantly, giving you loading states, error handling, and refetching without the usual ceremony. For our simple weather app, we didn't need Solid's more advanced features like stores or effects, but for something complex, the fine-grained reactivity becomes essential.
<!-- end_my_thoughts -->

<!-- start_real_world_app -->

## Real-World App
Since the weather app is very simple, it may be helpful to see a more practical implementation of a Solid.js app. So, checkout:

<a href="https://github.com/Lissy93/cso"><img align="left" src="https://storage.googleapis.com/as93-screenshots/project-logos/cso.png" width="96"></a>

> **Chief Snack Officer** - _Office snack management app_<br>
> 🐙 Get it on GitHub at [github.com/Lissy93/cso](https://github.com/Lissy93/cso)<br>
> 🌐 View the website at [lissy93.github.io/cso](https://lissy93.github.io/cso)

<br>
<!-- end_real_world_app -->

<!-- start_license -->

## License

Weather-Front is licensed under [MIT](https://github.com/lissy93/framework-benchmarks/blob/main/LICENSE) © Alicia Sykes 2025.<br>
View [Attributions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#attributions) for credits, thanks and contributors.

<!-- end_license -->
