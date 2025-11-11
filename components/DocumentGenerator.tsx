import React, { useState } from 'react';
import { GeneratedDocument } from '../types';
import { ArticleIcon, WandSparklesIcon, LoaderIcon } from './Icons';

interface DocumentGeneratorProps {
    generatedDocuments: GeneratedDocument[];
    isLoading: boolean;
    onGenerate: (docType: string) => void;
    renderMarkdown: (markdown: string | null) => React.ReactNode;
}

const PREDEFINED_DOC_TYPES = [
    "Advertising Slogan",
    "News Story",
    "Job Advert",
    "Short Story"
];

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ generatedDocuments, isLoading, onGenerate, renderMarkdown }) => {
    const [selectedDocType, setSelectedDocType] = useState('');
    const [customDocType, setCustomDocType] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleGenerateClick = () => {
        const docType = showCustomInput ? customDocType : selectedDocType;
        if (docType.trim()) {
            onGenerate(docType.trim());
            // Reset form
            setSelectedDocType('');
            setCustomDocType('');
            setShowCustomInput(false);
        }
    };

    const handlePredefinedClick = (docType: string) => {
        setSelectedDocType(docType);
        setShowCustomInput(false);
    };

    const handleOtherClick = () => {
        setSelectedDocType('');
        setShowCustomInput(true);
    };
    
    const sortedDocuments = [...(generatedDocuments || [])].sort((a,b) => b.timestamp - a.timestamp);

    return (
        <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-300">
            <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-3">
                <ArticleIcon />
                <span>Generate Documents from this Perspective</span>
            </h3>

            <div className="p-4 bg-slate-100 rounded-lg mb-6">
                <div className="mb-3 text-sm font-semibold text-slate-600">Choose a document type to generate:</div>
                <div className="flex flex-wrap gap-2 mb-3">
                    {PREDEFINED_DOC_TYPES.map(type => (
                        <button 
                            key={type}
                            onClick={() => handlePredefinedClick(type)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedDocType === type ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-100'}`}
                        >
                            {type}
                        </button>
                    ))}
                    <button
                        onClick={handleOtherClick}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${showCustomInput ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-100'}`}
                    >
                        Other...
                    </button>
                </div>
                {showCustomInput && (
                    <input
                        type="text"
                        value={customDocType}
                        onChange={(e) => setCustomDocType(e.target.value)}
                        placeholder="Enter custom document type..."
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                )}
                <button
                    onClick={handleGenerateClick}
                    disabled={isLoading || (!selectedDocType && !customDocType.trim())}
                    className="mt-3 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
                >
                    {isLoading ? <LoaderIcon className="animate-spin" /> : <WandSparklesIcon />}
                    <span>{isLoading ? 'Generating...' : 'Generate'}</span>
                </button>
            </div>
            
            {sortedDocuments.length > 0 && (
                <div>
                    <h4 className="font-semibold text-slate-600 mb-3">Generated Documents:</h4>
                    <div className="space-y-4">
                        {sortedDocuments.map((doc, index) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{doc.type}</div>
                                <div className="prose prose-sm max-w-none text-slate-700">{renderMarkdown(doc.content)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentGenerator;