---
title: Metaphornik own-key migration checkpoint
date: 2026-10-22
status: checked
---
# Plan and stable renderer contract

1. Preserve all prompts and UI capabilities. Route text, image generation and image edits directly to Gemini or OpenAI using a visitor key held in memory by default. Remove build-time credential injection.
2. Validate saved/imported results and provider outputs; preserve existing browser records. Export a standalone offline result viewer.
3. Run focused mocked tests, typecheck, credential-free build and browser checks; commit and push the feature branch.

Portable command: `node portable/render-metaphornik.mjs input.json output.html`.
Module contract: `renderResults(results): string` exported by the same module. No dependencies or network access. Distribute the complete `portable/` folder. Canonical copy: adjacent Markdown with YAML frontmatter; CSS and behaviour are separate adjacent files embedded at render time.
Accepted JSON: existing legacy object keyed by metaphor, each value a StoredMetaphorAnalysis; also versioned envelope `{ "format": "metaphornik-results", "version": 1, "analyses": { ... } }`. The schema and example will be adjacent in portable/. Imported data must pass structural and reference validation. Keys/provider configuration never belong in results. Existing legacy records remain readable. Export/viewing never requires an API key.

No deployment, DNS changes, GCP deletion or paid calls. Existing untracked research/ belongs to prior work and is preserved. Parent owns canonical skill and shared records.

# Verification

- `npm test`: 17 focused tests pass. Covers memory-only keys, explicit persistence/opt-out/reset, blocked storage, absent keys before network, header-only credentials, schema conversion, OpenAI/Gemini image edits, redacted authentication/quota/model/network failures, incomplete outputs, legacy/versioned records, invalid references, prototype keys, rejected credential fields, raster image/history round trips, hostile HTML and Markdown-source propagation.
- `npm run typecheck`: passes.
- `GEMINI_API_KEY=METAPHORNIK_BUILD_SENTINEL_NOT_A_REAL_KEY npm run build`: passes without any real credentials. Static assets contain neither the sentinel, `process.env.API_KEY`, AI Studio imports nor the executable Tailwind CDN script. Tailwind 3 is bundled locally; Google icon font remains an external stylesheet.
- `npm audit --omit=dev --audit-level=moderate`: zero production vulnerabilities. Full audit: seven development advisories in Tailwind 3 and its build-chain dependencies (two moderate, five high), recorded in `docs/audit-metaphornik-development-dependencies.json`. No forced Tailwind 4 migration.
- T3 browser: opened successfully; snapshot failed twice with the exact error `Preview automation snapshot timed out after 15000ms.` Used the authorised headless fallback with the installed Playwright module and bundled Chromium headless shell, never the user's Chrome.
- `tests/metaphornik-browser.mjs`: passes using an isolated browser context. Provider traffic is intercepted with fake credentials. Verifies own-key setup, memory-only default, explicit persistence across reload, clear/reset, mocked analysis, image generation and multipart editing, JSON import and saved result loading with no key/network request, hostile imported consequence/document/comparison text, HTML download, redacted 401 error, and offline `file://` viewer selection/collapse/download controls. No page errors. No paid provider calls.
- `node portable/render-metaphornik.mjs portable/example-metaphornik-results.json dist/metaphornik-example.html`: passes. HTML registered with ReportScout as “Metaphornik portable viewer example”. Single-file strict audit: no blockers, no warnings, zero external resources, scripts or runtime fetches.
- Copying the entire portable folder to a separate distribution directory and calling its module succeeds, with no repository path in rendered output. Markdown title mutation propagates to rebuilt HTML in the focused test.
- `git diff --check`: passes. Reviewed all rendering paths; no `dangerouslySetInnerHTML` or HTML insertion sinks. Imported/model text uses React nodes or `textContent`. Image types and base64 payloads validate at boundaries.

## Implementation notes

All original prompt bodies are preserved. The unused Gemini SDK dependency was removed entirely; Gemini calls use fixed REST endpoints and header keys, with no SDK construction, Vertex routing or Application Default Credentials fallback. Provider bodies and raw transport errors are never logged. Text analysis, metaphor generation, identification, reframing, additional facts, custom perspective naming, consequences, comparisons, creative documents, image generation and editing route through the provider adapter. OpenAI is the default because both text and image operations are implemented; its account/model availability remains user-specific.

