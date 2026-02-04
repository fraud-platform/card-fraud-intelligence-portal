# CI / CD Setup Guide

This document describes the CI groundwork present in this repository and the manual steps required to enable full CI/CD on GitHub.

## What is already in place

- `.github/workflows/ci.yml` — runs on `push` and `pull_request`. Jobs:
  - Install dependencies
  - Verify Doppler secrets on `main` (fails early if missing)
  - Generate ESLint JSON report and upload as artifact
  - Lint with `pnpm ci:lint` (configurable warnings threshold)
  - Type check (`pnpm type-check`)
  - Unit tests (`pnpm test`)
  - Coverage (`pnpm test:coverage`)
  - Build + upload artifact
  - CSP Report-Only validation (required)
  - CSP enforcement check (optional; toggle via `CSP_ENFORCE=true`)
  - Playwright E2E job (runs after quality gates)

- NPM scripts:
  - `pnpm ci:lint` — strict lint used by CI (currently allows a pragmatic number of warnings)
  - `pnpm csp:test` & `pnpm csp:enforce` — CSP verification scripts used in CI

## Manual setup steps (required before protecting `main`)

1. Add Doppler secrets to the repository secrets:
   - `DOPPLER_TOKEN_TEST`
   - `DOPPLER_TOKEN_PROD`

2. Create GitHub environments and protection rules:
   - `test` (with reviewers/approval if desired)
   - `production` (with required approvals)
   - Protect `main` branch and require status checks: `Quality Gates` / `Build` / `E2E Tests` as appropriate.

3. CSP enforcement rollout:
   - Fix CSP: remove `unsafe-eval` and inline script allowances from CSP and migrate inline scripts to nonce-based approach. Style inline (`unsafe-inline`) may remain temporarily until all inline style attributes are migrated to external styles or nonce-managed style tags. Update the server to inject per-request nonces for scripts and styles and validate via CI before enabling enforcement.
   - Use `pnpm run csp:find-inline-styles` to enumerate inline style attribute usage to plan migration.
   - Once validated (CI `CSP Report-Only` passes and script nonces are in place), set `CSP_ENFORCE=true` in CI to run the enforcement check (note: the enforcement check currently validates script directives and warns about style `unsafe-inline`).

## How to run CI checks locally

- Install dependencies: pnpm install
- Run lint (strict): pnpm ci:lint
- Run type-check: pnpm type-check
- Run unit tests (fast): pnpm test:unit:fast
- Run coverage: pnpm test:coverage

Tip: Run `pnpm ci:lint` and fix issues before opening a PR.

## Lint gating policy

- To avoid blocking existing work immediately, CI currently uses a pragmatic warnings threshold. Plan:
  1. Run `pnpm ci:lint` locally and address top-level errors.
  2. Gradually lower `--max-warnings` in `package.json` in increments (50 → 20 → 0).

## Next automation ideas (optional)

- Add a Reviewdog action to annotate PRs with lint warnings/errors.
- Fail PRs on ESLint warnings after we converge to 0 warnings.
- Add a GH Action to publish the ESLint JSON to a dashboard for trend analysis.

If you'd like, I can start with triaging the current lint failures and fixing the top offenders; say the word and I'll begin with the highest-impact files.