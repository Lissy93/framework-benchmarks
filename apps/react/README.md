<!-- start_header -->
<h1 align="center">⚛️ Weather Front - React</h1>

<p align="center">
  <img width="64" src="https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/main/assets/favicon.png" /><br>
  <i>A tiny weather app</i>
  <br>
  <b><a href="/">🚀 Demo</a> ● <a href="https://frontend-framework-benchmarks.as93.net">📊 Results</a></b>
  <br><br>
  <a href="https://react.dev/" target="_blank"><img src="https://img.shields.io/badge/Framework-React-61DAFB?logo=react&logoColor=fff&labelColor=61DAFB" /></a>
  <a href="https://github.com/Lissy93/framework-benchmarks/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-AE56FF?logo=googledocs&logoColor=fff&labelColor=8A2BE2" /></a>
  <a href="https://github.com/lissy93"><img src="https://img.shields.io/badge/Author-Lissy93-EA4AAA?logo=githubsponsors&logoColor=fff&labelColor=E31591" /></a>
</p>
<!-- end_header -->

<!-- start_about -->

## About

<img align="right" src="/assets/screenshot.png" width="400">

This is a simple weather app, built in [React](https://react.dev/) (as well as also [10 other frontend frameworks](/)) in order to review, compare and benchmark frontend web frameworks.

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
| **Test** - Executes all e2e and unit tests | [![Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/test-react.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/test.yml) |
| **Lint** - Verifies code style and quality | [![Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/lint-react.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/lint.yml) |
| **Build** - Builds and deploys the app | [![Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/build-react.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/build.yml) |

<!-- end_status -->

<!-- start_usage -->

## Usage

First, follow the [repo setup instructions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#usage). Then `cd apps/react` and use the following commands:

```bash
npm run dev    # Start dev server (vite)
npm test       # Run tests
npm run lint   # Run lint checks
npm build      # Build for production (vite build)
npm start      # Serve built prod app (from ./dist)
```

For troubleshooting, use `npm run verify` from the root of the project.

<!-- end_usage -->

## React Implementation
<!-- start_framework_specific -->
- `src/App.jsx` - Main component with hooks-based state management
- `src/hooks/useWeatherData.js` - Custom hook for weather logic and API calls
- `src/components/ErrorBoundary.jsx` - Error boundary for crash protection
- `src/components/` - Modular functional components
<!-- end_framework_specific -->

## About React
<!-- start_framework_description -->
React is the most popular frontend library, created by Facebook in 2013. 
It popularised the component model and virtual DOM, changing frontend forever. 
Its ecosystem is massive, with libraries for everything. 
The downside is that it’s just a view layer, so you end up wiring lots of pieces together. 
Still, it runs huge apps like Facebook, Instagram and Netflix.

<!-- end_framework_description -->

## My Thoughts on React
<!-- start_my_thoughts -->
React is everywhere, powering millions of websites and used by every major tech company. It's been around for over 12 years, and both React and its tooling are incredibly mature. There's a reason it became the default choice for so many teams - the ecosystem is massive, jobs are plentiful, and you can build basically anything.

But it's not perfect. Our weather app showcases both React's strengths and frustrations. The component model is elegant, `useState` and `useEffect` work fine for simple state, and the custom `useWeatherData` hook abstracts the weather logic nicely. But you're constantly thinking about re-renders, dependency arrays, and manual memoization.

The virtual DOM adds overhead that other frameworks avoid entirely. Need to optimize performance? Time to sprinkle `React.memo`, `useCallback`, and `useMemo` everywhere. Coming from Svelte or Solid, all this manual work feels tedious. But the developer tooling is exceptional and the community support is unmatched.

The JSX syntax is familiar once you get used to the quirks - `className` instead of `class`, self-closing tags, and JavaScript expressions in curly braces. Controlled components with `value` and `onChange` work well for forms, though they're more verbose than Vue's `v-model`.

React really shines for complex applications where the ecosystem matters. We didn't need Redux, React Query, or code splitting for this simple weather app, but for something like [Web Check](https://github.com/lissy93/web-check), these tools become essential. The flexibility to choose your own architecture is both React's blessing and curse.
<!-- end_my_thoughts -->


<!-- start_real_world_app -->

## Real-World App
Since the weather app is very simple, it may be helpful to see a more practical implementation of a React app. So, checkout:

<a href="https://github.com/Lissy93/web-check"><img align="left" src="https://raw.githubusercontent.com/Lissy93/web-check/master/public/android-chrome-192x192.png" width="96"></a>

> **Web Check** - _All-in-one OSINT tool for analyzing any site_<br>
> 🐙 Get it on GitHub at [github.com/Lissy93/web-check](https://github.com/Lissy93/web-check)<br>
> 🌐 View the website at [web-check.xyz](https://web-check.xyz/)

<br>
<!-- end_real_world_app -->

<!-- start_license -->

## License

Weather-Front is licensed under [MIT](https://github.com/lissy93/framework-benchmarks/blob/main/LICENSE) © Alicia Sykes 2025.<br>
View [Attributions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#attributions) for credits, thanks and contributors.

<!-- end_license -->
