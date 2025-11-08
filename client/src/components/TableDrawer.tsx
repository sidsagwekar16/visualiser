import React from 'react';
import { TableNode, SchemaHealth } from '../types';
import { X, Database, Key, Link, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { formatBytes, formatNumber, getHealthColor } from '../lib/utils';
import { useStore } from '../store/useStore';

interface TableDrawerProps {
  table: TableNode;
  onClose: () => void;
}

export default function TableDrawer({ table, onClose }: TableDrawerProps) {
  const { diagnostics } = useStore();
  
  const health = diagnostics?.healthScores.find(h => h.table === table.name);
  const healthColor = getHealthColor(health?.score || 50);

  return (
    <div className="fixed right-0 top-0 h-full w-[450px] bg-white dark:bg-gray-900 border-l shadow-2xl overflow-y-auto z-50">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6" style={{ color: healthColor }} />
          <div>
            <h2 className="text-xl font-bold">{table.name}</h2>
            <p className="text-sm text-gray-500">{table.schema} schema</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Health Score */}
      {health && (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Health Score</span>
            <span
              className="text-2xl font-bold"
              style={{ color: healthColor }}
            >
              {health.score}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${health.score}%`,
                backgroundColor: healthColor,
              }}
            />
          </div>
          {health.issues.length > 0 && (
            <div className="mt-3 space-y-1">
              {health.issues.map((issue, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-orange-600 dark:text-orange-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="p-4 border-b grid grid-cols-2 gap-3">
        <div className="text-sm">
          <div className="text-gray-500">Rows</div>
          <div className="font-semibold text-lg">
            {table.rowCount ? formatNumber(table.rowCount) : 'N/A'}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-gray-500">Size</div>
          <div className="font-semibold text-lg">
            {table.sizeBytes ? formatBytes(table.sizeBytes) : 'N/A'}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-gray-500">Columns</div>
          <div className="font-semibold text-lg">{table.columns.length}</div>
        </div>
        <div className="text-sm">
          <div className="text-gray-500">Foreign Keys</div>
          <div className="font-semibold text-lg">{table.foreignKeys.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="columns" className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="columns">Columns</TabsTrigger>
          <TabsTrigger value="constraints">Constraints</TabsTrigger>
          <TabsTrigger value="indexes">Indexes</TabsTrigger>
        </TabsList>

        <TabsContent value="columns" className="space-y-2 mt-4">
          {table.columns.map((col, idx) => (
            <Card key={idx}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {col.isPrimaryKey && (
                      <Key className="w-4 h-4 text-yellow-500" />
                    )}
                    {table.foreignKeys.some(fk => fk.column === col.name) && (
                      <Link className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="font-mono font-semibold">{col.name}</span>
                  </div>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {col.type}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500 space-x-3">
                  <span>{col.nullable ? 'nullable' : 'not null'}</span>
                  {col.default && <span>default: {col.default}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="constraints" className="space-y-2 mt-4">
          {/* Primary Keys */}
          {table.primaryKeys.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-yellow-500" />
                  Primary Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {table.primaryKeys.join(', ')}
              </CardContent>
            </Card>
          )}

          {/* Foreign Keys */}
          {table.foreignKeys.map((fk, idx) => {
            // Determine relationship type
            const isUnique = table.indexes.some(index => 
              index.unique && index.columns.length === 1 && index.columns[0] === fk.column
            ) || table.primaryKeys.includes(fk.column);
            
            const relationshipType = isUnique ? 'One-to-One' : 'One-to-Many';
            const relColor = isUnique ? 'text-green-600' : 'text-blue-600';
            const relBg = isUnique ? 'bg-green-50 dark:bg-green-950' : 'bg-blue-50 dark:bg-blue-950';

            return (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-blue-500" />
                      Foreign Key
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${relBg} ${relColor} font-semibold`}>
                      {relationshipType}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div><span className="font-mono">{fk.column}</span> → <span className="font-mono">{fk.references}</span></div>
                  {isUnique && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      ✓ Unique constraint (one-to-one relationship)
                    </div>
                  )}
                  {fk.onDelete && <div className="text-gray-500 text-xs">ON DELETE {fk.onDelete}</div>}
                  {fk.onUpdate && <div className="text-gray-500 text-xs">ON UPDATE {fk.onUpdate}</div>}
                </CardContent>
              </Card>
            );
          })}

          {table.foreignKeys.length === 0 && table.primaryKeys.length === 0 && (
            <div className="text-center text-gray-400 py-8">No constraints</div>
          )}
        </TabsContent>

        <TabsContent value="indexes" className="space-y-2 mt-4">
          {table.indexes.map((idx, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="font-mono">{idx.name}</span>
                  {idx.unique && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                      UNIQUE
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                Columns: {idx.columns.join(', ')}
              </CardContent>
            </Card>
          ))}
          {table.indexes.length === 0 && (
            <div className="text-center text-gray-400 py-8">No indexes</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


