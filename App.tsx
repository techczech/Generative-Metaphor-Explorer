import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MetaphorAnalysis, MappingSet, StoredMetaphorAnalysis, ExploredPerspective, Fact, Comparison, GeneratedDocument, GeneratedImage, Mapping, Domain, AlternativeFrame } from './types';
import * as geminiService from './services/geminiService';
import MetaphorInput from './components/MetaphorInput';
import MetaphorGenerator from './components/MetaphorGenerator';
import MetaphorIdentifier from './components/MetaphorIdentifier';
import DomainColumn from './components/DomainColumn';
import MappingSelector from './components/MappingSelector';
import ConsequenceExplorer from './components/ConsequenceExplorer';
import MappingVisualizer, { PERSPECTIVE_COLORS } from './components/MappingVisualizer';
import Principles from './components/Principles';
import About from './components/About';
import SavedAnalyses from './components/SavedAnalyses';
import CustomPerspectiveEditor from './components/CustomPerspectiveEditor';
import HowItWorks from './components/HowItWorks';
import { BrainCircuitIcon, LoaderIcon, AlertTriangleIcon, BookIcon, InfoIcon, ExportIcon, ImportIcon, TerminalIcon, SavedIcon, WandSparklesIcon, GenerateIcon, QuestionMarkIcon, CloseIcon, IdentifyIcon } from './components/Icons';
import GeminiInfoLink from './components/GeminiInfoLink';

const LOCAL_STORAGE_KEY = 'metaphorAnalyses';

