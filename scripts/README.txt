╔══════════════════════════════════════════════════════════════════════════════╗
║     __        __         _   _                 _____                _        ║
║     \ \      / /__  __ _| |_| |__   ___ _ __  |  ___| __ ___  _ __ | |_      ║
║      \ \ /\ / / _ \/ _` | __| '_ \ / _ \ '__| | |_ | '__/ _ \| '_ \| __|     ║
║       \ V  V /  __/ (_| | |_| | | |  __/ |    |  _|| | | (_) | | | | |_      ║
║        \_/\_/ \___|\__,_|\__|_| |_|\___|_|    |_|  |_|  \___/|_| |_|\__|     ║
╟──────────────────────────────────────────────────────────────────────────────╢
║ Scripts to setup, verify, run and execute the benchmarking jobs for all apps ║
╚══════════════════════════════════════════════════════════════════════════════╝


╭───────────────────────────────┬─────────────────────────────────────────────╮
│ Directory Tree                │ Description                                 │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ ├── setup                     │ Project setup / initialization scripts      │
│ │   ├── main.py               │ Complete project setup - run all tasks      │
│ │   ├── generate_scripts.py   │ Generate npm scripts from frameworks.json   │
│ │   ├── generate_mocks.py     │ Create realistic mock weather data          │
│ │   ╰── sync_assets.py        │ Copy shared assets to all framework apps    │
│ ├── verify                    │ Scripts to ensure everything is working     │
│ │   ├── main.py               │ Run all verification tasks                  │
│ │   ├── check.py              │ Verify project setup and dependencies       │
│ │   ├── test.py               │ Execute all e2e + unit tests for all apps   │
│ │   ╰── lint.py               │ Lint all apps with reporting                │
│ ├── collect                   │                                             │
│ │   ╰── measure-complexity.py │                                             │
│ ╰── common.py                 │ Shared utilities and configuration helpers  │
╰───────────────────────────────┴─────────────────────────────────────────────╯

How to Run Scripts:
  python scripts/<dir>/<script>.py

