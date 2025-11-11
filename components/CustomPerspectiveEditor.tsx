import React from 'react';
import { MappingSet, Domain } from '../types';
import { CreateIcon, RemoveMappingIcon, WandSparklesIcon } from './Icons';

interface CustomPerspectiveEditorProps {
    perspective: MappingSet;
    setPerspective: React.Dispatch<React.SetStateAction<MappingSet | null>>;
    sourceDomain: Domain;
    targetDomain: Domain;
    onRemoveMapping: (index: number) => void;
    onExplore: () => void;
    isLoading: boolean;
}

const CustomPerspectiveEditor: React.FC<CustomPerspectiveEditorProps> = ({
    perspective,
    setPerspective,
    sourceDomain,
    targetDomain,
    onRemoveMapping,
    onExplore,
    isLoading,
}) => {
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPerspective(prev => prev ? { ...prev, name: e.target.value } : null);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPerspective(prev => prev ? { ...prev, description: e.target.value } : null);
    };

    return (
        <div className="my-6 p-6 bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-xl animate-fade-in">
            <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center gap-3">
                <CreateIcon />
                <span>Custom Perspective Editor</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <input
                    type="text"
                    value={perspective.name}
                    onChange={handleNameChange}
                    placeholder="Perspective Name"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                />
                 <textarea
                    value={perspective.description}
                    onChange={handleDescriptionChange}
                    placeholder="Perspective Description"
                    rows={1}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                />
            </div>
            
            <div className="mb-4">
                 <h4 className="font-semibold text-indigo-700 mb-2">Your Mappings ({perspective.mappings.length}):</h4>
                {perspective.mappings.length > 0 ? (
                    <ul className="space-y-2 max-h-40 overflow-y-auto bg-white p-2 rounded-md border">
                        {perspective.mappings.map((mapping, index) => (
                             <li key={index} className="flex items-center justify-between p-2 rounded-md bg-slate-50 text-sm">
                                <div>
                                    <span className="font-medium text-blue-600">{sourceDomain.facts[mapping.sourceFactIndex]?.text}</span>
                                    <span className="mx-2 text-slate-400">&rarr;</span>
                                    <span className="font-medium text-indigo-600">{targetDomain.facts[mapping.targetFactIndex]?.text}</span>
                                </div>
                                 <button onClick={() => onRemoveMapping(index)} className="p-1 text-slate-400 hover:text-red-500">
                                    <RemoveMappingIcon className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-4 text-slate-500 bg-white rounded-md border">
                        Drag a fact from the source to the target domain to create a mapping.
                    </div>
                )}
            </div>

            <button
                onClick={onExplore}
                disabled={isLoading || perspective.mappings.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
                <WandSparklesIcon />
                <span>Explore Consequences for this Perspective</span>
            </button>
        </div>
    );
};

export default CustomPerspectiveEditor;
