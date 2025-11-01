<h1 align="center">🌈 Framework Benchmarks</h1>
<p align="center">
	<i>The same weather app built in 10 different frontend frameworks</i><br>
    For automated cross-framework web performance benchmarking
  <br>
	<a href="https://framework-benchmarks.as93.net"><img width="96" src="https://storage.googleapis.com/as93-screenshots/project-logos/framework-benchmarks.png" /></a><br>
	<b>📊 <a href="https://framework-benchmarks.as93.net">View Results</a> </b>  •
 	<b> 🎯 <a href="https://stack-match.as93.net/">Choose a Framework</a></b>
</p>

### Intro
I've built the same weather app in 10 different frontend web frameworks.
Along with automated scripts to benchmark each of their performance, quality and capabilities.
To finally answer the age-old question: "Which is the _best_* frontend framework?"<br>
So, without further ado, let's see how every framework weathers the storm! ⛈️

#### Why?
1. To objectively compare frontend frameworks in an automated way
2. Because I have no life, and like building the same thing 10 times

#### What does _best_ mean?
- Smallest bundle size and best compression
- Fastest load time _(FCP, LCP, TTI, TTFB, etc)_
- Lowest resource consumption _(CPU & memory usage, etc)_
- Most maintainable _(least verbose, complex and repetitive code)_
- Quickest build time _(prod compile, dev server HMR latency, etc)_

