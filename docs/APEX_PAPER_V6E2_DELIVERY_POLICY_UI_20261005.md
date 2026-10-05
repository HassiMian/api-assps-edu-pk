# Connect V6-E2 Delivery Center UI — 2026-10-05

Delivery Center now surfaces the server-reviewed native presentation contract for the exact immutable revision: renderer name, render policy and golden-approval status. The client never infers output authority.

Blank/Manual source shows `SOURCE-NATIVE RENDER POLICY`, `PTSPaperGenerator`, and `GOLDEN APPROVAL PENDING`; Print/PDF/Word remain blocked until the backend reports an approved golden gate. Revision save still rebinds delivery state/hash/key to the new immutable revision.

Production build acceptance: Next build PASS; synthetic browser 3/3; four-role shell PASS; mobile widths 320/375/390/430/768/1024 all PASS.
