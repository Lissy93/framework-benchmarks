# Framework Applications

This project contains the same weather application built using 12 different JavaScript frameworks. Each implementation provides identical functionality but uses the specific patterns and approaches of its framework.

## Available Frameworks

The project includes implementations for:

**React** - Component-based with hooks and modern React patterns
**Vue** - Built with Vue 3 and the Composition API
**Svelte** - Compiled framework with reactive statements
**Angular** - Full TypeScript application with services and components
**Qwik** - Resumable framework optimized for performance
**Solid.js** - Fine-grained reactivity without virtual DOM
**Preact** - Lightweight alternative to React
**jQuery** - Classic DOM manipulation approach
**Alpine.js** - Minimal framework with HTML-first approach
**Lit** - Web Components with efficient updates
**VanJS** - Ultra-small vanilla framework
**Vanilla** - Pure JavaScript without any framework

Each app lives in its own directory under `apps/{framework}/` and can be developed, built, and tested independently.

## Common Features

**Weather Search:** Location-based weather lookup
**Current Conditions:** Temperature, humidity, wind speed
**Forecasts:** Hourly and daily predictions
**Weather Icons:** Visual condition indicators
**Responsive Design:** Mobile and desktop layouts
**Error Handling:** Network and API error states
**Loading States:** Progress indicators during data fetch

## Architecture

### Standard Structure
```
apps/{framework}/
├── src/
│   ├── components/    # UI components
│   ├── services/      # Weather API service
│   ├── utils/         # Helper functions
│   ├── styles/        # Framework-specific styles
│   └── mocks/         # Test data
├── public/            # Static assets
├── package.json       # Dependencies and scripts
└── dist/             # Built output
```

### Shared Logic
**Weather Service:** API integration with error handling
**Data Formatting:** Consistent temperature, date, and text formatting  
**Mock Integration:** Development and testing data
**State Management:** Framework-appropriate state patterns

### Framework-Specific Patterns
**Component Architecture:** Each framework uses its preferred component model
**State Management:** Built-in state vs external libraries
**Styling Approach:** CSS modules, styled-components, framework styles
**Build Tools:** Vite, Webpack, framework CLIs

## Development

### Individual Development
```bash
npm run dev:{framework}  # Start individual dev server
npm run build:{framework} # Build individual framework
npm run test:{framework}  # Test individual framework
```

### Consistency Validation
All apps maintain:
- Identical user interfaces
- Same API integration points
- Consistent behavior patterns
- Matching accessibility features
- Similar performance characteristics

## Comparison Focus

**Bundle Size:** Production build sizes
**Performance:** Runtime speed and efficiency
**Developer Experience:** Build times, HMR, debugging
**Code Maintainability:** Complexity and readability
**Learning Curve:** Framework-specific concepts
**Ecosystem:** Available libraries and tooling
