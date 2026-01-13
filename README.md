# Metaphornik

*Explore new perspectives through generative metaphors*

Metaphornik is an interactive web application designed to help users understand and creatively explore conceptual metaphors. Powered by Google's Gemini 2.5 Pro, it serves as a tool for critical thinking, creativity, and deeper insight into complex topics by deconstructing and reconstructing metaphorical mappings.

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

## Technology Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **Generative AI**: Google Gemini 2.5 Pro via the Google AI SDK
-   **Prototyping Environment**: Built with and for Google AI Studio

## License

The source code for Metaphornik is licensed under the [MIT License](LICENSE).

The content, including the text on the "Principles" page, is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).

## Acknowledgements

This tool was conceived and developed by **Dominik Lukeš** with the assistance of Gemini.

The analytical approach is inspired by the work of Donald Schön, George Lakoff, Mark Johnson, Gilles Fauconnier, Mark Turner, and others.
