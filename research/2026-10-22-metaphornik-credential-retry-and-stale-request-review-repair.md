---
title: "Metaphornik credential retry and stale request review repair"
kind: "evidence"
created: "2026-10-22T19:26:21Z"
project: "/Users/dominiklukes/gitrepos/07_webapps-websites/07_demos-and-explainers/Generative-Metaphor-Explorer"
sources:
  - file: tests/metaphornik-credential-retry-browser.mjs
  - file: tests/metaphornik-providers.test.mjs
---
Specification-review repair verified with synthetic credentials and denied external traffic. A saved unexplored perspective now explains the missing key and automatically starts once after applying credentials. Identical settings, persistence-only changes and unrelated rerenders do not trigger another request. Explored saved content remains visible without credentials.

The provider adapter previously captured settings in a client that could be invoked after a key was cleared. Clients now check a credential version before sending, and credential changes abort active fetches and reject late results. Automatic multi-perspective exploration, custom perspective steps and comparison guard their continuation against changed credentials. The browser regression clears credentials while the first of two queued perspectives is pending and confirms that the second request is never sent and the stale response is not saved. Aborting cannot reverse a provider request already accepted.

Verification: 20 focused Node tests, TypeScript checking, production build, original mocked browser smoke and dedicated credential-retry browser regression all pass. No actual provider calls or deployment. Full reproducibility and limitations are in docs/checkpoint-metaphornik-migration.md.
