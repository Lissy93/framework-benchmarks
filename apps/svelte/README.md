# Weather App - Svelte

A modern weather application built with SvelteKit, implementing identical functionality to the vanilla JavaScript version with modern best practices.

## Features

- **Real-time weather data** from Open-Meteo API
- **7-day forecast** with expandable details
- **Location search** with geocoding
- **Responsive design** for all screen sizes
- **Error handling** with user-friendly messages
- **Local storage** for location persistence
- **Accessibility** features (ARIA labels, keyboard navigation)
- **Loading states** with smooth transitions

## Modern SvelteKit Implementation

This Svelte version showcases modern frontend development patterns:

- **SvelteKit** for SSG/SPA architecture
- **Svelte Stores** for reactive state management
- **Component composition** with event dispatching
- **TypeScript support** (optional)
- **Static adapter** for optimized builds
- **Modern ES modules** and imports

## Project Structure

```
src/
├── routes/
│   ├── +layout.svelte    # Root layout with global styles
│   └── +page.svelte      # Main page component
├── lib/
│   ├── components/       # Reusable UI components
│   │   ├── SearchForm.svelte
│   │   ├── LoadingState.svelte
│   │   ├── ErrorState.svelte
│   │   ├── WeatherContent.svelte
│   │   ├── CurrentWeather.svelte
│   │   ├── Forecast.svelte
│   │   └── ForecastItem.svelte
│   ├── stores/           # Svelte stores for state
│   │   └── weather-store.js
│   └── services/         # API and business logic
│       └── weather-service.js
└── app.html              # HTML template
```

## Key Svelte Patterns

### Reactive Stores
Uses Svelte's reactive store system for global state management:

```javascript
export const weatherData = writable(null);
export const isLoading = writable(false);
export const error = writable(null);
```

### Component Communication
Event dispatching for parent-child communication:

```svelte
<ForecastItem
  on:toggle={handleToggleForecast}
  isActive={activeForecastIndex === index}
/>
```

### Reactive Statements
Automatic updates with Svelte's reactivity:

```svelte
$: isVisible = !!$weatherData && !$isLoading && !$error;
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

The app is tested using the same Playwright test suite as other framework implementations:

```bash
# Run tests for Svelte app
npm run test -- --config=playwright-svelte.config.js
```

## Mock Data Support

Supports mock data for testing and development:
- Add `?mock=true` to URL for mock mode
- Automatically detects test environments
- Uses static JSON files for consistent testing

## Build Output

- **Static site** optimized for deployment
- **Code splitting** for optimal loading
- **Asset optimization** and compression
- **Modern JS** with fallbacks

## Deployment

Built as a static site that can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

The build outputs to the `build/` directory with all necessary static assets.