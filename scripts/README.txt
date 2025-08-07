
╭────────────────────────────────┬─────────────────────────────────────────────╮
│ Directory Tree                 │ Description                                 │
├────────────────────────────────┼─────────────────────────────────────────────┤
│ ├── setup                      │ Project setup / initialization scripts      │
│ │   ├── initial-setup.js       │ Complete project initialization             │
│ │   ├── generate-scripts.js    │ Generate npm scripts for each frameworks    │
│ │   ├── generate-mocks.js      │ Create mock API data for testing            │
│ │   ╰── sync-assets.js         │ Copy shared assets to each app              │
│ ├── verify                     │ Scripts to ensure everything is working     │
│ │   ├── check.js               │ Verify project setup and dependencies       │
│ │   ├── test.js                │ Execute all e2e + unit tests for all apps   │
│ │   ╰── lint.js                │ Lint all apps with reporting                │
│ ├── collect                    │                                             │
│ │   ╰── measure-complexity.py  │                                             │
│ ╰── utils.js                   │                                             │
╰────────────────────────────────┴─────────────────────────────────────────────╯

How to Run Scripts:
  node scripts/<dir>/<file> - Run a specific script (see above)
  node scripts/<path>       - Run a collection <setup|verify|collect|analyze>

Examples:
  node scripts/verify       - Validates project, runs tests and lint checks
  node scripts/verify/test  - Executes test suite for all apps
