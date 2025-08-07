# Weather App - Lit

A modern weather application built with [Lit](https://lit.dev/) - a simple library for building fast, lightweight web components.

## Features

- 🌦️ Current weather conditions
- 📅 7-day weather forecast  
- 🔍 City search functionality
- 📱 Responsive design
- ♿ Accessible interface
- 🎨 Modern, clean UI
- 💾 Persistent location storage
- 📍 Geolocation support

## Lit Features Used

- **Web Components**: Custom elements with encapsulated logic
- **Reactive Properties**: `@property()` decorator for reactive state
- **Templating**: `html` template literals with data binding
- **CSS-in-JS**: `css` tagged template for component styling
- **Lifecycle Methods**: `firstUpdated`, `updated` for component lifecycle
- **Event Handling**: `@click`, `@submit` for user interactions
- **Conditional Rendering**: `${condition ? template : nothing}`
- **List Rendering**: `map()` with `repeat()` directive
- **State Management**: Internal component state with reactive updates

## Development

```bash
npm install   # Install dependencies
npm run dev   # Start development server on http://localhost:3000
```

The app uses modern web standards and Lit's efficient reactive updates for optimal performance.