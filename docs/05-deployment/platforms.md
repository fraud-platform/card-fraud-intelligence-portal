# Platform Deployment Options

## Current Repo Support

- Container-first deployment
- GitHub Actions workflows for CI and deploy orchestration

## Example Targets

- Choreo (workflow scaffolding exists)
- Any container host (Kubernetes, ECS, Azure Container Apps, etc.)
- Static hosting with edge proxy (if equivalent security headers are enforced)

## Keep in Mind

- Frontend env vars are embedded at build time
- Runtime must provide secure headers and SPA routing fallback
- Production Auth0 and API URLs must be non-localhost