The browser check demonstrated a pre-existing Markdown rendering defect: a heading and following paragraph in the same block dropped the paragraph. The renderer now preserves that body text. Existing JSON storage keys are retained. Invalid/unreadable existing storage is preserved without overwrite, while new work can remain in memory for export. Imports merge against the latest in-memory records rather than a stale file-read snapshot. Settings persistence stays separate from results.

## Remaining limits and handoff

Real provider credentials, live CORS, account permissions, quota and model quality were deliberately not exercised. Defaults are documented provider model IDs and can be changed in the UI. The offline viewer preserves all result content and uses literal Markdown text, collapsible perspectives and selection; AI generation and editing remain in the web app. Canonical skill publication belongs to the parent, using the complete portable folder and its schema/example. No app-local SKILL.md was created.

No deployment, DNS change, GCP deletion, licence change, desktop packaging or ChatGPT sign-in was performed. Existing untracked sign-in research and its prior manifest entries belong to the parent and are preserved outside this commit.

## Browser reproduction

Start the app with `npm run dev`. Generate the example HTML after the latest build (Vite clears dist on build), then register it with ReportScout before opening it. Run `node tests/metaphornik-browser.mjs` with `METAPHORNIK_PLAYWRIGHT_MODULE` pointing to an installed Playwright `index.mjs` and `METAPHORNIK_HEADLESS_SHELL` pointing to a bundled headless-shell executable if Playwright's own revision is unavailable. Optional `METAPHORNIK_TEST_URL` changes the local app URL. These optional verification tools are not renderer dependencies.

The checked run used Playwright from `/Users/dominiklukes/.npm/_npx/86170c4cd1c5da32/node_modules/playwright/index.mjs` and bundled headless shell `/Users/dominiklukes/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell`.

## Specification review follow-up (2026-10-22)

Fixed the reviewed P2: selecting a saved, unexplored perspective without credentials now gives an actionable Provider settings instruction. Applied credentials notify the app through a versioned external store and start the pending selected perspective once. Attempts are deduplicated across ordinary rerenders and identical settings; persistence-only changes do not trigger a retry. Existing explored content hydrates and displays without any key or provider request.

The delayed-operation inspection confirmed that a previously created adapter client captured its key for later use. Clients now retain a credential version rather than a captured key; delayed use after clearing or changing settings fails before any network request. Credential changes abort in-flight fetches, discard late responses, and guard follow-up steps in automatic exploration, custom perspective generation and comparison. The comparison's stale-state timeout was removed in favour of local resolved consequences. An abort cannot undo a request already accepted by a provider.

Checks: `npm test` passes 20 tests, including stale-client rejection, request abortion/late-response rejection, and no notifications for unchanged credentials or persistence-only changes. `npm run typecheck` and `npm run build` pass without credentials. `tests/metaphornik-credential-retry-browser.mjs` passes with all external traffic denied except intercepted synthetic-key OpenAI responses: zero requests for explored saved content, actionable prompt for an unexplored perspective, exactly one automatic request after setup, no duplicate after identical settings or unrelated parent rerenders, preserved saved content after clearing, and no queued second-perspective request or stale saved result after clearing during a multi-perspective operation. No actual API calls. The full original browser smoke also passes.

Only this app repository was changed. The parent owns the specification review record and subsequent standards review.

## Standards review follow-up: optional fields (2026-10-22)

Fixed the reproduced `comparisons: false` import crash. Optional `comparisons`, `generatedDocuments` and `generatedImage` fields now validate whenever present, rather than only when truthy. Present values of the wrong type are rejected before import merging, storage, JSON export or HTML rendering. Omitted fields and empty optional arrays remain valid; the documented JSON format and schema do not change.

The new focused regression failed before the fix with `Missing expected exception: comparisons must reject false`, then passed after the three presence checks were corrected. `npm test` now passes 22 tests; `npm run typecheck`, `npm run build` and `git diff --check` pass.

`tests/metaphornik-invalid-import-browser.mjs` passes in an isolated headless context with all provider traffic denied. It rejects 12 imports spanning `false`, `0`, empty string and `null` for each affected optional field; verifies browser storage remains byte-identical across reloads; and then opens both existing saved perspectives and their comparison, including the original user notes, without a crash, page error, key or provider request. The original browser smoke and credential-retry browser regression both pass after the fix, including image generation/editing and offline viewer checks using synthetic/intercepted responses.

Only this app repository was changed. No paid API calls or deployment occurred. The parent owns refreshing the canonical skill's copied portable validator and closing the shared review record.
