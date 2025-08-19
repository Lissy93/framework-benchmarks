<!-- start_header -->
<h1 align="center">🔥 Weather Front - Svelte</h1>

<p align="center">
  <img width="64" src="https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/main/assets/favicon.png" /><br>
  <i>A tiny weather app</i>
  <br>
  <b><a href="/">🚀 Demo</a> ● <a href="https://frontend-framework-benchmarks.as93.net">📊 Results</a></b>
  <br><br>
  <img src="https://img.shields.io/badge/Framework-Svelte-ff3e00?logo=svelte&logoColor=fff&labelColor=ff3e00" />
  <img src="https://img.shields.io/badge/License-MIT-AE56FF?logo=googledocs&logoColor=fff&labelColor=8A2BE2" />
  <img src="https://img.shields.io/badge/Author-Lissy93-EA4AAA?logo=githubsponsors&logoColor=fff&labelColor=E31591" />
</p>
<!-- end_header -->

<!-- start_about -->

## About

<img align="right" src="/assets/screenshot.png" width="400">

This is a simple weather app, built in [Svelte](https://svelte.dev/) (as well as also [10 other frontend frameworks](/)) in order to review, compare and benchmark frontend web frameworks.

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
| **Test** - Executes all e2e and unit tests | [![Test Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/test-svelte.svg)](https://github.com/Lissy93/weather-front/actions/workflows/test.yml) |
| **Lint** - Verifies code style and quality | [![Lint Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/lint-svelte.svg)](https://github.com/Lissy93/weather-front/actions/workflows/lint.yml) |
| **Build** - Builds and deploys the app | [![Build Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/build-svelte.svg)](https://github.com/Lissy93/weather-front/actions/workflows/build.yml) |

<!-- end_status -->

<!-- start_usage -->

## Usage

First, follow the [repo setup instructions](https://github.com/Lissy93/weather-front?tab=readme-ov-file#usage). Then `cd apps/svelte` and use the following commands:

```bash
npm run dev    # Start dev server (vite dev --port 3000)
npm test       # Run tests
npm run lint   # Run lint checks
npm build      # Build for production (vite build)
npm start      # Serve built prod app (from ./dist)
```

For troubleshooting, use `npm run verify` from the root of the project.

<!-- end_usage -->

<!-- start_framework_specific -->
## Svelte Implementation

Svelte is just *fun*. There's something magical about writing `count += 1` and having the UI automatically update. No `useState`, no `useEffect`, no `ref()` - just assign to a variable and it reacts. This is how UI frameworks should work.

Unlike React or Vue, Svelte doesn't ship a runtime. Your components get compiled into highly optimized vanilla JavaScript at build time. The result? Tiny bundles, blazing fast performance, and surprisingly readable compiled output. Our weather app compiles down to around 15KB, which is frankly ridiculous for a full-featured application.

The `$:` reactive statements are brilliant for computed values - `$: tempDisplay = `${temp}°C`` just works and updates whenever `temp` changes. Svelte stores handle global state beautifully, and the automatic subscription cleanup means you never have to worry about memory leaks.

### Notable files
- `src/routes/+page.svelte` - Main page using SvelteKit's file-based routing
- `src/lib/stores/weather-store.js` - Global state with Svelte writable stores
- `src/lib/services/weather-service.js` - API calls integrated with stores
- `src/lib/components/` - Single-file components with scoped styles

The template syntax feels natural - `{#if}`, `{#each}`, and `{#await}` blocks handle conditional rendering and async data elegantly. Two-way binding with `bind:value` eliminates the usual form boilerplate you'd write in React.

For our simple weather app, we didn't need Svelte's built-in animations or transitions. But Svelte is my go to choice for nearly all my personal projects, as these features become incredibly powerful. The `transition:` and `animate:` directives can make your UI feel incredibly polished with minimal code.
<!-- end_framework_specific -->

<!-- start_real_world_app -->

## Real-World App
Since the weather app is very simple, it may be helpful to see a more practical implementation of a Svelte app. So, checkout:

<a href="https://github.com/Lissy93/portainer-templates"><img align="left" src="https://storage.googleapis.com/as93-screenshots/project-logos/portainer-templates.png" width="96"></a>

> **Portainer Templates** - _Automated Docker deployment specs_<br>
> 🐙 Get it on GitHub at [github.com/Lissy93/portainer-templates](https://github.com/Lissy93/portainer-templates)<br>
> 🌐 View the website at [portainer-templates.as93.net](https://portainer-templates.as93.net/)

<br>
<!-- end_real_world_app -->

<!-- start_license -->

## License

Weather-Front is licensed under [MIT](https://github.com/Lissy93/weather-front/blob/main/LICENSE) © Alicia Sykes 2025.<br>
View [Attributions](https://github.com/Lissy93/weather-front?tab=readme-ov-file#attributions) for credits, thanks and contributors.

<!-- end_license -->
