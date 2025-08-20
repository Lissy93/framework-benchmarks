<!-- start_header -->
<h1 align="center">💚 Weather Front - Vue 3</h1>

<p align="center">
  <img width="64" src="https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/main/assets/favicon.png" /><br>
  <i>A tiny weather app</i>
  <br>
  <b><a href="/">🚀 Demo</a> ● <a href="https://frontend-framework-benchmarks.as93.net">📊 Results</a></b>
  <br><br>
  <img src="https://img.shields.io/badge/Framework-Vue_3-4FC08D?logo=vuedotjs&logoColor=fff&labelColor=4FC08D" />
  <img src="https://img.shields.io/badge/License-MIT-AE56FF?logo=googledocs&logoColor=fff&labelColor=8A2BE2" />
  <img src="https://img.shields.io/badge/Author-Lissy93-EA4AAA?logo=githubsponsors&logoColor=fff&labelColor=E31591" />
</p>
<!-- end_header -->

<!-- start_about -->
Vue sits in the Goldilocks zone - not as minimal as Alpine, not as opinionated as Angular, just right for most projects. It feels like the framework that actually learned from React's mistakes while keeping the good parts. Single File Components are brilliant, the template syntax is intuitive, and reactivity just works without the mental gymnastics of `useEffect`.

For our weather app, Vue felt natural and productive. The `v-if`, `v-for`, and `v-model` directives handle conditional rendering, lists, and form inputs elegantly. No weird JSX quirks, no manual event handling - just HTML that does what you expect. The Composition API gives you React-style logic organization when you need it, but Options API is still there for simpler components.

The reactivity system using Proxies is genuinely impressive. Change a data property and everything dependent on it updates automatically. No `useState`, no memoization hell, no stale closures. Vue tracks dependencies behind the scenes and updates only what needs to change.

The Single File Component format is perfect - template, script, and styles all in one file with proper scoping. `<style scoped>` means your CSS only affects that component, no global pollution or CSS-in-JS complexity. It just works the way you'd expect.

Vue's ecosystem is mature without being overwhelming. I didn't need Vue Router or Pinia for this simple app, but they're there when you need them.

I chose Vue for [Dashy](https://github.com/Lissy93/dashy/), because it both has everything I needed, but also is incredbily easy, so contributors could add their own widgets and features, with out a steep learning curve.
<!-- end_about -->

<!-- start_status -->

## Status

| Task | Status |
|---|---|
| **Test** - Executes all e2e and unit tests | [![Test Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/test-vue.svg)](https://github.com/Lissy93/weather-front/actions/workflows/test.yml) |
| **Lint** - Verifies code style and quality | [![Lint Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/lint-vue.svg)](https://github.com/Lissy93/weather-front/actions/workflows/lint.yml) |
| **Build** - Builds and deploys the app | [![Build Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/build-vue.svg)](https://github.com/Lissy93/weather-front/actions/workflows/build.yml) |

<!-- end_status -->

<!-- start_usage -->

## Usage

First, follow the [repo setup instructions](https://github.com/Lissy93/weather-front?tab=readme-ov-file#usage). Then `cd apps/vue` and use the following commands:

```bash
npm run dev    # Start dev server (vite --port 3000)
npm test       # Run tests
npm run lint   # Run lint checks
npm build      # Build for production (vite build)
npm start      # Serve built prod app (from ./dist)
```

For troubleshooting, use `npm run verify` from the root of the project.

<!-- end_usage -->

## Vue Implementation

<!-- start_framework_specific -->
### Notable files
- `src/App.vue` - Main component using Vue's Composition API
- `src/services/weatherService.js` - API integration with Vue's reactive patterns  
- `src/components/` - Single File Components with scoped styles
- `src/utils/weatherUtils.js` - Utility functions for data processing
<!-- end_framework_specific -->


<!-- start_real_world_app -->

## Real-World App
Since the weather app is very simple, it may be helpful to see a more practical implementation of a Vue 3 app. So, checkout:

<a href="https://github.com/Lissy93/dashy"><img align="left" src="https://i.ibb.co/yhbt6CY/dashy.png" width="96"></a>

> **Dashy** - _Highly configurable self-hostable server dashboard_<br>
> 🐙 Get it on GitHub at [github.com/Lissy93/dashy](https://github.com/Lissy93/dashy)<br>
> 🌐 View the website at [dashy.to](https://dashy.to)

<br>
<!-- end_real_world_app -->

<!-- start_license -->

## License

Weather-Front is licensed under [MIT](https://github.com/Lissy93/weather-front/blob/main/LICENSE) © Alicia Sykes 2025.<br>
View [Attributions](https://github.com/Lissy93/weather-front?tab=readme-ov-file#attributions) for credits, thanks and contributors.

<!-- end_license -->
