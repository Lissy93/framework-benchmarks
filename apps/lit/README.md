<!-- start_header -->
<h1 align="center">🔥 Weather Front - Lit</h1>

<p align="center">
  <img width="64" src="https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/main/assets/favicon.png" /><br>
  <i>A tiny weather app</i>
  <br>
  <b><a href="/">🚀 Demo</a> ● <a href="https://frontend-framework-benchmarks.as93.net">📊 Results</a></b>
  <br><br>
  <a href="https://lit.dev/" target="_blank"><img src="https://img.shields.io/badge/Framework-Lit-324fff?logo=lit&logoColor=fff&labelColor=324fff" /></a>
  <a href="https://github.com/Lissy93/framework-benchmarks/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-AE56FF?logo=googledocs&logoColor=fff&labelColor=8A2BE2" /></a>
  <a href="https://github.com/lissy93"><img src="https://img.shields.io/badge/Author-Lissy93-EA4AAA?logo=githubsponsors&logoColor=fff&labelColor=E31591" /></a>
</p>
<!-- end_header -->

<!-- start_about -->

## About

<img align="right" src="/assets/screenshot.png" width="400">

This is a simple weather app, built in [Lit](https://lit.dev/) (as well as also [10 other frontend frameworks](/)) in order to review, compare and benchmark frontend web frameworks.

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
| **Test** - Executes all e2e and unit tests | [![Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/test-lit.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/test.yml) |
| **Lint** - Verifies code style and quality | [![Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/lint-lit.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/lint.yml) |
| **Build** - Builds and deploys the app | [![Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/build-lit.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/build.yml) |

<!-- end_status -->

<!-- start_usage -->

## Usage

First, follow the [repo setup instructions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#usage). Then `cd apps/lit` and use the following commands:

```bash
npm run dev    # Start dev server (vite --port 3000)
npm test       # Run tests
npm run lint   # Run lint checks
npm build      # Build for production (vite build)
npm start      # Serve built prod app (from ./dist)
```

For troubleshooting, use `npm run verify` from the root of the project.

<!-- end_usage -->

## Lit Implementation
<!-- start_framework_specific -->
#### Web Components & Custom Elements
The [`weather-app.js`](https://github.com/Lissy93/framework-benchmarks/blob/main/apps/lit/src/weather-app.js) extends `LitElement` and registers as `<weather-app>` using `customElements.define()`. All components are true Web Components that work in any framework.

#### Tagged Template Literals
Lit uses JavaScript tagged template literals for both HTML templates (`html\`\``) and CSS styles (`css\`\`). This provides syntax highlighting and type safety without build-time compilation.

#### Reactive Properties
Static properties are defined with `static properties = { _isLoading: { state: true } }`. Changes to these properties automatically trigger re-renders of only the affected parts.

#### Shared Style System
The [`shared-styles.js`](https://github.com/Lissy93/framework-benchmarks/blob/main/apps/lit/src/shared-styles.js) demonstrates Lit's CSS module system using `css` tagged template literals for design system consistency across components.

#### Shadow DOM Encapsulation
Each Lit component renders in its own Shadow DOM, providing true style encapsulation without CSS-in-JS runtime overhead.
<!-- end_framework_specific -->

## About Lit
<!-- start_framework_description -->
Lit is a framework from Google built around Web Components. 
It’s minimal, modern and uses standard browser APIs rather than reinventing the wheel. 
Great when you want reusable components without a massive framework overhead. 
It’s gaining traction for design systems and apps that need native-feeling components.

<!-- end_framework_description -->

## My Thoughts on Lit
<!-- start_my_thoughts -->
Lit can feel like stepping back into the old React class component days, but actually the cohesion to web standards makes Lit pretty... lit. It's built around Web Components, which is both its greatest strength and biggest frustration. Everything is properly encapsulated and framework-agnostic, but the developer experience feels surprisingly verbose for 2025.

The weird expression syntax has caught me out a lot. Want to bind a property? Use `.value="${this.temp}"`. A boolean attribute? `?disabled="${this.loading}"`. An event listener? `@click="${this.handleClick}"`. It's functional once you memorize the symbols, but it breaks the flow when you're trying to think about business logic.

Class-based components can feel outdated after years of hooks and functional patterns. Creating a simple weather display requires extending `LitElement`, defining `@property` decorators, implementing `render()`, and handling lifecycle methods manually. It works, but feels like unnecessary ceremony.

The shadow DOM isolation is cool in theory - your styles can't leak, global CSS can't interfere. But in practice, it creates more problems than it solves. Want to style components consistently? Good luck getting your design system to work across shadow boundaries. Because of this, I really struggled to get the shared weather styles working across the Lit app. If you want to submit a PR to fix this, please do!

But Lit really does shine for design systems and component libraries where you need true framework-agnostic components. I did build [Email Comparison](https://email-comparison.as93.net/) in Lit, but in heindsite, I think that was a mistake!
<!-- end_my_thoughts -->

<!-- start_real_world_app -->

## Real-World App
Since the weather app is very simple, it may be helpful to see a more practical implementation of a Lit app. So, checkout:

<a href="https://github.com/Lissy93/email-comparison"><img align="left" src="https://storage.googleapis.com/as93-screenshots/project-logos/email-comparison.png" width="96"></a>

> **Email Comparison** - _An objective comparison of privacy-respecting email providers_<br>
> 🐙 Get it on GitHub at [github.com/Lissy93/email-comparison](https://github.com/Lissy93/email-comparison)<br>
> 🌐 View the website at [email-comparison.as93.net](https://email-comparison.as93.net/)

<br>
<!-- end_real_world_app -->

<!-- start_license -->

## License

Weather-Front is licensed under [MIT](https://github.com/lissy93/framework-benchmarks/blob/main/LICENSE) © Alicia Sykes 2025.<br>
View [Attributions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#attributions) for credits, thanks and contributors.

<!-- end_license -->
