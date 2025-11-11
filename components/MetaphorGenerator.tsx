import React, { useState } from 'react';
import { GenerateIcon, LoaderIcon, WandSparklesIcon } from './Icons';

interface MetaphorGeneratorProps {
  onGenerate: (topic: string) => void;
  isLoading: boolean;
  generatedMetaphors: string[];
  onSelectMetaphor: (metaphor: string) => void;
  isAnalysisLoading: boolean;
}

const MetaphorGenerator: React.FC<MetaphorGeneratorProps> = ({ onGenerate, isLoading, generatedMetaphors, onSelectMetaphor, isAnalysisLoading }) => {
  const [topic, setTopic] = useState('');
  const [examples] = useState([
    'banks',
    'cars',
    'electricity',
    'economy',
    'Large Language Models',
    'Machine Learning',
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onGenerate(topic);
    }
  };

  const handleExampleClick = (example: string) => {
    setTopic(example);
    onGenerate(example);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic, e.g., banks"
          className="flex-grow w-full px-4 py-3 text-lg bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
          disabled={isLoading || isAnalysisLoading}
        />
        <button
          type="submit"
          disabled={isLoading || isAnalysisLoading || !topic.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? <LoaderIcon className="animate-spin" /> : <GenerateIcon />}
          <span>{isLoading ? 'Generating...' : 'Generate'}</span>
        </button>
      </form>

      <div className="mt-4 text-sm text-slate-500">
        Or try an example:
        <span className="ml-2 flex flex-wrap gap-x-3 gap-y-1">
          {examples.map((ex, i) => (
            <button 
              key={i} 
              onClick={() => handleExampleClick(ex)} 
              disabled={isLoading || isAnalysisLoading} 
              className="text-slate-600 hover:text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline"
            >
              {ex}
            </button>
          ))}
        </span>
      </div>


      {generatedMetaphors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold text-slate-600 mb-2">Click a metaphor to analyze it:</h3>
          <div className="flex flex-wrap gap-3">
            {generatedMetaphors.map((metaphor, index) => (
              <button
                key={index}
                onClick={() => onSelectMetaphor(metaphor)}
                disabled={isAnalysisLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-lg border-2 border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition-colors disabled:opacity-50"
              >
                <WandSparklesIcon className="text-blue-500" />
                <span>{metaphor}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaphorGenerator;
