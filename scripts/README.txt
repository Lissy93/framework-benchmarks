===============================================================================
=========================== 📜 SCRIPT USAGE GUIDE  ============================
===============================================================================

🐍 Python setup:
  pip install -r scripts/requirements.txt

🚀 How to run scripts:
  python scripts/<dir>/<script>.py [options]

🔧 Configuration:
  frameworks.json - Framework definitions and metadata  
  config.json - Project settings and configuration

📖 Getting help:
  For detailed docs on any script, add the --help flag
  Or, run `npm run help` for a full list of commands

===============================================================================
========================== 📋 ESSENTIAL COMMANDS  =============================
===============================================================================

┌─ Setup & Installation ─┬────────────────────────────────────────────────────┐
│ npm run setup          │ Complete project setup (install, build, sync)      │
└────────────────────────┴────────────────────────────────────────────────────┘

┌─ Build & Serve ────────┬────────────────────────────────────────────────────┐
│ npm run build          │ Build all framework applications                   │
│ npm start              │ Start production server (all frameworks)           │
└────────────────────────┴────────────────────────────────────────────────────┘

┌─ Verification & Testing ────────────────────────────────────────────────────┐
│ npm test               │ Run all tests                                      │
│ npm run lint           │ Lint all applications                              │
│ npm run check          │ Check project setup                                │
└────────────────────────┴────────────────────────────────────────────────────┘

┌─ Performance & Analysis ────────────────────────────────────────────────────┐
│ npm run benchmark all          │ Run all benchmarks                         │
│ npm run benchmark lighthouse   │ Google Lighthouse performance audits       │
│ npm run benchmark bundle-size  │ Bundle size analysis with compression      │
│ npm run benchmark source       │ Source code complexity & maintainability   │
└─────────────────────────────────────────────────────────────────────────────┘


===============================================================================
=========================== 📂 DIRECTORY LISTING  =============================
===============================================================================

╭───────────────────────────────────────────────────────────────────────────╮
│ File structure and usage summary                                          │
├───────────────────────────────────────────┬───────────────────────────────┤
├── main.py                                 │ Main entry point - help/info  │
├── common.py                               │ Shared utilities & config     │
├── setup/ - PROJECT SETUP & INITIALIZATION │                               │
│ ├── main.py                               │ Complete setup - run all      │
│ ├── generate_scripts.py                   │ Generate package.json scripts │
│ ├── generate_mocks.py                     │ Create realistic weather data │
│ ├── sync_assets.py                        │ Copy assets to all apps       │
│ ╰── install_deps.py                       │ Install all dependencies      │
├── run/ - BUILD & SERVE APPLICATIONS       │                               │
│ ├── build.py                              │ Build all framework apps      │
│ ├── serve.py                              │ Production server (Flask)     │
│ ├── index.html                            │ Server UI template            │
│ ╰── error.html                            │ Server error page template    │
├── verify/ - QUALITY ASSURANCE & VALIDATION│                               │
│ ├── main.py                               │ Run all verification tasks    │
│ ├── check.py                              │ Verify setup & dependencies   │
│ ├── test.py                               │ Execute all e2e + unit tests  │
│ ├── lint.py                               │ Lint all apps with reporting  │
│ ├── validate_schemas.py                   │ Validate JSON schemas         │
│ ├── frameworks-schema.json                │ Schema for frameworks.json    │
│ ╰── config-schema.json                    │ Schema for config.json        │
├── benchmark/ - PERFORMANCE & ANALYSIS     │                               │
│ ├── main.py                               │ Main benchmark CLI interface  │
│ ├── lighthouse.py                         │ Google Lighthouse performance │
│ ├── bundle_size.py                        │ Bundle size analysis          │
│ ├── source_analysis.py                    │ Source code complexity        │
│ ├── base.py                               │ Base benchmark runner class   │
│ ╰── chrome_launcher.py                    │ Chrome browser management     │
╰───────────────────────────────────────────┴───────────────────────────────╯
