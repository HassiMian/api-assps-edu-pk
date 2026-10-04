# APEX Connect — Design System v3 architecture and audit
Date: 2026-10-04 | Scope: api.assps.edu.pk independent super app, NOT school SaaS app.assps.edu.pk.

## Baseline audit (source reviewed)
- Shared `DashboardLayout` renders legacy dark Sidebar/Topbar for admin/student/parent; only teacher uses the newer pearl-white `TeacherWorkspaceShell`.
- `globals.css` hardcodes navy `--color-background`, white `--color-foreground` and blue glass utilities; multiple broad `@media` rules force all `.flex-row`, tables, modal elements to stack, overriding component intent.
- Student dashboard uses dynamic Tailwind strings `bg-${color}-500/20` (unreliable extraction); hero is blue/cyan and empty analytics occupy large chart placeholders. Stats lack robust loading/error differentiation; "AI Insights Pending" is not a calculated metric.
- Parent dashboard displays school-wide-style fee revenue charts to household users despite parent scope and claims "Complaint submitted" without any backend POST. Remove false-success feature until a real tenant-scoped complaint API exists.
- Admin dashboard is 722 lines with complex 3D glowing navy cards, magic-colour fallbacks and multiple fake-zero stats on timeout; calendar dates include estimated entries. Avoid changing domain queries/business logic while rebuilding view.
- Teacher dashboard is now light and assignment-aware, but legacy child pages still carry white text and navy form/input classes, causing low contrast in new shell. Staff class assignment table has 0 active rows; never invent assignments.

## Architectural decisions (challenge and revision)
1. NO copying Teacher's exact green theme across all portals: share geometry, spacing, typography and semantic colours; distinguish roles with muted accent (teacher sage, student violet/peach, parent mineral teal, admin graphite/ochre). This prevents four visually identical generic AI dashboards.
2. One `ConnectWorkspaceShell` for four user roles with one menu registry; existing routes intact. Keep school branding and secured auth via `DashboardLayout` and server-verified session proxy. Teacher's existing shell becomes compatibility wrapper, avoiding two diverging layouts.
3. Semantic design token layer (`--cw-*`) scoped to `.cw-shell` and role selectors, never globally override system/login/print styling. Components use `cw-*` base primitives and explicit white / dark contrast states. Disallow blanket `.text-white {color:black}` on gradient buttons.
4. Shared states: Loading => skeleton, API failure => retry/error, no associated data => contextual empty state, valid numerical zero => 0. Never fake subjects/rank/trends or assert non-existent success. Charts render only for actual records and accessible text is always present.
5. Contrast acceptance: regular text >=4.5:1; large text >=3:1; interactive controls/borders/icon affordance >=3:1 where relevant; keyboard focus visible. Runtime CSS colour token check plus CI static checks for risky nested dark classes; manual real-browser/mobile screenshot QA required before claiming pixel perfection.
6. Preserve the same protected `/admin`, `/teacher`, `/student`, `/parent` routing and tenant API. The graphic shell never confers authorisation. No backend permission/roster changes for visual work.
7. `DashboardLayout` switches four roles to new shell. Responsive drawer at <1024px and keyboard/ARIA support. Avoid duplicate sidebar on mobile. Do not style Paper Editor or unrelated school SaaS.

## Visual system
- Canvas pearl #F6F6F2, surface #FFFFFF, subtle mineral border #E3E8E1, text #26362D, secondary #55645B, muted #65756B, success #26734C, warning #95602A, danger #9C3E3B.
- Role-specific accent is a restrained navigational signal, not a saturated full-page background. Warm grey/sand texture and generous negative space.
- Desktop nav 252px/collapsed 82px; 77px topbar; max content 1720px; 16-24px cards; 8px spacing grid; mobile drawer and 44px touch targets.
- Body humanist sans, restrained Georgia/editorial headings; numbers tabular. Avoid gimmicky animations/3D rotations; respect reduced-motion preferences.

## Delivery waves / gates
A. Baseline evidence and token audit. B. Four-role reusable shell + accessible themes and shared surfaces. C. Four dashboard compositions using real endpoints with loading/error/empty distinctions. D. Child-page contrast compatibility, focus states, forms, tables and small-screen overflow. E. Static accessibility validation, isolated Next build, synthetic cross-role HTTP checks and manual preview. F. Blue/green deployment plus Git isolated release commit, health/auth/regression gates and rollback artifact. G. Separate per-page follow-up (Paper Studio, Parent Finance, Admin Users, Student Exams) requiring detailed product-level review, not a risky global colour sed.

