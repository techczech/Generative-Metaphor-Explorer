---
title: "Metaphornik optional result field validation repair"
kind: "evidence"
created: "2026-10-22T19:33:10Z"
project: "/Users/dominiklukes/gitrepos/07_webapps-websites/07_demos-and-explainers/Generative-Metaphor-Explorer"
sources:
  - file: portable/metaphornik-results.mjs
  - file: tests/metaphornik-invalid-import-browser.mjs
---
The standards review reproduced a saved-comparison crash after importing comparisons:false. The validator used truthiness guards for optional comparisons, generatedDocuments and generatedImage, so false, zero, empty strings and null escaped type validation. All three guards now check field presence and validate every present value; omitted fields and empty optional arrays remain valid.

The focused regression failed before the fix and passes afterward. The suite passes 22 tests, typecheck and production build. An isolated browser regression denies provider traffic and rejects 12 malformed imports, checks byte-identical existing storage across reloads, then opens both saved perspectives, their comparison and original notes with zero page errors or provider calls. Original browser smoke and credential-retry checks also pass. Exact verification and limits are in docs/checkpoint-metaphornik-migration.md. The parent will refresh the canonical skill's copied renderer; no deployment or actual API call occurred.
