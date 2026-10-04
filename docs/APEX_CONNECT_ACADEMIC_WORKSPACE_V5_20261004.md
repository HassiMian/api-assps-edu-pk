# APEX Connect Academic Workspace V5 — 2026-10-04

V5 is a product architecture change rather than another colour pass.

## Master brand
Connect keeps pearl/white/soft-grey as the dominant canvas. ASSPS navy `#0B2C4D` and metallic-silver tones now identify global school chrome (brand mark, sidebar, topbar, Admin/Teacher authority states). Student violet and Parent teal remain role cognition accents only. This avoids an all-blue interface while making the navy/silver shield identity visible across the product.

## Admin Academic Directory
The Admin landing page now loads real tenant-scoped `/students?active=true`, `/employees?active=true` and `/portal/teacher-assignments` alongside dashboard stats. It renders live previews for Students, Faculty and Academic Groups, with class student/subject counts and links to the full management screens. Partial source failures surface an explicit directory error rather than demo records or false zeros.

## Teacher Paper Studio V5
The existing canonical paper/question engines are preserved; V5 replaces the inherited SaaS presentation with a Connect-native assessment workspace. Teacher teaching context is loaded from real server assignments and scoped student access. The outer shell is pearl/silver/navy, old dark module chrome is normalized inside the V5 scope, and the printable paper surface stays white/black for print fidelity.

The left workspace is organised as Create, Library, Intelligence and Teaching. `My Papers` is a private teacher vault, not a school-wide library. `Question Bank` is read/select access to approved questions inside assigned class+subject scope. Admin/Principal retains school-wide governance.

## Security boundary
Backend `paper_vault` remains authoritative. Teacher list/update/delete queries are owner-scoped by signed `owner_user_id` and school. Cross-teacher lookups use non-leaking semantics. Save is additionally constrained by `teacher_class_assignments`. Question Bank teacher reads are approved+assigned only; teacher mutation remains denied. UI hiding is never treated as access control.

Acceptance executed against isolated V5 build with synthetic tenant records: Admin rendered real synthetic student `Ali V5 Learner`, teacher `Ayesha Science`, and `Class Seven`; Teacher A saw assigned `Seven / Science`, saw `Ayesha Science Midterm`, and did not see Teacher B's `Bilal Math Midterm`. Teacher vault API returned exactly one own paper. Existing backend regressions: Paper Vault 8/8 PASS and Question Bank 6/6 PASS. Synthetic fixtures were deleted.
