# APEX Connect Product V4 — ASSPS School Operating Layer

Date: 2026-10-04
Status: implementation in isolated production candidate; public promotion requires build, permission, browser and route gates.

## Product thesis
APEX Connect is not a reskin of the school SaaS. It is the role-aware operating layer over the same authoritative school records. The mature SaaS PaperDocument/question/layout/RTL/print engines are reusable domain engines; the old navy/gold SaaS Paper Generator shell is not the Connect experience.

## 1. ASSPS Brand System V4
Structural identity is consistent across Admin, Teacher, Student and Parent:
- ASSPS Navy `#0B2C4D` for authority, primary typography and navigation selection.
- Metallic Silver `#C7D1DB` / soft silver `#E7ECF1` for borders, chrome and depth.
- Pearl/White `#F7F9FB` / `#FFFFFF` for the main operating canvas.
- Sky `#4AA8D5` and Ferozi/Teal `#169C9C` only as controlled live/interaction accents.
- Role accent colours remain secondary inside content cards; they never replace the school brand spine.
- The actual configured school logo is rendered from authenticated school settings when available. No hard-coded substitute is treated as the school's official logo.

## 2. One school data graph, not duplicate modules
The SaaS/backend remains source of truth. Connect consumes:
- `/students?active=true` — tenant scoped; teacher reads are class-assignment scoped.
- `/employees?active=true` — school staff directory.
- `/portal/teacher-assignments` — teacher/class/section/subject authorization graph.
- `/portal/teaching-options` — teacher assigned classes/subjects or admin school classes.
- `/settings` — authenticated school identity/branding.

Admin Classes V4 is relational: select a live class and inspect students, sections, teachers and subjects. Teacher Paper Studio displays only assigned classes, subjects and students. No mock directory is maintained in Connect.

## 3. Paper Studio V4
### Shared domain engine
Reuse the mature SaaS assessment domain engine:
- PaperDocument/schema and legacy migration compatibility
- PTS/Unified/Board generators
- Question Bank
- Urdu/RTL and MCQ/short/long layout engines
- preview/print/export/editor engines
- AI import/scan/generation infrastructure where authorized

### Connect UX
Do not reuse the legacy SaaS navy/gold shell. Paper Studio V4 supplies a pearl/silver/navy Connect shell:
- Hero with school identity and signed-in session state
- live class/student/subject context
- desktop workflow rail and mobile horizontal studio nav
- grouped flows: Create, Library, Intelligence, Teaching
- readable error/loading/empty states
- responsive workspace around the unchanged printable-paper canvas

Teacher primary journey:
`Create Paper -> Assigned Class/Subject -> Approved Question Bank -> Pattern/Questions -> Preview/Edit -> Save to My Papers -> Reopen own paper`

## 4. Server-authoritative Paper Vault
`paper_vault` is the canonical persistence layer. Browser localStorage is never the authority for saved papers.

Fields include school, owner, class, section, subject, lifecycle status, revision, JSON PaperDocument payload, timestamps and soft-delete marker. Indexes cover school/update, owner/update and class/subject.

Permission matrix:
| Capability | Teacher | Admin / Principal | Super Admin |
|---|---|---|---|
| Create paper | Assigned class/subject only | School scope | Authorized school context |
| List saved papers | **Own only** | School-wide | Authorized school context |
| Reopen/edit/rename | **Own only** | School-wide | Authorized school context |
| Delete | Own only, soft delete | School-wide | Authorized school context |
| Change review status | No | Yes | Yes |

`expectedRevision` provides optimistic concurrency; a stale update returns HTTP 409 instead of overwriting another session.

## 5. Question Bank governance
Teacher access is intentionally not the same as management access.
- Teacher GET list/single: only **approved** questions for active teacher assignments matching class and subject.
- Teacher cannot create, edit, delete or approve Question Bank rows.
- Admin/Principal/Super Admin retain school governance CRUD/approval.
- UI mirrors backend permissions: teacher sees read-only approved/assigned library and no management controls.

## 6. Paper lifecycle
Initial states: `draft`, `review`, `approved`, `archived`. Teachers create drafts. Admin/Principal governance can move lifecycle state. Teacher visibility is ownership-bound regardless of state. Future school-wide print queues must consume approved/governed records and never broaden teacher visibility.

## 7. Reliability rules
- Save/rename/delete UI updates only after server confirmation.
- No optimistic local "saved" card when Paper Vault rejects a request.
- Local cache key is scoped by tenant and signed-in user and excludes the canonical saved-paper list.
- Failed class/roster/settings request is shown as unavailable, never as fabricated zero/sample data.
- Teacher paper save is independently re-authorized by backend class/subject assignment; hiding a UI option is not security.
- Tenant/role access is enforced backend-side and covered by synthetic isolation tests.

## 8. Acceptance already implemented in source
- Paper Vault synthetic isolation: 8/8 PASS (own list/edit, cross-teacher denial, assignment denial, admin school view, revision conflict, soft delete).
- Question Bank synthetic scope: 6/6 PASS (assigned/approved read, cross-class exclusion, unapproved exclusion, teacher mutation denial, admin school view).
- Existing backend regression suites: 8/8 test files PASS (attendance, identity, tenant, role and forged-cookie protections).
- TypeScript after Paper Studio, vault clients, Question Bank UI and relational Classes changes: PASS.

## 9. Release gates before production promotion
1. Final Next.js optimized production build exit 0.
2. Isolated backend with new vault/QBank routes health + synthetic isolation tests.
3. Isolated frontend preview wired to candidate backend.
4. Authenticated Teacher Paper Studio browser checks at desktop/tablet/mobile; no document overflow; My Papers only own records; assigned context visible.
5. Admin Classes relational view browser check with real-shaped synthetic fixture.
6. Four-role static route + cross-role isolation regression.
7. Contrast/mobile source gates and Paper V4 ownership source gate.
8. Controlled backend restart followed by production vault/QBank smoke using synthetic tenant only.
9. Blue/green frontend promotion with retained rollback candidate.
10. Source checkpoint + Git bundle; GitHub remote readback required before claiming remote sync.

## 10. Follow-on production work (not to fake as complete)
- Admin/Principal Paper Library/Governance UI and lifecycle review queue.
- Autosave/recovery draft endpoint with explicit revision semantics.
- Paper audit log (who created/reviewed/approved/printed).
- Actual physical iPhone/iPad Safari and Samsung Internet hardware acceptance.
- Missing student online-exam publishing endpoint, approved quiz integration and homework API remain separate product integrations.
