# APEX Connect Paper Studio V6-D frontend release — 2026-10-05

## Scope
V6-D turns the V6-C protected own-paper editor into a revision-safe editing client for the shared SaaS paper vault. It does **not** create a second Connect paper store and does not claim canonical print/DOCX parity.

## Save protocol
When a teacher reopens an owned paper, Connect verifies both paper detail and `/document-review`, then captures server `revision` + source `snapshotHash`. A save PATCH sends **both** as compare-and-swap guards together with the lossless working document. Backend resolves signed school/owner/assignment; client cannot supply owner identity.

After a successful write, Connect immediately re-reads the paper and only advances its local guard when the server confirms the committed revision. If another tab/session writes first, stale save gets HTTP 409, local edits remain visible, Save is disabled, and UI requires `Reload latest (discard local edits)` before further editing.

## Conflict reload fix
TipTap maintains its own document state, so React source state alone was insufficient after a conflict reload. V6-D now:
- increments editor epoch on every verified protected-paper reopen/reload;
- synchronizes external `block.contentHtml` changes into TipTap using `setContent(...,{emitUpdate:false})` to avoid false dirty updates.
This was verified with two simultaneous browser pages editing the same paper.

## Revision history
Teacher can open a read-only **Immutable revision history** panel. It shows current revision and server journal entries. Restore/revert is intentionally not exposed yet. Initial guarded edit atomically captures original baseline revision 1 plus new revision 2; later edits append immutable snapshots.

## Safety boundaries retained from V6-C
- Lossless bridge represents every question item, not only bucket zero.
- Urdu/English text, options IDs, answer/bank metadata and unknown legacy fields survive no-op/edit round trips.
- Unsafe reorder/add/remove, source identity mutation, institution/class/subject edit and shared category-level per-question marks are blocked.
- Direct Pro Print and DOCX remain disabled until canonical renderer parity is proven.
- Other teachers' paper IDs/history stay non-leaking 404.

## Acceptance evidence
- V6-D frontend source gate: **10/10 PASS**.
- V6-C protected-editor source gate: **12/12 PASS**.
- Lossless bridge: **8/8 PASS**.
- Real two-browser-session conflict gate: **5/5 PASS** — both open rev1; session A saves rev2; session B stale save receives conflict and cannot overwrite; accepted reload visibly shows session A content + rev2; history shows rev1/rev2; DB current payload and immutable snapshots preserve untouched fields.
- Four-role authenticated shell: Admin 17, Teacher 8, Student 5, Parent 3 child routes PASS; dashboards 200; cross-role 307.
- Paper Studio responsive widths 320/375/390/430/768/1024: **6/6 PASS**, no document/body overflow.
- Backend live V6-D HTTP: **9/9 PASS**; V6 projection **8/8**, Paper Vault **8/8**, Question Bank **6/6**.
- Synthetic fixtures cleaned after tests.

## Remaining V6-E/F boundary
Final Print/PDF/Word/Online-Test delivery must use the canonical validated renderer/revision contract. Phase3R/new-authoring curriculum documents require real reviewed curriculum publication/source evidence; do not fabricate V13 hashes or server approval. V6-F storage cutover waits for production-approved SaaS PaperDocument registry, migration/RLS/backups and output parity.
