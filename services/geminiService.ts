

import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MetaphorAnalysis, MappingSet, Domain, Mapping, Fact, GeneratedDocument, GeneratedImage, AlternativeFrame } from '../types';

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        sourceDomain: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The name of the source domain (e.g., 'Interns')." },
                facts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 5-7 key attributes or concepts for the source domain." }
            },
            required: ['name', 'facts']
        },
        targetDomain: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The name of the target domain (e.g., 'AI')." },
                facts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 5-7 key attributes or concepts for the target domain." }
            },
            required: ['name', 'facts']
        },
        mappingSets: {
            type: Type.ARRAY,
            description: "A list of 3-4 different, partial ways to map the source to the target. Each represents a unique perspective.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "A short, descriptive name for this mapping set (e.g., 'Skills Mapping')." },
                    description: { type: Type.STRING, description: "A one-sentence explanation of what this mapping focuses on." },
                    icon: { type: Type.STRING, description: "The name of a single Google Material Symbol that best represents this mapping's theme (e.g., 'build', 'groups', 'psychology')." },
                    mappings: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                sourceFactIndex: { type: Type.INTEGER, description: "The index of the fact in the sourceDomain.facts array." },
                                targetFactIndex: { type: Type.INTEGER, description: "The index of the fact in the targetDomain.facts array." }
                            },
                            required: ['sourceFactIndex', 'targetFactIndex']
                        }
                    }
                },
                required: ['name', 'description', 'icon', 'mappings']
            }
        }
    },
    required: ['sourceDomain', 'targetDomain', 'mappingSets']
};

export const analyzeMetaphor = async (metaphor: string): Promise<MetaphorAnalysis> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are an expert in conceptual metaphor analysis. A user has provided the metaphor: "${metaphor}".
    Your task is to analyze this metaphor. Please return a JSON object that strictly follows the provided schema.
    Identify the source and target domains. For each domain, list 5-7 distinct, concise facts or attributes.
    Then, create 3-4 different 'mappingSets'. Each set should represent a unique, partial perspective on the metaphor by linking facts from the source domain to the target domain.
    For each mappingSet, also provide a relevant 'icon' name from the Google Material Symbols library that visually represents the core concept of the perspective.
    The mappings should use the array indices of the facts you've identified. Ensure indices are valid.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
        },
    });

    const jsonText = response.text.trim();
    // The response is already a JSON object due to responseMimeType and responseSchema.
    const analysisResult = JSON.parse(jsonText) as MetaphorAnalysis;
    
    // Add unique IDs to facts client-side
    analysisResult.sourceDomain.facts = analysisResult.sourceDomain.facts.map((factText, index) => ({
        id: `source-${index}`,
        text: factText as unknown as string, // Cast because Gemini returns string[], not Fact[]
    }));

    analysisResult.targetDomain.facts = analysisResult.targetDomain.facts.map((factText, index) => ({
        id: `target-${index}`,
        text: factText as unknown as string,
    }));

    return analysisResult;
};


export const exploreConsequences = async (
    metaphor: string,
    selectedMappingSet: MappingSet,
    sourceDomain: Domain,
    targetDomain: Domain
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const mappingDetails = selectedMappingSet.mappings.map(m => {
        const sourceFact = sourceDomain.facts[m.sourceFactIndex]?.text;
        const targetFact = targetDomain.facts[m.targetFactIndex]?.text;
        if (sourceFact && targetFact) {
            return `- '${sourceFact}' (from ${sourceDomain.name}) is mapped to '${targetFact}' (from ${targetDomain.name})`;
        }
        return '';
    }).filter(Boolean).join('\n');
    
    if (mappingDetails.length === 0) {
        return "## No Mappings Provided\nPlease create at least one mapping between the source and target domains to explore the consequences.";
    }

    const prompt = `Continuing the analysis of the metaphor "${metaphor}", we are focusing on a specific perspective: "${selectedMappingSet.name} - ${selectedMappingSet.description}".
This mapping connects the following concepts:
${mappingDetails}

Based ONLY on this specific set of connections, explore the consequences.
Provide a concise, insightful analysis in Markdown format. Use up to three levels of headings for structure (e.g., ## Section, ### Subsection).

Your analysis should cover:
1.  **New Insights:** What new understanding does this perspective offer about ${targetDomain.name}?
2.  **Limitations:** What are the potential misunderstandings this specific mapping could create?
3.  **Highlights and Hides:** Present this section as a Markdown table with two columns: "What it Highlights" and "What it Hides". Each row in the table should contain a specific point.

Example table format:
| What it Highlights | What it Hides |
| --- | --- |
| Point A about ${targetDomain.name} is emphasized. | Point B about ${targetDomain.name} is obscured. |
| More details on highlight... | More details on what is hidden... |`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });

    return response.text;
};

