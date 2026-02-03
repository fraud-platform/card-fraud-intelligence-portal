# =============================================================================
# Card Fraud Intelligence Portal - Production Dockerfile
# Multi-stage build: Node/pnpm builder → Nginx Alpine runtime
#
# Build with Doppler:
#   doppler run -- docker build -t fraud-portal:latest .
#
# Or with explicit build args:
#   docker build \
#     --build-arg VITE_API_URL=https://api.example.com \
#     --build-arg VITE_AUTH0_DOMAIN=tenant.auth0.com \
#     -t fraud-portal:latest .
# =============================================================================

# Stage 1: Build the application
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9 --activate

# Build arguments for VITE_ environment variables
# These are embedded into the JavaScript bundle at build time
ARG VITE_API_URL
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_AUDIENCE
ARG VITE_AUTH0_REDIRECT_URI
ARG VITE_AUTH0_ROLE_CLAIM
ARG VITE_DISABLE_MOCKS=true
ARG VITE_APP_NAME="Fraud Rule Authoring Portal"
ARG VITE_APP_VERSION=1.0.0
ARG VITE_ENABLE_ANALYTICS=false
ARG VITE_SENTRY_DSN
ARG VITE_SENTRY_ENVIRONMENT=production
ARG VITE_SENTRY_RELEASE=1.0.0
ARG VITE_E2E_MODE=false

# Set as environment variables for the build process
ENV VITE_API_URL=$VITE_API_URL \
    VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN \
    VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID \
    VITE_AUTH0_AUDIENCE=$VITE_AUTH0_AUDIENCE \
    VITE_AUTH0_REDIRECT_URI=$VITE_AUTH0_REDIRECT_URI \
    VITE_AUTH0_ROLE_CLAIM=$VITE_AUTH0_ROLE_CLAIM \
    VITE_DISABLE_MOCKS=$VITE_DISABLE_MOCKS \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_VERSION=$VITE_APP_VERSION \
    VITE_ENABLE_ANALYTICS=$VITE_ENABLE_ANALYTICS \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
    VITE_SENTRY_ENVIRONMENT=$VITE_SENTRY_ENVIRONMENT \
    VITE_SENTRY_RELEASE=$VITE_SENTRY_RELEASE \
    VITE_E2E_MODE=$VITE_E2E_MODE

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies (frozen lockfile for reproducible builds)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application (VITE_ env vars are embedded into the bundle)
RUN pnpm build

# =============================================================================
# Stage 2: Production Nginx server - minimal Alpine image
# =============================================================================
FROM nginx:1.27-alpine AS production

# Create non-root user and set up permissions (single layer)
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

# Copy nginx config and built assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=appuser:appgroup /app/dist /usr/share/nginx/html

USER appuser

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5173/health || exit 1

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
