# Tests

Cross-framework testing with E2E and unit tests.

## Structure

**Config:** `tests/config/`
- Framework-specific Playwright configs
- `playwright.config.base.js` - Shared settings
- Individual configs for all 12 frameworks

**E2E Tests:** `tests/e2e/`  
- `weather-app-advanced.test.js` - Comprehensive interaction testing
- Weather search functionality
- UI component interactions
- Error handling scenarios
- Mock API integration

**Unit Tests:** `tests/unit/`
- `weather-app.test.js` - App logic testing
- `weather-service.test.js` - Service layer testing  
- `test-runner.js` - Custom test execution
- Framework-agnostic testing

## Running Tests

```bash
# All frameworks
npm run test:all

# Individual frameworks  
npm run test:react
npm run test:vue
npm run test:angular
# etc...

# Specific test types
npm run test -- --grep "weather search"
```

## Test Features

### E2E Testing
**Playwright-based:** Reliable browser automation
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile device simulation
- Network condition testing
- Screenshot comparisons

**Scenarios:**
- Search functionality with various locations
- Weather data display and formatting
- Error states and loading indicators
- Responsive design validation
- Accessibility testing

### Unit Testing  
**Framework-agnostic:** Tests shared logic
- Weather service API calls
- Data formatting utilities
- Business logic validation
- Mock data handling

### Mock Integration
**Realistic data:** Consistent across frameworks
- Weather API responses
- Error scenarios
- Edge cases (extreme temperatures, etc.)
- Location-based variations

## Test Configuration

**Shared config:** Common Playwright settings
- Timeouts and retries
- Browser configurations  
- Test data management
- Reporter settings

**Framework-specific:** Individual customizations
- Build process integration
- Dev server management
- Framework-specific selectors
- Performance thresholds

## Reporting

**Console output:** Real-time test results
**HTML reports:** Detailed test reports with screenshots
**CI integration:** GitHub Actions workflow integration
**Performance metrics:** Load time measurements