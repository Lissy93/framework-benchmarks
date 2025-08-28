# Troubleshooting

### "Unable to connect to Chrome"
- Ensure Chrome/Chromium is installed
- Try installing: `sudo apt install chromium-browser`
- For WSL, make sure X11 forwarding is configured

### Server not running
- Start with: `npm start`
- Verify server health: `npm run benchmark server-check`

### Framework not found
- Check framework is built: `npm run build:react`
- Verify server shows framework: http://127.0.0.1:3000/

### Inconsistent benchmark results
- Use `--executions 3` or higher for more stable averages
- Statistical analysis helps identify result variability
- Cache clearing between runs improves accuracy

### Bundle size analysis fails
- Ensure frameworks are built: `npm run build:react`, `npm run build:vue`, etc.
- Check that `dist/` or `build/` directories exist in framework folders
- Verify build output contains JavaScript/CSS files

### Source analysis fails
- Ensure framework directories exist in `apps/` folder
- Check that `src/` directories contain source files
- Verify source files have supported extensions (.js, .jsx, .ts, .tsx, .vue, .svelte, etc.)

### Build time measurement fails
- Ensure Node.js dependencies are installed: `npm install` in each framework directory
- Check that framework directories exist in `apps/` folder
- Verify build commands are correct in `frameworks.json`
- For build timeout errors: increase timeout (currently 5 minutes) or optimize build process
- Check disk space if backup/restore operations fail

### Dev server measurement fails
- Ensure Node.js dependencies are installed: `npm install` in each framework directory
- Check that dev server ports are available (not in use by other processes)
- Verify dev commands are correct in `frameworks.json`
- For startup timeout errors: check framework-specific setup requirements
- Ensure source files exist for HMR testing

### Resource monitoring fails
- Ensure server is running: `npm start` and verify with `npm run benchmark server-check`
- Install Python dependencies: `pip install psutil websockets requests`
- Check system permissions for process monitoring
- For WSL/Linux: ensure browser processes are accessible
- For enhanced monitoring: launch Chrome with `--remote-debugging-port=9222`
