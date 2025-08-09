
╭────────────────────────────────┬────────────────────────────────────────────╮
│ Directory Tree                 │ Description                                │
├────────────────────────────────┼────────────────────────────────────────────┤
│ ├── setup                     │ Project setup / initialization scripts      │
│ │   ├── main.py               │ Complete project setup - run all tasks      │
│ │   ├── generate_scripts.py   │ Generate npm scripts from frameworks.json   │
│ │   ├── generate_mocks.py     │ Create realistic mock weather data          │
│ │   ╰── sync_assets.py        │ Copy shared assets to all framework apps    │
│ ├── common.py                 │ Shared utilities and configuration helpers  │
│ ├── verify                    │ Scripts to ensure everything is working     │
│ │   ├── check.js              │ Verify project setup and dependencies       │
│ │   ├── test.js               │ Execute all e2e + unit tests for all apps   │
│ │   ╰── lint.js               │ Lint all apps with reporting                │
│ ├── collect                   │                                             │
│ │   ╰── measure-complexity.py │                                             │
│ ╰── utils.js                  │                                             │
╰───────────────────────────────┴─────────────────────────────────────────────╯

How to Run Scripts:
  python scripts/setup/<script>.py  - Run individual setup script
  npm run <script-name>             - Run via npm (recommended)
  
  # Other scripts  
  node scripts/<dir>/<file>         - Run Node.js scripts (verify, etc.)

Examples:
  npm run setup:all               - Complete project setup (all tasks)
  npm run sync-assets             - Copy shared assets to all apps
  npm run generate-mocks          - Generate realistic weather mock data
  npm run generate-scripts        - Update package.json scripts
  
  python scripts/setup/main.py    - Direct Python execution (same as npm run setup:all)
  python scripts/setup/sync_assets.py - Direct asset sync execution
  node scripts/verify             - Validates project, runs tests and lint checks

