

import React from 'react';
import { LoaderIcon, StructureIcon, StopCircleIcon, CompareArrowsIcon, NotesIcon, WandSparklesIcon, ArticleIcon, ImageIcon } from './Icons';
import { MappingSet, ExploredPerspective, Domain } from '../types';
import DocumentGenerator from './DocumentGenerator';
import ImageGenerator from './ImageGenerator';

interface ConsequenceExplorerProps {
  selectedPerspectives: { 
    set: MappingSet, 
    consequences: string | null, 
    index: number,
    exploredData?: ExploredPerspective,
    color: string,
  }[];
  isLoading: boolean;
  onStop: () => void;
  isLoadingComparison: boolean;
  onCompare: () => void;
  comparisonResult: string | null;
  userNotes: string;
  onUserNotesChange: (notes: string) => void;
  onGenerateDocument: (perspectiveIndex: number, docType: string) => void;
  isLoadingDocument: boolean;
  onGenerateImage: (perspectiveIndex: number, prompt: string) => void;
  isLoadingImage: boolean;
  sourceDomain: Domain;
  targetDomain: Domain;
}

const ConsequenceExplorer: React.FC<ConsequenceExplorerProps> = ({ 
    selectedPerspectives, 
    isLoading, 
    onStop,
    isLoadingComparison,
    onCompare,
    comparisonResult,
    userNotes,
    onUserNotesChange,
    onGenerateDocument,
    isLoadingDocument,
    onGenerateImage,
    isLoadingImage,
    sourceDomain,
    targetDomain,
}) => {
  
  const parseInlineFormatting = (line: string): React.ReactNode => {
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return part;
    });
  };

  const renderMarkdown = (markdown: string | null): React.ReactNode => {
    if (!markdown) return null;

    const blocks = markdown.split('\n\n');
    const elements: React.ReactNode[] = [];

    blocks.forEach((block, blockIndex) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return;

        const lines = trimmedBlock.split('\n');
        
        // 1. Table check
        const isTable = lines.length >= 2 && lines[0].includes('|') && lines[1].includes('|') && lines[1].replace(/[-|: ]/g, '').length === 0;
        if (isTable) {
            try {
                const tableHeaders = lines[0].split('|').map(h => h.trim()).filter(Boolean);
                const tableRows = lines.slice(2).map(rowLine => rowLine.split('|').map(c => c.trim()).filter(Boolean));

                if (tableHeaders.length === 0 || tableRows.some(r => r.length > 0 && r.length !== tableHeaders.length)) {
                    throw new Error("Invalid table structure, falling back.");
                }
                
                elements.push(
                    <div key={`table-wrapper-${blockIndex}`} className="my-4 overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50">
                            <tr>
                                {tableHeaders.map((header, hIndex) => (
                                <th key={hIndex} className="p-3 text-sm font-semibold text-slate-600 tracking-wider border-b-2 border-slate-200">{parseInlineFormatting(header)}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                            {tableRows.map((row, rIndex) => (
                                <tr key={rIndex} className="bg-white hover:bg-slate-50">
                                {row.map((cell, cIndex) => (
                                    <td key={cIndex} className="p-3 text-sm text-slate-700">{parseInlineFormatting(cell)}</td>
                                ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                );
                return; // Done with this block
            } catch (e) {
                // Fallback for malformed tables, render as preformatted text
                elements.push(<pre key={`pre-fallback-${blockIndex}`} className="my-4 p-4 bg-slate-100 rounded text-sm whitespace-pre-wrap">{block}</pre>);
                return;
            }
        }

        // 2. List check
        const isList = lines.every(l => l.trim().startsWith('* ') || l.trim().startsWith('- ') || l.trim() === '');
        if (isList) {
            const listItems = lines
                .map(l => l.trim())
                .filter(l => l.startsWith('* ') || l.startsWith('- '))
                .map(l => l.substring(2));
            
            elements.push(
                <ul key={`ul-${blockIndex}`} className="list-disc list-inside space-y-1 my-4 pl-4">
                    {listItems.map((item, i) => <li key={i}>{parseInlineFormatting(item)}</li>)}
                </ul>
            );
            return;
        }

        // 3. Heading check
        const firstLine = lines[0] || '';
        if (firstLine.startsWith('#')) {
            if (firstLine.startsWith('### ')) elements.push(<h4 key={`h4-${blockIndex}`} className="text-lg font-semibold mt-4 mb-2 text-slate-700">{parseInlineFormatting(firstLine.substring(4))}</h4>);
            else if (firstLine.startsWith('## ')) elements.push(<h3 key={`h3-${blockIndex}`} className="text-xl font-bold mt-4 mb-2 text-slate-800">{parseInlineFormatting(firstLine.substring(3))}</h3>);
            else if (firstLine.startsWith('# ')) elements.push(<h2 key={`h2-${blockIndex}`} className="text-2xl font-bold mt-6 mb-3 text-slate-900">{parseInlineFormatting(firstLine.substring(2))}</h2>);
            else elements.push(<p key={`p-${blockIndex}`} className="my-4">{parseInlineFormatting(block.replace(/\n/g, ' '))}</p>); // Not a valid heading
            return;
        }

        // 4. Paragraph (default)
        elements.push(<p key={`p-${blockIndex}`} className="my-4">{parseInlineFormatting(block.replace(/\n/g, ' '))}</p>);
    });

    return elements;
  };

  if (selectedPerspectives.length === 0 && !isLoading) {
    return null;
  }
  
  // Show a full-screen loader ONLY for the initial load of a single perspective.
  const showFullScreenLoader = isLoading && selectedPerspectives.length === 1 && !selectedPerspectives[0].consequences;
  if (showFullScreenLoader) {
     return (
      <div className="w-full mt-8 p-6 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col items-center justify-center min-h-[200px]">
        <LoaderIcon className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 mb-4">Exploring consequences...</p>
        <button
            type="button"
            onClick={onStop}
            className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
        >
            <StopCircleIcon />
            <span>Stop Generation</span>
        </button>
      </div>
    );
  }

  const gridColsClasses: { [key: number]: string } = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };
  const gridColsClass = gridColsClasses[selectedPerspectives.length] || 'grid-cols-1';


  return (
    <div className="w-full mt-8">
      <div className={`grid ${gridColsClass} gap-6`}>
        {selectedPerspectives.map(({ set, consequences, index, exploredData, color }) => (
            <div key={index} className="p-6 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col">
                 <h2 className="text-xl font-bold border-b pb-2 mb-4 flex items-center gap-3" style={{color: color}}>
                    <StructureIcon className="text-xl" />
                    <span>{set.name}</span>
                 </h2>
                 <div className="text-slate-600 flex-grow">
                    {consequences ? (
                        renderMarkdown(consequences)
                    ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-slate-500">
                            <LoaderIcon className="animate-spin text-blue-500 text-3xl" />
                            <p className="mt-2 text-sm">Loading analysis...</p>
                        </div>
                    ) : (
                        <p className="text-slate-400">No consequences explored yet.</p>
                    )}
                 </div>

                 {exploredData?.generatedDocuments && exploredData.generatedDocuments.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-200">
                        <h4 className="font-semibold text-slate-600 mb-3 flex items-center gap-2">
                          <ArticleIcon />
                          <span>Generated Documents</span>
                        </h4>
                        <div className="space-y-4">
                          {exploredData.generatedDocuments.map((doc, docIndex) => (
                            <div key={docIndex} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{doc.type}</div>
                              <div className="prose prose-sm max-w-none text-slate-700">{renderMarkdown(doc.content)}</div>
                            </div>
                          ))}
                        </div>
                    </div>
                 )}

                {exploredData?.generatedImage && (
                    <div className="mt-6 pt-4 border-t border-slate-200">
                        <h4 className="font-semibold text-slate-600 mb-3 flex items-center gap-2">
                          <ImageIcon />
                          <span>Image Illustration</span>
                        </h4>
                        <img 
                            src={`data:${exploredData.generatedImage.mimeType};base64,${exploredData.generatedImage.base64Data}`}
                            alt={`Illustration for ${set.name}`}
                            className="rounded-lg shadow-md border w-full"
                        />
                    </div>
                 )}

                 {selectedPerspectives.length === 1 && exploredData && (
                    <>
                        <DocumentGenerator 
                            generatedDocuments={exploredData.generatedDocuments || []}
                            isLoading={isLoadingDocument}
                            onGenerate={(docType) => onGenerateDocument(index, docType)}
                            renderMarkdown={renderMarkdown}
                        />
                        <ImageGenerator 
                            mappingSet={set}
                            sourceDomain={sourceDomain}
                            targetDomain={targetDomain}
                            generatedDocuments={exploredData.generatedDocuments || []}
                            generatedImage={exploredData.generatedImage}
                            isLoading={isLoadingImage}
                            onGenerate={(prompt) => onGenerateImage(index, prompt)}
                        />
                    </>
                 )}
            </div>
        ))}
      </div>

      {selectedPerspectives.length >= 2 && (
         <div className="w-full mt-8 p-6 md:p-8 bg-white rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-3">
              <CompareArrowsIcon className="text-2xl text-slate-600" />
              <span>Comparative Analysis</span>
            </h2>
            {isLoadingComparison && <div className="flex items-center justify-center"><LoaderIcon className="animate-spin mr-2" /> Generating comparison...</div>}
            {!comparisonResult && !isLoadingComparison && (
                <div className="text-center p-4">
                    <p className="text-slate-500 mb-4">Compare these perspectives to get an AI-generated summary of their differences and similarities.</p>
                     <button onClick={onCompare} className="flex items-center justify-center mx-auto gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                        <WandSparklesIcon />
                        <span>Generate AI Comparison</span>
                    </button>
                </div>
            )}
            {comparisonResult && <div className="text-slate-600">{renderMarkdown(comparisonResult)}</div>}

            <div className="mt-8 pt-6 border-t">
                <h3 className="text-xl font-bold text-slate-700 mb-3 flex items-center gap-3">
                    <NotesIcon />
                    <span>My Notes</span>
                </h3>
                <textarea
                    value={userNotes}
                    onChange={(e) => onUserNotesChange(e.target.value)}
                    placeholder="Record your own insights and reflections on this comparison here..."
                    className="w-full h-40 p-3 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>
         </div>
      )}
    </div>
  );
};

export default ConsequenceExplorer;