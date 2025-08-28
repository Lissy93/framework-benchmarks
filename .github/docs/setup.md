# Setup

Complete project initialization and maintenance.

## Quick Start

```bash
npm run setup
```

Runs all setup tasks automatically.

## Manual Setup

### Dependencies
**Script:** `scripts/setup/install_deps.py`
- Run: `python scripts/setup/install_deps.py`
- Installs Node.js deps for all 12 frameworks
- Handles npm/yarn package management  
- Validates successful installations
- Shows progress per framework

### Assets
**Script:** `scripts/setup/sync_assets.py`
- Run: `python scripts/setup/sync_assets.py`
- Copies shared assets to all frameworks:
  - Icons and logos
  - CSS variables and styles
  - Mock weather data
  - Design system components
- Preserves framework-specific customizations
- Maintains consistent branding

### Mock Data
**Script:** `scripts/setup/generate_mocks.py`
- Run: `python scripts/setup/generate_mocks.py`
- Creates realistic weather API responses
- Uses configurable seed for reproducible results
- Generates location-specific patterns
- Temperature, humidity, wind data
- Multiple weather conditions

### Scripts
**Script:** `scripts/setup/generate_scripts.py`  
- Run: `python scripts/setup/generate_scripts.py`
- Auto-generates npm scripts in each framework's package.json
- Creates consistent dev/build/test/lint commands
- Handles framework-specific variations
- Updates package.json files automatically

## Setup Tasks

**Complete setup:** All tasks in sequence
**Selective setup:** Skip tasks with flags:
```bash
npm run setup -- --skip-deps --skip-mocks
```

**Fresh setup:** Clean install from scratch
**Maintenance:** Re-run to sync changes

## Directory Structure

After setup:
- `apps/{framework}/node_modules/` - Dependencies
- `apps/{framework}/public/` - Shared assets  
- `apps/{framework}/src/mocks/` - Mock data
- Updated package.json scripts in each framework