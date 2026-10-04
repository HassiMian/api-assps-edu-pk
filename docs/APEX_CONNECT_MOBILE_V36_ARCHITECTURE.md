# APEX Connect V3.6 / V3.6.1 — Four-portal mobile architecture and acceptance

**Release scope**: Only the independent APEX Connect super-app `api.assps.edu.pk` frontend, and the shared backend fair-browsing middleware. The school SaaS `app.assps.edu.pk` frontend, assessment editor, exam papers, tenants and real student/fee records were not modified by this responsive release.

## Evidence-first audit: root causes fixed

1. Old global `globals.css` at 768px forced every `.flex-row`, `.md:flex-row` and `.lg:flex-row` into column with `!important`, breaking legitimate mobile headers/toolbars and compact action rows. Removed the blanket rule; each workflow's own responsive classes now govern its layout.
2. Old CSS forced *all* `table` elements to a minimum 650px even when they were not within scrolling wrappers. Scope table minimum widths to intentional overflow wrappers and `.cw-data-table` only. Preserve momentum horizontal scrolling locally instead of introducing document-wide overflow or hiding data.
3. `ConnectWorkspaceShell` mobile drawer now has a labelled controlled navigation element, keyboard Escape and Tab wrapping, focus return, inert hidden sidebar, body scroll-lock with exact restoration, desktop compact state ignored while mobile drawer is active. Sidebar/overview links use `prefetch={false}` to reduce unnecessary 17-link RSC fetch bursts on metered connections.
4. Touch-ready scoped rules: navigation/actions minimum 44px hit areas, mobile forms minimum 16px font to prevent iOS Safari input autofocus zoom, viewport `viewportFit:cover` while keeping user zoom enabled, notch/gesture safe-area padding, `100svh`/`100dvh` dynamic viewport, constrained inner-scroll modals, responsive breadcrumb ellipsis, no extra global overflow overrides. Urdu `[lang=ur]`/`[dir=rtl]` wrapping preserves RTL glyph joining and readability. Reduced-motion and print isolation retained.
5. Shared school-NAT 429 problem discovered by the authenticated 40-case Chromium browser test: old `120 req/IP/min` counted hundreds of separate school users together, causing settings/branding to fail. Shared backend middleware now verifies signed HS256 `authToken` before assigning individual tenant/user 180/min browsing quota; public/invalid-session stays 240/IP/min. Login per-identifier, password-recovery and a separate 480/IP/min login flood cap remain active. Unsigned user/tenant cookies cannot change rate-limit identity. Backend details in `al-siddique-backend/src/docs/APEX_SHARED_NETWORK_FAIR_BROWSING_20261004.md` in the separate isolated backend release branch.

## Browser matrix and honest limits

| Engine / environment | Test scope | Verified result |
|---|---|---|
| Playwright Chromium (Blink), mobile emulation | Admin, Teacher, Student and Parent: widths 320, 360, 375, 390, 412, 430, 768, 820, 1024, 1280; auth dashboards and representative inner screens; doc/body overflow, sidebar visible breakpoints, drawer/ESC/focus/scroll-lock and Admin Users modal | **40/40 PASS**, nine internal QA screenshots; synthetic fixtures cleaned |
| Firefox 132 (Gecko), Linux headless | Same four roles, 320, 375, 390, 430, 768, 1024 widths; dashboard/representative inner routes; interactive drawer and modal checks | **24/24 PASS**; nine screenshots; cached HTTP 304 correctly accepted as valid navigation |
| WebKit 18.2, Linux WPE on production HTTPS | Four roles at 320, 375, 390, 430, 768, 1024, each in fresh mobile browser context; authenticated DOM/viewport and representative inner-route layout (no fake HTTP localhost Secure cookie) | **24/24 layout-only PASS**; WebKit's Linux headless touch/screenshot automation stalls, so no claim of physical iOS Safari gesture or screenshot acceptance |
| Authenticated production route regression | Admin 17, Teacher 8, Student 5, Parent 3 inner screens, four dashboards and cross-role redirects | **PASS**; actual school records left unchanged |
| Source integrity/contrast | `scripts/check-connect-mobile-v36.mjs`, V3 tokens | **13/13 mobile architecture** and **22/22 contrast tokens PASS** |

**Important**: A browser engine alone does not prove every physical phone perfect. Apple Safari on a real iPhone/iPad, Samsung Internet on a Samsung device, Chrome Android, Firefox Android, iOS software keyboard/autofill, landscape/portrait transitions, zoom at 200%, screen-reader announcements and notched-device safe areas need a device-lab signoff. WebKit Linux's WPE `locator.tap`/screenshot renderer timed out; Chromium/Firefox real Playwright interactions passed, while WebKit's *layout* passed. Do not advertise hardware QA as done. Missing Student Online Exam publishing, approved quiz and Homework APIs are still separate product integration tasks, not mobile styling defects.

## Release and rollback

V3.6 isolated build `kjI3N7LVqxnNOpjnZF_x8` was promoted after the Chromium 40-case matrix and P1–P4 regression. V3.6.1 follows with sidebar-prefetch/RTL refinement; retain previous green `.next-candidate-before-mobile-v36-20261004` and `.next-candidate-before-mobile-v361-20261004` rollback directories where applicable. Backend fair-session limiter is source-controlled in the isolated backend release checkout; never blindly copy deployed directories over Git repositories or stage unfinished school SaaS attendance work.

## Manual device signoff checklist

- All four role accounts: login, dashboard, menu, logout and one workflow screen each at 320/375/390/430 and 768/1024 in portrait; 667x375 and 844x390 in landscape.
- Test touch scroll within wide tables vs outer page, drawer open/close/Escape where keyboard exists, keyboard-up and keyboard-down on input/modal, iOS pinch zoom, `viewport-fit:cover` notch/bottom gesture region and tab/voiceover focus.
- Verify Urdu/English notice mixed direction and font visibility, clear disabled/loading/error states, fee/assessment form buttons, table cell content, print preview separate from responsive UI.
- Check actual iPhone Safari, iPad Safari, Samsung Internet, Android Chrome and Firefox (desktop + Android), including a shared school Wi-Fi/NAT login rush. Attach device model, OS/browser version and screenshot to acceptance report rather than assuming universal parity.
