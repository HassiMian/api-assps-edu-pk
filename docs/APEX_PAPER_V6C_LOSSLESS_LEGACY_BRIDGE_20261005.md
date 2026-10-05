# Connect V6-C — staged lossless legacy editor bridge

Source: `src/components/PaperGeneratorSaaS/editor/losslessLegacyBridge.mjs`.

**Why:** The prior 93-line Pro Editor converter only projected `loadedPaper[type.value][0]`, silently hiding all subsequent questions of a category. It could also write only bucket zero, couldn't represent per-item marks when the category shared marks, and did not preserve/validate provenance of edited blocks. That cannot be used as a canonical SaaS migration path.

New staging adapter:
- Projects every item from every numbered category to a distinct block with protected original `sourceType`, `sourceIndex`, `sourceItemId` plus safe editable text/marks representation.
- Never calls Question Bank, fabricates approved source identity, converts an official V13/Phase3R/specialist paper, or changes original in place.
- No-op `applyLegacyWorkingDocument(legacyPaperToWorkingDocument(source),source)` reproduces all source JSON, including untouched bilingual Urdu/English fields, options with IDs, answer keys, bank revision, section metadata, original unknown extensions and print settings.
- A change to the *second* MCQ changes just that source item; other items/provenance/options remain identical.
- Editing a shared category-level mark on one item, reordering, adding/removing blocks, modifying institution/class/source identity, malformed fields or incompatible families is refused until canonical PaperDocument handles them explicitly. Never pretend to have persisted semantics that legacy rendering cannot represent.
- New adapter is not yet wired to live `PaperDocumentEditor.jsx` or the active print renderer; this is an intentional cutover gate, not an incomplete unnoticed import. Existing V6-B UI and saved-paper workflows stay untouched.

Unit proof: `node --test scripts/test-paper-v6c-lossless.mjs` **7/7 PASS**; synthetic paper contains 2 MCQs, 3 shorts, one long, Urdu/English, answers/marks/options, source metadata and additional unknown fields.
