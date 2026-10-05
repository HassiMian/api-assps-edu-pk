# APEX Connect Paper Studio V6-E1 Delivery Center — 2026-10-05

## Product behavior
V6-E1 adds a contextual Delivery Center inside the protected own-paper editor; it does not add a fifth top-level Paper Studio workspace. The four primary workspaces remain Studio Home / Create Paper / Question Bank / My Papers.

Delivery Center calls the shared backend with the exact V6-D CAS guard (`paper id + revision + snapshot SHA-256`). It displays revision number, current/historical state, stable delivery key, and per-channel status for Preview / Print / PDF / Word / Online Test.

## Honest channel state
The UI never treats a hidden button as access control and never invents output authority:
- Compatibility Preview may report available for a valid legacy source.
- Print / PDF / Word remain visibly **BLOCKED** while canonical renderer parity is pending.
- Online Test shows auto/manual/unsupported question counts but remains **BLOCKED** until the publish adapter exists. Unsupported question kinds are reported rather than silently dropped.
- A historical revision is explicitly distinguished from current and cannot be online-published by V6-E1.

Direct legacy Pro Print/DOCX stays disabled. V6-E1 does not route around this with a second client-only exporter.

## Revision behavior
After a guarded editor save succeeds, V6-D updates revision+hash and remounts the protected editor. Delivery Center therefore discards the previous manifest and re-verifies the new immutable revision. A different revision produces a different delivery key.

## Acceptance evidence
- Frontend V6-E source gate: **10/10 PASS**.
- Next.js production build: **PASS**, build ID `jRW7MEdxClVjM7H9sF_zL`.
- Real browser synthetic teacher: **3/3 PASS** — rev1 Delivery Center status, UI edit saved rev2, Delivery Center rebound to rev2 with changed key, current DB payload preserved untouched options/unknown source fields.
- Four-role authenticated route regression: Admin 17 / Teacher 8 / Student 5 / Parent 3 child routes PASS; dashboards 200; cross-role 307.
- Paper Studio widths 320 / 375 / 390 / 430 / 768 / 1024: **6/6 PASS**, no document/body overflow.
- Backend live V6-E manifest: **8/8 PASS**; V6-D **9/9**, V6 projection **8/8**, Vault **8/8**, Question Bank **6/6**, isolated Attendance **16/16**.
- Synthetic fixtures cleaned.

## Remaining V6-E2
A shared canonical output renderer must prove visual/RTL/marks parity before Print/PDF/Word can transition from blocked to available. Online Test needs a revision-bound publish adapter/schema and student delivery contract. Do not clone mutable question copies into a second online-exam truth store.
