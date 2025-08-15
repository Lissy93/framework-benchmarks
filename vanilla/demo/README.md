# Weather App - Vanilla JavaScript

A minimal weather application built with vanilla JavaScript, HTML, and CSS.

## Features

- **Current Weather**: Detailed breakdown of current conditions
- **7-Day Forecast**: Clickable cards showing daily weather summary
- **Responsive Design**: Desktop side-by-side, mobile stacked layout
- **Location Search**: Input validation and error handling
- **Persistence**: Remembers last searched location
- **Accessibility**: Semantic HTML, keyboard navigation, ARIA labels
- **Modal Details**: Click forecast cards for detailed information

## Getting Started

1. **Run development server**:
   ```bash
   npm run dev
   ```

2. **Open in browser**:
   ```
   http://localhost:3000
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

## Project Structure

```
vanilla/
├── index.html          # Main HTML file
├── styles.css          # App-specific styles
├── js/
│   ├── weather-app.js     # Main application logic
│   ├── weather-service.js # API service layer
│   └── weather-utils.js   # Utility functions
└── public/
    └── assets/            # Shared assets (styles, mocks)
```

## Technical Implementation

- **ES6 Classes**: Modern JavaScript architecture
- **Fetch API**: Async data fetching with error handling
- **LocalStorage**: Location persistence
- **CSS Grid/Flexbox**: Responsive layout
- **Semantic HTML**: Accessibility compliance
- **Event Delegation**: Efficient event handling

## Data Sources

- **Live**: [Open-Meteo API](https://open-meteo.com)
- **Mock**: Local JSON for development/testing
- **Geocoding**: Open-Meteo Geocoding API

## Browser Support

- Modern browsers with ES6+ support
- Chrome 60+, Firefox 55+, Safari 12+, Edge 79+