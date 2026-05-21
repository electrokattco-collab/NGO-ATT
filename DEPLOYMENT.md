# ATT NGO Staged Rollout Plan

## Goals
- Validate production integration with live Firebase, payment gateways, and monitoring.
- Release incrementally to limit impact from configuration or runtime failures.
- Keep the launch safe with smoke tests and rollback criteria.

## Stages

### 1. Internal Beta
- Deploy backend to a staging environment (Cloud Run, App Engine, or managed VM).
- Deploy frontend build to staging CDN or static hosting.
- Use staging Firebase project and sandbox payment credentials.
- Enable monitoring and logging (`SENTRY_DSN`, `LOG_AGGREGATOR_URL`).
- Run full regression: API, payment, contact, volunteer, blog, and upload paths.

### 2. Canary Deployment
- Deploy production build to a subset of users or a separate production site.
- Use production Firebase project and sandbox/live gateway configuration.
- Monitor logs, error rates, and payment webhook processing.
- Validate rate limiting, CORS restrictions, and file upload protections.

### 3. Full Launch
- Once canary traffic is stable and no major issues remain:
  - Switch payment gateways to live mode.
  - Confirm SSL, DNS, and CDN configuration.
  - Enable analytics and email notifications in production.

## Acceptance Criteria
- `npm run build` succeeds.
- Test coverage is available and core flows exceed 80% coverage.
- Firestore rules are validated by automated tests.
- Monitoring captures errors and logs in a central aggregator.
- Production `.env` is provisioned separately and never committed.

## Rollback Strategy
- Maintain a rollback snapshot or container image/tag.
- If errors exceed threshold or payment failures occur, revert to the last known good version.
- Use service health checks and log alerts to trigger rollback quickly.
