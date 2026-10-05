# V6-F3 — source-native renderer golden evidence

V6-F3 creates verifiable evidence for the existing source-native renderer without unlocking teacher Print/PDF/Word or setting the backend renderer-approval flag.

## Runtime/test identity
`PTSPaperGenerator` no longer owns a private duplicate of `buildPrintHtml`. The unchanged print HTML wrapper is extracted to `printDocumentRenderer.mjs`. Runtime `doPrint()` and the golden evidence harness consume the same helper. The helper itself is included in build-provenance SHA attestation.

The production UI remains fail-closed: Teacher Paper Studio still passes `deliveryLocked=true`; direct legacy Pro Print/DOCX remains disabled; Delivery Center is the authority surface. V6-F3 evidence never writes `PAPER_CANONICAL_RENDERER_PARITY_APPROVED` and manifest field `approvalClaim` remains false.

## Golden profiles
The operational harness creates a temporary synthetic school/teacher with one real assignment and three owner-scoped papers, then uses the actual Connect workflow `My Papers -> Reopen -> protected editor -> Template Preview`.

Profiles:
- English: MCQ + short question.
- Urdu: MCQ + short question with RTL/Nastaliq validation.
- Dual: two bilingual MCQs + bilingual short question.

For each profile the harness captures the source-native screen paper, extracts the actual `#paper-canvas` HTML, passes it through the same shared print helper used by runtime printing, renders that print document in Chromium and captures screenshot/PDF hashes. It verifies expected question text, normalized semantic screen/print equality, no horizontal clipping, and RTL/Nastaliq evidence where applicable. Evidence is written outside Git under `/root/secure-archive/apex-paper-v6f3-20261005/` and synthetic DB fixtures are removed in `finally`.

## Contract gate
`test-paper-v6f3-print-renderer.mjs` pins deterministic helper output SHA-256 `d39993fa2e7109c5324faae32d4ac6b9671f40b81338d62d4ce741af8c9980bb`, confirms A4/font/watermark/half-sheet semantics, and proves runtime wrapper output equals the pure helper.

## Approval semantics
A passing automated evidence manifest is a prerequisite, not self-approval. Backend `PAPER_CANONICAL_RENDERER_PARITY_APPROVED` remains false until the release reviewer accepts the golden evidence. Canonical registry writes remain independently disabled, and curriculum publisher production approval remains a separate gate.
