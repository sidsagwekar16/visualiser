import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { SchemaMetadata, TableNode } from '../types';
import { GitBranch, ArrowRight, Database } from 'lucide-react';

interface ConnectionFinderProps {
  isOpen: boolean;
  onClose: () => void;
  schema: SchemaMetadata;
  onHighlightPath: (tableNames: string[]) => void;
}

export default function ConnectionFinder({ isOpen, onClose, schema, onHighlightPath }: ConnectionFinderProps) {
  const [fromTable, setFromTable] = useState('');
  const [toTable, setToTable] = useState('');
  const [paths, setPaths] = useState<string[][]>([]);

  const findPaths = () => {
    if (!fromTable || !toTable) return;

    const allPaths = findAllPaths(fromTable, toTable, schema);
    setPaths(allPaths);
  };

  const handleHighlightPath = (path: string[]) => {
    onHighlightPath(path);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Find Connections Between Tables
          </DialogTitle>
          <DialogDescription>
            Discover relationships and paths between any two tables
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* From/To Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">From Table</label>
              <select
                value={fromTable}
                onChange={(e) => setFromTable(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Select table...</option>
                {schema.tables.map(table => (
                  <option key={table.name} value={table.name}>
                    {table.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">To Table</label>
              <select
                value={toTable}
                onChange={(e) => setToTable(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Select table...</option>
                {schema.tables.map(table => (
                  <option key={table.name} value={table.name}>
                    {table.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={findPaths} disabled={!fromTable || !toTable} className="w-full">
            Find Connections
          </Button>

          {/* Results */}
          {paths.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">
                Found {paths.length} connection{paths.length !== 1 ? 's' : ''}:
              </h3>
              {paths.map((path, idx) => (
                <Card key={idx}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">
                        Path {idx + 1} ({path.length} tables)
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleHighlightPath(path)}
                      >
                        Highlight in Graph
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {path.map((table, i) => (
                        <React.Fragment key={i}>
                          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900 rounded">
                            <Database className="w-3 h-3" />
                            <span className="font-mono text-sm">{table}</span>
                          </div>
                          {i < path.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {paths.length === 0 && fromTable && toTable && (
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                No direct connections found between these tables
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to find all paths between two tables
function findAllPaths(from: string, to: string, schema: SchemaMetadata): string[][] {
  const paths: string[][] = [];
  const visited = new Set<string>();

  function dfs(current: string, target: string, path: string[]) {
    if (current === target) {
      paths.push([...path]);
      return;
    }

    if (path.length > 5) return; // Limit path depth to avoid infinite loops

    visited.add(current);

    // Find all tables this table references (outgoing)
    const currentTable = schema.tables.find(t => t.name === current);
    if (currentTable) {
      currentTable.foreignKeys.forEach(fk => {
        const refTable = fk.references.split('.')[0];
        if (!visited.has(refTable)) {
          dfs(refTable, target, [...path, refTable]);
        }
      });
    }

    // Find all tables that reference this table (incoming)
    schema.relationships
      .filter(rel => rel.to === current && !visited.has(rel.from))
      .forEach(rel => {
        if (!visited.has(rel.from)) {
          dfs(rel.from, target, [...path, rel.from]);
        }
      });

    visited.delete(current);
  }

  dfs(from, to, [from]);
  return paths;
}


