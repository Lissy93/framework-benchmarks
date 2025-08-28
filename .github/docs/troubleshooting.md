# Troubleshooting

This guide covers common issues you might encounter and how to resolve them.

## Setup Issues

**Permission denied errors during npm install**
Run with sudo if needed: `sudo npm install`. On Windows, run terminal as administrator.

**Python command not found**
Ensure Python 3.8+ is installed and available as `python` or `python3`. Install from python.org or use your system package manager.

**Git clone fails with permission errors**
Use HTTPS instead of SSH: `git clone https://github.com/lissy93/framework-benchmarks.git`

**Setup hangs or times out**
This usually happens during npm install for frameworks. Wait for completion (can take 10+ minutes) or check your network connection.

## Build Issues

**Individual framework build fails**
Check the specific framework's logs. Common causes:
- Missing dependencies (run `npm install` in the framework directory)
- Node.js version compatibility (ensure Node.js 18+)
- Disk space issues (each build needs ~100MB)

**Angular build fails with memory errors**
Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=4096" npm run build:angular`

**Build output directory not found**
Different frameworks use different output directories. Check `apps/{framework}/dist/` or `apps/{framework}/build/`.

## Server Issues

**Port 3000 already in use**
Kill the existing process: `pkill -f ":3000"` or use a different port with `npm start -- --port 3001`

**Framework shows 404 or not found**
Ensure the framework is built first with `npm run build:{framework}` before starting the server.

**Server starts but frameworks don't load**
Check that build outputs exist in the correct directories. Run `ls apps/{framework}/dist/` to verify.

## Benchmark Issues

**Chrome not found for Lighthouse**
Install Chrome or Chromium:
- Ubuntu/Debian: `sudo apt install chromium-browser`
- macOS: Install Chrome from google.com/chrome
- Windows: Install Chrome from google.com/chrome

**Benchmark results are inconsistent**
Use multiple executions for more reliable results: `python scripts/benchmark/main.py all --executions 3`

**Bundle size analysis shows zero**
The frameworks need to be built first: `npm run build` before running bundle analysis.

**Lighthouse fails with connection errors**
Ensure the server is running (`npm start`) and accessible at `http://localhost:3000` before running benchmarks.

## Docker Issues

**Docker build fails**
Ensure you have sufficient disk space (build needs ~2GB) and Docker is running.

**Container starts but benchmarks fail**
Use the correct Chrome flags for containers: `CHROME_FLAGS='--no-sandbox --disable-dev-shm-usage --headless'`

## General Tips

**Check logs** - Most scripts provide detailed error messages. Read them carefully for specific guidance.

**Clean and retry** - Try `npm run clean` followed by a fresh setup if builds are behaving unexpectedly.

**Check dependencies** - Ensure all system requirements (Node.js 18+, Python 3.8+, Chrome) are installed and up to date.

**Disk space** - The full project with all frameworks built needs ~5GB of disk space.
