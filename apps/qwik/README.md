<!-- start_header -->
<h1 align="center">⚡ Weather Front - Qwik</h1>

<p align="center">
  <img width="64" src="https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/main/assets/favicon.png" /><br>
  <i>A tiny weather app</i>
  <br>
  <b><a href="/">🚀 Demo</a> ● <a href="https://frontend-framework-benchmarks.as93.net">📊 Results</a></b>
  <br><br>
  <img src="https://img.shields.io/badge/Framework-Qwik-ac7ef4?logo=qwik&logoColor=fff&labelColor=ac7ef4" />
  <img src="https://img.shields.io/badge/License-MIT-AE56FF?logo=googledocs&logoColor=fff&labelColor=8A2BE2" />
  <img src="https://img.shields.io/badge/Author-Lissy93-EA4AAA?logo=githubsponsors&logoColor=fff&labelColor=E31591" />
</p>
<!-- end_header -->

<!-- start_about -->

## About

<img align="right" src="/assets/screenshot.png" width="400">

This is a simple weather app, built in [Qwik](https://qwik.builder.io/) (as well as also [10 other frontend frameworks](/)) in order to review, compare and benchmark frontend web frameworks.

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
| **Test** - Executes all e2e and unit tests | [![Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/test-qwik.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/test.yml) |
| **Lint** - Verifies code style and quality | [![Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/lint-qwik.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/lint.yml) |
| **Build** - Builds and deploys the app | [![Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/build-qwik.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/build.yml) |

<!-- end_status -->

<!-- start_usage -->

## Usage

First, follow the [repo setup instructions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#usage). Then `cd apps/qwik` and use the following commands:

```bash
npm run dev    # Start dev server (vite --port 3000)
npm test       # Run tests
npm run lint   # Run lint checks
npm build      # Build for production (vite build)
npm start      # Serve built prod app (from ./dist)
```

For troubleshooting, use `npm run verify` from the root of the project.

<!-- end_usage -->

## Qwik Implementation
<!-- start_framework_specific -->
- `src/App.tsx` - Main component with resumable state
- `src/stores/weatherStore.ts` - Qwik stores that serialize automatically  
- `src/services/WeatherService.ts` - API calls with progressive loading
- `src/components/` - Components that wake up on demand
<!-- end_framework_specific -->

## About Qwik
<!-- start_framework_description -->
<!-- end_framework_description -->

## My Thoughts on Qwik
<!-- start_my_thoughts -->
Qwik is kinda wild. It completely rethinks how web apps work by doing something called "resumability" - your page loads instantly with zero JavaScript, then individual components wake up only when you interact with them. It's like having a webpage that's asleep until you poke it.

The secret is those `$` symbols everywhere. `component$()`, `useTask$()`, `onClick$()` - these aren't just weird syntax, they're lazy loading boundaries. Each `$` tells Qwik "this code can be loaded later when needed." So clicking a button doesn't load the entire app, it just loads that specific button's handler.

For our weather app, this means the initial page render is lightning fast - just HTML and CSS. Search for a city, and only *then* does the search logic get loaded. Click to expand a forecast day, and only the expansion code gets fetched. It's incremental interactivity taken to its logical extreme.

The state management feels familiar but with superpowers. Qwik stores automatically serialize to HTML, so when components resume, they pick up exactly where they left off. No hydration mismatch, no loading spinners, just seamless continuation. For that reason, I used Qwik to build the interactive stuff on my [Digital Defense](https://digital-defense.io/) website.

The trade-off is developer complexity - all those `$` symbols take getting used to, and debugging can be tricky when code loads on-demand. But for performance-critical apps, especially content-heavy sites, Qwik's approach is genuinely revolutionary. Your Core Web Vitals scores will thank you.
<!-- end_my_thoughts -->


<!-- start_real_world_app -->

## Real-World App
Since the weather app is very simple, it may be helpful to see a more practical implementation of a Qwik app. So, checkout:

<a href="https://github.com/Lissy93/personal-security-checklist"><img align="left" src="https://storage.googleapis.com/as93-screenshots/project-logos/digital-defense.png" width="96"></a>

> **Digital Defense** - _Interactive personal security checklist_<br>
> 🐙 Get it on GitHub at [github.com/Lissy93/personal-security-checklist](https://github.com/Lissy93/personal-security-checklist)<br>
> 🌐 View the website at [digital-defense.io](https://digital-defense.io)

<br>
<!-- end_real_world_app -->

<!-- start_license -->

## License

Weather-Front is licensed under [MIT](https://github.com/lissy93/framework-benchmarks/blob/main/LICENSE) © Alicia Sykes 2025.<br>
View [Attributions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#attributions) for credits, thanks and contributors.

<!-- end_license -->
