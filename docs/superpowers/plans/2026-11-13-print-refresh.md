# Print refresh implementation plan

**Goal:** Modernize the embedded printer UI, migrate application code to strict TypeScript and pnpm, preserve deployment topology.

**Architecture:** Keep Vue CLI and its dist/js/app.*.js output, environment names, start port 9004, nginx config, entrypoint and CI deployment. Update supported dependencies; use Composition API, local CSS and lazy mobile camera scanner. No QR image upload or desktop scanner.

**Tech stack:** Vue 3, TypeScript, Vue Router, Axios, vue-qrcode-reader, pnpm, Node 24 LTS.

## Constraints
- Preserve Docker multi-stage build, BUILD_MODE, dist, port 80 and existing balancing/network/CI.
- Mobile-only QR for immediate printing at the terminal; PIN remains available everywhere.
- Preserve existing URL query parameters through navigation and existing local history keys.
- No live print requests during testing.

## Review focus
- Duplicate upload/detect events must not queue repeat jobs.
- Storage denied or corrupt must not lose successful upload result.
- iframe camera permission denial needs actionable guidance and visible PIN fallback.
- Invalid PDFs/page ranges need validation before requests; server limits remain authoritative.
- Network/HTTP failures must preserve form values and distinguish uncertain print outcomes.

## Tasks
- [x] Toolchain: pnpm lock, Node 24 Docker builder, compatible latest Vue CLI, strict TS, ESLint, typecheck. Preserve existing build interfaces.
- [x] Typed API/storage/validation with runnable tests first: PDF/page validation, status errors, storage corruption, upload sequence, QR HTTP and deduplication.
- [x] Responsive form/result/history: local CSS, progress, inline errors, accessible controls, clipboard PIN, query preservation.
- [x] Mobile QR: explicit camera launch, rear camera, useful permission errors, stop on detect/leave, no automatic print retries, mobile history selection (up to 10).
- [x] Verification: tests, lint, typecheck, development/production builds, mocked browser checks at phone/desktop sizes including embedded query, update README.

User delegated implementation choices and requested TypeScript and pnpm. Execute inline in the existing checkout; no worktree, publish, push or deployment is needed.

## Verification and review

- 13 unit checks pass; strict vue-tsc and ESLint pass.
- 19 browser checks pass; one mobile-only case is intentionally skipped on desktop.
- Development and production builds pass; verify:build confirms hashed app entrypoint and no QR prefetch in both modes.
- Fresh reviewer found upload navigation loss and delayed autofill overwriting cleared input. Both reproduced by failing browser checks and fixed. QR pending navigation and actual camera track shutdown are also covered.
- Docker itself is unavailable in this environment; image execution and physical iOS/Android camera permissions still need testing in the deployment environment. No production print calls, push or deployment performed.
- Implementation choice: preserve Vue CLI 5 and use TypeScript 6 (latest supported by installed TypeScript ESLint). The scanner's local WASM is pinned to 1.1.3 to match the engine bundled in vue-qrcode-reader 5.7.3.
