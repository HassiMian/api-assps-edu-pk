# APEX Connect Paper Studio V6 — Canonical SaaS Projection Architecture
Date: 2026-10-05
Source baseline: Connect V5 `dcc1781`; SaaS Complete Paper Generator reference branch `feat/paper-persistent-authoring-session-phase3ad-20261003` commit `c8adac9`; original end-to-end creation blueprint `PAPER_GENERATOR_END_TO_END_AUDIT_AND_CREATION_BLUEPRINT_20261001.md`.

## 1. Product decision
APEX Connect MUST NOT own a second Paper Generator product. SaaS owns the canonical academic/paper platform, records, workflow contracts and full school-wide paper library. Connect exposes a role-aware projection of the SAME data and authoring pipeline to Teacher/Admin portals.

`SaaS canonical data + paper platform -> shared backend projection/policy -> APEX Connect role UI`

Do not copy an old SaaS page wholesale, do not create separate Connect-only question/paper truth, and do not keep adding independent top-level modules that bypass PaperDocument.

## 2. Current failure confirmed by audit
Current Connect Paper Studio presents 13 top-level destinations:
- Create: Paper Builder, Unified Builder, Board Pattern, Manual Entry
- Library: Question Bank, My Papers
- Intelligence: AI Generator, Import PDF, AI Scan
- Teaching: Online Test, Notes Maker, Daily Diary, Lesson Plans

This is feature-menu architecture, not a paper authoring pipeline. Four Teaching tools are not core Paper Generator modules. AI/PDF/scan are ingestion methods, not independent document systems. Multiple builders create overlapping mental models. The screenshot therefore exposes controls before a canonical authoring journey exists.

## 3. V6 information architecture — four primary workspaces
Teacher Paper Studio top level becomes only:

1. **Studio Home** — assignment context, recent own drafts, start actions, validation alerts.
2. **Create Paper** — one canonical authoring funnel with multiple starting methods.
3. **Question Bank** — read/select approved questions restricted to teacher assignments.
4. **My Papers** — signed teacher's own paper documents/drafts/revisions only.

Everything else becomes contextual:
- Blank / Type Myself -> Create Paper start method.
- Question Bank -> Create start method + separate browsing workspace.
- Duplicate My Paper -> Create start method, own papers only.
- Admin-approved Template -> Create start method, immutable source snapshot.
- AI Draft / PDF Import / Handwritten Scan -> ingestion methods inside Create Paper, always review-before-commit.
- Board Pattern -> metadata/template choice inside Create Paper, not a separate document engine.
- Online Test -> delivery/publish mode after a valid PaperDocument, not a separate builder.
- Notes Maker / Daily Diary / Lesson Plans -> Teacher Academics, outside Paper Studio.

## 4. Canonical end-to-end authoring pipeline
Every creation method converges here:

`Signed portal actor`
-> `SaaS teacher/class/subject projection`
-> `Class / Section / Subject / Curriculum version`
-> `Exam metadata + language + duration + target marks + layout/pattern`
-> `Start method: Blank | Bank | Own Paper | Approved Template | Import/AI/Scan`
-> `PaperDocument draft`
-> `Universal block editor`
-> `Rules/marks/choice validation`
-> `RTL/language/layout engine`
-> `Preview from same renderer`
-> `Save revision`
-> `Delivery: Print | PDF | Word | Publish Online Test (eligible question types only)`

No creation path gets its own persistence model or print renderer.

## 5. Canonical PaperDocument contract
Connect consumes the SAME PaperDocument contract as SaaS. Minimum immutable identity / mutable document fields:

- id, tenantId/schoolId, schemaVersion, status
- authorUserId / authorEmployeeId
- createdVia (`saas_admin`, `saas_teacher`, `connect_teacher`, import source)
- curriculum/profile/version snapshot identifiers
- class, section, subject, language, exam/term/title/date/duration
- ordered sections / stable question IDs / marks / choices / answer-line/layout properties
- design/template snapshot
- source bindings per bank question (question logical ID + approved revision/version + provenance)
- validation snapshot / target vs calculated marks
- revision / expectedRevision / timestamps
- portal visibility metadata only when explicitly shared or owner-linked

