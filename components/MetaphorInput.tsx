import React, { useState } from 'react';
import { WandSparklesIcon, StopCircleIcon } from './Icons';

interface MetaphorInputProps {
  onAnalyze: (metaphor: string) => void;
  isLoading: boolean;
  onStop: () => void;
}

const MetaphorInput: React.FC<MetaphorInputProps> = ({ onAnalyze, isLoading, onStop }) => {
  const [metaphor, setMetaphor] = useState('AI is an intern');
  const [examples] = useState([
    'AI is an intern',
    'Argument is war',
    'Education is a business',
    'Time is money'
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (metaphor.trim() && !isLoading) {
      onAnalyze(metaphor);
    }
  };
  
  const handleExampleClick = (example: string) => {
    setMetaphor(example);
    onAnalyze(example);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
        <input
          type="text"
          value={metaphor}
          onChange={(e) => setMetaphor(e.target.value)}
          placeholder="e.g., AI is an intern"
          className="flex-grow w-full px-4 py-3 text-lg bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
          disabled={isLoading}
        />
        {isLoading ? (
            <button
                type="button"
                onClick={onStop}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
                <StopCircleIcon />
                <span>Stop</span>
            </button>
        ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <WandSparklesIcon />
              <span>Analyze</span>
            </button>
        )}
      </form>
       <div className="mt-4 text-sm text-slate-500">
        Or try an example:
        <span className="ml-2">
          {examples.map((ex, i) => (
            <button key={i} onClick={() => handleExampleClick(ex)} disabled={isLoading} className="text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline px-2 py-1 rounded">
              {ex}
            </button>
          ))}
        </span>
      </div>
    </div>
  );
};

export default MetaphorInput;