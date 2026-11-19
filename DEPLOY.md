---
title: metaphornik Cloudflare Pages preview deployment
date: 2026-11-19
register: FOR AGENTS
---

# Pages preview

Project: `metaphornik` (account `b6ae5bced06492ee6f0c8f92776804da`). Preview: https://metaphornik.pages.dev/ . Production canonical and citation URL: https://metaphornik.edutools.fyi/ .

This phase uses the Pages project without custom domains. DNS and the existing Cloud Run services remain unchanged. Do not attach domains or switch addresses before Dominik approves the preview list.

```sh
npm ci
npm run build
env -u CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=b6ae5bced06492ee6f0c8f92776804da npx wrangler@4 pages deploy dist --project-name=metaphornik --branch=main
node ~/gitrepos/_SKILLS/skills/dev/web-design-elements/kit/check-citation.mjs https://metaphornik.pages.dev/
```

Wrangler uses its existing OAuth session. Never inject an owner API key into this browser build. This cited release already supports visitor-owned provider keys; no owner key or server proxy is deployed.
