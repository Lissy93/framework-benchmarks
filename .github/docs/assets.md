# Assets

Shared resources ensuring consistency across frameworks.

## Structure

**Icons:** `assets/icons/`
- Weather condition icons (sunny, rainy, cloudy, etc.)
- App icons and favicons
- Framework logos and badges
- SVG format for scalability

**Styles:** `assets/styles/`  
- CSS custom properties (colors, typography)
- Shared component styles
- Design system tokens
- Theme definitions

**Mock Data:** `assets/mocks/`
- Weather API responses
- Location databases
- Error scenarios
- Test data variations

## Sync Process

**Script:** `scripts/setup/sync_assets.py`
- Copies assets to all framework directories
- Maintains consistent branding
- Preserves framework-specific customizations
- Updates on asset changes

**Target locations:**
- `apps/{framework}/public/` - Static assets
- `apps/{framework}/src/assets/` - Source assets
- `apps/{framework}/src/mocks/` - Mock data

## Asset Types

### Design System
**Colors:** Consistent palette across frameworks
- Primary/secondary brand colors
- Weather condition colors
- UI state colors (error, success, warning)
- Neutral grays and backgrounds

**Typography:** Font definitions
- Font family selections
- Size scales and line heights
- Weight variations
- Responsive scaling

**Spacing:** Layout consistency
- Margin/padding scales
- Grid systems
- Component spacing
- Responsive breakpoints

### Weather Icons
**Conditions:** Complete weather icon set
- Clear/sunny conditions
- Cloudy variations
- Rain and snow
- Storm conditions
- Wind indicators

**Formats:** Multiple formats for framework compatibility
- SVG for modern frameworks
- PNG fallbacks
- Icon fonts where needed
- Accessibility considerations

### Mock Data
**Realistic responses:** Comprehensive weather data
- Current conditions
- Forecasts (hourly/daily)
- Location information
- Weather alerts

**Error scenarios:** Testing edge cases
- Network failures
- Invalid locations  
- Service unavailable
- Timeout conditions

## Framework Integration

**React/Preact:** JSX-compatible assets
**Vue:** Vue template integration
**Angular:** Angular asset pipeline
**Svelte:** Svelte asset handling
**Others:** Standard web asset patterns

Assets are adapted for each framework's build system while maintaining visual consistency.