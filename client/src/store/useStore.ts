import { create } from 'zustand';
import {
  SchemaMetadata,
  DiagnosticResult,
  TableStats,
  TableNode,
  SchemaLayer,
} from '../types';

interface AppState {
  schema: SchemaMetadata | null;
  diagnostics: DiagnosticResult | null;
  stats: TableStats[];
  selectedTable: TableNode | null;
  layers: SchemaLayer[];
  currentLayer: SchemaLayer | null;
  isLoading: boolean;
  error: string | null;
  viewMode: 'graph' | 'matrix';
  highlightedTables: string[];
  activeFilter: string | null;
  searchResults: string[];
  
  // Actions
  setSchema: (schema: SchemaMetadata) => void;
  setDiagnostics: (diagnostics: DiagnosticResult) => void;
  setStats: (stats: TableStats[]) => void;
  setSelectedTable: (table: TableNode | null) => void;
  setLayers: (layers: SchemaLayer[]) => void;
  setCurrentLayer: (layer: SchemaLayer | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setViewMode: (mode: 'graph' | 'matrix') => void;
  setHighlightedTables: (tables: string[]) => void;
  setActiveFilter: (filter: string | null) => void;
  setSearchResults: (results: string[]) => void;
}

export const useStore = create<AppState>((set) => ({
  schema: null,
  diagnostics: null,
  stats: [],
  selectedTable: null,
  layers: [],
  currentLayer: null,
  isLoading: false,
  error: null,
  viewMode: 'graph',
  highlightedTables: [],
  activeFilter: null,
  searchResults: [],
  
  setSchema: (schema) => set({ schema }),
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  setStats: (stats) => set({ stats }),
  setSelectedTable: (table) => set({ selectedTable: table }),
  setLayers: (layers) => set({ layers }),
  setCurrentLayer: (layer) => set({ currentLayer: layer }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setHighlightedTables: (tables) => set({ highlightedTables: tables }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSearchResults: (results) => set({ searchResults: results }),
}));