export const generateMoreFacts = async (domainName: string, existingFacts: string[]): Promise<string[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are an expert in conceptual analysis. For the domain "${domainName}", you are given a list of existing attributes: ${JSON.stringify(existingFacts)}.
    Generate 3-4 new, distinct, and concise attributes or facts that are relevant to this domain but are not on the existing list.
    Return your answer as a JSON array of strings. For example: ["new fact 1", "new fact 2"]`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as string[];
};

export const summarizeCustomPerspective = async (
    sourceDomain: Domain,
    targetDomain: Domain,
    mappings: Mapping[]
): Promise<{ name: string; description: string }> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const mappingDetails = mappings.map(m => {
        const sourceFact = sourceDomain.facts[m.sourceFactIndex]?.text;
        const targetFact = targetDomain.facts[m.targetFactIndex]?.text;
        if (sourceFact && targetFact) {
            return `- '${sourceFact}' is mapped to '${targetFact}'`;
        }
        return '';
    }).filter(Boolean).join('\n');

    const prompt = `Based on the following mappings between the "${sourceDomain.name}" domain and the "${targetDomain.name}" domain, generate a short, creative name and a one-sentence description for this perspective.
Mappings:
${mappingDetails}

Return the result as a JSON object with two keys: "name" and "description". For example: { "name": "Functional Analogy", "description": "This perspective focuses on the functional similarities between the two domains." }`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['name', 'description']
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as { name: string; description: string };
};

export const comparePerspectives = async (
    metaphor: string,
    perspectives: { 
        set: MappingSet; 
        consequences: string; 
        documents: GeneratedDocument[];
        image?: GeneratedImage;
    }[]
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const perspectivesDetails = perspectives.map(p => {
        const documentsDetails = p.documents.length > 0
            ? `**Generated Documents:**\n${p.documents.map(doc => `* **${doc.type}:** A document was generated reflecting this view.`).join('\n')}`
            : '';
        
        const imageDetails = p.image
            ? `**Illustrative Image:** An image was generated for this perspective. Final prompt: "${p.image.history[p.image.history.length - 1].prompt}"`
            : '';


        return `### Perspective: "${p.set.name}"
**Description:** ${p.set.description}
**Consequences Summary:**
${p.consequences}
${documentsDetails}
${imageDetails}
---`;
    }).join('\n\n');

    const prompt = `You are an expert in comparative conceptual analysis. For the metaphor "${metaphor}", you are given ${perspectives.length} different perspectives, each with a summary of its consequences and details on any creative artifacts (documents, images) generated from it.

${perspectivesDetails}

Your task is to synthesize and compare these perspectives.
- What are the key differences in focus between them? Consider the abstract consequences, the nature of the documents, and the imagery described.
- What does each perspective uniquely highlight about the target domain, and what does it consequently hide?
- How do the generated artifacts reveal the underlying assumptions or tone of each perspective?
- What larger insights or tensions emerge when you consider these perspectives together?

Provide a concise, insightful analysis in Markdown format. Use headings and bullet points for clarity.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });

    return response.text;
};

