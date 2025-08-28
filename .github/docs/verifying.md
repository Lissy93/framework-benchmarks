# Verifying

Quality assurance through testing, linting, and validation.

## Scripts

**Main:** `scripts/verify/main.py`
- Run: `npm run verify` or `python scripts/verify/main.py`
- Orchestrates all verification tasks
- Supports individual task selection

**Components:**
- `check.py` - Project setup validation
- `test.py` - E2E and unit test execution  
- `lint.py` - Code quality enforcement
- `validate_schemas.py` - JSON schema validation

## Usage

```bash
# Full verification suite
npm run verify

# Individual tasks
npm run test
npm run lint  
npm run check

# Skip specific tasks
npm run verify -- --skip-test --skip-lint
```

## Testing

**E2E Tests:** Playwright-based cross-framework testing
- Weather app interactions
- Mock API integration
- Screenshot comparison
- Performance regression

**Unit Tests:** Framework-agnostic logic testing
- Weather service functionality
- Utility functions
- Component behavior

## Linting

ESLint with framework-specific configs:
- React/Preact: JSX, hooks rules
- Vue: Vue-specific linting  
- Angular: TypeScript + Angular rules
- Svelte: Svelte-specific rules
- Standard JS rules for vanilla frameworks

## Validation

Schema validation for:
- `config.json` - Project configuration
- `frameworks.json` - Framework definitions
- Benchmark result formats