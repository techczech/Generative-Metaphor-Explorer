import React from 'react';
import { SourceIcon, PerspectiveIcon, ConsequencesIcon, WandSparklesIcon } from './Icons';
import GeminiInfoLink from './GeminiInfoLink';

const HowItWorks: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto my-8 p-6 md:p-8 bg-white rounded-xl shadow-md border border-slate-200 animate-fade-in text-slate-700">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">How Metaphornik Works</h2>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 text-left">
                <div className="flex items-start gap-4">
                    <div className="text-blue-500 text-3xl mt-1 flex-shrink-0 font-bold">1.</div>
                    <div>
                        <h3 className="font-bold text-lg">Deconstruction</h3>
                        <p className="text-slate-600">Enter a metaphor (e.g., "AI is an intern"). The tool uses <GeminiInfoLink /> to identify the <strong>Source Domain</strong> (Intern) and <strong>Target Domain</strong> (AI) and lists key attributes for each.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="text-indigo-500 text-3xl mt-1 flex-shrink-0 font-bold">3.</div>
                     <div>
                        <h3 className="font-bold text-lg">Consequence Exploration</h3>
                        <p className="text-slate-600">Select a perspective to explore its logical <strong>Consequences</strong>. What does this specific viewpoint imply about the Target Domain? What does it highlight, and what does it hide?</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="text-green-500 text-3xl mt-1 flex-shrink-0 font-bold">2.</div>
                    <div>
                        <h3 className="font-bold text-lg">Perspective Generation</h3>
                        <p className="text-slate-600"><GeminiInfoLink /> generates several <strong>Perspectives</strong>, which are different ways of mapping attributes from the source to the target, highlighting various aspects of the metaphor.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="text-purple-500 text-3xl mt-1 flex-shrink-0 font-bold">4.</div>
                    <div>
                        <h3 className="font-bold text-lg">Creative Extension</h3>
                        <p className="text-slate-600">Use the explored consequences as a creative brief to generate documents or images, turning abstract insights into concrete artifacts that embody the chosen perspective.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default HowItWorks;