# Weather App - Angular Implementation

A modern Angular 17+ implementation of the weather application with identical functionality to the vanilla JavaScript version.

## Features

- ✅ **Angular 17+** with standalone components
- ✅ **Modern Angular patterns** with signals-ready architecture
- ✅ **Reactive programming** with RxJS observables
- ✅ **Identical UI/UX** to vanilla JavaScript version
- ✅ **State management** with services and observables
- ✅ **TypeScript** for type safety and better developer experience
- ✅ **Dependency injection** for clean architecture
- ✅ **Accessibility compliant** with proper ARIA labels and keyboard navigation
- ✅ **Responsive design** that works on all devices
- ✅ **localStorage persistence** for search history
- ✅ **Mock data support** for testing

## Architecture

### Components (Standalone)
- **AppComponent** - Main application component with reactive state management
- **SearchFormComponent** - Search input with template-driven forms
- **CurrentWeatherComponent** - Current weather display with detailed metrics
- **ForecastComponent** - 7-day forecast container with state management
- **ForecastItemComponent** - Individual forecast day with event handling
- **LoadingStateComponent** - Loading indicator with Angular animations
- **ErrorStateComponent** - Error message display
- **WeatherContentComponent** - Weather content wrapper with conditional rendering

### Services
- **WeatherService** - HTTP service for weather data fetching with RxJS
- **WeatherStateService** - Centralized state management with BehaviorSubject

### Types
- **weather.types.ts** - TypeScript interfaces for type safety

### Utils
- **WeatherUtils** - Utility functions for formatting and weather codes

## Modern Angular Best Practices

1. **Standalone Components** - All components are standalone, no NgModule required
2. **Reactive Programming** - RxJS observables for data flow and state management
3. **TypeScript Interfaces** - Strong typing for all data structures
4. **Dependency Injection** - Services injected with `providedIn: 'root'`
5. **OnPush Change Detection** - Optimized for performance (ready for signals)
6. **Proper Lifecycle Management** - OnDestroy with takeUntil pattern
7. **Error Handling** - Comprehensive error handling with RxJS operators
8. **HTTP Client** - Modern HttpClient with observables
9. **Template-driven Forms** - Angular forms for user input
10. **Accessibility** - ARIA labels, keyboard navigation, semantic HTML

## Performance Optimizations

1. **Standalone Components** - Tree-shakable, smaller bundle size
2. **OnDestroy Pattern** - Prevents memory leaks with subscription cleanup
3. **BehaviorSubject** - Efficient state management with reactive updates
4. **HTTP Caching** - Efficient API calls with RxJS operators
5. **Change Detection** - Optimized with proper data flow patterns

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Testing

The Angular app passes the same test suite as the vanilla JavaScript version:

```bash
# Run tests from the project root
npx playwright test --config=playwright-angular.config.js
```

## Project Structure

```
src/
├── app/
│   ├── components/           # Standalone components
│   │   ├── app.component.ts
│   │   ├── search-form.component.ts
│   │   ├── current-weather.component.ts
│   │   ├── forecast.component.ts
│   │   ├── forecast-item.component.ts
│   │   ├── loading-state.component.ts
│   │   ├── error-state.component.ts
│   │   └── weather-content.component.ts
│   ├── services/             # Injectable services
│   │   ├── weather.service.ts
│   │   └── weather-state.service.ts
│   ├── types/                # TypeScript interfaces
│   │   └── weather.types.ts
│   └── utils/                # Utility functions
│       └── weather.utils.ts
├── main.ts                   # Bootstrap application
└── index.html               # Main HTML template
```

## State Management

The app uses a reactive state management pattern:

```typescript
// Centralized state with BehaviorSubject
private stateSubject = new BehaviorSubject<AppState>({
  weatherData: null,
  isLoading: false,
  error: null
});

// Observable state stream
public state$ = this.stateSubject.asObservable();
```

Components subscribe to state changes and react accordingly:

```typescript
ngOnInit(): void {
  this.weatherStateService.state$
    .pipe(takeUntil(this.destroy$))
    .subscribe(state => {
      this.state = state;
    });
}
```

## Browser Support

- Modern browsers with ES2022+ support
- Angular 17+ requirements
- Same responsive design as vanilla version
- Optimized bundle size with standalone components

## Key Angular Features Used

- **Standalone Components** - Modern Angular architecture
- **RxJS Observables** - Reactive programming patterns
- **HttpClient** - Modern HTTP service
- **Dependency Injection** - Clean service architecture
- **TypeScript** - Type safety and developer experience
- **Template Syntax** - Angular's powerful templating
- **Event Binding** - Reactive event handling
- **Property Binding** - Data binding patterns
- **Structural Directives** - *ngIf, *ngFor for conditional rendering
- **Lifecycle Hooks** - OnInit, OnDestroy, AfterViewInit