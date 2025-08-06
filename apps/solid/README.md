# Weather App - Solid.js

A modern weather application built with Solid.js, providing real-time weather information with a clean and responsive interface.

## Features

- **Current Weather**: Real-time weather conditions for any city
- **7-Day Forecast**: Extended weather forecast with detailed daily information
- **Location Services**: Automatic location detection with fallback options
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Offline-First**: Graceful handling of network issues
- **Test Coverage**: Comprehensive end-to-end testing with Playwright

## Quick Start

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Testing

```bash
# Run end-to-end tests
npm test
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

The application follows modern Solid.js patterns:

- **Signals**: Reactive state management with fine-grained updates
- **Components**: Functional components with JSX and reactive primitives
- **Services**: Abstracted weather API service with mock data support
- **Utils**: Shared utilities for weather data formatting
- **Testing**: Playwright tests for complete user journey validation

## Dependencies

- **Solid.js** (^1.8.0): Declarative, efficient, and flexible JavaScript library
- **Vite** (^5.2.0): Next generation frontend tooling
- **Playwright** (^1.40.0): End-to-end testing framework

## Project Structure

```
src/
├── components/          # Solid.js components
│   ├── CurrentWeather.jsx
│   ├── Forecast.jsx
│   ├── ForecastItem.jsx
│   ├── LoadingState.jsx
│   ├── ErrorState.jsx
│   ├── SearchForm.jsx
│   └── WeatherContent.jsx
├── stores/              # State management
│   └── weatherStore.js
├── services/            # API services
│   └── WeatherService.js
├── utils/               # Utility functions
│   └── WeatherUtils.js
├── App.jsx             # Main app component
└── index.jsx           # App entry point
```

## License

MIT License - see LICENSE file for details