## Rejected alternatives
- Global `!important` recolour all existing classes: breaks buttons/charts and future features.
- One monolithic shared dashboard: loses role-specific jobs and creates empty filler panels.
- Automatic class assignment or fabricated metrics for aesthetic purposes: data-integrity violation.
- Pushing raw unreviewed redesign to public green: require isolated build and role smoke tests first.

## Static route inventory and risk prioritisation
The non-dashboard inner modules are not all hand-designed yet. Static utility counts indicate migration debt, not proven runtime contrast failures:

| Role | TSX/JSX files | dark utility hits | white text hits | dynamic Tailwind hits |
|---|---:|---:|---:|---:|
| Admin | 19 | 185 | 238 | 0 |
| Teacher | 9 | 69 | 65 | 0 |
| Student | 7 | 14 | 27 | 0 |
| Parent | 4 | 12 | 27 | 0 |

Priority inner screens for component-level follow-through: Admin Users, Students, Teachers, Finance, Announcements, Setup; Teacher Classes, Assessments, Attendance; Parent Finance and Reports; Student Quiz and Exams. The shared shell plus a scoped legacy adapter ship first. They should not be mistaken for full manual pixel QA of each of these modules.

## V3 implemented foundational release
- `ConnectWorkspaceShell.tsx` centralized secure four-role navigation, role accent, responsive drawer, focusable buttons and breadcrumb; obsolete Teacher shell reduced to compatibility alias.
- `PortalDashboardPrimitives.tsx` standardized hero, metrics, actions, empty/error and section UI.
- Four landing dashboards rebuilt from authentic role-scoped endpoints: Admin school stats, Teacher assigned classes, Student own portal data, Parent linked household data.
- Parent's non-operational complaint 'success' removed (no backend submission existed); fictional Student rank/streak and Admin hard-coded growth percentages removed.
- `globals.css`: `.cw-shell` role-scoped semantic tokens plus conservative legacy `.glass-card` adapter; avoids touching external SaaS, login and PDF/print styles.
- `scripts/check-connect-v3-contrast.mjs` checks 22 text/button/legacy-state pairs at 4.5:1: all PASS after first failures were corrected. This is token-level coverage; it does not replace actual page screenshots and axe/keyboard review.
- `scripts/audit-connect-v3-routes.mjs` provides source inventory to prioritize deeper child-page migration.
- Build and synthetic four-role / cross-role route smoke are required release gates; prior protected Teacher portal and authenticated path must remain intact.

## Follow-up work that should not be represented as complete
- Manual browser checks at 375, 768, 1024, 1440 px for all inner modules, interactive modals, high-density tables, expanded/collapsed nav, focus order and keyboard-only flows.
- Accessible chart rework and child pages converted to semantic primitives rather than compatibility CSS.
- Parent concerns workflow requires tenant-scoped backend persistence/receipt API before the button can reappear.
- Canonical teacher class assignments remain an operational data issue; UI must not create false figures.

## V3 release acceptance evidence
- Final isolated Next 16.2.6 production build completed with exit code 0 and generated public build ID `2arYxeCzblEtj9jnhjGE7`.
- Colour-pair gate: 22/22 passed at >=4.5:1; initial three failing small-text variants were corrected.
- Synthetic authenticated smoke on Admin, Teacher, Student and Parent landing pages: all HTTP 200. Cross-role access attempts redirected (307). Sixteen additional authenticated child-page routes returned HTTP 200; user records created exclusively within ephemeral test tenant and cleaned up.
- Backend/public health HTTP 200 following zero-downtime blue/green promotion; previous green build preserved on VPS in `.next-candidate-before-v3-20261004`.
- No school data or portal role permissions were modified as part of the design release.

## V3.1 continuation refinement (2026-10-04)

These changes close problems discovered in the original shell review without changing tenant permissions, API payloads, school data, or the school SaaS:

