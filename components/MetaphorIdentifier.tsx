import React, { useState } from 'react';
import { IdentifyIcon, LoaderIcon, WandSparklesIcon, ReframeIcon } from './Icons';
import { AlternativeFrame } from '../types';

interface IdentifiedMetaphor {
  metaphor: string;
  explanation: string;
}

interface MetaphorIdentifierProps {
  onIdentify: (statement: string) => void;
  isLoading: boolean;
  identifiedMetaphors: IdentifiedMetaphor[];
  onSelectMetaphor: (metaphor: string) => void;
  isAnalysisLoading: boolean;
  onReframe: () => void;
  isLoadingReframing: boolean;
  alternativeFrames: AlternativeFrame[];
}

const MetaphorIdentifier: React.FC<MetaphorIdentifierProps> = ({ 
  onIdentify, 
  isLoading, 
  identifiedMetaphors, 
  onSelectMetaphor, 
  isAnalysisLoading,
  onReframe,
  isLoadingReframing,
  alternativeFrames
}) => {
  const [statement, setStatement] = useState('');
  const [examples] = useState([
    'You are not a customer, you are the product.',
    'Natural Selection',
    'Orange is the New Black',
    'Surveillance capitalism'
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (statement.trim() && !isLoading) {
      onIdentify(statement);
    }
  };

  const handleExampleClick = (example: string) => {
    setStatement(example);
    onIdentify(example);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2">
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Enter a term, phrase or sentence where you'd like to identify metaphors."
          rows={3}
          className="flex-grow w-full px-4 py-3 text-lg bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
          disabled={isLoading || isAnalysisLoading}
        />
        <button
          type="submit"
          disabled={isLoading || isAnalysisLoading || !statement.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? <LoaderIcon className="animate-spin" /> : <IdentifyIcon />}
          <span>{isLoading ? 'Identifying...' : 'Identify'}</span>
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

      {identifiedMetaphors.length > 0 && (
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h3 className="text-md font-semibold text-slate-600 mb-3">Identified Metaphors:</h3>
          <div className="space-y-3">
            {identifiedMetaphors.map(({ metaphor, explanation }, index) => (
              <div key={index} className="p-3 bg-white border border-slate-200 rounded-md">
                <button
                  onClick={() => onSelectMetaphor(metaphor)}
                  disabled={isAnalysisLoading}
                  className="w-full flex items-center justify-between text-left text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  <span className="font-bold">{metaphor}</span>
                  <WandSparklesIcon />
                </button>
                <p className="text-sm text-slate-500 mt-1">{explanation}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            {isLoadingReframing && (
                 <div className="flex items-center justify-center text-slate-500">
                    <LoaderIcon className="animate-spin mr-2" />
                    <span>Generating reframes...</span>
                </div>
            )}
            {!isLoadingReframing && alternativeFrames.length === 0 && (
                 <button
                    onClick={onReframe}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-slate-400"
                >
                    <ReframeIcon />
                    <span>Reframe this Statement</span>
                </button>
            )}
             {alternativeFrames.length > 0 && (
                 <div>
                    <h4 className="font-semibold text-slate-600 mb-2">Alternative Frames:</h4>
                    <div className="space-y-3">
                        {alternativeFrames.map((frame, i) => (
                          <div key={i} className="p-3 bg-white border border-slate-200 rounded-md">
                            <button
                                onClick={() => onSelectMetaphor(frame.proposedMetaphor)}
                                disabled={isAnalysisLoading}
                                className="w-full text-left text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                                <span className="font-bold flex items-center justify-between">
                                    {frame.proposedMetaphor}
                                    <WandSparklesIcon />
                                </span>
                            </button>
                            <p className="text-sm text-slate-500 mt-1">{frame.reasoning}</p>
                          </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaphorIdentifier;
