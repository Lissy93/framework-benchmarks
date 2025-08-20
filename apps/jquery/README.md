<!-- start_header -->
<h1 align="center">💙 Weather Front - jQuery</h1>

<p align="center">
  <img width="64" src="https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/main/assets/favicon.png" /><br>
  <i>A tiny weather app</i>
  <br>
  <b><a href="/">🚀 Demo</a> ● <a href="https://frontend-framework-benchmarks.as93.net">📊 Results</a></b>
  <br><br>
  <img src="https://img.shields.io/badge/Framework-jQuery-0769AD?logo=jquery&logoColor=fff&labelColor=0769AD" />
  <img src="https://img.shields.io/badge/License-MIT-AE56FF?logo=googledocs&logoColor=fff&labelColor=8A2BE2" />
  <img src="https://img.shields.io/badge/Author-Lissy93-EA4AAA?logo=githubsponsors&logoColor=fff&labelColor=E31591" />
</p>
<!-- end_header -->

<!-- start_about -->
Let's be honest - building a modern app with jQuery in 2024 feels like showing up to a Formula 1 race with a vintage car. It'll get you there, but everyone will wonder what the f*ck you are on. Still, jQuery powered the web for over a decade, and is still actually very widley used (thanks WordPress), so it's worth understanding what made it so dominant. Nowadays pertty much everything jQuery could do, is implemented into ES6+ natively, so there's little point in jQuery (unless u r supporting IE11).

The TL;DR of jQuery's magic was always in the simplicity. `$('#weather-display').html(weatherHtml)` just *works*. No virtual DOM, no component lifecycle, no build process - just select elements and manipulate them. The method chaining is genuinely elegant: `$('.forecast-item').addClass('active').fadeIn(300)` reads like English.

For our weather app, jQuery actually handles the basic functionality fine. Event delegation with `$(document).on('click', '.forecast-toggle', handler)` works perfectly, and `$.ajax()` fetches weather data without fuss. But you quickly realize you're manually managing everything React or Vue handles automatically - state updates, DOM synchronization, component organization.

The imperative style becomes tedious fast. Want to update the temperature display? Manually find the element and change its text. Need to show/hide loading states? Manually toggle CSS classes. It works, but you'll write 3x more code than you would in Svelte.

jQuery still has its place for simple enhancements to static sites, but for anything interactive, modern frameworks or even vanilla JS, are just better. The ecosystem and community have largely moved on, and you'll spend more time fighting against jQuery's limitations than building features.
<!-- end_about -->

<!-- start_status -->

## Status

| Task | Status |
|---|---|
| **Test** - Executes all e2e and unit tests | [![Test Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/test-jquery.svg)](https://github.com/Lissy93/weather-front/actions/workflows/test.yml) |
| **Lint** - Verifies code style and quality | [![Lint Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/lint-jquery.svg)](https://github.com/Lissy93/weather-front/actions/workflows/lint.yml) |
| **Build** - Builds and deploys the app | [![Build Status](https://raw.githubusercontent.com/Lissy93/weather-front/refs/heads/badges/build-jquery.svg)](https://github.com/Lissy93/weather-front/actions/workflows/build.yml) |

<!-- end_status -->

<!-- start_usage -->

## Usage

First, follow the [repo setup instructions](https://github.com/Lissy93/weather-front?tab=readme-ov-file#usage). Then `cd apps/jquery` and use the following commands:

```bash
npm run dev    # Start dev server (vite --port 3000)
npm test       # Run tests
npm run lint   # Run lint checks
npm build      # Build for production (vite build)
npm start      # Serve built prod app (from ./dist)
```

For troubleshooting, use `npm run verify` from the root of the project.

<!-- end_usage -->

## jQuery Implementation

<!-- start_framework_specific -->
### Notable files
- `src/main.js` - Application initialization and jQuery setup
- `src/components/weather-ui.js` - Manual DOM management and event handling
- `src/services/weather-service.js` - API calls with `$.ajax()`
- `index.html` - Plain HTML structure with jQuery CDN
<!-- end_framework_specific -->


<!-- start_real_world_app -->
<!-- end_real_world_app -->

<!-- start_license -->

## License

Weather-Front is licensed under [MIT](https://github.com/Lissy93/weather-front/blob/main/LICENSE) © Alicia Sykes 2025.<br>
View [Attributions](https://github.com/Lissy93/weather-front?tab=readme-ov-file#attributions) for credits, thanks and contributors.

<!-- end_license -->