export const generateDocumentFromPerspective = async (
    metaphor: string,
    perspective: { set: MappingSet, consequences: string },
    documentType: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are a creative expert tasked with generating a document.
Your work must be entirely shaped by a specific metaphorical perspective.

**Metaphor:** "${metaphor}"
**Perspective:** "${perspective.set.name}" - ${perspective.set.description}
**Contextual Analysis of this Perspective:**
${perspective.consequences}

---

Now, fully adopt this point of view. Generate a document of the following type: **${documentType}**.

The document should not explain the metaphor. Instead, it should be a natural artifact of someone who *thinks* through this metaphorical lens. For example, if the metaphor is "argument is war" and the document is a "meeting invitation", it might use language like "strategy session" or "defend your position".

Generate the document now in Markdown format.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });

    return response.text;
};

export const generateOrEditImage = async (
    prompt: string,
    baseImage?: { base64Data: string; mimeType: string; }
): Promise<{ base64Data: string; mimeType: string }> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const parts = [];
    if (baseImage) {
        parts.push({
            inlineData: {
                data: baseImage.base64Data,
                mimeType: baseImage.mimeType,
            },
        });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    // Extract the image data from the response
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return {
                base64Data: part.inlineData.data,
                mimeType: part.inlineData.mimeType,
            };
        }
    }

    throw new Error("Image generation failed to return an image.");
};

export const generateMetaphors = async (topic: string): Promise<string[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are an expert in creative thinking and conceptual metaphors. A user wants to understand the topic "${topic}" better.
    Generate 5-7 distinct and insightful generative metaphors for this topic.
    Each metaphor should be in the format "X is Y", where X is the topic or a variation of it.
    Return your answer as a JSON array of strings. For example, if the topic is "learning", you might return: ["learning is a journey", "learning is building a house"].`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as string[];
};

const identifiedMetaphorSchema = {
    type: Type.OBJECT,
    properties: {
        metaphor: { type: Type.STRING, description: "The conceptual metaphor in the format 'CONCEPT A IS CONCEPT B'." },
        explanation: { type: Type.STRING, description: "A brief explanation of how the metaphor works in the context of the statement." }
    },
    required: ['metaphor', 'explanation']
};

export const identifyMetaphors = async (statement: string): Promise<{metaphor: string; explanation: string}[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are an expert in conceptual metaphor analysis. A user has provided the statement: "${statement}".
    Your task is to identify all potential conceptual metaphors present in this statement. For each metaphor you find, express it in the canonical 'A IS B' format and provide a brief explanation.
    Return a JSON array of objects, where each object represents a metaphor and strictly follows the provided schema. If no metaphors are found, return an empty array.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: identifiedMetaphorSchema
            },
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as {metaphor: string; explanation: string}[];
};

const alternativeFrameSchema = {
    type: Type.OBJECT,
    properties: {
        proposedMetaphor: { type: Type.STRING, description: "The new conceptual metaphor, ideally in 'A is B' or 'A as B' format." },
        reasoning: { type: Type.STRING, description: "A brief explanation of why this new frame is useful, what it highlights, and how it differs from the original." }
    },
    required: ['proposedMetaphor', 'reasoning']
};

export const suggestAlternativeFrames = async (statement: string, metaphors: {metaphor: string; explanation: string}[]): Promise<AlternativeFrame[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const metaphorDetails = metaphors.map(m => `- "${m.metaphor}": ${m.explanation}`).join('\n');

    const prompt = `You are an expert in communication and conceptual reframing. A user wants to explore alternative ways to understand a concept.

    Original Statement/Concept: "${statement}"

    This concept currently relies on the following conceptual metaphors:
    ${metaphorDetails}

    Your task is to propose 3-4 alternative conceptual metaphors that reframe the original concept in a different light. The goal is to find frames that might be more constructive, nuanced, or have fewer conceptual mismatches.

    For each proposal, provide the new metaphor and a brief reasoning for its usefulness. Use the user's example of reframing "Surveillance Capitalism" as "Evidence-Based Capitalism" (drawing on "Evidence-Based Medicine") as a guide for the kind of creative, analytical reframing required.

    Return a JSON array of objects, where each object strictly follows the provided schema.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: alternativeFrameSchema
            },
        },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AlternativeFrame[];
};
