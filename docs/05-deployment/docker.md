# Docker Deployment

## Source Files

- `Dockerfile`
- `nginx.conf`

## Build Image

```powershell
docker build -t fraud-portal:latest .
```

## Run Container

```powershell
docker run --rm -p 5173:5173 fraud-portal:latest
```

Health endpoint:

- `http://localhost:5173/health`

## Build Args

The Docker build supports `VITE_*` build args. Key ones:

- `VITE_API_URL`
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`
- `VITE_AUTH0_ROLE_CLAIM`
- `VITE_SENTRY_DSN`
