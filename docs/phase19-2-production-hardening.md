# Phase 19.2 — Production Hardening

The current EDUBBA production deployment is a preview/demo, not a production-ready multi-user learning system.

Local identity separates learning state for personal testing, but it is not real authentication or an authorization boundary. Do not enable production persistence for learner progress, mastery, Practice, or Learning Log data until real authentication and per-user authorization are implemented.

Production diagnostics (`/dev`, `/api/db-test`, and `/api/hello`) stay disabled unless `ENABLE_DEV_TOOLS=true` is set deliberately.