- Mobile drawer computes `effectiveCompact = compact && !mobile` to prevent hidden labels if the teacher/admin previously collapsed the sidebar on desktop then resized. Compact toggle is hidden on mobile.
- Replaced the topbar bell glyph, which incorrectly linked to Overview rather than opening actual notifications, with a truthful overview icon and title. Do not reinstate a fake notification affordance; wire a role-scoped inbox API and unread state first.
- Refined role-scoped legacy module colours: white-background cards use sufficiently dark blue/green/violet/amber/red foreground variants; nested slate-700/800/900 containers are surfaced in pale mineral rather than navy. Gradient action foregrounds remain white. Applied exclusively under `.cw-shell .tws-main .glass-card`.
- Responsive link hit areas target 44 px for mobile sidebar. Do not override print styles.
- Mandatory gates: 22/22 token contrast script; source-route inventory; isolated Next/TypeScript production build; synthetic four-role login and 16 inner routes; cross-role denial; health; source checkpoint and rollback. These prove source/runtime regression status, **not** manual visual acceptance of every child view.

### Prioritized module-by-module visual acceptance backlog

| Wave | Screens | Acceptance scope |
|---|---|---|
| P1 | Admin Users, Students, Teachers, Finance | 320px+ overflow; readable tabular data; modal focus/close; warning/error contrast; one-time credential display must be intentionally prominent and no-store |
| P1 | Teacher Classes, Attendance, Assessments | Class-assignment empty state; real-only figures; readable selectors, disabled states and rubric tables; Urdu/RTL content where applicable |
| P2 | Parent Finance, Reports | Family/tenant isolation; status and currency hierarchy; accessible notices; never fake complaint submission |
| P2 | Student Exams, Quiz, Homework | Age-appropriate approachable visual density; keyboard flow; timer and submitted-state clarity; no invented ranks or streaks |
| P3 | Remaining Admin operations + responsive modals | Shared field/control primitives, consistent drawers, responsive data tables and role-specific icons |

### Human verification still required

Compare 375/768/1024/1440px browser screenshots including dark-to-light form islands, select menus, overlays, empty/error/loaded states, keyboard navigation and mobile drawer after desktop-collapse. Accessibility checkers cannot inspect all dynamic contrast interactions from source text alone. Do not claim that 39 inner routes have been manually pixel-audited until this is done.

### V3.1 production post-release route matrix

On build `FY6kcFkFX439ZDyIbdAlj`, a synthetic tenant was used to authenticate all four portal roles against the actual backend. All four dashboard GETs and the **33 fixed child routes** returned HTTP 200: Admin 17, Teacher 8, Student 5 and Parent 3. Each role's navigation attempt into a different portal redirected with HTTP 307. Synthetic school/users were deleted after the test. This extends, rather than replaces, the earlier 16-route preview gate. Dynamic exam detail (`/student/online-test/[examId]`) requires an actual generated exam fixture and was not included in this fixed-route matrix.

## V3.2 — P1 operational modules (live 2026-10-04)

### Scope and architecture
Five workflow-critical screens now share `PortalModulePrimitives.tsx` (editorial section heading, subheading and contextual support note), with semantic `.cw-module-*`, `.cw-field`, `.cw-data-table`, and `.cw-modal-*` classes scoped to the Connect shell. Existing user/fee/student/attendance/exam endpoints and tenant permissions were preserved. This is a deliberate per-module migration, not global replacement of Tailwind colours.

1. **Admin Users**: searchable server-returned user directory, real status labels, nonfunctional access-control/overflow actions removed, refresh control, high-contrast responsive table, separate secure handoff/reconciliation hierarchy, light create/reset modal surfaces. Actual role permissions remain backend owned.
2. **Admin Students**: removes the serious old optimistic local creation/update/delete on failed API requests, fake time-based student IDs and invented 100% attendance. Only server-confirmed writes followed by a refresh update the UI; failed changes surface an error in the active editor. The export action is truthfully disabled until implemented. Attendance aggregate shows em dash when unavailable.
3. **Admin Finance**: independently tracked fee and proof readiness with retry/error, no Axios catch-to-empty fallback, no false zero when either source is unavailable, server-confirmed approval and bulk generation, readable data tables and modal surfaces. Production feeRoutes also returns 503 rather than mock data when DB unavailable (`ALLOW_MOCK_FALLBACK` only applies outside NODE_ENV production).
4. **Teacher Attendance**: school-local `Asia/Karachi` date rather than UTC rollover; separates assignment-service error from genuine no-class state, separates roster error from genuine zero students, clear marked-count before submission and `aria-pressed` on all six present/absent/leave mobile/desktop controls. Geofence is explicitly described as not configured.
5. **Teacher Assessments**: no misleading default Physics when no class assigned, no invented 0% average with zero marks, school-local exam date, and results are shown as saved only after the server confirms submission. Assigned classes are still authoritative.

