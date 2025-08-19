<!-- start_header --> 
<!-- end_header -->

<!-- start_about -->
<!-- end_about -->

<!-- start_status -->
<!-- end_status -->

<!-- start_usage -->
<!-- end_usage -->

## Lit Implementation
<!-- start_framework_specific -->
Lit can feel like stepping back into the old React class component days, but actually the cohesion to web standards makes Lit pretty... lit. It's built around Web Components, which is both its greatest strength and biggest frustration. Everything is properly encapsulated and framework-agnostic, but the developer experience feels surprisingly verbose for 2025.

The weird expression syntax has caught me out a lot. Want to bind a property? Use `.value="${this.temp}"`. A boolean attribute? `?disabled="${this.loading}"`. An event listener? `@click="${this.handleClick}"`. It's functional once you memorize the symbols, but it breaks the flow when you're trying to think about business logic.

Class-based components can feel outdated after years of hooks and functional patterns. Creating a simple weather display requires extending `LitElement`, defining `@property` decorators, implementing `render()`, and handling lifecycle methods manually. It works, but feels like unnecessary ceremony.

### Notable files
- `src/weather-app.js` - Main application as a custom element
- `src/weather-display.js` - Weather data display component
- `src/weather-forecast.js` - Forecast list with lit-html templates
- `src/weather-search.js` - Search form component with event binding

The shadow DOM isolation is cool in theory - your styles can't leak, global CSS can't interfere. But in practice, it creates more problems than it solves. Want to style components consistently? Good luck getting your design system to work across shadow boundaries. Because of this, I really struggled to get the shared weather styles working across the Lit app. If you want to submit a PR to fix this, please do!

But Lit really does shine for design systems and component libraries where you need true framework-agnostic components. I did build [Email Comparison](https://email-comparison.as93.net/) in Lit, but in heindsite, I think that was a mistake!
<!-- end_framework_specific -->

<!-- start_real_world_app -->
<!-- end_real_world_app -->

<!-- start_license -->
<!-- end_license -->
