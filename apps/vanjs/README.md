<!-- start_header -->
<h1 align="center">🚐 Weather Front - VanJS</h1>

<p align="center">
  <img width="64" src="https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/main/assets/favicon.png" /><br>
  <i>A tiny weather app</i>
  <br>
  <b><a href="/">🚀 Demo</a> ● <a href="https://frontend-framework-benchmarks.as93.net">📊 Results</a></b>
  <br><br>
  <a href="https://vanjs.org/" target="_blank"><img src="https://img.shields.io/badge/Framework-VanJS-F44336?logo=vitess&logoColor=fff&labelColor=F44336" /></a>
  <a href="https://github.com/Lissy93/framework-benchmarks/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-AE56FF?logo=googledocs&logoColor=fff&labelColor=8A2BE2" /></a>
  <a href="https://github.com/lissy93"><img src="https://img.shields.io/badge/Author-Lissy93-EA4AAA?logo=githubsponsors&logoColor=fff&labelColor=E31591" /></a>
</p>
<!-- end_header -->

<!-- start_about -->

## About

<img align="right" src="/assets/screenshot.png" width="400">

This is a simple weather app, built in [VanJS](https://vanjs.org/) (as well as also [10 other frontend frameworks](/)) in order to review, compare and benchmark frontend web frameworks.

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
| **Test** - Executes all e2e and unit tests | [![Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/test-vanjs.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/test.yml) |
| **Lint** - Verifies code style and quality | [![Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/lint-vanjs.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/lint.yml) |
| **Build** - Builds and deploys the app | [![Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/build-vanjs.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/build.yml) |

<!-- end_status -->

<!-- start_usage -->

## Usage

First, follow the [repo setup instructions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#usage). Then `cd apps/vanjs` and use the following commands:

```bash
npm run dev    # Start dev server (vite --port 3000)
npm test       # Run tests
npm run lint   # Run lint checks
npm build      # Build for production (vite build)
npm start      # Serve built prod app (from ./dist)
```

For troubleshooting, use `npm run verify` from the root of the project.

<!-- end_usage -->

## VanJS Implementation
<!-- start_framework_specific -->
- `src/main.js` - Application logic with VanJS state and DOM creation
- `src/weather-service.js` - API calls that update VanJS reactive state
- `src/weather-utils.js` - Utility functions for data processing
- `index.html` - Minimal HTML with VanJS script tag
<!-- end_framework_specific -->

## About Van
<!-- start_framework_description -->
VanJS is an ultra-tiny library for writing reactive UIs with plain functions. 
No build step, no virtual DOM, just direct DOM manipulation with reactivity built in. 
It’s surprisingly powerful for its size and is good for small apps or embedded widgets. 
Think of it as a modern alternative to jQuery that actually plays nice with modern JS.

<!-- end_framework_description -->

## My Thoughts on Van
<!-- start_my_thoughts -->
VanJS is impressively tiny - just 1KB of runtime with zero dependencies. It's basically "what if we took the reactive parts of modern frameworks and stripped away everything else?" The result is surprisingly elegant for simple applications, but you'll quickly bump into its limitations.

The functional approach is refreshing after dealing with classes and complex component lifecycles. `van.state(initialValue)` creates reactive state, `van.tags.div()` creates DOM elements, and everything just works. Our weather app's temperature display is literally `van.tags.span(temperature)` - when `temperature` changes, the DOM updates automatically.

But the simplicity comes with trade-offs. There's no component abstraction beyond functions, no templating system, no event system. You're essentially building a reactive version of vanilla DOM manipulation. It works for basic interactivity but gets unwieldy fast.

The DOM creation syntax is functional but verbose: `van.tags.div({class: "weather-card"}, van.tags.h2("Weather"))`. Coming from JSX or template languages, it feels like writing assembly code. You'll miss the declarative nature of modern frameworks.

VanJS works well for simple enhancements where you need just a touch of reactivity without the framework overhead. I've used it for mini apps, like [raid-calculator](https://github.com/lissy93/raid-calculator). But for anything substantial, you'll spend more time fighting the limitations than building features. It's an interesting experiment in minimalism, but modern frameworks exist for good reasons.
<!-- end_my_thoughts -->


<!-- start_real_world_app -->

## Real-World App
Since the weather app is very simple, it may be helpful to see a more practical implementation of a VanJS app. So, checkout:

<a href="https://github.com/Lissy93/raid-calculator"><img align="left" src="https://storage.googleapis.com/as93-screenshots/project-screenshots/raid-caclularor.png" width="96"></a>

> **RAID Calculator** - _RAID array capacity and fault tolerance_<br>
> 🐙 Get it on GitHub at [github.com/Lissy93/raid-calculator](https://github.com/Lissy93/raid-calculator)<br>
> 🌐 View the website at [raid-calculator.as93.net](https://raid-calculator.as93.net/)

<br>
<!-- end_real_world_app -->

<!-- start_license -->

## License

Weather-Front is licensed under [MIT](https://github.com/lissy93/framework-benchmarks/blob/main/LICENSE) © Alicia Sykes 2025.<br>
View [Attributions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#attributions) for credits, thanks and contributors.

<!-- end_license -->
