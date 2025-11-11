import React, { useState } from 'react';

const GeminiInfoLink: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      <span 
        className="font-semibold text-blue-600 cursor-pointer hover:underline"
        onClick={(e) => { e.preventDefault(); setShowInfo(prev => !prev); }}
      >
        Gemini 2.5 Pro
      </span>
      {showInfo && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-800 text-white text-sm rounded-lg shadow-lg z-10" role="tooltip">
          <p>
            Gemini 2.5 Pro is a frontier Large Language Model by Google with reasoning capabilities and a large context window. 
            See <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">Google's website</a> for more details.
          </p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
        </div>
      )}
    </span>
  );
};

export default GeminiInfoLink;