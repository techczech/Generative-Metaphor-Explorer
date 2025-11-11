

import React, { useState, useLayoutEffect, useEffect } from 'react';
import { MappingSet, Domain } from '../types';

interface MappingVisualizerProps {
  sourceDomain: Domain;
  targetDomain: Domain;
  selectedMappingSets: MappingSet[];
  factRefs: React.RefObject<Map<string, HTMLDivElement | null>>;
  containerRef: React.RefObject<HTMLDivElement>;
}

interface PathInfo {
  id: string;
  d: string;
  color: string;
}

export const PERSPECTIVE_COLORS = ['#3b82f6', '#10b981', '#ef4444'];

const MappingVisualizer: React.FC<MappingVisualizerProps> = ({
  sourceDomain,
  targetDomain,
  selectedMappingSets,
  factRefs,
  containerRef,
}) => {
  const [paths, setPaths] = useState<PathInfo[]>([]);

  const calculatePaths = React.useCallback(() => {
    if (!selectedMappingSets || selectedMappingSets.length === 0 || !containerRef.current || !factRefs.current) {
      setPaths([]);
      return;
    }

    const newPaths: PathInfo[] = [];
    const containerRect = containerRef.current.getBoundingClientRect();

    selectedMappingSets.forEach((mappingSet, setIndex) => {
        mappingSet.mappings.forEach((mapping) => {
            const sourceFact = sourceDomain.facts[mapping.sourceFactIndex];
            const targetFact = targetDomain.facts[mapping.targetFactIndex];
      
            if (!sourceFact || !targetFact) return;
      
            const sourceEl = factRefs.current?.get(sourceFact.id);
            const targetEl = factRefs.current?.get(targetFact.id);
      
            if (sourceEl && targetEl) {
              const sourceRect = sourceEl.getBoundingClientRect();
              const targetRect = targetEl.getBoundingClientRect();
      
              const startX = sourceRect.right - containerRect.left;
              const startY = sourceRect.top + sourceRect.height / 2 - containerRect.top;
      
              const endX = targetRect.left - containerRect.left;
              const endY = targetRect.top + targetRect.height / 2 - containerRect.top;
      
              const controlX1 = startX + 60;
              const controlY1 = startY;
              const controlX2 = endX - 60;
              const controlY2 = endY;
              
              const pathId = `path-${sourceFact.id}-${targetFact.id}-${setIndex}`;
              const pathD = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
              const color = PERSPECTIVE_COLORS[setIndex % PERSPECTIVE_COLORS.length];
              
              newPaths.push({ id: pathId, d: pathD, color });
            }
        });
    });

    setPaths(newPaths);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMappingSets, sourceDomain, targetDomain]);

  useLayoutEffect(() => {
    calculatePaths();
  }, [calculatePaths]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
        calculatePaths();
    });

    const container = containerRef.current;
    if (container) {
        resizeObserver.observe(container);
    }

    return () => {
        if(container) {
            resizeObserver.unobserve(container);
        }
    };
  }, [containerRef, calculatePaths]);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <svg width="100%" height="100%">
        <g>
          {paths.map(({ id, d, color }) => (
            <path
              key={id}
              d={d}
              stroke={color}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeOpacity={0.8}
              className="transition-all duration-500 ease-in-out"
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default MappingVisualizer;