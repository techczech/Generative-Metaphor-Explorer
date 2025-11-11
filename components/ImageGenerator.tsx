
import React, { useState, useEffect } from 'react';
import { GeneratedImage, MappingSet, Domain, GeneratedDocument } from '../types';
import { ImageIcon, WandSparklesIcon, LoaderIcon } from './Icons';

interface ImageGeneratorProps {
    mappingSet: MappingSet;
    sourceDomain: Domain;
    targetDomain: Domain;
    generatedDocuments: GeneratedDocument[];
    generatedImage: GeneratedImage | undefined;
    isLoading: boolean;
    onGenerate: (prompt: string) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ mappingSet, sourceDomain, targetDomain, generatedDocuments, generatedImage, isLoading, onGenerate }) => {
    const [prompt, setPrompt] = useState('');

    useEffect(() => {
        if (!generatedImage) {
            // Create a context-rich prompt
            const mappingDetails = mappingSet.mappings.map(m => {
                const sourceFact = sourceDomain.facts[m.sourceFactIndex]?.text;
                const targetFact = targetDomain.facts[m.targetFactIndex]?.text;
                if (sourceFact && targetFact) {
                    return `- '${sourceFact}' from the source is like '${targetFact}' in the target.`;
                }
                return '';
            }).filter(Boolean).join('\n');

            const documentSnippets = generatedDocuments.map(doc => 
                `A generated ${doc.type} for this perspective starts with: "${doc.content.slice(0, 150)}..."`
            ).join('\n');

            let context = `The perspective is named "${mappingSet.name}".\n`;
            if (mappingDetails) {
                context += `It's based on these connections:\n${mappingDetails}\n`;
            }
            if (documentSnippets) {
                context += `This perspective has inspired the following creative documents:\n${documentSnippets}\n`;
            }

            const newPrompt = `Create an abstract, artistic, and visually compelling illustration for a metaphorical perspective.
Do not include any text in the image.
The image should evoke the feeling and core ideas of the perspective, which is described below:
---
${context}
---
Generate an image that captures the essence of these ideas.`;
            setPrompt(newPrompt);
        } else {
            setPrompt(''); // Clear prompt for editing
        }
    }, [generatedImage, mappingSet, sourceDomain, targetDomain, generatedDocuments]);

    const handleGenerateClick = () => {
        if (prompt.trim()) {
            onGenerate(prompt.trim());
        }
    };
    
    return (
        <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-300">
            <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-3">
                <ImageIcon />
                <span>Illustrate Perspective with an Image</span>
            </h3>
            
            {generatedImage && (
                <div className="mb-4">
                    <img 
                        src={`data:${generatedImage.mimeType};base64,${generatedImage.base64Data}`} 
                        alt={`Illustration for ${mappingSet.name}`}
                        className="rounded-lg shadow-md border w-full"
                    />
                    <p className="text-xs text-slate-500 mt-2">Last prompt: "{generatedImage.history[generatedImage.history.length-1].prompt}"</p>
                </div>
            )}
            
            <div className="p-4 bg-slate-100 rounded-lg">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={generatedImage ? "Describe your edits (e.g., 'make it black and white')" : "Describe the image to generate..."}
                    rows={generatedImage ? 2 : 8}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
                <button
                    onClick={handleGenerateClick}
                    disabled={isLoading || !prompt.trim()}
                    className="mt-3 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-slate-400"
                >
                    {isLoading ? <LoaderIcon className="animate-spin" /> : <WandSparklesIcon />}
                    <span>{isLoading ? 'Generating...' : (generatedImage ? 'Apply Edit' : 'Generate Image')}</span>
                </button>
            </div>
        </div>
    );
};

export default ImageGenerator;