#### Contents
- [Frameworks Covered](#frameworks-covered)
- [Usage Guide](#usage)
- [Project Outline](#project-outline)
- [Requirement Spec](#requirement-spec)
- [Benchmarking](#benchmarking)
- [Results](#results)
- [Real-world Applications](#side-note)
- [Status](#status)
- [Attributions and License](#attributions)

---

## Frameworks Covered

<!-- start_framework_list -->
<p align="center">
        <a href="https://framework-benchmarks.as93.net/react/"><img width="48" src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/react.png" /></a>
    <a href="https://framework-benchmarks.as93.net/angular/"><img width="48" src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/angular.png" /></a>
    <a href="https://framework-benchmarks.as93.net/svelte/"><img width="48" src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/svelte.png" /></a>
    <a href="https://framework-benchmarks.as93.net/preact/"><img width="48" src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/preact.png" /></a>
    <a href="https://framework-benchmarks.as93.net/solid/"><img width="48" src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/solid.png" /></a>
    <a href="https://framework-benchmarks.as93.net/qwik/"><img width="48" src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/qwik.png" /></a>
    <a href="https://framework-benchmarks.as93.net/vue/"><img width="48" src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/vue.png" /></a>
    <a href="https://framework-benchmarks.as93.net/jquery/"><img width="48" src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/jquery.png" /></a>
    <a href="https://framework-benchmarks.as93.net/alpine/"><img width="48" src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/alpine.png" /></a>
    <a href="https://framework-benchmarks.as93.net/lit/"><img width="48" src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/lit.png" /></a>
    <a href="https://framework-benchmarks.as93.net/vanjs/"><img width="48" src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/vanjs.png" /></a>
    <a href="https://framework-benchmarks.as93.net/vanilla/"><img width="48" src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/javascript.png" /></a>
<br><sub>Click a framework to view info, test/lint/build/etc statuses, and to preview the demo app</sub></p>
<!-- end_framework_list -->

---

## Usage

### Prerequisites

You'll need to ensure you've got
Git, Node (LTS or v22+), Python (3.10) and uv installed

### Setup

```bash
git clone git@github.com:lissy93/framework-benchmarks.git
cd framework-benchmarks
npm install
pip install -r scripts/requirements.txt
npm run setup
```

### Developing
Run `npm run dev:[app-name]`<br>
Or, you can: `cd ./apps/[app-name]` then `npm i` and `npm run dev`

### Testing
All apps are tested with the same shared test suite, to ensure they all conform to the same requirements, and are fully functional.
Tests are dome with [Playwright](https://playwright.dev/docs/intro) and can be found in the [`tests/`](https://github.com/lissy93/framework-benchmarks/tree/main/tests) directory.

Either execute tests for all implementations with `npm test`, or just for a specific app with `npm run test:[app]` (e.g. `npm run test:react`).<br>
You should also verify the lint checks pass, with `npm run lint` or `npm run lint:[app]`.

### Deploying
Build the app for production, with `npm run build:[app-name]`<br>
Then upload `./apps/[app-name]/dist/` to any web server, CDN or static hosting provider

### Adding a Framework
1. Create app directory: `apps/your-framework/` with `package.json`, `vite.config.js`, and a `src/` dir
2. Build your app (ensuring it meets the [requirements spec](#requirement-spec) above)
3. Update [`frameworks.json`](https://github.com/lissy93/framework-benchmarks/blob/main/frameworks.json)
4. Add a test config file in `tests/config/`
6. Them run `node scripts/setup/generate-scripts.js` and `node scripts/setup/sync-assets.js`


---

## Project Outline

### Directory Structure

```
framework-benchmarks
├── scripts					# Scripts for managing the app (syncing assets, generating mocks, etc)
├── assets					# These are shared across all apps for consistency
│   ├── icons				# SVG icons, used by all apps
│   ├── styles			# CSS classes and variables, used by all apps
│   └── mocks				# Mocked data, used by apps when running benchmarks
├── tests						# Test suit
└── apps						# Directory for each app as a standalone project
    ├── react/
    ├── svelte/
    ├── angular/
    └── ...
```

### Scripts
The **[`scripts/`](https://github.com/lissy93/framework-benchmarks/tree/main/scripts)** directory contains
everything for managing the project (setup, testing, benchmarking, reporting, etc).
You can view a list of scripts by running `npm run help`.


### Shared Assets
To keep things uniform, all apps will share certain assets

- **[`tests/`](https://github.com/lissy93/framework-benchmarks/tree/main/tests)** - Same test suit used for all apps. To ensure each app conforms to the spec and is fully functional
- **[`assets/`](https://github.com/lissy93/framework-benchmarks/tree/main/assets)** - Same static assets (icons, fonts, styles, meta, etc)
- **[`assets/styles/`](https://github.com/lissy93/framework-benchmarks/tree/main/assets/styles)** - Same styles for all apps, and theming is done with CSS variables

### Third Parties
- **Dependencies**: Beyond their framework code, none of the apps use any additional dependencies, libraries or third-party "stuff"
- **Data**: Apps support using real weather data, from [open-meteo api](https://open-meteo.com). However, to keep tests fair, we use mocked data when running benchmarks.


### Commands

- `npm run setup` - Creates mock data, syncs assets, updates scripts and installs dependencies
- `npm run test` - Runs the test suite for all apps, or a specific app
- `npm run lint` - Runs the linter for all apps, or a specific app
- `npm run check` - Verifies the project is correctly setup and ready to go
- `npm run build` - Builds all apps, or a specific app for production
- `npm run start` - Starts the demo server, which serves up all built apps
- `npm run help` - Displays a list of all available commands

See the [`package.json`](https://github.com/lissy93/framework-benchmarks/blob/main/package.json) for all commands

Note that the project commands get generated automatically by the [`generate_scripts.py`](https://github.com/lissy93/framework-benchmarks/blob/main/scripts/setup/generate_scripts.py) script, based on the contents of [`frameworks.json`](https://github.com/lissy93/framework-benchmarks/blob/main/frameworks.json) and [`config.json`](https://github.com/lissy93/framework-benchmarks/blob/main/config.json).

---

## Requirement Spec

Every app is built with identical requirements (as validated by the shared test suite), and uses the same assets, styles, and data. The only difference is the framework used to build each.

### Technical Requirements
Why a weather app? Because it enables us to use all the critical features of any frontend framework, including:
- Binding user input and validation
- Fetching external data asynchronously
- Basic state management of components
- Handling fallback views (loading, errors)
- Using browser features (location, storage, etc)
- Logic blocks, for iterative content and conditionals
- Lifecycle methods (mounting, updating, unmounting)

### Functional Requirements
For our app to be somewhat complete and useful, it must do the following:
- On initial load, the user should see weather for their current GPS location
- The user should be able to search for a city, and view it's weather
- And the user's city should be stored in localstorage for next time
- The app should show a detailed view of the current weather
- And a summary 7-day forecast, where days can be expanded for more details

### Quality Requirements
There's certain standards every app should follow, and we want to use best practices, so:
- Theming: The app should support both light and dark mode, based on the user's preferences
- Internationalization: The copy should be extracted out of the code, so that it is translatable
- Accessibility: The app should meet AA standard of accessibility
- Mobile: The app should be fully responsive and optimized for mobile
- Performance: The app should be efficiently coded as best as the framework allows
- Testing: The app should meet 90% test coverage
- Error Handling: Errors should be handled, correctly surfaced, and tracible
- Quality: The code should be linted for consistent formatting
- Security: Inputs must be validated, data via HTTPS, and no known vulnerabilities
- SEO: Basic meta and og tags, SSR where possible, 
- CI: Automated tests, lints and validation should ensure all changes are compliant

### Benchmarking Requirements
To compare the frameworks, we need to measure:
- Bundle size & output
- Load metrics: FCP, LCP, CLS, TTI, interaction latency
- Hydration/SSR cost, CPU & memory
- Cold vs. warm cache behaviour
- Memory usage: idle, post-flow, leak delta
- Build time & dev server HMR latency

### UI Requirements
The interface is simple, but must be identical arcorss all apps. As validated by the snapshots in the tests.<br>
The screenshots will all look like this:

<img src="https://raw.githubusercontent.com/Lissy93/framework-benchmarks/refs/heads/main/assets/screenshot.png" width="400" />

---

## Benchmarking

---

## Results

A summary of results can be viewed in [`summary.tsv`](https://github.com/Lissy93/framework-benchmarks/blob/main/results/summary.tsv).<br>
Full, detailed results can be found in the [`results`](https://github.com/Lissy93/framework-benchmarks/tree/results) branch,
or attached as an artifact in the GitHub Actions benchmarking workflow runs.
For slightly more interactive reports, you can view the website at [framework-benchmarks.as93.net](https://framework-benchmarks.as93.net),
and also view a stats on a per-framework basis.

### Summary
<p align="center"><sub>The following charts show live data from the latest benchmark run. See the web version for interactive charts.</sub></p>
<!-- start_summary_charts -->
<p align="center">
  <img src="https://quickchart.io/chart/render/zf-9b8391e2-d199-4073-921d-cfa38d85ec84" width="256" title="Performance Overview" alt="Performance Overview" />
  <img src="https://quickchart.io/chart/render/zf-9e8635f8-7d8a-449f-bc55-ad1a82c157f9" width="256" title="Performance vs Bundle Size" alt="Performance vs Bundle Size" />
  <img src="https://quickchart.io/chart/render/zf-8cf5958f-2aa9-4e40-8a5e-cd7180cb70d2" width="256" title="Source Code Analysis" alt="Source Code Analysis" />
  <img src="https://quickchart.io/chart/render/zf-40205c93-a075-4315-bda9-4508179440e7" width="256" title="Bundle Size and Comparison" alt="Bundle Size and Comparison" />
  <img src="https://quickchart.io/chart/render/zf-36d67859-6802-4f18-a07d-1bf936f602bd" width="256" title="Lighthouse Performance Scores" alt="Lighthouse Performance Scores" />
  <img src="https://quickchart.io/chart/render/zf-6bd2a88a-1a3d-465a-8c72-e129c2083262" width="256" title="Loading Performance" alt="Loading Performance" />
  <img src="https://quickchart.io/chart/render/zf-b940e8a0-2453-4809-ac83-481358f93a29" width="256" title="Project Size Distribution" alt="Project Size Distribution" />
  <img src="https://quickchart.io/chart/render/zf-a18f7742-db90-466e-8d67-fc7698242d94" width="256" title="Development Server Performance" alt="Development Server Performance" />
  <img src="https://quickchart.io/chart/render/zf-9c1de557-f4d6-438f-b311-a8832172c7ed" width="256" title="Build Time Distribution" alt="Build Time Distribution" />
</p>
<!-- end_summary_charts -->

### Community Info

<!-- start_framework_stats -->
| Framework | Stars | Downloads | Size | Contributors | Age | Last updated | License |
|---|---|---|---|---|---|---|---|
| <a href="https://github.com/facebook/react"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/react.png" alt="⚛️" width="16"></a> [**React**](https://github.com/facebook/react) | 240.2k | 196.1M | 1177.4 MB | 2k | 12.4y | 12 hours ago | MIT |
| <a href="https://github.com/angular/angular"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/angular.png" alt="🅰️" width="16"></a> [**Angular**](https://github.com/angular/angular) | 99.2k | 17.4M | 563.5 MB | 2.5k | 11.1y | 1 day ago | MIT |
| <a href="https://github.com/sveltejs/svelte"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/svelte.png" alt="🔥" width="16"></a> [**Svelte**](https://github.com/sveltejs/svelte) | 84.6k | 8.4M | 114.3 MB | 870 | 9.0y | 23 hours ago | MIT |
| <a href="https://github.com/preactjs/preact"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/preact.png" alt="💜" width="16"></a> [**Preact**](https://github.com/preactjs/preact) | 38.1k | 43.3M | 17.9 MB | 366 | 10.1y | 13 hours ago | MIT |
| <a href="https://github.com/solidjs/solid"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/solid.png" alt="🚀" width="16"></a> [**Solid.js**](https://github.com/solidjs/solid) | 34.5k | 4.2M | 13.9 MB | 181 | 7.5y | 3 days ago | MIT |
| <a href="https://github.com/QwikDev/qwik"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/qwik.png" alt="⚡" width="16"></a> [**Qwik**](https://github.com/QwikDev/qwik) | 21.8k | 113.4k | 60.9 MB | 618 | 4.7y | 3 days ago | MIT |
| <a href="https://github.com/vuejs/core"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/vue.png" alt="💚" width="16"></a> [**Vue 3**](https://github.com/vuejs/core) | 52k | 29.6M | 36.7 MB | 577 | 7.1y | 2 weeks ago | MIT |
| <a href="https://github.com/jquery/jquery"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/jquery.png" alt="💙" width="16"></a> [**jQuery**](https://github.com/jquery/jquery) | 59.6k | 68.2M | 34.2 MB | 344 | 19.6y | 3 days ago | MIT |
| <a href="https://github.com/alpinejs/alpine"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/alpine.png" alt="🏔️" width="16"></a> [**Alpine.js**](https://github.com/alpinejs/alpine) | 30.6k | 1.4M | 8.8 MB | 296 | 5.9y | 5 days ago | MIT |
| <a href="https://github.com/lit/lit"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/lit.png" alt="🔥" width="16"></a> [**Lit**](https://github.com/lit/lit) | 20.6k | 14.5M | 59.2 MB | 206 | 8.3y | 1 week ago | BSD-3-Clause |
| <a href="https://github.com/vanjs-org/van"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/vanjs.png" alt="🚐" width="16"></a> [**VanJS**](https://github.com/vanjs-org/van) | 4.2k | 14.2k | 3.8 MB | 24 | 2.5y | 1 month ago | MIT |
<!-- end_framework_stats -->

---

## Side note
Different frameworks shine in different ways, and therefore have very different usecases.<br>
So, in order to let each one shine, I have I have built real-world apps in each framework.


| Project | Framework | GitHub | Website |
|---|---|---|---|
| [<img src="https://raw.githubusercontent.com/Lissy93/web-check/master/public/android-chrome-192x192.png" width="18" /> Web Check](https://github.com/Lissy93/web-check) - All-in-one OSINT tool for analyzing any site | [![React](https://img.shields.io/static/v1?label=&message=React&color=61DAFB&logo=react&logoColor=FFFFFF)](https://react.dev/) | [![GitHub Repo stars](https://img.shields.io/github/stars/Lissy93/web-check)](https://github.com/Lissy93/web-check) | [🌐 web-check.xyz](https://web-check.xyz) |
| [<img src="https://i.ibb.co/yhbt6CY/dashy.png" width="18" /> Dashy](https://github.com/Lissy93/dashy) - Highly configurable self-hostable server dashboard | [![Vue.js](https://img.shields.io/static/v1?label=&message=Vue.js&color=4FC08D&logo=vuedotjs&logoColor=FFFFFF)](https://vuejs.org/) | [![GitHub Repo stars](https://img.shields.io/github/stars/Lissy93/dashy)](https://github.com/Lissy93/dashy) | [🌐 dashy.to](https://dashy.to) |
| [<img src="https://storage.googleapis.com/as93-screenshots/project-logos/digital-defense.png" width="18" /> Digital Defense](https://github.com/Lissy93/personal-security-checklist) - Interactive personal security checklist | [![Qwik](https://img.shields.io/static/v1?label=&message=Qwik&color=ac7ef4&logo=qwik&logoColor=FFFFFF)](https://qwik.builder.io/) | [![GitHub Repo stars](https://img.shields.io/github/stars/Lissy93/personal-security-checklist)](https://github.com/Lissy93/personal-security-checklist) | [🌐 digital-defense.io](https://digital-defense.io) |
| [<img src="https://storage.googleapis.com/as93-screenshots/project-logos/portainer-templates.png" width="18" /> Portainer Templates](https://github.com/Lissy93/portainer-templates) - Automated Docker deployment specs | [![Svelte](https://img.shields.io/static/v1?label=&message=Svelte&color=ff3e00&logo=svelte&logoColor=FFFFFF)](https://svelte.dev/) | [![GitHub Repo stars](https://img.shields.io/github/stars/Lissy93/portainer-templates)](https://github.com/Lissy93/portainer-templates) | [🌐 portainer-templates](https://portainer-templates.as93.net/) |
| [<img src="https://storage.googleapis.com/as93-screenshots/project-logos/domain-locker.png" width="18" /> Domain Locker](https://github.com/Lissy93/domain-locker) - Domain name portfolio manager | [![Angular](https://img.shields.io/static/v1?label=&message=Angular&color=DD0031&logo=angular&logoColor=FFFFFF)](https://angular.io/) | [![GitHub Repo stars](https://img.shields.io/github/stars/Lissy93/domain-locker)](https://github.com/Lissy93/domain-locker) | [🌐 domain-locker.com](https://domain-locker.com) |
| [<img src="https://storage.googleapis.com/as93-screenshots/project-logos/email-comparison.png" width="18" /> Email Comparison](https://github.com/Lissy93/email-comparison) - Objective testing of mail providers | [![Lit](https://img.shields.io/static/v1?label=&message=Lit&color=00ffff&logo=lit&logoColor=FFFFFF)](https://lit.dev/) | [![GitHub Repo stars](https://img.shields.io/github/stars/Lissy93/email-comparison)](https://github.com/Lissy93/email-comparison) | [🌐 email-comparison](https://email-comparison.as93.net/) |
| [<img src="https://storage.googleapis.com/as93-screenshots/project-logos/who-dat.png" width="18" /> Who Dat](https://github.com/Lissy93/who-dat) - WHOIS lookup for domain registration info  | [![Alpine.js](https://img.shields.io/static/v1?label=&message=Alpine.js&color=8BC0D0&logo=alpinedotjs&logoColor=FFFFFF)](https://alpinejs.dev/) | [![GitHub Repo stars](https://img.shields.io/github/stars/Lissy93/who-dat)](https://github.com/Lissy93/who-dat) | [🌐 who-dat.as93.net](https://who-dat.as93.net) |
| [<img src="https://storage.googleapis.com/as93-screenshots/project-logos/cso.png" width="18" /> Chief Snack Officer](https://github.com/Lissy93/cso) - Office snack management app | [![Solid](https://img.shields.io/static/v1?label=&message=Solid&color=2C4F7C&logo=solid&logoColor=FFFFFF)](https://www.solidjs.com/) | [![GitHub Repo stars](https://img.shields.io/github/stars/Lissy93/cso)](https://github.com/Lissy93/cso) | [🌐 N/A](https://lissy93.github.io/cso) |
| [<img src="https://storage.googleapis.com/as93-screenshots/project-logos/awesome-privacy.png" width="18" /> Awesome Privacy](https://github.com/Lissy93/awesome-privacy) - Curated directory of respectful apps | [![Astro](https://img.shields.io/static/v1?label=&message=Astro&color=E83CB9&logo=astro&logoColor=FFFFFF)](https://astro.build/) | [![GitHub Repo stars](https://img.shields.io/github/stars/Lissy93/awesome-privacy)](https://github.com/Lissy93/awesome-privacy) | [🌐 awesome-privacy.xyz](https://awesome-privacy.xyz/) |
| [<img src="https://storage.googleapis.com/as93-screenshots/project-screenshots/raid-caclularor.png" width="18" /> RAID Calculator](https://github.com/Lissy93/raid-calculator) - RAID array capacity and fault tolerance | [![Van.js](https://img.shields.io/static/v1?label=&message=Van.js&color=F44336&logo=vitess&logoColor=FFFFFF)](https://vanjs.org/) | [![GitHub Repo stars](https://img.shields.io/github/stars/Lissy93/raid-calculator)](https://github.com/Lissy93/raid-calculator) | [🌐 raid-calculator](https://raid-calculator.as93.net/) |
| [<img src="https://github.com/Lissy93/permissionator/blob/main/public/logo.png?raw=true" width="18" /> Permissionator](https://github.com/Lissy93/permissionator) - Generating Linux file permissions | [![Marko](https://img.shields.io/static/v1?label=&message=Marko&color=2596BE&logo=marko&logoColor=FFFFFF)](https://markojs.com/) | [![GitHub Repo stars](https://img.shields.io/github/stars/Lissy93/permissionator)](https://github.com/Lissy93/permissionator) | [🌐 permissionator](https://permissionator.as93.net) |

---

## Status

Each app gets built and tested to ensure that it is functional, compliant with the spec, and (reasonably) well coded. Below is the current status of each, but for complete details you can see the [Workflow Logs](https://github.com/lissy93/framework-benchmarks/actions) via GitHub Actions. 

| Workflow | Status |
|---|---|
| **Build**: Compiles each app for deployment | [![🔨 Build](https://github.com/Lissy93/framework-benchmarks/actions/workflows/build.yml/badge.svg)](https://github.com/Lissy93/framework-benchmarks/actions/workflows/build.yml) |
| **Test**: Runs all unit and integration tests | [![🧪 Test](https://github.com/Lissy93/framework-benchmarks/actions/workflows/test.yml/badge.svg)](https://github.com/Lissy93/framework-benchmarks/actions/workflows/test.yml) |
| **Lint**: Ensures lint/consistency checks pass | [![🧼 Lint](https://github.com/Lissy93/framework-benchmarks/actions/workflows/lint.yml/badge.svg)](https://github.com/Lissy93/framework-benchmarks/actions/workflows/lint.yml) |
| **Benchmark**: Executes all app benchmarks | [![📈 Benchmark](https://github.com/Lissy93/framework-benchmarks/actions/workflows/benchmark.yml/badge.svg)](https://github.com/Lissy93/framework-benchmarks/actions/workflows/benchmark.yml) |
| **Transform**: Formats and publishes results | [![🔄 Transform Results](https://github.com/Lissy93/framework-benchmarks/actions/workflows/transform-results.yml/badge.svg)](https://github.com/Lissy93/framework-benchmarks/actions/workflows/transform-results.yml) |
| **Docker**: Builds and publishes the image | [![🐳 Build & Publish Docker Image](https://github.com/Lissy93/framework-benchmarks/actions/workflows/docker.yml/badge.svg)](https://github.com/Lissy93/framework-benchmarks/actions/workflows/docker.yml) |
| **Docs**: Updates dynamic info in markdown | [![📄 Update readme](https://github.com/Lissy93/framework-benchmarks/actions/workflows/update-docs.yml/badge.svg)](https://github.com/Lissy93/framework-benchmarks/actions/workflows/update-docs.yml) |
| **Mirror**: Syncs repo to Codeberg mirror  | [![🪞 Mirror to Codeberg](https://github.com/Lissy93/framework-benchmarks/actions/workflows/mirror.yml/badge.svg)](https://github.com/Lissy93/framework-benchmarks/actions/workflows/mirror.yml) |


<!-- start_all_status -->

| App | Build | Test | Lint |
|---|---|---|---|
| <a href="https://github.com/lissy93/framework-benchmarks/tree/main/apps/react"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/react.png" width="16" /> React</a> | ![React Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/build-react.svg) | ![React Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/test-react.svg) | ![React Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/lint-react.svg) |
| <a href="https://github.com/lissy93/framework-benchmarks/tree/main/apps/angular"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/angular.png" width="16" /> Angular</a> | ![Angular Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/build-angular.svg) | ![Angular Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/test-angular.svg) | ![Angular Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/lint-angular.svg) |
| <a href="https://github.com/lissy93/framework-benchmarks/tree/main/apps/svelte"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/svelte.png" width="16" /> Svelte</a> | ![Svelte Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/build-svelte.svg) | ![Svelte Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/test-svelte.svg) | ![Svelte Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/lint-svelte.svg) |
| <a href="https://github.com/lissy93/framework-benchmarks/tree/main/apps/preact"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/preact.png" width="16" /> Preact</a> | ![Preact Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/build-preact.svg) | ![Preact Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/test-preact.svg) | ![Preact Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/lint-preact.svg) |
| <a href="https://github.com/lissy93/framework-benchmarks/tree/main/apps/solid"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/solid.png" width="16" /> Solid.js</a> | ![Solid.js Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/build-solid.svg) | ![Solid.js Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/test-solid.svg) | ![Solid.js Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/lint-solid.svg) |
| <a href="https://github.com/lissy93/framework-benchmarks/tree/main/apps/qwik"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/qwik.png" width="16" /> Qwik</a> | ![Qwik Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/build-qwik.svg) | ![Qwik Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/test-qwik.svg) | ![Qwik Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/lint-qwik.svg) |
| <a href="https://github.com/lissy93/framework-benchmarks/tree/main/apps/vue"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/vue.png" width="16" /> Vue 3</a> | ![Vue 3 Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/build-vue.svg) | ![Vue 3 Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/test-vue.svg) | ![Vue 3 Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/lint-vue.svg) |
| <a href="https://github.com/lissy93/framework-benchmarks/tree/main/apps/jquery"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/jquery.png" width="16" /> jQuery</a> | ![jQuery Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/build-jquery.svg) | ![jQuery Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/test-jquery.svg) | ![jQuery Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/lint-jquery.svg) |
| <a href="https://github.com/lissy93/framework-benchmarks/tree/main/apps/alpine"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/alpine.png" width="16" /> Alpine.js</a> | ![Alpine.js Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/build-alpine.svg) | ![Alpine.js Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/test-alpine.svg) | ![Alpine.js Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/lint-alpine.svg) |
| <a href="https://github.com/lissy93/framework-benchmarks/tree/main/apps/lit"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/lit.png" width="16" /> Lit</a> | ![Lit Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/build-lit.svg) | ![Lit Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/test-lit.svg) | ![Lit Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/lint-lit.svg) |
| <a href="https://github.com/lissy93/framework-benchmarks/tree/main/apps/vanjs"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/vanjs.png" width="16" /> VanJS</a> | ![VanJS Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/build-vanjs.svg) | ![VanJS Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/test-vanjs.svg) | ![VanJS Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/lint-vanjs.svg) |
| <a href="https://github.com/lissy93/framework-benchmarks/tree/main/apps/vanilla"><img src="https://storage.googleapis.com/as93-screenshots/frontend-benchmarks/framework-logos/javascript.png" width="16" /> Vanilla JavaScript</a> | ![Vanilla JavaScript Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/build-vanilla.svg) | ![Vanilla JavaScript Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/test-vanilla.svg) | ![Vanilla JavaScript Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/badges/lint-vanilla.svg) |
<!-- end_all_status -->

---

## Attributions

### Sponsors

![Sponsors](https://readme-contribs.as93.net/sponsors/lissy93?avatarSize=80&perRow=10)

### Contributors

![Contributors](https://readme-contribs.as93.net/contributors/lissy93/framework-benchmarks?avatarSize=80&perRow=10)


### Stargzers

![Stargazers](https://readme-contribs.as93.net/stargazers/lissy93/framework-benchmarks?perRow=16&limit=64)

---

## License


> _**[lissy93/framework-benchmarks](https://github.com/lissy93/framework-benchmarks)** is licensed under [MIT](https://github.com/lissy93/framework-benchmarks/blob/HEAD/LICENSE) © [Alicia Sykes](https://aliciasykes.com) 2025._<br>
> <sup align="right">For information, see <a href="https://tldrlegal.com/license/mit-license">TLDR Legal > MIT</a></sup>

<details>
<summary>Expand License</summary>

```
The MIT License (MIT)
Copyright (c) Alicia Sykes <alicia@omg.com> 

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to deal 
in the Software without restriction, including without limitation the rights 
to use, copy, modify, merge, publish, distribute, sub-license, and/or sell 
copies of the Software, and to permit persons to whom the Software is furnished 
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included install 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANT ABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

</details>

<!-- License + Copyright -->
<p  align="center">
  <i>© <a href="https://aliciasykes.com">Alicia Sykes</a> 2025</i><br>
  <i>Licensed under <a href="https://gist.github.com/Lissy93/143d2ee01ccc5c052a17">MIT</a></i><br>
  <a href="https://github.com/lissy93"><img src="https://i.ibb.co/4KtpYxb/octocat-clean-mini.png" /></a><br>
  <sup>Thanks for visiting :)</sup>
</p>

<!-- Dinosaurs are Awesome -->
<!-- 
                        . - ~ ~ ~ - .
      ..     _      .-~               ~-.
     //|     \ `..~                      `.
    || |      }  }              /       \  \
(\   \\ \~^..'                 |         }  \
 \`.-~  o      /       }       |        /    \
 (__          |       /        |       /      `.
  `- - ~ ~ -._|      /_ - ~ ~ ^|      /- _      `.
              |     /          |     /     ~-.     ~- _
              |_____|          |_____|         ~ - . _ _~_-_
-->


