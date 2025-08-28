# 🐳 Docker Guide for Framework Benchmarks

This guide explains how to run the Framework Benchmarks project using Docker.

## 🚀 Quick Start

### Using Published Image (Recommended)

```bash
# Pull and run the latest image from GitHub Container Registry
docker run -p 3000:3000 ghcr.io/lissy93/framework-benchmarks:latest
```

Then visit http://localhost:3000 to explore the framework comparison website and individual apps.

### Using Docker Compose

```bash
# Clone the repository first
git clone https://github.com/lissy93/framework-benchmarks.git
cd framework-benchmarks

# Run with Docker Compose
docker-compose up
```

## 🔧 Building Locally

```bash
# Build the image
docker build -t framework-benchmarks .

# Run the container
docker run -p 3000:3000 framework-benchmarks
```

## 📊 Running Benchmarks

The Docker image includes Google Chrome and all tools needed to run performance benchmarks.

### Basic Benchmark Execution

```bash
# Get container ID
docker ps

# Run all benchmarks with default settings
docker exec -it <container-id> bash -c "
    cd /app && \
    CHROME_FLAGS='--no-sandbox --disable-dev-shm-usage --headless' \
    python scripts/benchmark/main.py all
"
```

### Custom Benchmark Options

```bash
# Run specific benchmark types
docker exec -it <container-id> bash -c "
    cd /app && \
    CHROME_FLAGS='--no-sandbox --disable-dev-shm-usage --headless' \
    python scripts/benchmark/main.py all --type lighthouse,bundle-size --executions 3
"

# Run benchmarks for specific frameworks only
docker exec -it <container-id> bash -c "
    cd /app && \
    CHROME_FLAGS='--no-sandbox --disable-dev-shm-usage --headless' \
    python scripts/benchmark/main.py all --frameworks react,vue,svelte --executions 5
"

# Run with multiple benchmark types and frameworks
docker exec -it <container-id> bash -c "
    cd /app && \
    CHROME_FLAGS='--no-sandbox --disable-dev-shm-usage --headless' \
    python scripts/benchmark/main.py all \
      --type lighthouse,bundle-size,source-analysis,build-time \
      --frameworks react,vue,angular,svelte \
      --executions 3
"
```

### Development Container Benchmarks

```bash
# Run development version with full capabilities
docker compose --profile dev up framework-benchmarks-dev

# Then run benchmarks (development container has additional tools)
docker exec -it framework-benchmarks-framework-benchmarks-dev-1 bash -c "
    cd /app && \
    CHROME_FLAGS='--no-sandbox --disable-dev-shm-usage --headless' \
    python scripts/benchmark/main.py all --type lighthouse,bundle-size --executions 3
"
```

## 🎯 Available Endpoints

Once running, the container serves:

- `http://localhost:3000` - Main comparison dashboard
- `http://localhost:3000/react` - React weather app  
- `http://localhost:3000/vue` - Vue weather app
- `http://localhost:3000/svelte` - Svelte weather app
- `http://localhost:3000/angular` - Angular weather app
- `http://localhost:3000/<framework>` - Any of the 12 framework apps
- `http://localhost:3000/health` - Health check endpoint

## 📁 Volume Mounts

### Persistent Benchmark Results

```bash
docker run -p 3000:3000 -v $(pwd)/benchmark-results:/app/benchmark-results ghcr.io/lissy93/framework-benchmarks:latest
```

### Development Setup

```bash
docker run -p 3000:3000 \
  -v $(pwd)/benchmark-results:/app/benchmark-results \
  -v $(pwd)/results:/app/results \
  ghcr.io/lissy93/framework-benchmarks:latest
```

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `CHROME_FLAGS` | Chrome launch flags | `--no-sandbox --disable-setuid-sandbox` |
| `BENCHMARK_TYPES` | Comma-separated benchmark types | `lighthouse,bundle-size,source-analysis` |
| `FRAMEWORKS` | Comma-separated framework list | _(all)_ |
| `EXECUTIONS` | Number of benchmark executions | `1` |

Example with environment variables:
```bash
docker run -p 3000:3000 \
  -e BENCHMARK_TYPES="lighthouse,bundle-size" \
  -e FRAMEWORKS="react,vue,svelte" \
  -e EXECUTIONS=3 \
  ghcr.io/lissy93/framework-benchmarks:latest
```

## 🔍 Troubleshooting

### Chrome/Lighthouse Issues

If benchmarks fail with Chrome-related errors:

```bash
# Check Chrome installation
docker exec -it <container-id> google-chrome --version

# Test Chrome with proper flags
docker exec -it <container-id> bash -c "
    google-chrome --no-sandbox --disable-dev-shm-usage --headless --dump-dom http://localhost:3000
"
```

### Memory Issues

For large-scale benchmarking, increase container memory:

```bash
docker run -p 3000:3000 --memory=4g --shm-size=2g ghcr.io/lissy93/framework-benchmarks:latest
```

### Port Conflicts

If port 3000 is busy, use a different port:

```bash
docker run -p 8080:3000 ghcr.io/lissy93/framework-benchmarks:latest
```

Then visit http://localhost:8080

## 🏗️ Multi-stage Build

The Dockerfile includes two targets:

- **`production`** (default): Production-ready image with essential tools
- **`development`**: Includes Playwright and full dev dependencies

```bash
# Build development image
docker build --target development -t framework-benchmarks:dev .

# Run development container
docker run -p 3000:3000 framework-benchmarks:dev
```

## 🏷️ Image Tags

Available tags on `ghcr.io/lissy93/framework-benchmarks`:

- `latest` - Latest stable release from main branch
- `v1.0.0` - Specific version tags
- `main` - Latest commit from main branch

## 📈 Performance Tips

1. **Use volume mounts** to persist benchmark results between runs
2. **Increase memory** for intensive benchmarking: `--memory=4g`
3. **Use SSD storage** for better I/O performance during builds
4. **Limit concurrent benchmarks** to avoid resource contention

---

## 📝 Example Workflows

### Basic Exploration
```bash
docker run -p 3000:3000 ghcr.io/lissy93/framework-benchmarks:latest
# Visit http://localhost:3000 to explore the apps
```

### Run Benchmarks & Save Results
```bash
docker run -p 3000:3000 -v $(pwd)/results:/app/benchmark-results ghcr.io/lissy93/framework-benchmarks:latest

# In another terminal - run benchmarks with results saved to host
docker exec -it $(docker ps -q --filter ancestor=ghcr.io/lissy93/framework-benchmarks:latest) bash -c "
    cd /app && \
    CHROME_FLAGS='--no-sandbox --disable-dev-shm-usage --headless' \
    python scripts/benchmark/main.py all --type lighthouse,bundle-size --executions 3
"

# Results will be saved to ./results/ on your host
```

### Performance Testing Specific Frameworks
```bash
docker run -p 3000:3000 \
  -e FRAMEWORKS="react,vue,svelte" \
  -e EXECUTIONS=5 \
  -v $(pwd)/results:/app/benchmark-results \
  ghcr.io/lissy93/framework-benchmarks:latest
```