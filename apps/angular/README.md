<!-- start_header --> 
<!-- end_header -->

<!-- start_about -->
<!-- end_about -->

<!-- start_status -->
<!-- end_status -->

<!-- start_usage -->
<!-- end_usage -->

<!-- start_framework_specific -->
## Angular Implementation

Angular isn't the cool kid anymore, but it's incredibly solid and ships with absolutely everything you need. TypeScript from day one, dependency injection, forms, HTTP client, routing, testing utilities - it's all there, officially maintained and deeply integrated. No need to cobble together a stack from random npm packages.

For our weather app, Angular did kinda feel like using a sledgehammer to crack a nut. Using the newer standalone components (no more `NgModule` boilerplate!) made things cleaner, but I was still writing a lot more code than I needed in Svelte or Vue. That said, everything does just works, and the TypeScript integration is phenomenal.

The dependency injection system was quite nice for having `WeatherService` automatically injected into components. And RxJS observables handle all the async weather data very nicley, though they do add a learning curve if you're not familiar with reactive programming.

### Notable files
- `src/app/app.component.ts` - Root component with weather state management
- `src/app/services/weather.service.ts` - Injectable service using Angular's HttpClient
- `src/app/services/weather-state.service.ts` - Centralized state with RxJS observables
- `src/app/components/` - Standalone components for weather display
- `src/app/types/weather.types.ts` - TypeScript interfaces for type safety

Angular's template syntax with `*ngIf`, `*ngFor`, and `(click)` feels natural once you get used to it. Change detection just works without thinking about it (unlike React where you're constantly memoizing things).

For a simple weather app, we really didn't need any of Angular's big or flagship features (like guards, resolvers, or lazy loading). But I recently build [Domain Locker](https://github.com/lissy93/domain-locker) using Angular, and it was a great fit for the complexity of that project, As the structure, type safety, and tooling made it easy to manage a large codebase with multiple features.
<!-- end_framework_specific -->

<!-- start_real_world_app -->
<!-- end_real_world_app -->

<!-- start_license -->
<!-- end_license -->
