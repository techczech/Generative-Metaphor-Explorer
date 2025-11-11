import React from 'react';
import { StoredMetaphorAnalysis } from '../types';
import { HistoryIcon, DeleteIcon, SavedIcon } from './Icons';

interface SavedAnalysesProps {
  analyses: StoredMetaphorAnalysis[];
  onLoad: (metaphor: string) => void;
  onDelete: (metaphor: string) => void;
  isLoading: boolean;
  limit?: number; // To show only N recent items
  isPage?: boolean; // To style as a full page
}

const SavedAnalyses: React.FC<SavedAnalysesProps> = ({ analyses, onLoad, onDelete, isLoading, limit, isPage }) => {
  const sortedAnalyses = [...analyses].sort((a, b) => b.timestamp - a.timestamp);
  const analysesToDisplay = limit ? sortedAnalyses.slice(0, limit) : sortedAnalyses;
  
  const title = isPage ? "Saved Explorations" : "Recent Explorations";
  const Icon = isPage ? SavedIcon : HistoryIcon;
  const containerClasses = isPage 
    ? "w-full bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 animate-fade-in"
    : "w-full max-w-4xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md border border-slate-200";

  if (analyses.length === 0 && isPage) {
    return (
        <div className={containerClasses}>
            <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-3">
                <Icon className="text-slate-500" />
                <span>{title}</span>
            </h2>
            <p className="text-slate-500 text-center py-8">You have no saved explorations yet. Start by analyzing a metaphor on the Explorer page.</p>
        </div>
    );
  }

  if (analysesToDisplay.length === 0) {
    return null;
  }
  
  return (
    <div className={containerClasses}>
      <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-3">
        <Icon className="text-slate-500" />
        <span>{title}</span>
      </h2>
      <ul className="divide-y divide-slate-200">
        {analysesToDisplay.map((item) => (
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