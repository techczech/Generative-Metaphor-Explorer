
import React from 'react';
import { StoredMetaphorAnalysis } from '../types';
import { HistoryIcon, DeleteIcon } from './Icons';

interface SavedAnalysesProps {
  analyses: StoredMetaphorAnalysis[];
  onLoad: (metaphor: string) => void;
  onDelete: (metaphor: string) => void;
  isLoading: boolean;
}

const SavedAnalyses: React.FC<SavedAnalysesProps> = ({ analyses, onLoad, onDelete, isLoading }) => {
  if (analyses.length === 0) {
    return null;
  }
  
  const sortedAnalyses = [...analyses].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md border border-slate-200">
      <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-3">
        <HistoryIcon className="text-slate-500" />
        <span>Previous Explorations</span>
      </h2>
      <ul className="divide-y divide-slate-200">
        {sortedAnalyses.map((item) => (
          <li key={item.metaphor} className="py-3 flex items-center justify-between">
            <div>
              <button 
                onClick={() => onLoad(item.metaphor)}
                disabled={isLoading}
                className="font-semibold text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline text-left"
              >
                {item.metaphor}
              </button>
              <p className="text-sm text-slate-500">
                Saved on {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => onDelete(item.metaphor)}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
              aria-label={`Delete ${item.metaphor}`}
            >
              <DeleteIcon />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SavedAnalyses;