Question Bank insertion creates a paper-local editable snapshot. Later Question Bank edits MUST NOT silently mutate saved papers.

## 6. SaaS -> Connect data ownership
### SaaS/shared backend remains canonical for
- Students, teachers/employees, classes/sections
- teacher_class_assignments and portal identity linkage
- curriculum versions / course-subject-chapter-topic structure
- approved Question Bank + revisions/provenance
- PaperDocument + paper revisions
- templates/patterns/rules
- final validation/render/export services
- admin/principal school-wide paper governance

### Connect owns only
- role-specific navigation/workspace state
- temporary unsaved UI state
- portal presentation and capabilities
- calls into canonical APIs

Never mirror canonical paper/question records into a separate Connect-only database table once canonical PaperDocument storage is available.

## 7. Teacher visibility/security matrix
| Resource/action | Teacher Connect | Admin/Principal SaaS |
|---|---|---|
| Students | only assigned class/section projection | school-wide |
| Classes/subjects | only active assignment projection | school-wide |
| Question Bank read | approved + assigned class/subject only | school-wide governed |
| Question Bank create/approve/delete | NO | YES by permission |
| New paper | assigned class/subject only | school-wide |
| Saved paper list | ONLY own authored/owned papers | school-wide |
| Open/edit paper | ONLY own paper, same school | governed school-wide |
| Duplicate paper | own paper; approved shared template separately | governed school-wide |
| Other teacher paper existence | MUST NOT leak | visible by role |
| Print/PDF/Word | own valid paper | governed school-wide |
| Publish online test | own valid eligible document + assigned scope | governed school-wide |

A disabled/unlinked teacher portal cannot access Connect. Ownership is based on signed portal identity mapped to canonical author, never a client-supplied teacher ID.

## 8. Saved Papers semantics
SaaS library may show every school paper according to admin permissions. Teacher Connect `My Papers` is a projection query:

`school_id = signed school AND owner_user_id = signed user AND deleted_at IS NULL`

When canonical author mapping exists, a teacher may see their own paper regardless of whether it was authored from SaaS Teacher UI or Connect. Papers with no verified author mapping are NOT inferred/auto-linked. Sharing another teacher paper is a distinct future template/share workflow, never implicit in Saved Papers.

## 9. Projection API boundary
Connect should consume a paper-platform facade rather than knowing storage details:

- `GET /api/portal/paper-studio/context`
  - signed actor, school branding, active teacher assignments, class/section/subject options, capabilities, enabled creation/delivery modes
- `GET /api/portal/paper-studio/questions?...`
  - approved assignment-scoped questions + revision IDs
- `GET /api/portal/paper-studio/papers?scope=mine`
- `GET /api/portal/paper-studio/papers/:id`
- `POST /api/portal/paper-studio/papers`
- `PATCH /api/portal/paper-studio/papers/:id` with expectedRevision
- `POST /api/portal/paper-studio/papers/:id/duplicate`
- `POST /api/portal/paper-studio/papers/:id/validate`
- `POST /api/portal/paper-studio/papers/:id/publish-online` after eligibility validation

Backend resolves teacher ID/assignment from the signed session. Client never selects arbitrary owner IDs.

## 10. Transitional compatibility rule
Today production has `paper_vault` plus the mature SaaS frontend/store, while the advanced `paper_documents/paper_revisions` authoring work exists on reviewed feature branches and is not yet the universal live storage layer. V6 therefore introduces a **repository/facade contract**, not another truth store.

Stage A: projection facade can adapt current `paper_vault` / approved question_bank into PaperDocument-compatible responses.
Stage B: when SaaS canonical `paper_documents/paper_revisions` is production-approved, switch repository implementation underneath the same API. Connect UI does not change and no dual-write is introduced.

