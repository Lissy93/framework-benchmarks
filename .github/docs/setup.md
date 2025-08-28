# Setup

This guide covers setting up the project from scratch or maintaining an existing installation.

## Quick Start

```bash
git clone https://github.com/lissy93/framework-benchmarks.git
cd framework-benchmarks
npm install
pip install -r scripts/requirements.txt
npm run setup
```

This runs all setup tasks automatically and prepares the project for development.

## What Setup Does

The setup process handles four main tasks:

**Install Dependencies** - Installs Node.js packages for all framework applications. This can take several minutes as it processes each framework individually.

**Sync Assets** - Copies shared assets (icons, styles, mock data) to all frameworks while preserving framework-specific customizations.

**Generate Mock Data** - Creates realistic weather API responses for development and testing. Uses a consistent seed for reproducible results.

**Generate Scripts** - Auto-generates npm scripts in each framework's package.json file, ensuring consistent dev/build/test/lint commands across all applications.

## Manual Setup Steps

If you prefer to run setup steps individually:

```bash
# Install dependencies for all frameworks
python scripts/setup/install_deps.py

# Copy shared assets to all frameworks  
python scripts/setup/sync_assets.py

# Generate mock weather data
python scripts/setup/generate_mocks.py

# Update package.json scripts
python scripts/setup/generate_scripts.py
```

## Prerequisites

Before running setup, ensure you have:
- Node.js 18+ and npm
- Python 3.8+ and pip
- Git for cloning the repository

## Common Issues

**Permission errors** - Use sudo if needed for global npm packages
**Network timeouts** - Retry setup if npm installs fail
**Python errors** - Install Python dependencies with `pip install -r scripts/requirements.txt`
**Disk space** - Each framework needs ~200MB for node_modules

After setup, each framework directory will have its dependencies installed and be ready for development.