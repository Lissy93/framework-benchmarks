# Weather App Testing Guide

This document explains how to run and maintain the comprehensive test suite for the Weather Front project.

## 🧪 Test Structure

The project includes both **unit tests** and **end-to-end (E2E) tests**:

```
tests/
├── unit/                          # Unit tests (Node.js)
│   ├── weather-service.test.js    # API service tests
│   ├── weather-app.test.js        # App logic tests
│   └── run-unit-tests.js          # Unit test runner
├── e2e/                          # Advanced E2E tests
│   └── weather-app-advanced.test.js
├── config/                       # Playwright configs (one per framework)
├── weather-app.test.js           # Core E2E tests
├── test-helpers.js              # Shared test utilities
└── .env.example                 # Test configuration template
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Install Playwright and browsers
npm install
npm run install:playwright
```

### 2. Start the Development Server

```bash
# Start vanilla JS app on localhost:3000
npm run dev:vanilla
```

### 3. Run Tests

#### Run All Tests
```bash
npm run test:all          # Unit + E2E tests
```

#### Run Unit Tests Only
```bash
npm run test:unit         # Fast JavaScript unit tests
```

#### Run E2E Tests Only
```bash
npm run test             # All E2E tests (headless)
npm run test:headed      # E2E tests with browser UI
npm run test:ui          # Interactive test runner
```

#### Debug Tests
```bash
npm run test:debug       # Debug mode with DevTools
```

#### View Test Reports
```bash
npm run test:report      # Open HTML test report
```

## 📋 Test Categories

### Unit Tests (Node.js)
- **Fast execution** (~5 seconds)
- **No browser required**
- Tests individual functions and modules
- **Weather Service**: API calls, data transformation, error handling
- **Weather App Logic**: DOM manipulation, state management

### E2E Tests (Playwright)
- **Real browser testing** (Chrome, Firefox, Safari)
- **User interaction testing**
- **Cross-device testing** (desktop, mobile, tablet)
- **Network condition testing**
- **Performance testing**

## 🎯 Test Coverage

### Core Functionality ✅
- [x] Initial app loading
- [x] City search functionality
- [x] Weather data display
- [x] 7-day forecast
- [x] Error handling
- [x] Loading states
- [x] LocalStorage persistence

### Advanced Features ✅
- [x] Forecast item expansion/collapse
- [x] Responsive design
- [x] Keyboard navigation
- [x] Form validation
- [x] Network error handling
- [x] Rate limiting handling
- [x] Special characters in city names

### Performance ✅
- [x] Load time < 2 seconds
- [x] Large data handling
- [x] Rapid interaction handling
- [x] Memory usage optimization

### Accessibility ✅
- [x] Proper heading structure
- [x] Form labels and ARIA attributes
- [x] Keyboard navigation
- [x] Focus management

## 🛠 Writing New Tests

### Unit Test Example
```javascript
runner.test('should validate input correctly', async () => {
  const service = createWeatherService();
  
  try {
    await service.getWeatherByCity('');
    throw new Error('Should have thrown an error');
  } catch (error) {
    if (!error.message.includes('required')) {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
});
```

### E2E Test Example
```javascript
test('should search for weather data', async ({ page }) => {
  const helpers = new WeatherAppHelpers(page);
  
  await helpers.navigateToApp();
  await helpers.searchForCity('London');
  await helpers.waitForWeatherData();
  await helpers.assertLocationDisplayed('London');
});
```

## 🔧 Test Configuration

### Browser Testing
Tests run on multiple browsers and devices:
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Pixel 5, iPhone 12

### API Mocking
All tests use mocked APIs to ensure:
- **Consistent test data**
- **Fast execution**
- **No external dependencies**
- **Predictable error scenarios**

### Environment Variables
Copy `tests/.env.example` to `tests/.env` to customize:
- Test timeouts
- Browser settings
- Performance thresholds
- Debug options

## 📊 Continuous Integration

### GitHub Actions Ready
```yaml
- name: Run Tests
  run: |
    npm run test:unit
    npm run test:ci
```

### Test Reports
- **HTML Report**: Visual test results with screenshots
- **JSON Report**: Machine-readable results
- **JUnit XML**: CI integration format

## 🐛 Debugging Failed Tests

### 1. Run in Headed Mode
```bash
npm run test:headed
```

### 2. Use Debug Mode
```bash
npm run test:debug
```

### 3. Check Screenshots
Failed tests automatically capture screenshots in `test-results/`

### 4. View Trace Files
Playwright traces show step-by-step execution:
```bash
npx playwright show-trace test-results/trace.zip
```

## 📈 Performance Monitoring

Tests include performance assertions:
- **Page load time**: < 2 seconds
- **Data rendering**: < 1 second
- **Search response**: < 3 seconds

## ✅ Test Quality Standards

### All Tests Must:
1. **Be deterministic** - Same result every time
2. **Be isolated** - No dependencies between tests
3. **Be fast** - Unit tests < 100ms, E2E tests < 30s
4. **Test real scenarios** - Based on actual user workflows
5. **Include error cases** - Test failure paths
6. **Be maintainable** - Clear, documented code

### Test Naming Convention
- **Unit**: `should [expected behavior] when [condition]`
- **E2E**: `should [user action] and [expected outcome]`

## 🔄 Framework Compatibility

These tests are designed to work across all planned framework implementations:
- ✅ **Vanilla JS** (current)
- 🔄 **React** (planned)
- 🔄 **Vue** (planned)
- 🔄 **Svelte** (planned)
- 🔄 **Angular** (planned)

The same test suite will verify consistent behavior across all implementations.

---

## 📞 Support

If tests fail or you need help:
1. Check this README
2. Review test output and screenshots
3. Run tests in debug mode
4. Check [GitHub Issues](https://github.com/lissy93/framework-benchmarks/issues)

**Happy Testing! 🎉**
