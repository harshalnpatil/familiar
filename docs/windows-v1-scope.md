# Windows v1 Scope Gate

This document is the release-readiness gate for Windows v1 and the default triage rubric for incoming work.

## Must-have (required for GA)

1. **Install + first run succeeds on supported Windows versions**
   - **Acceptance criteria:** Clean install works, app launches, onboarding/dashboard renders, and no blocker crash in first 10 minutes.
   - **Fallback UX (if degraded):** Show a blocking “Windows setup issue” screen with retry + logs export. Do not claim ready state.

2. **Core recording lifecycle is reliable**
   - **Acceptance criteria:** Start/stop recording works from UI, status indicator is accurate, and captured artifacts persist for the active session.
   - **Fallback UX (if degraded):** Auto-stop recording, surface persistent warning banner, and provide one-click restart recording.

3. **Permissions + privacy controls are explicit**
   - **Acceptance criteria:** Required permissions are detected, denied states are explained, and privacy mode/off switches are respected.
   - **Fallback UX (if degraded):** Disable affected capture features and show actionable instructions to re-enable permissions.

4. **Data safety + storage management**
   - **Acceptance criteria:** Session data is saved without corruption, cleanup/retention runs as configured, and delete actions remove target data.
   - **Fallback UX (if degraded):** Enter read-only safe mode for existing data and prompt user before any destructive operation.

5. **Critical error visibility + recovery path**
   - **Acceptance criteria:** Fatal and repeated operational errors are surfaced in-app, with logs accessible for support triage.
   - **Fallback UX (if degraded):** Show recovery dialog with restart app, open logs folder, and copy diagnostics actions.

## Nice-to-have (ship if stable; not GA blockers)

1. **Polish/perf improvements (startup time, smoother UI updates)**
   - **Acceptance criteria:** Improvements are measurable and do not regress must-have reliability.
   - **Fallback UX:** Keep current behavior; no partial rollout that risks core reliability.

2. **Advanced convenience workflows**
   - **Acceptance criteria:** Added flow is discoverable and documented in UI microcopy.
   - **Fallback UX:** Hide feature behind non-default flag or omit from Windows v1 build.

3. **Deeper integrations/automation helpers**
   - **Acceptance criteria:** Integration failures are isolated and do not affect base app operation.
   - **Fallback UX:** Disable integration and present “core app unaffected” notice.

## Deferred (post-v1 by default)

1. **Cross-device/cloud sync**
   - **Acceptance criteria (future):** Conflict handling, offline behavior, and account recovery are production-ready.
   - **Fallback UX (v1):** Local-only messaging; sync entry points hidden.

2. **Enterprise policy/admin controls**
   - **Acceptance criteria (future):** Policy precedence, auditability, and rollback are validated.
   - **Fallback UX (v1):** Manual user-level settings only.

3. **Non-critical ecosystem extensions**
   - **Acceptance criteria (future):** Extension sandboxing and compatibility matrix are documented.
   - **Fallback UX (v1):** Extension surfaces hidden; core remains fully usable.

## Release gate + triage policy

- **Release readiness rule:** Windows v1 is release-ready only when all must-have items meet acceptance criteria (or approved temporary exception with owner + expiry date).
- **Triage rule:**
  - Issues mapped to **must-have** are P0/P1 and block release until resolved or exception-approved.
  - Issues mapped to **nice-to-have** are P2 unless they regress a must-have.
  - **Deferred** scope is not accepted into v1 unless explicitly promoted by product/engineering leads.
- **Decision rule for ambiguous work:** If no mapping exists, classify by user impact first; default to must-have when reliability, data safety, or privacy is affected.
