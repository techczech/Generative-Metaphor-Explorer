import React, { useState } from 'react';
import { Domain, Fact } from '../types';
import { SourceIcon, TargetIcon, AddIcon, WandSparklesIcon, LoaderIcon } from './Icons';

interface DomainColumnProps {
  domain: Domain;
  factRefs: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
  side: 'source' | 'target';
  mappedIndices?: Set<number>;
  onFactDragStart?: (factIndex: number) => void;
  onFactDrop?: (factIndex: number) => void;
  onAddFact?: (text: string) => void;
  onGenerateMoreFacts?: () => Promise<void>;
  draggedItem: { index: number; side: 'source' | 'target' } | null;
}

const FactItem: React.FC<{
  fact: Fact;
  index: number;
  isMapped: boolean;
  factRef: (el: HTMLDivElement | null) => void;
  onDragStart?: () => void;
  onDrop?: () => void;
  isBeingDragged?: boolean;
}> = ({ fact, isMapped, factRef, onDragStart, onDrop, isBeingDragged }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isBeingDragged) {
      setIsDragOver(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop?.();
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };


  return (
     <div
      ref={factRef}
      draggable={true}
      onDragStart={onDragStart}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`p-3 rounded-lg transition-all duration-300 relative cursor-grab
        ${isMapped ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500' : 'bg-slate-100 text-slate-700'}
        border-2 border-dashed
        ${isDragOver ? 'border-indigo-500 bg-indigo-100' : 'border-transparent'}
        ${fact.custom ? 'border-2 border-green-400' : ''}
        ${isBeingDragged ? 'opacity-40' : ''}
      `}
    >
      {fact.text}
       {fact.custom && <span className="absolute top-1 right-1 text-xs text-green-600 font-bold">USER</span>}
    </div>
  )
}

const AddFactControl: React.FC<{
    onAddFact: (text: string) => void;
    onGenerateMoreFacts: () => Promise<void>;
}> = ({ onAddFact, onGenerateMoreFacts }) => {
    const [newFact, setNewFact] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAdd = () => {
        if (newFact.trim()) {
            onAddFact(newFact.trim());
            setNewFact('');
        }
    };
    
    const handleGenerate = async () => {
        setIsGenerating(true);
        await onGenerateMoreFacts();
        setIsGenerating(false);
    }

    return (
        <div className="mt-4 pt-4 border-t-2 border-dashed">
            <div className="flex gap-2">
                <input 
                    type="text"
                    value={newFact}
                    onChange={(e) => setNewFact(e.target.value)}
                    placeholder="Add a new fact"
                    className="flex-grow w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                />
                 <button onClick={handleAdd} className="p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    <AddIcon />
                </button>
            </div>
             <button onClick={handleGenerate} disabled={isGenerating} className="mt-2 w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50">
                {isGenerating ? <LoaderIcon className="animate-spin" /> : <WandSparklesIcon />}
                <span>{isGenerating ? 'Generating...' : 'Generate More with AI'}</span>
            </button>
        </div>
    )
}

const DomainColumn: React.FC<DomainColumnProps> = ({ 
    domain, 
    factRefs, 
    side, 
    mappedIndices = new Set(),
    onFactDragStart,
    onFactDrop,
    onAddFact,
    onGenerateMoreFacts,
    draggedItem
}) => {
  return (
    <div className="w-full p-4 md:p-6 bg-white rounded-xl shadow-md border border-slate-200">
      <h2 className="text-xl md:text-2xl font-bold text-slate-700 mb-4 pb-2 border-b-2 border-slate-200 flex items-center gap-3">
        {side === 'source' 
            ? <SourceIcon className="text-blue-500 text-3xl" /> 
            : <TargetIcon className="text-indigo-500 text-3xl" />
        }
        <span>
            {side === 'source' ? 'Source Domain' : 'Target Domain'}: <span className="font-extrabold text-slate-800">{domain.name}</span>
        </span>
      </h2>
      <ul className="space-y-3">
        {domain.facts.map((fact, index) => (
          <li key={fact.id}>
             <FactItem
                fact={fact}
                index={index}
                isMapped={mappedIndices.has(index)}
                factRef={(el) => factRefs.current.set(fact.id, el)}
                onDragStart={() => onFactDragStart?.(index)}
                onDrop={() => onFactDrop?.(index)}
                isBeingDragged={draggedItem?.side === side && draggedItem?.index === index}
            />
          </li>
        ))}
      </ul>
      {onAddFact && onGenerateMoreFacts && (
        <AddFactControl onAddFact={onAddFact} onGenerateMoreFacts={onGenerateMoreFacts} />
      )}
    </div>
  );
};

export default DomainColumn;