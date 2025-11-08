import React from 'react';
import { Button } from './ui/button';
import {
  Download,
  Upload,
  RefreshCw,
  Database,
  FileJson,
  FileCode,
  LayoutGrid,
  Network,
  GitBranch,
  Share2,
  Play,
  Layers,
} from 'lucide-react';

interface ToolbarProps {
  onRefresh: () => void;
  onExportSQL: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onFindConnections: () => void;
  onAnalyzeRelationships: () => void;
  onTraceFlow: () => void;
  onGroupTables: () => void;
  viewMode: 'graph' | 'matrix';
  onViewModeChange: (mode: 'graph' | 'matrix') => void;
  isLoading: boolean;
}

export default function Toolbar({
  onRefresh,
  onExportSQL,
  onExportJSON,
  onImportJSON,
  onFindConnections,
  onAnalyzeRelationships,
  onTraceFlow,
  onGroupTables,
  viewMode,
  onViewModeChange,
  isLoading,
}: ToolbarProps) {
  return (
    <div className="border-b bg-white dark:bg-gray-900 p-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-lg text-blue-900 dark:text-blue-100">
            Schema Visualizer
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <Button
            variant={viewMode === 'graph' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('graph')}
          >
            <Network className="w-4 h-4 mr-1" />
            Graph
          </Button>
          <Button
            variant={viewMode === 'matrix' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('matrix')}
          >
            <LayoutGrid className="w-4 h-4 mr-1" />
            Matrix
          </Button>
        </div>

        {/* Analysis Tools */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <Button variant="ghost" size="sm" onClick={onTraceFlow}>
            <Play className="w-4 h-4 mr-1" />
            Trace Flow
          </Button>
          <Button variant="ghost" size="sm" onClick={onGroupTables}>
            <Layers className="w-4 h-4 mr-1" />
            Group Tables
          </Button>
          <Button variant="ghost" size="sm" onClick={onFindConnections}>
            <GitBranch className="w-4 h-4 mr-1" />
            Connections
          </Button>
          <Button variant="ghost" size="sm" onClick={onAnalyzeRelationships}>
            <Share2 className="w-4 h-4 mr-1" />
            Relationships
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        <Button variant="outline" size="sm" onClick={onImportJSON}>
          <Upload className="w-4 h-4 mr-1" />
          Import
        </Button>

        <Button variant="outline" size="sm" onClick={onExportJSON}>
          <FileJson className="w-4 h-4 mr-1" />
          Export JSON
        </Button>

        <Button variant="outline" size="sm" onClick={onExportSQL}>
          <FileCode className="w-4 h-4 mr-1" />
          Export SQL
        </Button>
      </div>
    </div>
  );
}


