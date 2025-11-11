import React from 'react';
import { BrainCircuitIcon, TerminalIcon } from './Icons';
import GeminiInfoLink from './GeminiInfoLink';

const About: React.FC = () => {
  return (
    <div className="bg-white p-6 sm:p-8 md:p-12 rounded-xl shadow-lg border border-slate-200 animate-fade-in">
      <article className="max-w-prose mx-auto">
        <header className="text-center mb-12">
          <BrainCircuitIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold text-slate-800">About Metaphornik</h1>
          <p className="mt-4 text-lg text-slate-600">Exploring new perspectives through the power of generative metaphors and AI.</p>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-slate-200 pb-3 mb-6">What is this tool?</h2>
          <div className="space-y-4 text-slate-700 text-lg leading-relaxed">
            <p>
              The Generative Metaphor Explorer is an interactive application designed to help you deconstruct and understand conceptual metaphors. By inputting a metaphor (e.g., "AI is an intern"), the tool uses <GeminiInfoLink /> to:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Identify the <strong>source</strong> and <strong>target</strong> domains of the metaphor.</li>
              <li>Generate key facts and attributes for each domain.</li>
              <li>Propose several different <strong>partial mappings</strong> between the domains, each representing a unique perspective.</li>
              <li>Explore the <strong>consequences</strong> and implications of adopting a specific perspective.</li>
            </ul>
            <p>
              The goal is not to find the "correct" interpretation of a metaphor, but to use the mappings as a creative engine for generating new insights, challenging assumptions, and seeing familiar concepts in a new light.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-slate-200 pb-3 mb-6 flex items-center gap-3">
            <TerminalIcon />
            <span>Credits & Technology</span>
          </h2>
          <div className="space-y-4 text-slate-700 text-lg leading-relaxed">
            <p>
              This tool was vibecoded by <a href="https://www.linkedin.com/in/dominiklukes/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">Dominik Lukeš</a>, building upon his extensive research into conceptual metaphors and frame negotiation.
            </p>
            <p>
              It was built using <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">Google AI Studio</a>, a web-based tool for prototyping with generative AI models.
            </p>
             <p>
              The core analysis is powered by <GeminiInfoLink />, which provides the nuanced understanding required to deconstruct and explore metaphorical mappings.
            </p>
          </div>
        </section>
      </article>
    </div>
  );
};

export default About;