const App: React.FC = () => {
  const [page, setPage] = useState<'explorer' | 'principles' | 'about' | 'saved'>('explorer');
  const [metaphor, setMetaphor] = useState<string>('');
  const [analysis, setAnalysis] = useState<MetaphorAnalysis | null>(null);
  const [selectedMappingIndices, setSelectedMappingIndices] = useState<number[]>([]);
  const [consequencesMap, setConsequencesMap] = useState<Record<number, string>>({});
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<string>('');

  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isLoadingMetaphors, setIsLoadingMetaphors] = useState<boolean>(false);
  const [isLoadingIdentifier, setIsLoadingIdentifier] = useState<boolean>(false);
  const [isLoadingReframing, setIsLoadingReframing] = useState<boolean>(false);
  const [isLoadingConsequences, setIsLoadingConsequences] = useState<boolean>(false);
  const [isLoadingComparison, setIsLoadingComparison] = useState<boolean>(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState<boolean>(false);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [savedAnalyses, setSavedAnalyses] = useState<Record<string, StoredMetaphorAnalysis>>({});
  
  const [inputMode, setInputMode] = useState<'analyze' | 'generate' | 'identify'>('analyze');
  const [generatedMetaphors, setGeneratedMetaphors] = useState<string[]>([]);
  const [identifiedMetaphors, setIdentifiedMetaphors] = useState<{metaphor: string; explanation: string;}[]>([]);
  const [alternativeFrames, setAlternativeFrames] = useState<AlternativeFrame[]>([]);
  const [originalStatement, setOriginalStatement] = useState<string>('');
  
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [customPerspective, setCustomPerspective] = useState<MappingSet | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ index: number; side: 'source' | 'target' } | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  
  const factRefs = useRef(new Map<string, HTMLDivElement | null>());
  const visualizerContainerRef = useRef<HTMLDivElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const cancellationRef = useRef(false);

  useEffect(() => {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            setSavedAnalyses(JSON.parse(saved));
        }
    } catch (e) {
        console.error("Failed to load saved analyses from localStorage", e);
    }
  }, []);
  
  const resetState = (keepMetaphor = false) => {
    setAnalysis(null);
    setSelectedMappingIndices([]);
    setConsequencesMap({});
    setComparisonResult(null);
    setUserNotes('');
    setIsCustomMode(false);
    setIsComparisonMode(false);
    setCustomPerspective(null);
    setGeneratedMetaphors([]);
    setIdentifiedMetaphors([]);
    setAlternativeFrames([]);
    setOriginalStatement('');
    factRefs.current.clear();
    if (!keepMetaphor) {
        setMetaphor('');
    }
  }
  
  const handleStopGeneration = () => {
    cancellationRef.current = true;
    setIsLoadingAnalysis(false);
    setIsLoadingMetaphors(false);
    setIsLoadingIdentifier(false);
    setIsLoadingReframing(false);
    setIsLoadingConsequences(false);
    setIsLoadingComparison(false);
    setIsLoadingDocument(false);
    setIsLoadingImage(false);
    setError(null);
  };
  
  const handleGenerateMetaphors = async (topic: string) => {
    cancellationRef.current = false;
    setIsLoadingMetaphors(true);
    setGeneratedMetaphors([]);
    setError(null);
    resetState();

    try {
        const result = await geminiService.generateMetaphors(topic);
        if (cancellationRef.current) return;
        setGeneratedMetaphors(result);
    } catch (e) {
        if (!cancellationRef.current) {
            console.error(e);
            setError('Failed to generate metaphors. The model might be unavailable. Please try again.');
        }
    } finally {
        setIsLoadingMetaphors(false);
    }
  };

  const handleAnalyzeMetaphor = useCallback(async (metaphorToAnalyze: string) => {
    cancellationRef.current = false;
    setIsLoadingAnalysis(true);
    setError(null);
    resetState();
    setMetaphor(metaphorToAnalyze);

    try {
      const result = await geminiService.analyzeMetaphor(metaphorToAnalyze);
      if (cancellationRef.current) return;
      
      setAnalysis(result);

      const newStoredAnalysis: StoredMetaphorAnalysis = {
        metaphor: metaphorToAnalyze,
        analysis: result,
        exploredPerspectives: [],
        timestamp: Date.now(),
      };

      setSavedAnalyses(prev => {
        const updated = { ...prev, [metaphorToAnalyze]: newStoredAnalysis };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      if (result.mappingSets && result.mappingSets.length > 0) {
        setSelectedMappingIndices([0]);
      }
    } catch (e) {
      if (!cancellationRef.current) {
        console.error(e);
        setError('Failed to analyze the metaphor. The model might be unavailable or the input is invalid. Please try again.');
      }
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, []);

  const handleIdentifyMetaphors = async (statement: string) => {
    cancellationRef.current = false;
    setIsLoadingIdentifier(true);
    setError(null);
    resetState();
    setOriginalStatement(statement);

    try {
        const result = await geminiService.identifyMetaphors(statement);
        if (cancellationRef.current) return;
        setIdentifiedMetaphors(result);
    } catch (e) {
        if (!cancellationRef.current) {
            console.error(e);
            setError('Failed to identify metaphors. The model might be unavailable. Please try again.');
        }
    } finally {
        setIsLoadingIdentifier(false);
    }
  };

  const handleReframeStatement = async () => {
    if (!originalStatement || identifiedMetaphors.length === 0) return;
    cancellationRef.current = false;
    setIsLoadingReframing(true);
    setError(null);

    try {
        const result = await geminiService.suggestAlternativeFrames(originalStatement, identifiedMetaphors);
        if (cancellationRef.current) return;
        setAlternativeFrames(result);
    } catch (e) {
        if (!cancellationRef.current) {
            console.error(e);
            setError('Failed to generate reframes. The model might be unavailable. Please try again.');
        }
    } finally {
        setIsLoadingReframing(false);
    }
  };
  
  const handleSelectMapping = (index: number) => {
      setIsCustomMode(false);
      setCustomPerspective(null);
      setComparisonResult(null);
      setUserNotes('');
      
      if (isComparisonMode) {
        setSelectedMappingIndices(prev => {
            const currentIndex = prev.indexOf(index);
            if (currentIndex > -1) {
                return prev.filter(i => i !== index);
            }
            if (prev.length < 3) {
                return [...prev, index];
            }
            return prev;
        });
      } else {
        setSelectedMappingIndices([index]);
      }
  }

  const handleToggleComparisonMode = () => {
    setIsComparisonMode(prev => !prev);
    setSelectedMappingIndices([]);
    setComparisonResult(null);
    setUserNotes('');
  }
  
  const handleStartCustomMode = () => {
      setIsCustomMode(true);
      setIsComparisonMode(false);
      setSelectedMappingIndices([]);
      setConsequencesMap({});
      setComparisonResult(null);
      setUserNotes('');
      setCustomPerspective({
          name: "My Custom Perspective",
          description: "A set of mappings I created.",
          mappings: [],
          custom: true,
      });
  }

  useEffect(() => {
    const explore = async () => {
      if (isCustomMode || selectedMappingIndices.length === 0 || !analysis || !metaphor) {
        return;
      }
      
      cancellationRef.current = false;
      setIsLoadingConsequences(true);
      setError(null);

      const consequencesToFetch = selectedMappingIndices.filter(index => !consequencesMap[index]);
      
      for (const index of consequencesToFetch) {
        const saved = savedAnalyses[metaphor];
        const existingPerspective = saved?.exploredPerspectives.find(p => p.mappingSetIndex === index);
  
        if (existingPerspective && existingPerspective.consequences.length > 0) {
          setConsequencesMap(prev => ({...prev, [index]: existingPerspective.consequences[existingPerspective.consequences.length - 1]}));
          continue;
        }

        if (cancellationRef.current) break;

        try {
          const selectedSet = analysis.mappingSets[index];
          const result = await geminiService.exploreConsequences(metaphor, selectedSet, analysis.sourceDomain, analysis.targetDomain);
          if (cancellationRef.current) break;
          
          setConsequencesMap(prev => ({...prev, [index]: result}));
  
          setSavedAnalyses(prev => {
            const currentAnalysis = prev[metaphor];
            if (!currentAnalysis) return prev;
            const perspectiveIndex = currentAnalysis.exploredPerspectives.findIndex(p => p.mappingSetIndex === index);
            let newExploredPerspectives: ExploredPerspective[];
  
            if (perspectiveIndex > -1) {
              newExploredPerspectives = [...currentAnalysis.exploredPerspectives];
              newExploredPerspectives[perspectiveIndex] = { ...newExploredPerspectives[perspectiveIndex], consequences: [result] };
            } else {
              newExploredPerspectives = [...currentAnalysis.exploredPerspectives, { mappingSetIndex: index, consequences: [result] }];
            }
  
            const updatedAnalysis: StoredMetaphorAnalysis = { ...currentAnalysis, exploredPerspectives: newExploredPerspectives, timestamp: Date.now() };
            const updatedAll = { ...prev, [metaphor]: updatedAnalysis };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAll));
            return updatedAll;
          });
  
        } catch (e) {
          if (!cancellationRef.current) {
            console.error(e);
            setError('Failed to explore consequences. Please try again.');
          }
        }
      }
      setIsLoadingConsequences(false);
    };
    explore();
  }, [selectedMappingIndices, analysis, metaphor, savedAnalyses, isCustomMode, consequencesMap]);

  const handleExploreCustom = async () => {
    if (!analysis || !customPerspective || !metaphor) return;
    
    cancellationRef.current = false;
    setIsLoadingConsequences(true);
    setConsequencesMap({});
    setError(null);
    
    try {
      let finalPerspective = { ...customPerspective };
      if (finalPerspective.name === "My Custom Perspective" && finalPerspective.mappings.length > 0) {
        const summary = await geminiService.summarizeCustomPerspective(analysis.sourceDomain, analysis.targetDomain, finalPerspective.mappings);
        if (cancellationRef.current) return;
        finalPerspective = { ...finalPerspective, ...summary };
      }

      const result = await geminiService.exploreConsequences(metaphor, finalPerspective, analysis.sourceDomain, analysis.targetDomain);
      if (cancellationRef.current) return;
      
      const currentStoredAnalysis = savedAnalyses[metaphor];
      if (!currentStoredAnalysis) throw new Error("Could not find analysis to save to.");

      const updatedMappingSets = [...currentStoredAnalysis.analysis.mappingSets, finalPerspective];
      const newMappingSetIndex = updatedMappingSets.length - 1;

      const newExploredPerspective: ExploredPerspective = { mappingSetIndex: newMappingSetIndex, consequences: [result] };
      const updatedExploredPerspectives = [...currentStoredAnalysis.exploredPerspectives, newExploredPerspective];
      
      const updatedStoredAnalysis: StoredMetaphorAnalysis = {
        ...currentStoredAnalysis,
        analysis: { ...currentStoredAnalysis.analysis, mappingSets: updatedMappingSets },
        exploredPerspectives: updatedExploredPerspectives,
        timestamp: Date.now()
      };

      setSavedAnalyses(prev => {
        const updatedAll = { ...prev, [metaphor]: updatedStoredAnalysis };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAll));
        return updatedAll;
      });

      setAnalysis(updatedStoredAnalysis.analysis);
      setConsequencesMap({ [newMappingSetIndex]: result });
      
      setIsCustomMode(false);
      setCustomPerspective(null);
      setSelectedMappingIndices([newMappingSetIndex]);

    } catch (e) {
      if (!cancellationRef.current) {
        console.error(e);
        setError('Failed to explore or save the custom perspective.');
      }
    } finally {
      setIsLoadingConsequences(false);
    }
  };

  const handleCompare = async () => {
    if (!analysis || !metaphor || selectedMappingIndices.length < 2) return;

    // Load consequences for any missing perspectives before comparing
    const consequencesToFetch = selectedMappingIndices.filter(index => !consequencesMap[index]);
    if (consequencesToFetch.length > 0) {
        setIsLoadingConsequences(true);
        for(const index of consequencesToFetch) {
            try {
                const selectedSet = analysis.mappingSets[index];
                const result = await geminiService.exploreConsequences(metaphor, selectedSet, analysis.sourceDomain, analysis.targetDomain);
                setConsequencesMap(prev => ({ ...prev, [index]: result }));
            } catch (e) {
                setError(`Failed to load perspective "${analysis.mappingSets[index].name}" for comparison.`);
                setIsLoadingConsequences(false);
                return;
            }
        }
        setIsLoadingConsequences(false);
    }

    // This needs to be in a timeout to allow state to update from the fetch above.
    setTimeout(async () => {
        const perspectivesToCompare = selectedMappingIndices
            .map(index => {
                const currentSavedAnalysis = savedAnalyses[metaphor];
                const exploredData = currentSavedAnalysis?.exploredPerspectives.find(p => p.mappingSetIndex === index);
                return {
                    set: analysis.mappingSets[index],
                    consequences: consequencesMap[index], // Use the potentially just-fetched consequence
                    documents: exploredData?.generatedDocuments || [],
                    image: exploredData?.generatedImage
                };
            })
            .filter(p => p.consequences) as { set: MappingSet; consequences: string; documents: GeneratedDocument[], image?: GeneratedImage }[];

        if (perspectivesToCompare.length !== selectedMappingIndices.length) {
            setError("Please ensure consequences are loaded for all selected perspectives before comparing.");
            return;
        }

        cancellationRef.current = false;
        setIsLoadingComparison(true);
        setComparisonResult(null);
        setUserNotes('');
        setError(null);

        try {
            const result = await geminiService.comparePerspectives(metaphor, perspectivesToCompare);
            if (cancellationRef.current) return;
            setComparisonResult(result);
            handleSaveComparison(result, '');
        } catch (e) {
            if (!cancellationRef.current) setError("Failed to generate comparison.");
        } finally {
            setIsLoadingComparison(false);
        }
    }, 100);
  };

  const handleSaveComparison = (aiSummary: string, notes: string) => {
    setSavedAnalyses(prev => {
        const currentAnalysis = prev[metaphor];
        if (!currentAnalysis) return prev;

        const newComparison: Comparison = {
            perspectiveIndices: selectedMappingIndices.slice().sort(),
            aiSummary: aiSummary,
            userNotes: notes,
            timestamp: Date.now()
        };

        const existingComparisons = currentAnalysis.comparisons || [];
        const existingIndex = existingComparisons.findIndex(c => 
            JSON.stringify(c.perspectiveIndices.slice().sort()) === JSON.stringify(newComparison.perspectiveIndices)
        );

        let updatedComparisons: Comparison[];
        if (existingIndex > -1) {
            updatedComparisons = [...existingComparisons];
            updatedComparisons[existingIndex] = newComparison;
        } else {
            updatedComparisons = [...existingComparisons, newComparison];
        }

        const updatedAnalysis: StoredMetaphorAnalysis = { ...currentAnalysis, comparisons: updatedComparisons };
        const updatedAll = { ...prev, [metaphor]: updatedAnalysis };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAll));
        return updatedAll;
    });
  };

  const handleUserNotesChange = (notes: string) => {
    setUserNotes(notes);
    if(comparisonResult) {
        handleSaveComparison(comparisonResult, notes);
    }
  }
  
  useEffect(() => {
    if (!isComparisonMode) {
        setComparisonResult(null);
        setUserNotes('');
        return;
    }
    const sortedIndices = selectedMappingIndices.slice().sort();
    if (sortedIndices.length < 2) {
        setComparisonResult(null);
        setUserNotes('');
        return;
    };
    const currentAnalysis = savedAnalyses[metaphor];
    const savedComparison = currentAnalysis?.comparisons?.find(c => 
        JSON.stringify(c.perspectiveIndices.slice().sort()) === JSON.stringify(sortedIndices)
    );
    if (savedComparison) {
        setComparisonResult(savedComparison.aiSummary);
        setUserNotes(savedComparison.userNotes);
    } else {
        setComparisonResult(null);
        setUserNotes('');
    }
  }, [selectedMappingIndices, savedAnalyses, metaphor, isComparisonMode]);

  const handleGenerateDocument = async (perspectiveIndex: number, documentType: string) => {
    if (!analysis || !metaphor || !consequencesMap[perspectiveIndex]) {
        setError("Cannot generate document: missing context.");
        return;
    }

    cancellationRef.current = false;
    setIsLoadingDocument(true);
    setError(null);
    
    try {
        const perspective = {
            set: analysis.mappingSets[perspectiveIndex],
            consequences: consequencesMap[perspectiveIndex]
        };

        const content = await geminiService.generateDocumentFromPerspective(metaphor, perspective, documentType);
        if (cancellationRef.current) return;

        const newDocument: GeneratedDocument = {
            type: documentType,
            content,
            timestamp: Date.now()
        };
        
        setSavedAnalyses(prev => {
            const currentAnalysis = prev[metaphor];
            if (!currentAnalysis) return prev;

            const exploredIndex = currentAnalysis.exploredPerspectives.findIndex(p => p.mappingSetIndex === perspectiveIndex);
            if (exploredIndex === -1) return prev; 

            const updatedExploredPerspectives = [...currentAnalysis.exploredPerspectives];
            const targetPerspective = updatedExploredPerspectives[exploredIndex];
            const updatedDocuments = [...(targetPerspective.generatedDocuments || []), newDocument];
            updatedExploredPerspectives[exploredIndex] = { ...targetPerspective, generatedDocuments: updatedDocuments };
            
            const updatedAnalysis: StoredMetaphorAnalysis = { ...currentAnalysis, exploredPerspectives: updatedExploredPerspectives };
            const updatedAll = { ...prev, [metaphor]: updatedAnalysis };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAll));
            return updatedAll;
        });

    } catch (e) {
        if (!cancellationRef.current) setError(`Failed to generate document of type: ${documentType}`);
    } finally {
        setIsLoadingDocument(false);
    }
  };

  const handleGenerateImage = async (perspectiveIndex: number, prompt: string) => {
    const currentAnalysis = savedAnalyses[metaphor];
    if (!analysis || !currentAnalysis) {
        setError("Cannot generate image: missing context.");
        return;
    }

    cancellationRef.current = false;
    setIsLoadingImage(true);
    setError(null);
    
    try {
        const exploredIndex = currentAnalysis.exploredPerspectives.findIndex(p => p.mappingSetIndex === perspectiveIndex);
        if (exploredIndex === -1) {
            setError("Cannot find perspective to add image to.");
            return;
        }

        const existingImage = currentAnalysis.exploredPerspectives[exploredIndex].generatedImage;
        const baseImage = existingImage ? { base64Data: existingImage.base64Data, mimeType: existingImage.mimeType } : undefined;

        const { base64Data, mimeType } = await geminiService.generateOrEditImage(prompt, baseImage);
        if (cancellationRef.current) return;

        const newHistoryEntry = { prompt, timestamp: Date.now() };

        const newImage: GeneratedImage = {
            base64Data,
            mimeType,
            history: existingImage ? [...existingImage.history, newHistoryEntry] : [newHistoryEntry],
        };
        
        setSavedAnalyses(prev => {
            const current = prev[metaphor];
            if (!current) return prev;

            const updatedExploredPerspectives = [...current.exploredPerspectives];
            updatedExploredPerspectives[exploredIndex] = {
                ...updatedExploredPerspectives[exploredIndex],
                generatedImage: newImage,
            };
            
            const updatedStoredAnalysis: StoredMetaphorAnalysis = {
                ...current,
                exploredPerspectives: updatedExploredPerspectives,
            };

            const updatedAll = { ...prev, [metaphor]: updatedStoredAnalysis };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAll));
            return updatedAll;
        });

    } catch (e) {
        if (!cancellationRef.current) setError(`Failed to generate image.`);
    } finally {
        setIsLoadingImage(false);
    }
  };

  const updateAndSaveAnalysis = (newAnalysis: MetaphorAnalysis) => {
    setAnalysis(newAnalysis);
    setSavedAnalyses(prev => {
        const current = prev[metaphor];
        if (!current) return prev;
        const updatedAnalysis: StoredMetaphorAnalysis = {
            ...current,
            analysis: newAnalysis,
            timestamp: Date.now(),
        };
        const updatedAll = { ...prev, [metaphor]: updatedAnalysis };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedAll));
        return updatedAll;
    });
  };

  const handleAddFact = (side: 'source' | 'target', text: string) => {
    if (!analysis) return;
    const domainKey = side === 'source' ? 'sourceDomain' : 'targetDomain';
    const newFact: Fact = { id: `${side}-${Date.now()}`, text, custom: true };

    const newDomain: Domain = {
        ...analysis[domainKey],
        facts: [...analysis[domainKey].facts, newFact],
    };
    
    const newAnalysis: MetaphorAnalysis = { ...analysis, [domainKey]: newDomain };
    updateAndSaveAnalysis(newAnalysis);
  };

  const handleGenerateMoreFacts = async (side: 'source' | 'target') => {
    if (!analysis) return;
    const domainKey = side === 'source' ? 'sourceDomain' : 'targetDomain';
    const domainData = analysis[domainKey];
    const existingFacts = domainData.facts.map(f => f.text);

    try {
        const newFactsText = await geminiService.generateMoreFacts(domainData.name, existingFacts);
        const newFacts: Fact[] = newFactsText.map((text, i) => ({
            id: `${side}-gen-${Date.now()}-${i}`,
            text,
            custom: true, // Mark as user-initiated
        }));

        const newDomain: Domain = {
            ...domainData,
            facts: [...domainData.facts, ...newFacts],
        };
        const newAnalysis: MetaphorAnalysis = { ...analysis, [domainKey]: newDomain };
        updateAndSaveAnalysis(newAnalysis);
    } catch (e) {
        setError("Failed to generate more facts from AI.");
    }
  };

  const handleFactDragStart = (index: number, side: 'source' | 'target') => {
    setDraggedItem({ index, side });
  };
  
  const handleFactDrop = (targetIndex: number, targetSide: 'source' | 'target') => {
    if (!draggedItem || !analysis) {
        setDraggedItem(null);
        return;
    }

    // Reordering within the same column
    if (draggedItem.side === targetSide) {
        if (draggedItem.index === targetIndex) {
            setDraggedItem(null);
            return; // Dropped on itself
        }
        
        const domainKey = targetSide === 'source' ? 'sourceDomain' : 'targetDomain';
        const domain = analysis[domainKey];
        const facts = [...domain.facts];
        const [removed] = facts.splice(draggedItem.index, 1);
        facts.splice(targetIndex, 0, removed);

        const idToNewIndexMap = new Map(facts.map((f, i) => [f.id, i]));
        
        // Update indices in all mappings across all perspectives
        const updatedMappingSets = analysis.mappingSets.map(set => ({
            ...set,
            mappings: set.mappings.map(m => {
                const sourceFactId = analysis.sourceDomain.facts[m.sourceFactIndex]?.id;
                const targetFactId = analysis.targetDomain.facts[m.targetFactIndex]?.id;

                let newSourceIndex = m.sourceFactIndex;
                let newTargetIndex = m.targetFactIndex;

                if (targetSide === 'source' && sourceFactId) {
                    newSourceIndex = idToNewIndexMap.get(sourceFactId) ?? m.sourceFactIndex;
                } else if (targetSide === 'target' && targetFactId) {
                    newTargetIndex = idToNewIndexMap.get(targetFactId) ?? m.targetFactIndex;
                }
                
                return { sourceFactIndex: newSourceIndex, targetFactIndex: newTargetIndex };
            }),
        }));
        
        const newAnalysis: MetaphorAnalysis = {
            ...analysis,
            [domainKey]: { ...domain, facts },
            mappingSets: updatedMappingSets,
        };
        updateAndSaveAnalysis(newAnalysis);

    } else if (isCustomMode && customPerspective) {
        // Creating a new mapping in custom mode
        const sourceFactIndex = draggedItem.side === 'source' ? draggedItem.index : targetIndex;
        const targetFactIndex = draggedItem.side === 'target' ? draggedItem.index : targetIndex;

        // Avoid duplicate mappings
        const isDuplicate = customPerspective.mappings.some(
            m => m.sourceFactIndex === sourceFactIndex && m.targetFactIndex === targetFactIndex
        );

        if (!isDuplicate) {
            const newMapping: Mapping = { sourceFactIndex, targetFactIndex };
            setCustomPerspective(prev => prev ? ({
                ...prev,
                mappings: [...prev.mappings, newMapping],
            }) : null);
        }
    }

    setDraggedItem(null);
  };
  
  const handleRemoveCustomMapping = (index: number) => {
    setCustomPerspective(prev => prev ? ({
        ...prev,
        mappings: prev.mappings.filter((_, i) => i !== index)
    }) : null);
  };
  
  const handleLoadAnalysis = (metaphorKey: string) => {
    const data = savedAnalyses[metaphorKey];
    if (data) {
        resetState(true);
        setMetaphor(data.metaphor);
        setAnalysis(data.analysis);
        if (data.analysis.mappingSets.length > 0) {
            setSelectedMappingIndices([0]);
        }
        setPage('explorer');
    }
  };

  const handleDeleteAnalysis = (metaphorKey: string) => {
    setSavedAnalyses(prev => {
        const updated = { ...prev };
        delete updated[metaphorKey];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    });
    if (metaphor === metaphorKey) {
        resetState();
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(savedAnalyses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = `metaphornik_analyses_${new Date().toISOString()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text === 'string') {
                const importedData = JSON.parse(text);
                // Basic validation
                if (typeof importedData === 'object' && !Array.isArray(importedData)) {
                    setSavedAnalyses(prev => {
                        const merged = { ...prev, ...importedData };
                        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
                        return merged;
                    });
                } else {
                    throw new Error("Invalid format");
                }
            }
        } catch (err) {
            setError("Failed to import file. Please make sure it's a valid JSON export from this tool.");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };
  
  const sourceMappedIndices = useMemo(() => {
    if (!analysis) return new Set<number>();
    const indices = new Set<number>();
    const setsToDisplay = isCustomMode ? (customPerspective ? [customPerspective] : []) : selectedMappingIndices.map(i => analysis.mappingSets[i]);
    setsToDisplay.forEach(set => set.mappings.forEach(m => indices.add(m.sourceFactIndex)));
    return indices;
  }, [analysis, selectedMappingIndices, isCustomMode, customPerspective]);

  const targetMappedIndices = useMemo(() => {
    if (!analysis) return new Set<number>();
    const indices = new Set<number>();
    const setsToDisplay = isCustomMode ? (customPerspective ? [customPerspective] : []) : selectedMappingIndices.map(i => analysis.mappingSets[i]);
    setsToDisplay.forEach(set => set.mappings.forEach(m => indices.add(m.targetFactIndex)));
    return indices;
  }, [analysis, selectedMappingIndices, isCustomMode, customPerspective]);
  
  const perspectivesToDisplay = useMemo(() => {
    if (!analysis || isCustomMode) {
      return [];
    }
    return selectedMappingIndices.map((index, i) => ({
      set: analysis.mappingSets[index],
      consequences: consequencesMap[index] || null,
      index: index,
      exploredData: savedAnalyses[metaphor]?.exploredPerspectives.find(p => p.mappingSetIndex === index),
      color: PERSPECTIVE_COLORS[i % PERSPECTIVE_COLORS.length],
    }));
  }, [analysis, isCustomMode, selectedMappingIndices, consequencesMap, savedAnalyses, metaphor]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <BrainCircuitIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Metaphornik</h1>
                <p className="text-sm text-slate-600">Explore new perspectives through generative metaphors</p>
              </div>
            </div>
            <nav className="flex items-center gap-2 sm:gap-4 text-sm font-semibold text-slate-600">
                <button onClick={() => setPage('explorer')} className={`flex items-center gap-1 px-2 py-1 rounded ${page === 'explorer' ? 'text-blue-600 bg-blue-100' : 'hover:text-blue-600'}`}><TerminalIcon className="text-base"/><span>Explorer</span></button>
                <button onClick={() => setPage('saved')} className={`flex items-center gap-1 px-2 py-1 rounded ${page === 'saved' ? 'text-blue-600 bg-blue-100' : 'hover:text-blue-600'}`}><SavedIcon className="text-base"/><span>Saved</span></button>
                <button onClick={() => setPage('principles')} className={`flex items-center gap-1 px-2 py-1 rounded ${page === 'principles' ? 'text-blue-600 bg-blue-100' : 'hover:text-blue-600'}`}><BookIcon className="text-base"/><span>Principles</span></button>
                <button onClick={() => setPage('about')} className={`flex items-center gap-1 px-2 py-1 rounded ${page === 'about' ? 'text-blue-600 bg-blue-100' : 'hover:text-blue-600'}`}><InfoIcon className="text-base"/><span>About</span></button>
                <button onClick={handleExport} title="Export All Analyses" className="p-2 rounded-full hover:bg-slate-200"><ExportIcon/></button>
                <button onClick={() => importFileRef.current?.click()} title="Import Analyses" className="p-2 rounded-full hover:bg-slate-200"><ImportIcon/></button>
                <input type="file" ref={importFileRef} onChange={handleImport} accept=".json" className="hidden" />
                <button onClick={() => setShowHowItWorks(true)} title="How It Works" className="p-2 rounded-full hover:bg-slate-200"><QuestionMarkIcon/></button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {page === 'explorer' && (
          <>
            <div className="w-full max-w-2xl mx-auto">
                <div className="flex border-b border-slate-200 mb-4">
                    <button 
                        onClick={() => setInputMode('analyze')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors rounded-t-lg -mb-px
                            ${inputMode === 'analyze' 
                                ? 'border-b-2 border-blue-600 text-blue-600' 
                                : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'
                            }`
                        }
                    >
                        <WandSparklesIcon />
                        <span>Analyze a Metaphor</span>
                    </button>
                    <button
                        onClick={() => setInputMode('generate')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors rounded-t-lg -mb-px
                            ${inputMode === 'generate' 
                                ? 'border-b-2 border-green-600 text-green-600' 
                                : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'
                            }`
                        }
                    >
                        <GenerateIcon />
                        <span>Generate Metaphors</span>
                    </button>
                     <button
                        onClick={() => setInputMode('identify')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors rounded-t-lg -mb-px
                            ${inputMode === 'identify' 
                                ? 'border-b-2 border-amber-600 text-amber-600' 
                                : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'
                            }`
                        }
                    >
                        <IdentifyIcon />
                        <span>Identify Metaphors</span>
                    </button>
                </div>

                {inputMode === 'analyze' && (
                    <MetaphorInput 
                        onAnalyze={handleAnalyzeMetaphor} 
                        isLoading={isLoadingAnalysis} 
                        onStop={handleStopGeneration} 
                    />
                )}
                
                {inputMode === 'generate' && (
                    <MetaphorGenerator 
                        onGenerate={handleGenerateMetaphors}
                        isLoading={isLoadingMetaphors}
                        generatedMetaphors={generatedMetaphors}
                        onSelectMetaphor={handleAnalyzeMetaphor}
                        isAnalysisLoading={isLoadingAnalysis}
                    />
                )}

                {inputMode === 'identify' && (
                    <MetaphorIdentifier
                        onIdentify={handleIdentifyMetaphors}
                        isLoading={isLoadingIdentifier}
                        identifiedMetaphors={identifiedMetaphors}
                        onSelectMetaphor={handleAnalyzeMetaphor}
                        isAnalysisLoading={isLoadingAnalysis}
                        onReframe={handleReframeStatement}
                        isLoadingReframing={isLoadingReframing}
                        alternativeFrames={alternativeFrames}
                    />
                )}
            </div>
            
            {(isLoadingAnalysis || isLoadingMetaphors || isLoadingIdentifier) && (
              <div className="text-center p-8">
                <LoaderIcon className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600">{
                  isLoadingAnalysis ? 'Analyzing metaphor...' : 
                  isLoadingMetaphors ? 'Generating metaphors...' :
                  'Identifying metaphors...'} this may take a moment.</p>
              </div>
            )}

            {error && (
              <div className="my-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3">
                <AlertTriangleIcon />
                <span>{error}</span>
              </div>
            )}
            
            {!isLoadingAnalysis && !isLoadingMetaphors && !isLoadingIdentifier && !analysis && (
              <>
                {Object.keys(savedAnalyses).length > 0 ? (
                  <SavedAnalyses 
                    analyses={Object.values(savedAnalyses)} 
                    onLoad={handleLoadAnalysis}
                    onDelete={handleDeleteAnalysis}
                    isLoading={isLoadingAnalysis}
                    limit={3}
                  />
                ) : (
                  <div className="text-center text-slate-500 mt-16">
                     <p>No recent explorations. Analyze a metaphor or generate one to get started!</p>
                     <button onClick={() => setShowHowItWorks(true)} className="mt-4 text-blue-600 hover:underline">How does this work?</button>
                  </div>
                )}
              </>
            )}

            {analysis && (
              <div className="mt-8 animate-fade-in">
                <MappingSelector
                  mappingSets={analysis.mappingSets}
                  selectedIndices={selectedMappingIndices}
                  onSelect={handleSelectMapping}
                  isLoading={isLoadingConsequences || isLoadingComparison}
                  onStartCustom={handleStartCustomMode}
                  isCustomMode={isCustomMode}
                  exploredIndices={new Set(savedAnalyses[metaphor]?.exploredPerspectives.map(p => p.mappingSetIndex) || [])}
                  onCompare={handleCompare}
                  isComparisonMode={isComparisonMode}
                  onToggleComparisonMode={handleToggleComparisonMode}
                />

                {isCustomMode && customPerspective && (
                  <CustomPerspectiveEditor
                      perspective={customPerspective}
                      setPerspective={setCustomPerspective}
                      sourceDomain={analysis.sourceDomain}
                      targetDomain={analysis.targetDomain}
                      onRemoveMapping={handleRemoveCustomMapping}
                      onExplore={handleExploreCustom}
                      isLoading={isLoadingConsequences}
                  />
                )}

                <div ref={visualizerContainerRef} className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] lg:grid-cols-[1fr_200px_1fr] gap-4 md:gap-8 items-start">
                  <DomainColumn
                    domain={analysis.sourceDomain}
                    factRefs={factRefs}
                    side="source"
                    mappedIndices={sourceMappedIndices}
                    onFactDragStart={(index) => handleFactDragStart(index, 'source')}
                    onFactDrop={(targetIndex) => handleFactDrop(targetIndex, 'source')}
                    onAddFact={(text) => handleAddFact('source', text)}
                    onGenerateMoreFacts={() => handleGenerateMoreFacts('source')}
                    draggedItem={draggedItem}
                  />
                  <div className="hidden md:block" />
                  <DomainColumn
                    domain={analysis.targetDomain}
                    factRefs={factRefs}
                    side="target"
                    mappedIndices={targetMappedIndices}
                    onFactDragStart={(index) => handleFactDragStart(index, 'target')}
                    onFactDrop={(targetIndex) => handleFactDrop(targetIndex, 'target')}
                    onAddFact={(text) => handleAddFact('target', text)}
                    onGenerateMoreFacts={() => handleGenerateMoreFacts('target')}
                    draggedItem={draggedItem}
                  />
                  <MappingVisualizer
                    sourceDomain={analysis.sourceDomain}
                    targetDomain={analysis.targetDomain}
                    selectedMappingSets={isCustomMode && customPerspective ? [customPerspective] : selectedMappingIndices.map(i => analysis.mappingSets[i])}
                    factRefs={factRefs}
                    containerRef={visualizerContainerRef}
                  />
                </div>
                 {selectedMappingIndices.length > 1 && analysis && (
                    <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
                        {selectedMappingIndices.map((mappingIndex, i) => (
                            <div key={mappingIndex} className="flex items-center gap-2">
                                <span 
                                    className="w-4 h-4 rounded-md" 
                                    style={{ backgroundColor: PERSPECTIVE_COLORS[i % PERSPECTIVE_COLORS.length] }}
                                ></span>
                                <span className="font-semibold" style={{ color: PERSPECTIVE_COLORS[i % PERSPECTIVE_COLORS.length] }}>
                                    {analysis.mappingSets[mappingIndex].name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}


                 <ConsequenceExplorer
                  selectedPerspectives={perspectivesToDisplay}
                  isLoading={isLoadingConsequences}
                  onStop={handleStopGeneration}
                  isLoadingComparison={isLoadingComparison}
                  onCompare={handleCompare}
                  comparisonResult={comparisonResult}
                  userNotes={userNotes}
                  onUserNotesChange={handleUserNotesChange}
                  onGenerateDocument={handleGenerateDocument}
                  isLoadingDocument={isLoadingDocument}
                  onGenerateImage={handleGenerateImage}
                  isLoadingImage={isLoadingImage}
                  sourceDomain={analysis.sourceDomain}
                  targetDomain={analysis.targetDomain}
                />
              </div>
            )}
          </>
        )}
        
        {page === 'saved' && (
          <SavedAnalyses 
            analyses={Object.values(savedAnalyses)} 
            onLoad={handleLoadAnalysis}
            onDelete={handleDeleteAnalysis}
            isLoading={isLoadingAnalysis}
            isPage={true}
          />
        )}
        {page === 'principles' && <Principles />}
        {page === 'about' && <About />}
      </main>

       {showHowItWorks && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4"
            onClick={() => setShowHowItWorks(false)}
        >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
                <HowItWorks />
                <button 
                    onClick={() => setShowHowItWorks(false)}
                    className="absolute top-2 right-2 p-2 text-slate-500 bg-white/50 rounded-full hover:bg-white hover:text-slate-800 transition-colors"
                    aria-label="Close how it works"
                >
                    <CloseIcon />
                </button>
            </div>
        </div>
      )}

      <footer className="bg-slate-100 border-t border-slate-200 text-center py-6 text-sm text-slate-500">
        <p>This tool was conceived and developed with <GeminiInfoLink /> by Dominik Lukeš based on the <a href="https://metaphorhacker.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">MetaphorHacker</a> approach. This approach was inspired by the work of Donald Schön, George Lakoff, Mark Johnson, Gilles Fauconnier, Mark Turner, and others.</p>
      </footer>
    </div>
  );
};

export default App;