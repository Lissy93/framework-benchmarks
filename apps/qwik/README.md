# Weather App - Qwik

A weather application built with [Qwik](https://qwik.builder.io/).

## Features

- Current weather display with detailed metrics
- 7-day weather forecast
- Interactive forecast details
- Responsive design
- Accessibility features
- Local storage for location persistence
- Mock data support for testing

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test
```

## Architecture

- **Components**: Reactive components using Qwik's signals
- **Services**: Weather API integration with mock support
- **Stores**: Lightweight state management using Qwik context
- **Utils**: Shared utilities for formatting and weather data

## Testing

The app includes comprehensive end-to-end tests covering:
- Core functionality (search, display, error handling)
- Advanced interactions (forecast details, keyboard navigation)
- Performance and accessibility requirements
- State management and persistence