
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
│ │   ├── main.py               │ Run all verification tasks                   │
│ │   ├── check.py              │ Verify project setup and dependencies       │
│ │   ├── test.py               │ Execute all e2e + unit tests for all apps   │
│ │   ╰── lint.py               │ Lint all apps with reporting                │
│ ├── collect                   │                                             │
│ │   ╰── measure-complexity.py │                                             │
│ ╰── utils.js                  │                                             │
╰───────────────────────────────┴─────────────────────────────────────────────╯

How to Run Scripts:
  # Setup scripts (modern Python with Rich UI)
  python scripts/setup/<script>.py   - Run individual setup script
  python scripts/verify/<script>.py  - Run individual verify script
  npm run <script-name>              - Run via npm (recommended)
  
  # Other scripts  
  node scripts/<dir>/<file>          - Run Node.js scripts (performance, etc.)

Examples:
  # Setup tasks
  npm run setup:all               - Complete project setup (all tasks)
  npm run sync-assets             - Copy shared assets to all apps
  npm run generate-mocks          - Generate realistic weather mock data
  npm run generate-scripts        - Update package.json scripts
  
  # Verification tasks  
  npm run verify                  - Complete verification (check + test + lint)
  npm run check                   - Verify project setup and dependencies
  npm run test                    - Execute all e2e + unit tests for all apps
  npm run lint                    - Lint all apps with reporting
  
  # Direct Python execution
  python scripts/setup/main.py    - Direct Python execution (same as npm run setup:all)
  python scripts/verify/main.py   - Direct Python execution (same as npm run verify)

