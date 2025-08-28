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

# Install Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

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
