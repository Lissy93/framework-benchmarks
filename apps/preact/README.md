# Weather App - Preact

A modern weather application built with Preact, providing real-time weather information with a clean and responsive interface.

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

The application follows modern Preact patterns:

- **Hooks**: Custom `useWeatherData` hook for state management
- **Components**: Modular, reusable components with clear separation of concerns
- **Services**: Abstracted weather API service with mock data support
- **Utils**: Shared utilities for weather data formatting
- **Testing**: Playwright tests for complete user journey validation

## Dependencies

- **Preact** (^10.19.0): Fast 3KB alternative to React
- **Vite** (^5.2.0): Next generation frontend tooling
- **Playwright** (^1.40.0): End-to-end testing framework

## Project Structure

```
src/
├── components/          # Preact components
│   ├── CurrentWeather.jsx
│   ├── Forecast.jsx
│   ├── ForecastItem.jsx
│   ├── LoadingState.jsx
│   ├── ErrorState.jsx
│   ├── SearchForm.jsx
│   └── WeatherContent.jsx
├── hooks/              # Custom hooks
│   └── useWeatherData.js
├── services/           # API services
│   └── WeatherService.js
├── utils/              # Utility functions
│   └── WeatherUtils.js
├── App.jsx            # Main app component
└── main.jsx           # App entry point
```

## License

MIT License - see LICENSE file for details