# Weather App - Alpine.js

A modern weather application built with [Alpine.js](https://alpinejs.dev/) - a rugged, minimal JavaScript framework for composing behavior directly in your markup.

## Features

- 🌦️ Current weather conditions
- 📅 7-day weather forecast
- 🔍 City search functionality
- 📱 Responsive design
- ♿ Accessible interface
- 🎨 Modern, clean UI
- 💾 Persistent location storage
- 📍 Geolocation support

## Alpine.js Features Used

- **Reactive Data**: `x-data` for component state management
- **Event Handling**: `x-on` for click and form submissions  
- **Conditional Rendering**: `x-show` for loading/error states
- **List Rendering**: `x-for` for forecast items
- **Template Interpolation**: `x-text` for dynamic content
- **Class Binding**: `x-bind:class` for conditional styling
- **Effects**: `x-effect` for side effects and API calls
- **Refs**: `x-ref` for direct DOM access
- **Init**: `x-init` for initialization logic

## Development

```bash
npm run dev    # Start development server on http://localhost:3000
```

The app uses Alpine.js via CDN for simplicity and follows Alpine.js best practices for reactive, declarative programming.