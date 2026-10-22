---
title: "Metaphornik direct provider API and portable viewer decisions"
kind: "evidence"
created: "2026-10-22T19:07:36Z"
project: "/Users/dominiklukes/gitrepos/07_webapps-websites/07_demos-and-explainers/Generative-Metaphor-Explorer"
sources:
  - url: "https://developers.openai.com/api/docs/guides/image-generation"
  - url: "https://developers.openai.com/api/docs/models/gpt-4.1-mini"
  - url: "https://developers.openai.com/api/docs/guides/structured-outputs"
  - url: "https://ai.google.dev/gemini-api/docs/image-generation"
---
Verified official provider documentation during the 2026-10-22 migration. OpenAI Images supports image generations and multipart image edits; GPT Image 1 remains documented. GPT-4.1 mini supports text/structured output. OpenAI structured output requires object schemas with additionalProperties false; array results are wrapped in a result object at the provider boundary and unwrapped for the existing app. Gemini uses its native generateContent image parts and response modalities. Browser-direct implementations use credentials in request headers and fixed provider origins, never in result data or URLs. No paid calls were made: focused tests stub fetch; browser tests intercept provider traffic. Model access/CORS/quality remain live-account verification limits.

The offline renderer distributes the entire portable/ folder, with no npm dependencies. Command: node portable/render-metaphornik.mjs input.json output.html. It accepts legacy records or a version-1 metaphornik-results envelope, validates mappings and raster images, embeds Markdown-authored interface copy and uses textContent for imported/generated text. Standalone HTML audit passed with zero remote resources or runtime fetches.