No mass migration or destructive archive reset as part of the first Connect release.

## 11. Editor UX target
Create Paper is a workspace, not a dashboard of cards:
- left: document outline/sections/questions
- center: live A4 PaperDocument canvas
- right: selected block inspector
- top command bar: class/subject status, calculated marks, validation, Save, Review, Export/Publish
- bottom/side add drawer: Blank Question, Question Bank, Import/AI/Scan

Question numbers, marks, question text, options, instructions, answer lines, alignment/font/spacing remain independently editable. Reorder/duplicate/remove with undo. `Attempt any N`, block marks and total marks are validated without silently rewriting user content.

## 12. Output and online delivery
Preview/print/PDF/Word MUST use the same validated renderer. Urdu/RTL/Jameel Noori and English/Math font rules remain consistent. Draft/invalid document cannot silently become final.

Online Test consumes an eligible PaperDocument revision. It does not maintain a parallel exam-question editor. Unsupported blocks are flagged before publish; publish stores binding to the paper revision so later edits create a new revision rather than silently changing a live exam.

## 13. Performance / production constraints
- Lazy-load rich editor and import/AI tools.
- Virtualize large Question Bank lists.
- Debounced draft persistence; explicit revision save with optimistic concurrency.
- Never serialize giant school-wide banks into browser localStorage.
- No base64-heavy assets inside primary PaperDocument records.
- Fail closed on context/ownership/API errors; never replace errors with empty own-paper lists.
- Existing historical/V13/Early Years papers remain preserved through adapters and locked source datasets.
- Mobile workspace gets dedicated responsive editor modes, not desktop canvas blindly shrunk.

## 14. Execution plan and hard gates
### Phase V6-A — Contract + projection facade
- implement backend `paper-studio/context` and repository interface
- prove signed teacher assignment resolution, own-paper projection, admin school-wide separation
- no UI removal yet
Gate: tenant/teacher/owner adversarial tests + no real data mutation.

### Phase V6-B — New Studio Home + Create funnel
- replace 13-destination rail with four primary workspaces
- move AI/PDF/scan into creation source drawer
- move Notes/Diary/Lesson Plans out of Paper Studio navigation
- Board Pattern becomes setup/template option
Gate: browser flow from teacher assignment -> blank draft -> editor and from Bank -> editor.

### Phase V6-C — Universal PaperDocument editor adapter
- reuse canonical editor/rules/renderer contracts from SaaS
- do NOT fork a Connect-specific editor engine
- current paper_vault adapter only as temporary repository implementation
Gate: marks/RTL/print parity, save/reopen/revision conflict.

### Phase V6-D — My Papers + revision workflow
- own-only list/open/edit/duplicate
- no other-teacher existence leakage
- server errors distinguished from true empty list
Gate: two-teacher synthetic adversarial browser/API test.

### Phase V6-E — Delivery unification
- print/PDF/Word via same renderer
- Online Test becomes publish action from eligible validated revision
Gate: published exam bound to immutable paper revision, unsupported blocks blocked.

### Phase V6-F — canonical SaaS storage cutover
- only after SaaS paper_documents/paper_revisions release is production-approved
- swap facade repository; no UI rewrite and no dual truth
Gate: migration/read parity and rollback.

## 15. Definition of production-ready
V6 is NOT production-ready merely because the screen is attractive. It is production-ready only when:
- same canonical SaaS data/paper contract is used;
- all teacher scope/ownership rules are backend-enforced;
- Blank/Bank/Own Paper paths converge to one PaperDocument editor;
- Question Bank incomplete/outage cannot block manual paper creation;
- own-only My Papers is proven with two signed teachers;
- preview/print/PDF/Word parity is proven;
- revision conflict and stale save are tested;
- mobile editor has dedicated acceptance;
- historical papers remain intact;
- no duplicate Connect paper truth exists;
- public release has rollback and source SHA parity.
