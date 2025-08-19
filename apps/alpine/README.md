<!-- start_header -->
<h1 align="center">🏔️ Weather Front - Alpine.js</h1>

<p align="center">
  <img width="64" src="https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/main/assets/favicon.png" /><br>
  <i>A tiny weather app</i>
  <br>
  <b><a href="/">🚀 Demo</a> ● <a href="https://frontend-framework-benchmarks.as93.net">📊 Results</a></b>
  <br><br>
  <img src="https://img.shields.io/badge/Framework-Alpine.js-8BC0D0?logo=alpinedotjs&logoColor=fff&labelColor=8BC0D0" />
  <img src="https://img.shields.io/badge/License-MIT-AE56FF?logo=googledocs&logoColor=fff&labelColor=8A2BE2" />
  <img src="https://img.shields.io/badge/Author-Lissy93-EA4AAA?logo=githubsponsors&logoColor=fff&labelColor=E31591" />
</p>
<!-- end_header -->

<!-- start_about -->

## About

<img align="right" src="/assets/screenshot.png" width="400">

This is a simple weather app, built in [Alpine.js](https://alpinejs.dev/) (as well as also [10 other frontend frameworks](/)) in order to review, compare and benchmark frontend web frameworks.

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
| **Test** - Executes all e2e and unit tests | [![Test Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/test-alpine.svg)](https://github.com/Lissy93/weather-front/actions/workflows/test.yml) |
| **Lint** - Verifies code style and quality | [![Lint Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/lint-alpine.svg)](https://github.com/Lissy93/weather-front/actions/workflows/lint.yml) |
| **Build** - Builds and deploys the app | [![Build Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/build-alpine.svg)](https://github.com/Lissy93/weather-front/actions/workflows/build.yml) |

<!-- end_status -->

<!-- start_usage -->

## Usage

First, follow the [repo setup instructions](https://github.com/Lissy93/weather-front?tab=readme-ov-file#usage). Then `cd apps/alpine` and use the following commands:

```bash
npm run dev    # Start dev server (python3 -m http.server 3000 || python -m http.server 3000)
npm test       # Run tests
npm run lint   # Run lint checks
npm build      # Build for production (echo 'No build step required')
npm start      # Serve built prod app (from ./dist)
```

For troubleshooting, use `npm run verify` from the root of the project.

<!-- end_usage -->

## Alpine Implementation

<!-- start_framework_specific -->
Alpine.js is like jQuery had a baby with Vue and decided to live directly in your HTML. It's refreshingly simple - you sprinkle a few `x-` attributes into your markup and suddenly you have reactive behavior. No build tools, no bundlers, no complexity. Just add a script tag and start building.

The approach feels intuitive once you get it. `x-data` sets up your reactive state, `x-show` handles conditional rendering, and `x-for` loops through arrays. Our weather app's forecast list is just `<div x-for="day in forecast">` - no components, no imports, no ceremony.

What's clever is how Alpine stays out of your way. The HTML is still readable, the JavaScript is minimal, and everything degrades gracefully if Alpine doesn't load. It's progressive enhancement done right - the page works without JavaScript, but becomes interactive when it loads.

### Notable files
- `index.html` - Main HTML with Alpine directives sprinkled in
- `js/weather-app.js` - Alpine data and methods for weather logic
- `js/weather-service.js` - API calls integrated with Alpine reactivity
- `js/weather-utils.js` - Utility functions for data formatting

The syntax reads naturally: `x-on:click="searchWeather()"`, `x-text="temperature"`, `x-bind:class="{'active': isExpanded}"`. It's declarative like Vue templates but lives right in the HTML. The reactive updates happen automatically when you modify the data.

For simple interactive websites, Alpine hits the sweet spot. You get modern reactivity without the complexity of a full framework. But for anything complex, you'll miss proper component organization and tooling. Alpine works great for [my whois lookup API](https://github.com/Lissy93/who-dat), because I just needed sprinkles of interactivity to update results, not a full SPA experience.

<!-- end_framework_specific -->

<!-- start_real_world_app -->

## Real-World App
Since the weather app is very simple, it may be helpful to see a more practical implementation of a Alpine.js app. So, checkout:

<a href="https://github.com/Lissy93/who-dat"><img align="left" src="https://storage.googleapis.com/as93-screenshots/project-logos/who-dat.png" width="96"></a>

> **Who Dat** - _WHOIS lookup for domain registration info_<br>
> 🐙 Get it on GitHub at [github.com/Lissy93/who-dat](https://github.com/Lissy93/who-dat)<br>
> 🌐 View the website at [who-dat.as93.net](https://who-dat.as93.net)

<br>
<!-- end_real_world_app -->

<!-- start_license -->

## License

Weather-Front is licensed under [MIT](https://github.com/Lissy93/weather-front/blob/main/LICENSE) © Alicia Sykes 2025.<br>
View [Attributions](https://github.com/Lissy93/weather-front?tab=readme-ov-file#attributions) for credits, thanks and contributors.

<!-- end_license -->
