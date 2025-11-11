

export interface Fact {
  id: string;
  text: string;
  custom?: boolean;
}

export interface Domain {
  name: string;
  facts: Fact[];
}

export interface Mapping {
  sourceFactIndex: number;
  targetFactIndex: number;
}

export interface MappingSet {
  name: string;
  description: string;
  icon?: string;
  mappings: Mapping[];
  custom?: boolean;
}

export interface MetaphorAnalysis {
  sourceDomain: Domain;
  targetDomain: Domain;
  mappingSets: MappingSet[];
}

export interface GeneratedDocument {
  type: string;
  content: string;
  timestamp: number;
}

export interface GeneratedImage {
    base64Data: string;
    mimeType: string;
    history: { prompt: string; timestamp: number }[];
}

export interface ExploredPerspective {
  mappingSetIndex: number;
  consequences: string[]; // Array to hold different generated versions
  generatedDocuments?: GeneratedDocument[];
  generatedImage?: GeneratedImage;
}

export interface Comparison {
  perspectiveIndices: number[];
  aiSummary: string;
  userNotes: string;
  timestamp: number;
}

export interface StoredMetaphorAnalysis {
  metaphor: string;
  analysis: MetaphorAnalysis;
  exploredPerspectives: ExploredPerspective[];
  comparisons?: Comparison[];
  timestamp: number;
}