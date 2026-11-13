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
- [ ] Toolchain: pnpm lock, Node 24 Docker builder, compatible latest Vue CLI, strict TS, ESLint, typecheck. Preserve existing build interfaces.
- [ ] Typed API/storage/validation with runnable tests first: PDF/page validation, status errors, storage corruption, upload sequence, QR HTTP and deduplication.
- [ ] Responsive form/result/history: local CSS, progress, inline errors, accessible controls, clipboard PIN, query preservation.
- [ ] Mobile QR: explicit camera launch, rear camera, useful permission errors, stop on detect/leave, no automatic print retries, mobile history selection (up to 10).
- [ ] Verification: tests, lint, typecheck, development/production builds, mocked browser checks at phone/desktop sizes including embedded query, update README.

User delegated implementation choices and requested TypeScript and pnpm. Execute inline in the existing checkout; no worktree, publish, push or deployment is needed.
