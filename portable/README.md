---
title: Metaphornik portable renderer and result format
updated: 2026-10-22
---
# Metaphornik portable renderer

Copy this complete folder to distribute the renderer. It needs Node.js 22.18 or later and has no npm dependencies. Rendering and viewing require neither a key nor a network connection.

```sh
node render-metaphornik.mjs example-metaphornik-results.json metaphornik-results.html
```

The command takes two positional paths: input JSON and output HTML. Relative paths resolve against the current working directory. It exits with a non-zero status on invalid input or an I/O error. It does not call a model. A calling skill should generate the results with its own model and then run this command.

The module also exports `renderResults(results): string` from `render-metaphornik.mjs`. Assets resolve relative to the module, so the command works from any working directory. Keep its adjacent `.mjs`, `.js`, `.css` and `.md` files together. The schema and example are included for authoring results. No absolute machine paths are embedded.

## Accepted JSON

Use the versioned envelope in `example-metaphornik-results.json`:

```json
{"format":"metaphornik-results","version":1,"analyses":{}}
```

`analyses` is an object keyed by each exploration's exact `metaphor` string. Legacy app exports with just this object are also accepted. `schema-metaphornik-results.json` defines all fields. `metaphornik-results.mjs` additionally validates cross-field references and is authoritative for accepted records.

Each exploration requires `metaphor`, `analysis`, `exploredPerspectives` and a finite non-negative millisecond `timestamp`. Optional `comparisons` preserve comparison summaries and user notes. `analysis` requires `sourceDomain`, `targetDomain` and at least one `mappingSets` entry. Each domain contains its `name` and `facts`, where a fact has a unique `id`, its `text`, and optional Boolean `custom`. A mapping set has `name`, `description`, `mappings`, and optional `icon` and Boolean `custom`. Each mapping links zero-based `sourceFactIndex` and `targetFactIndex` values to existing facts.

Each explored perspective has a unique, valid `mappingSetIndex` and a `consequences` array of text versions. Optional `generatedDocuments` contain `type`, `content` and `timestamp`. Optional `generatedImage` contains raster `mimeType` (`image/png`, `image/jpeg`, `image/webp`), raw `base64Data` without a data-URL prefix, and a non-empty `history` array of `{prompt,timestamp}` entries. Each comparison has valid `perspectiveIndices`, `aiSummary`, `userNotes` and `timestamp`.

Unknown fields, credential/configuration fields, malformed references, prototype keys and active image MIME types are rejected. Never include API keys, provider settings or secrets. The app accepts imports up to 50 MB. Model-generated facts must be converted from strings into `{id,text}` records before using this format, as shown in the example.

## Viewer behaviour

The viewer preserves domains, explicit mapping connections, all consequence versions, generated documents, images and their prompt histories, comparisons and notes. Select explorations from the dropdown, collapse perspectives, print or save results back to JSON. Generated text remains literal text, including Markdown notation, to prevent imported HTML from executing. The full web app remains the editor and AI workspace.

All viewer interface copy is authored in `copy-metaphornik-viewer.md`, with YAML frontmatter and named Markdown sections. Edit those sections and rerun the same command to rebuild. CSS and browser behaviour are separate adjacent files and are embedded into the output. The resulting HTML contains no external fonts, scripts, styles or runtime fetches. A restrictive content security policy permits only embedded scripts/styles and raster data images.
