# Weather Front - Framework Comparison

A tiny weather app built in different frontend frameworks to measure and compare performance characteristics.

## Project Structure

```
weather-front/
├── scripts/          # Build and utility scripts
├── assets/           # Shared assets across all apps
│   ├── icons/       # Weather icons (SVG)
│   ├── styles/      # Shared CSS variables and components
│   └── mocks/       # Mock weather data for benchmarks
├── tests/           # Shared test suite (Playwright)
└── apps/            # Individual framework implementations
    ├── react/
    ├── svelte/
    ├── angular/
    └── vue/
```

## Measurements

- Bundle size & output analysis
- Load metrics: FCP, LCP, CLS, TTI, interaction latency
- Hydration/SSR cost, CPU & memory usage
- Cold vs. warm cache behavior
- Memory usage: idle, post-flow, leak delta
- Build time & dev server HMR latency

## Features

- Current weather display with detailed metrics
- 7-day weather forecast
- City search with input validation
- Location persistence in localStorage
- Error handling for invalid locations
- Responsive design
- Accessibility compliance

## Data Source

Uses the [Open-Meteo API](https://open-meteo.com) for real weather data, with mock data for consistent benchmarking.

## Getting Started

1. **Install dependencies** for a specific framework:
   ```bash
   cd apps/react
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Scripts

- `node scripts/generate-mocks.js` - Generate mock weather data
- `node scripts/sync-assets.js` - Sync shared assets to all apps

## Technical Requirements

Each app implementation includes:
- Input binding and validation
- Async data fetching
- Component state management
- Loading and error states
- Browser APIs (localStorage)
- Conditional rendering and loops
- Component lifecycle management