### V3.2 acceptance evidence
- Isolated Next 16.2.6 production build exit 0; TypeScript passed. New build ID `pSomSq5MQnpsmkDsEU9K5` is live on the green service behind the existing Nginx route to port 3002; previous V3.1 folder preserved as `.next-candidate-before-p1-20261004` for rollback.
- Full synthetic authorized route smoke: Admin 17, Teacher 8, Student 5, Parent 3 fixed inner pages all HTTP 200, four dashboard pages HTTP 200 and cross-role requests 307 redirected. Synthetic test identities cleaned up after execution.
- Existing token palette contrast checker 22/22 PASS, new P1 source-integrity checker 10/10 PASS (`scripts/check-connect-p1-integrity.mjs`). Pakistan-date UTC boundary checks PASS: `2026-10-04T18:59Z` maps to October 4 and `2026-10-04T19:01Z` maps to October 5 for Asia/Karachi.
- No backend migrations or actual school student/finance/teacher mark writes were made for V3.2. The source-only authenticated API-contract creation script was blocked by external safety checks and was not bypassed; backend `/fees` and `/pending-proofs` success/503 response shapes were inspected read-only.

### Unfinished, explicitly not claimed as complete
- Manual authenticated screenshots and browser/keyboard/axe review of every state and dialog at 375/768/1024/1440px; a static colour token PASS cannot certify all nested runtime contrast.
- P2 Parent Finance/Reports and Student Exams/Quiz/Homework, followed by high-density Admin Teachers, Announcements, setup and Teacher report-card workflows. Their route availability is tested but complete individual visual migration is not.
- Detail flows with real exam fixtures and full mutation integration tests must be independently reviewed before declaring application-wide pixel-perfect/production-ready UI.

## V3.3 — P2 family/student information hierarchy

The second module wave migrates Parent Finance, Parent Reports, Student Exams, Student Quiz and Student Homework into role-accented semantic Connect module surfaces. No payment instructions, exam marks or assignments have been invented to fill visually empty cards.

### Verified source findings and changes

1. Parent Finance had a high-impact data-unwrapping bug: `useApiData` already extracts `response.data.data`, but the previous screen then read `feesData?.data` again, causing genuine household fee arrays to render as empty. It now consumes the actual array, differentiates loading/error/invalid-payload/valid-empty states and shows fee status/challan references without promising payment submission. The old visible upload form was disabled (`PAYMENT_SUBMISSION_ENABLED=false`) yet misleadingly presented; the screen is now an honest read-only ledger until school-verified payment instructions/submission are configured.
2. Parent Reports no longer presents a decorative artificial attendance ring with `Number(stats.attPct || 0)` (which could imply 0% without saved marks), or ungrounded monthly AI forecast. The dashboard attendance breakdown controls data availability, and the `/notify/inbox` `exam_result` list has its own loading, retry and error state. No fake Export PDF button.
3. Student Exams shows valid published rows through the existing `fetchAvailableOnlineExams` abstraction, does not invent `30 minutes` when duration is absent, and rejects unexpected API responses rather than displaying false zero papers. Source audit found no `/exams/online/available` route in the deployed backend examRoutes; a 404 is shown as an honest missing-service message instead of implying there are no tests. Implementing this integration requires a separately reviewed server-scoped published-exam route (never expose correct answers to students).
4. Student Quiz accurately shows pending approved question-bank/class-scoped integration, a readable role-specific state and navigation to real exams, not sample questions or a teacher-only generation endpoint.
5. Student Homework removed its empty hard-coded `ASSIGNMENTS` list, delayed simulated bot response and disabled-but-active-looking chat shell. Until there is a real class-scoped homework API, it clearly shows integration state and a verified adjacent school workflow.

### Evidence and constraints

- New source gate `scripts/check-connect-p2-integrity.mjs`: 11/11 PASS (source correctness assertions, not browser visual proof).
- Public v3.2 Build ID before P2: `pSomSq5MQnpsmkDsEU9K5`; preserve this green candidate for rollback during promotion.
- No school fee, exam, homework, child or parent database mutation in P2 visual work.
- Still requires manual multi-breakpoint screenshots/keyboard focus tests of dynamic screens, and independent backend features for online exam publishing, approved quizzes and homework assignments before calling these full product integrations complete.
