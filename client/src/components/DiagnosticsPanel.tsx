import React from 'react';
import { DiagnosticResult } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { AlertTriangle, AlertCircle, Database, Activity } from 'lucide-react';

interface DiagnosticsPanelProps {
  diagnostics: DiagnosticResult;
}

export default function DiagnosticsPanel({ diagnostics }: DiagnosticsPanelProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diagnostics.summary.totalTables}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Relationships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diagnostics.summary.totalRelationships}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {diagnostics.summary.totalIssues}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Avg Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {diagnostics.summary.averageHealth}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Issues */}
      <Tabs defaultValue="orphans">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orphans">
            Orphans ({diagnostics.orphanTables.length})
          </TabsTrigger>
          <TabsTrigger value="cycles">
            Cycles ({diagnostics.circularDependencies.length})
          </TabsTrigger>
          <TabsTrigger value="types">
            Type Issues ({diagnostics.typeMismatches.length})
          </TabsTrigger>
          <TabsTrigger value="indexes">
            Missing Indexes ({diagnostics.missingIndexes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orphans" className="space-y-2 mt-4">
          {diagnostics.orphanTables.length > 0 ? (
            diagnostics.orphanTables.map((table, idx) => (
              <Card key={idx}>
                <CardContent className="p-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-400" />
                  <span className="font-mono text-sm">{table}</span>
                  <span className="text-xs text-gray-500 ml-auto">No relationships</span>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">No orphan tables</div>
          )}
        </TabsContent>

        <TabsContent value="cycles" className="space-y-2 mt-4">
          {diagnostics.circularDependencies.length > 0 ? (
            diagnostics.circularDependencies.map((cycle, idx) => (
              <Card key={idx}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm mb-1">Circular Dependency {idx + 1}</div>
                      <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        {cycle.join(' → ')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">No circular dependencies</div>
          )}
        </TabsContent>

        <TabsContent value="types" className="space-y-2 mt-4">
          {diagnostics.typeMismatches.length > 0 ? (
            diagnostics.typeMismatches.map((mismatch, idx) => (
              <Card key={idx}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold mb-1">
                        {mismatch.table}.{mismatch.column}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Type: <span className="font-mono">{mismatch.columnType}</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        References: <span className="font-mono">
                          {mismatch.referencedTable}.{mismatch.referencedColumn} ({mismatch.referencedType})
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">No type mismatches</div>
          )}
        </TabsContent>

        <TabsContent value="indexes" className="space-y-2 mt-4">
          {diagnostics.missingIndexes.length > 0 ? (
            diagnostics.missingIndexes.map((missing, idx) => (
              <Card key={idx}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Activity className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold">
                        {missing.table}.{missing.column}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {missing.reason}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">No missing indexes</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}



