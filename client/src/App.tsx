import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { schemaApi } from './lib/api';
import Toolbar from './components/Toolbar';
import SchemaGraph from './components/SchemaGraph';
import MatrixView from './components/MatrixView';
import TableDrawer from './components/TableDrawer';
import DiagnosticsPanel from './components/DiagnosticsPanel';
import SQLExportDialog from './components/SQLExportDialog';
import SearchBar, { SearchResult } from './components/SearchBar';
import QuickFilters from './components/QuickFilters';
import ConnectionFinder from './components/ConnectionFinder';
import RelationshipAnalyzer from './components/RelationshipAnalyzer';
import RelationshipLegend from './components/RelationshipLegend';
import FlowTracer from './components/FlowTracer';
import FocusMode from './components/FocusMode';
import TableGrouping from './components/TableGrouping';
import { Button } from './components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const {
    schema,
    diagnostics,
    selectedTable,
    viewMode,
    isLoading,
    error,
    activeFilter,
    setSchema,
    setDiagnostics,
    setSelectedTable,
    setViewMode,
    setLoading,
    setError,
    setHighlightedTables,
    setActiveFilter,
    setSearchResults,
  } = useStore();

  const [sqlDialogOpen, setSqlDialogOpen] = useState(false);
  const [exportedSQL, setExportedSQL] = useState('');
  const [connectionFinderOpen, setConnectionFinderOpen] = useState(false);
  const [relationshipAnalyzerOpen, setRelationshipAnalyzerOpen] = useState(false);
  const [flowTracerOpen, setFlowTracerOpen] = useState(false);
  const [tableGroupingOpen, setTableGroupingOpen] = useState(false);
  const [focusDepth, setFocusDepth] = useState(1);

  // Load schema on mount
  useEffect(() => {
    loadSchema();
  }, []);

  const loadSchema = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load from JSON file (not live DB for now)
      const schemaData = await schemaApi.getSchema(false);
      setSchema(schemaData);

      // Load diagnostics
      const diagnosticsData = await schemaApi.analyze(false);
      setDiagnostics(diagnosticsData);
    } catch (err: any) {
      console.error('Error loading schema:', err);
      setError(err.message || 'Failed to load schema');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSQL = async () => {
    if (!schema) return;

    try {
      // For now, generate SQL for the entire schema as if it were new
      const diff = {
        added: schema.tables,
        removed: [],
        modified: [],
      };

      const sql = await schemaApi.exportSQL(diff);
      setExportedSQL(sql);
      setSqlDialogOpen(true);
    } catch (err: any) {
      console.error('Error exporting SQL:', err);
      setError(err.message || 'Failed to export SQL');
    }
  };

  const handleExportJSON = () => {
    if (!schema) return;

    const json = JSON.stringify(schema, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema_export_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        
        // If it's already schema metadata format
        if (jsonData.tables && jsonData.relationships) {
          setSchema(jsonData);
        } else if (Array.isArray(jsonData)) {
          // If it's raw database export format
          const schemaData = await schemaApi.getSchema(false);
          setSchema(schemaData);
        }
      } catch (err: any) {
        console.error('Error importing JSON:', err);
        setError(err.message || 'Failed to import JSON');
      }
    };
    input.click();
  };

  const handleSearchResults = (results: SearchResult[]) => {
    const tableNames = [...new Set(results.map(r => r.table.name))];
    setSearchResults(tableNames);
  };

  const handleClearSearch = () => {
    setSearchResults([]);
  };

  const handleHighlightPath = (path: string[]) => {
    setHighlightedTables(path);
  };

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter);
    setSearchResults([]); // Clear search when filter changes
  };

  const handleSelectGroup = (tables: string[]) => {
    setSearchResults(tables);
    setHighlightedTables(tables);
  };

  const handleFocusDepthChange = (depth: number) => {
    setFocusDepth(depth);
    if (selectedTable && depth >= 0) {
      const relatedTables = getRelatedTables(selectedTable.name, depth);
      setHighlightedTables(relatedTables);
    }
  };

  const handleClearFocus = () => {
    setHighlightedTables([]);
    setSelectedTable(null);
    setFocusDepth(1);
  };

  const getRelatedTables = (tableName: string, depth: number): string[] => {
    if (!schema || depth === 0) return [tableName];

    const related = new Set<string>([tableName]);
    const queue: Array<{name: string; level: number}> = [{name: tableName, level: 0}];
    const visited = new Set<string>([tableName]);

    while (queue.length > 0) {
      const { name: currentTable, level } = queue.shift()!;

      if (level >= depth) continue;

      const table = schema.tables.find(t => t.name === currentTable);
      if (!table) continue;

      // Add FK references
      table.foreignKeys.forEach(fk => {
        const refTable = fk.references.split('.')[0];
        if (!visited.has(refTable)) {
          visited.add(refTable);
          related.add(refTable);
          queue.push({name: refTable, level: level + 1});
        }
      });

      // Add reverse references
      schema.relationships
        .filter(rel => rel.to === currentTable)
        .forEach(rel => {
          if (!visited.has(rel.from)) {
            visited.add(rel.from);
            related.add(rel.from);
            queue.push({name: rel.from, level: level + 1});
          }
        });
    }

    return Array.from(related);
  };

  if (isLoading && !schema) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading schema...</p>
        </div>
      </div>
    );
  }

  if (error && !schema) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Schema</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={loadSchema}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No schema loaded</p>
          <Button onClick={loadSchema} className="mt-4">Load Schema</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Toolbar */}
      <Toolbar
        onRefresh={loadSchema}
        onExportSQL={handleExportSQL}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onFindConnections={() => setConnectionFinderOpen(true)}
        onAnalyzeRelationships={() => setRelationshipAnalyzerOpen(true)}
        onTraceFlow={() => setFlowTracerOpen(true)}
        onGroupTables={() => setTableGroupingOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isLoading={isLoading}
      />

      {/* Search & Filters Bar */}
      <div className="border-b bg-white dark:bg-gray-900 p-3 space-y-3">
        <div className="max-w-2xl">
          {schema && (
            <SearchBar
              tables={schema.tables}
              onSearchResults={handleSearchResults}
              onClear={handleClearSearch}
            />
          )}
        </div>
        {diagnostics && (
          <QuickFilters
            diagnostics={diagnostics}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Diagnostics */}
        <div className="w-80 border-r bg-white dark:bg-gray-900 overflow-y-auto">
          {diagnostics && <DiagnosticsPanel diagnostics={diagnostics} />}
          <div className="p-4 border-t">
            <RelationshipLegend />
          </div>
        </div>

        {/* Center - Visualization */}
        <div className="flex-1 relative">
          {viewMode === 'graph' ? (
            <SchemaGraph schema={schema} />
          ) : (
            <MatrixView schema={schema} />
          )}
        </div>

        {/* Right Panel - Table Details */}
        {selectedTable && (
          <TableDrawer
            table={selectedTable}
            onClose={() => setSelectedTable(null)}
          />
        )}
      </div>

      {/* SQL Export Dialog */}
      <SQLExportDialog
        isOpen={sqlDialogOpen}
        onClose={() => setSqlDialogOpen(false)}
        sql={exportedSQL}
      />

      {/* Connection Finder Dialog */}
      {schema && (
        <ConnectionFinder
          isOpen={connectionFinderOpen}
          onClose={() => setConnectionFinderOpen(false)}
          schema={schema}
          onHighlightPath={handleHighlightPath}
        />
      )}

      {/* Relationship Analyzer Dialog */}
      {schema && (
        <RelationshipAnalyzer
          isOpen={relationshipAnalyzerOpen}
          onClose={() => setRelationshipAnalyzerOpen(false)}
          schema={schema}
        />
      )}

      {/* Flow Tracer Dialog */}
      {schema && (
        <FlowTracer
          isOpen={flowTracerOpen}
          onClose={() => setFlowTracerOpen(false)}
          schema={schema}
          onHighlightTables={setHighlightedTables}
        />
      )}

      {/* Table Grouping Dialog */}
      {schema && (
        <TableGrouping
          isOpen={tableGroupingOpen}
          onClose={() => setTableGroupingOpen(false)}
          schema={schema}
          onSelectGroup={handleSelectGroup}
        />
      )}

      {/* Focus Mode Panel */}
      <FocusMode
        selectedTable={selectedTable}
        onFocusDepthChange={handleFocusDepthChange}
        focusDepth={focusDepth}
        onClearFocus={handleClearFocus}
      />
    </div>
  );
}


