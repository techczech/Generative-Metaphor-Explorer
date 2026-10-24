---
name: "Generative Metaphor Explorer"
description: "Makes conceptual metaphor an exploratory activity by generating alternative frames and perspectives."
categories: [interactive-learning-objects, web-app, built-by-ai, powered-by-ai]
updated: 2026-07-16
deployments:
  Appsite:
    "Generative Metaphor Explorer": https://metaphornik.edutools.fyi/
---
# Metaphornik

*Explore new perspectives through generative metaphors*

Metaphornik is an interactive web application designed to help users understand and creatively explore conceptual metaphors. Using your own Gemini or OpenAI API key, it serves as a tool for critical thinking, creativity, and deeper insight into complex topics by deconstructing and reconstructing metaphorical mappings.

This tool is inspired by the work of cognitive linguists like George Lakoff and Mark Johnson, the concept of frame negotiation, and the [MetaphorHacker](https://metaphorhacker.net) approach developed by Dominik Lukeš.

## Features

Metaphornik combines AI-powered analysis with an interactive, user-driven interface to provide a rich exploratory experience.

-   **Metaphor Generation**: Don't have a metaphor? No problem. Provide a topic (e.g., "economy", "learning"), and Metaphornik will generate a list of insightful metaphors to kickstart your analysis.
-   **Automated Domain Mapping**: Input a metaphor (e.g., "AI is an intern"), and the tool automatically identifies the Source Domain (intern) and Target Domain (AI), generating a list of key attributes for each.
-   **Multiple Perspectives**: The AI generates several distinct "perspectives"—different ways of mapping attributes from the source to the target—each with a unique icon and description.
-   **In-Depth Consequence Exploration**: Select a perspective to get a detailed AI analysis of its implications. Discover what each viewpoint highlights, what it hides, and the new insights it offers.
-   **Interactive Customization**:
    -   **Create Your Own Mappings**: Disagree with the AI? Drag and drop facts between domains to create your own custom perspectives.
    -   **Add Your Own Facts**: Enrich the analysis by adding your own attributes to either domain.
    -   **Reorder Facts**: Drag and drop facts within a column to reorganize them.
-   **Side-by-Side Comparison**: Select up to three perspectives to compare them directly. The interface provides color-coded mapping lines, a legend, and an AI-generated summary of the key differences and similarities.
-   **Creative Extension**:
    -   **Generate Documents**: Use a perspective as a creative brief to generate text artifacts like news stories, job ads, or slogans.
    -   **Generate Images**: Create and edit images that visually represent the essence of a chosen perspective.
-   **Exploration Management**:
    -   All analyses are automatically saved to your browser's local storage.
    -   A dedicated **Saved Explorations** page allows you to revisit and manage your past work.
    -   **Import/Export** functionality lets you save your work to a file or share it with others.

## How It Works

Metaphornik follows a simple yet powerful four-step process:

1.  **Domain Mapping**: The tool first deconstructs the metaphor into its source and target domains and lists their core attributes.
2.  **Perspective Generation**: Next, it generates several unique perspectives by creating partial mappings between the domains.
3.  **Consequence Exploration**: You can then select a perspective to explore its logical consequences and understand its unique worldview.
4.  **Creative Extension**: Finally, you can use these insights to generate new creative works, like documents and images, that embody the perspective.

## Architecture

Metaphornik is a client-side Single Page Application (SPA) designed for simplicity and direct interaction with Generative AI models.

### Core Components
-   **Frontend Framework**: React 19 (via `react-dom/client`) handling the UI component tree and state management.
-   **Styling**: Tailwind CSS 3 is bundled locally for utility-first styling. Google Material Symbols provide the iconography.
-   **AI Integration**: Browser-direct Gemini and OpenAI APIs support all text operations, image generation and image editing. Provider settings keep the visitor's key in memory by default, with explicit opt-in browser persistence and a clear/reset action. No hosting proxy or build-time API key is used.
-   **Data Persistence**: The application relies on the browser's `localStorage` to persist user analyses, ensuring data remains available across page reloads without requiring a database.

### Key Directories
-   `components/`: Contains all React UI components (e.g., `DomainColumn`, `MappingVisualizer`, `ConsequenceExplorer`).
-   `services/`: Handles interactions with the Gemini API (`geminiService.ts`).
-   `types.ts`: TypeScript definitions for the application's data structures (Domains, Facts, Mappings, etc.).

## Deployment

Since Metaphornik is a client-side application, it can be deployed to any static site hosting service (e.g., Vercel, Netlify, GitHub Pages, Firebase Hosting).

### Local development and static hosting

Use Node.js 22.18 or later (the test command uses native TypeScript support) and npm:

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run dev
```

The production build needs no credentials. Upload `dist/` to a static host when deployment is authorised. For Cloudflare Pages, use `npm ci && npm run build`, with output directory `dist`; no Functions, Worker, GCP service or secret binding is required. No deployment or DNS change is part of this migration.

Visitors open **Provider settings**, select OpenAI or Gemini, enter their API key, and apply settings. Both providers support text analysis, metaphor generation, identification, reframing, perspective comparison, creative documents, image generation and image editing. Defaults are `gpt-4.1-mini` / `gpt-image-1` for OpenAI and `gemini-2.5-pro` / `gemini-2.5-flash-image` for Gemini; model IDs are editable for account availability. API usage is charged by the chosen provider. ChatGPT subscription sign-in is a later local-app feature.

Keys are not embedded in the build, URLs, results or exports. Browser persistence is optional and can be cleared. Only select “Remember” on a device you trust. Provider authentication, model-access, quota and network failures are reported without exposing raw API response bodies.

### Saved results and offline viewing

Existing browser records and legacy JSON exports remain supported. Import validates complete records and mapping references before merging. Viewing, importing and exporting saved results need no key. **Save offline HTML viewer** packages all saved results into a single local file. Existing records are preserved if browser storage is unavailable or validation fails; export in-memory work before closing in that situation.

The dependency-free portable renderer, machine-readable schema, example results and exact command contract are documented in [portable/README.md](portable/README.md). The complete `portable/` folder can be copied into a skill distribution without installing or building this app. The HTML viewer uses self-contained styling inspired by the existing interface and preserves all result content. It shows generated Markdown as text; the full app retains editing and AI generation.

The web interface bundles its Tailwind 3 styling locally and bundles its Material Symbols icon font locally; the portable viewer has no external dependencies. The repository no longer requires AI Studio-injected globals or its runtime import map.

## License

The source code for Metaphornik is licensed under the [MIT License](LICENSE.txt).

The content, including the text on the "Principles" page, is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).

## Acknowledgements

This tool was conceived and developed by **Dominik Lukeš** with the assistance of Gemini.

The analytical approach is inspired by the work of Donald Schön, George Lakoff, Mark Johnson, Gilles Fauconnier, Mark Turner, and others.


### Cloudflare release preparation

The production build includes the readable landing page, canonical metadata, sitemap and robots file for `https://metaphornik.dominiklukes.net/`. Pages preview addresses receive a noindex response header through static `_headers` rules. All assets, including the icon font, are bundled. The direct visitor-key provider implementation remains; the older guide branch's owner-funded proxy is not included.

Use `npm ci`, `npm test`, `npm run typecheck` and `npm run build`. The build verifies the canonical readable landing page, local resource references and deployment files. Wrangler configuration publishes only `dist`; no Functions, provider secrets or GCP backend are needed. A preview deployment is distinct from changing the public custom domain or retiring its existing services.
