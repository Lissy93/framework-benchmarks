<!-- start_header -->
<h1 align="center">🅰️ Weather Front - Angular</h1>

<p align="center">
  <img width="64" src="https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/main/assets/favicon.png" /><br>
  <i>A tiny weather app</i>
  <br>
  <b><a href="/">🚀 Demo</a> ● <a href="https://frontend-framework-benchmarks.as93.net">📊 Results</a></b>
  <br><br>
  <a href="https://angular.io/" target="_blank"><img src="https://img.shields.io/badge/Framework-Angular-DD0031?logo=angular&logoColor=fff&labelColor=DD0031" /></a>
  <a href="https://github.com/Lissy93/framework-benchmarks/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-AE56FF?logo=googledocs&logoColor=fff&labelColor=8A2BE2" /></a>
  <a href="https://github.com/lissy93"><img src="https://img.shields.io/badge/Author-Lissy93-EA4AAA?logo=githubsponsors&logoColor=fff&labelColor=E31591" /></a>
</p>
<!-- end_header -->

<!-- start_about -->

## About

<img align="right" src="/assets/screenshot.png" width="400">

This is a simple weather app, built in [Angular](https://angular.io/) (as well as also [10 other frontend frameworks](/)) in order to review, compare and benchmark frontend web frameworks.

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
| **Test** - Executes all e2e and unit tests | [![Test Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/test-angular.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/test.yml) |
| **Lint** - Verifies code style and quality | [![Lint Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/lint-angular.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/lint.yml) |
| **Build** - Builds and deploys the app | [![Build Status](https://raw.githubusercontent.com/lissy93/framework-benchmarks/refs/heads/badges/build-angular.svg)](https://github.com/lissy93/framework-benchmarks/actions/workflows/build.yml) |

<!-- end_status -->

<!-- start_usage -->

## Usage

First, follow the [repo setup instructions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#usage). Then `cd apps/angular` and use the following commands:

```bash
npm run dev    # Start dev server (ng serve --port 3000)
npm test       # Run tests
npm run lint   # Run lint checks
npm build      # Build for production (ng build)
npm start      # Serve built prod app (from ./dist)
```

For troubleshooting, use `npm run verify` from the root of the project.

<!-- end_usage -->

## About Angular
<!-- start_framework_description -->
Angular is a full-blown framework from Google, not just a library. 
It comes with everything out of the box, from routing to forms to testing. 
Its TypeScript-first approach and structured architecture make it great for large, enterprise apps. 
The learning curve is steep but it’s incredibly powerful when mastered.

<!-- end_framework_description -->

## Angular Implementation
<!-- start_framework_specific -->
#### Dependency Injection & Services
The app uses Angular's dependency injection system with services marked as `@Injectable({ providedIn: 'root' })`. The [`WeatherStateService`](https://github.com/Lissy93/framework-benchmarks/blob/main/apps/angular/src/app/services/weather-state.service.ts) manages global state using RxJS `BehaviorSubject`.

#### RxJS Reactive Patterns
State management leverages RxJS observables with operators like `catchError`, `finalize`, `switchMap`, and `delay`. The app component uses `takeUntil` pattern for subscription cleanup to prevent memory leaks.

#### Standalone Components
All components use Angular's modern standalone API, eliminating the need for NgModules. Components import their dependencies directly in the `imports` array.

#### Inline Templates
The [`AppComponent`](https://github.com/Lissy93/framework-benchmarks/blob/main/apps/angular/src/app/app.component.ts) demonstrates Angular's inline template syntax with data binding (`[isLoading]`, `(search)`), structural directives, and conditional rendering.

#### TypeScript Integration
Full TypeScript support with typed interfaces for weather data and app state, providing compile-time type checking and better developer experience.
<!-- end_framework_specific -->

## My Thoughts on Angular
<!-- start_my_thoughts -->
Angular isn't the cool kid anymore, but it's incredibly solid and ships with absolutely everything you need. TypeScript from day one, dependency injection, forms, HTTP client, routing, testing utilities - it's all there, officially maintained and deeply integrated. No need to cobble together a stack from random npm packages.

For our weather app, Angular did kinda feel like using a sledgehammer to crack a nut. Using the newer standalone components (no more `NgModule` boilerplate!) made things cleaner, but I was still writing a lot more code than I needed in Svelte or Vue. That said, everything does just works, and the TypeScript integration is phenomenal.

The dependency injection system was quite nice for having `WeatherService` automatically injected into components. And RxJS observables handle all the async weather data very nicley, though they do add a learning curve if you're not familiar with reactive programming.

Angular's template syntax with `*ngIf`, `*ngFor`, and `(click)` feels natural once you get used to it. Change detection just works without thinking about it (unlike React where you're constantly memoizing things).

For a simple weather app, we really didn't need any of Angular's big or flagship features (like guards, resolvers, or lazy loading). But I recently build [Domain Locker](https://github.com/lissy93/domain-locker) using Angular, and it was a great fit for the complexity of that project, As the structure, type safety, and tooling made it easy to manage a large codebase with multiple features.
<!-- end_my_thoughts -->


<!-- start_real_world_app -->

## Real-World App
Since the weather app is very simple, it may be helpful to see a more practical implementation of a Angular app. So, checkout:

<a href="https://github.com/Lissy93/domain-locker"><img align="left" src="https://storage.googleapis.com/as93-screenshots/project-logos/domain-locker.png" width="96"></a>

> **Domain Locker** - _Domain name portfolio manager_<br>
> 🐙 Get it on GitHub at [github.com/Lissy93/domain-locker](https://github.com/Lissy93/domain-locker)<br>
> 🌐 View the website at [domain-locker.com](https://domain-locker.com)

<br>
<!-- end_real_world_app -->

<!-- start_license -->

## License

Weather-Front is licensed under [MIT](https://github.com/lissy93/framework-benchmarks/blob/main/LICENSE) © Alicia Sykes 2025.<br>
View [Attributions](https://github.com/lissy93/framework-benchmarks?tab=readme-ov-file#attributions) for credits, thanks and contributors.

<!-- end_license -->
