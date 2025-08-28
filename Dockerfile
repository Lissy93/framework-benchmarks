# Build stage - Install dependencies and build project
FROM node:20-bullseye-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    wget \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY scripts/requirements.txt ./scripts/

# Install dependencies
RUN npm ci && pip3 install --no-cache-dir -r scripts/requirements.txt

# Create python symlink for scripts
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Copy source code
COPY . .

# Build all framework apps
RUN npm run setup && npm run build

# Production stage - Final runtime image
FROM node:20-bullseye-slim AS production

# Install runtime dependencies including Chrome
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libgbm1 \
    libxss1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome/Chromium (best effort - continue build even if this fails)
RUN set -e; \
    if [ "$(dpkg --print-architecture)" = "amd64" ]; then \
        echo "Attempting to install Google Chrome..."; \
        (wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
        && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google.list \
        && apt-get update \
        && apt-get install -y google-chrome-stable \
        && echo "Google Chrome installed successfully") || \
        (echo "Google Chrome installation failed, trying Chromium..." \
        && apt-get update \
        && apt-get install -y chromium-browser \
        && ln -sf /usr/bin/chromium-browser /usr/bin/google-chrome \
        && echo "Chromium installed as fallback") || \
        echo "Warning: No Chrome/Chromium could be installed - Lighthouse benchmarks will be skipped"; \
    else \
        echo "Installing Chromium for non-amd64 architecture..."; \
        (apt-get update \
        && apt-get install -y chromium-browser \
        && ln -sf /usr/bin/chromium-browser /usr/bin/google-chrome \
        && echo "Chromium installed successfully") || \
        echo "Warning: Chromium installation failed - Lighthouse benchmarks will be skipped"; \
    fi \
    && rm -rf /var/lib/apt/lists/* || true

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app .

# Install only production Python dependencies
RUN pip3 install --no-cache-dir -r scripts/requirements.txt

# Create python symlink
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Create non-root user
RUN useradd --create-home --shell /bin/bash --uid 1001 benchmarkuser && \
    chown -R benchmarkuser:benchmarkuser /app
USER benchmarkuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Default command
CMD ["npm", "start"]

# Development stage - Full development environment
FROM production AS development

USER root

# Install development dependencies
RUN npm install && npx playwright install --with-deps chromium

USER benchmarkuser

# Labels
LABEL org.opencontainers.image.title="Framework Benchmarks"
LABEL org.opencontainers.image.description="Cross-framework weather app comparison for automated web performance benchmarking"
LABEL org.opencontainers.image.url="https://framework-benchmarks.as93.net"
LABEL org.opencontainers.image.source="https://github.com/lissy93/framework-benchmarks"
LABEL org.opencontainers.image.vendor="Alicia Sykes"
LABEL org.opencontainers.image.licenses="MIT"
