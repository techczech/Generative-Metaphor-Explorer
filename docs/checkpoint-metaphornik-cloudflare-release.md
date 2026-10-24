---
title: Metaphornik Cloudflare preview release checkpoint
date: 2026-10-24
status: implementing
---

# Scope

Combine the checked visitor-key implementation with the readable-page work from ed2c98d. Preserve prompts, browser records, portable viewer and provider behaviour. Do not restore the older owner-funded Gemini proxy. Retain the agreed canonical address metaphornik.dominiklukes.net; its old-address redirects and public DNS switch are later actions.

# Plan

1. Add a production-output gate; demonstrate the old build lacks the canonical readable landing content and bundled font.
2. Integrate static metadata, readable fallback, sitemap/robots and preview noindex headers. Use static Cloudflare Pages with no Functions or provider secrets. Bundle the icon font.
3. Run tests, typecheck, production build and representative isolated-browser flows. Refresh and package the complete canonical skill/renderer; keep editable sources beside generated HTML.
4. Prepare a non-production Cloudflare preview, independently review the complete release and file the concrete public-cutover check in DTC. No DNS switch, redirects, real paid model calls or GCP deletion in this preparation.

Existing three untracked sign-in research files are preserved. Current root feature implementation: 5c1a95c. Existing guide worktree remains untouched.

## Checks so far

- Production-output check failed against the prior build because canonical/readable content was absent, then passed after integration.
- 22 focused tests, TypeScript and production build pass. All three isolated browser scripts pass: full own-key/image/viewer flow; credential retry/clear; 12 malformed imports without damaging saved results.
- The first full-browser attempt failed solely because its generated example fixture had been removed by Vite's clean build. The fixture was regenerated and the rerun passed. The build now generates that example automatically to make the documented checks reproducible from a fresh build.
- Local icon font bundled. Production dependency audit: zero findings. No paid calls.
- Cloudflare account authentication verified. Pages project metaphornik created for preview preparation; no custom domain changed and no deployment yet.

- Screenshot inspection found the original mobile header extended to 751 pixels in a 390-pixel viewport. Header/navigation now wrap on narrow screens; the new browser assertion checks document width rather than merely taking a screenshot. No controls or provider behaviour changed.


## Hosted preview checkpoint

Checked source is pushed at7809141. Cloudflare preview deployed at https://8d940e2e.metaphornik.pages.dev, alias https://release-preview.metaphornik.pages.dev. Normal browser/UA checks return200 and X-Robots-Tag:noindex; intended canonical remains https://metaphornik.dominiklukes.net/. The actual hosted release-browser check passed readable JavaScript-off content, bundled font, desktop/mobile geometry and zero external asset requests/page errors. Its receipt now records the hosted URL. Partial independent Sol review found no new Metaphornik blocker before the user changed the review/build seats. Final cross-review remains pending under the new roles. No custom domain, redirect or GCP service was changed.
