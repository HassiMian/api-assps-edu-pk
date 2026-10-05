# APEX Connect V6-C — protected legacy editor integration (2026-10-05)

## Release scope
The independent Connect Teacher Paper Studio now offers a source-preserving, owner-scoped compatibility editor **only** when reopening a compatible saved paper through `My Papers`. SaaS remains canonical and no historical record is migrated. Incompatible specialist papers remain on the existing template path, never forced through this working bridge.

## Why this cutover is necessary
The old 93-line Pro `documentAdapters.js` mapped only the first question per numbered category, risking missing later MCQs/shorts in the Pro Editor. `losslessLegacyBridge.mjs` represents every original item with sourceType/sourceIndex/sourceItemId. A no-op round-trip preserves original payload unchanged; changing the second question preserves the first, Urdu/English text, options, bank revision and unknown original fields.

## Protected UX
- Teacher's My Papers is server-authoritative/own-only. On reopening a representable legacy saved paper, Connect opens `PaperDocumentEditor` using the lossless bridge. It shows all question items; display numbering is sequential, source ordering immutable until canonical editing semantics are available.
- School name/address, teacher class and subject are read-only academic identity; editing different or duplicate source IDs, unknown format, category-shared per-question marks, protected metadata, unrepresentable rich HTML, source alias conflicts and unsafe reordering fail closed.
- This compatibility editor is a *plain question text* stage, NOT official V13/new-authoring source approval and NOT a Word-class rich-document save engine. The original source payload is not edited in place.
- Direct Pro Print and Pro DOCX are explicitly disabled pending canonical renderer/print-parity validation. `Template Preview` hands off the source-preserved working paper to the pre-existing PTS renderer; no silent document-family promotion.
- Presentation is ASSPS pearl/silver/navy, not a dark full-navy page. The existing EditorCanvasShell scales A4 within the mobile workspace. Repeated 401/403 AI-jobs polling is stopped after the first entitlement/session denial; no authorization bypass.

## Test evidence (isolated build `KCAJRQnw2W4P77YLGNONq`)
- Next.js production build exit 0 / TypeScript PASS.
- Synthetic signed teacher saved bilingual paper (2 MCQs + 2 shorts), via My Papers -> protected editor -> edit second MCQ -> Template Preview: **8/8 PASS**. Includes no mutation of stored original until explicit save, 390px editor doc/body no horizontal overflow, guarded fields and disabled direct Pro export, no repeated denied AI polling. Temporary fixture deleted.
- V6-C lossless bridge unit tests: **8/8 PASS**.
- V6-C source integrity checks: **12/12 PASS**.
- Existing V6-B browser creation funnel: **4/4 PASS**.
- Paper Studio responsive widths 320/375/390/430/768/1024: **6/6 PASS**.
- Authenticated four-role production-equivalent smoke: Admin 17, Teacher 8, Student 5, Parent 3 inner routes + four dashboards, cross-role redirects PASS.
- Backend signed document-review + vault/question permissions independently passed earlier: projection 8/8, vault 8/8, Question Bank 6/6, document-family validators 6/6.

## No misleading completion claim
This release is a safe, real integration of the transitional Editor. The fully canonical SaaS PaperDocument writer, approved bilingual curriculum ledger/publisher, durable revisions, cross-format migration, universal output renderer and actual iPhone/Samsung device acceptance remain later reviewed gates. Never automatically rebrand legacy drafts as official PaperDocumentV2 or Phase3R approved documents.

## Rollback
Public Nginx currently proxies green PM2 port 3002. Keep current `.next-candidate` V6-B build as `.next-candidate-before-v6c-editor-20261005`; build new candidate only after staged QA. During replacement temporarily route to healthy blue port3000 and verify health before switching back. On failed health return to previous green candidate and reload Nginx.
