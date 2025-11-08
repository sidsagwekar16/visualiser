import React from 'react';
import { SchemaMetadata } from '../types';

interface MatrixViewProps {
  schema: SchemaMetadata;
}

export default function MatrixView({ schema }: MatrixViewProps) {
  const tables = schema.tables.map(t => t.name);
  const relationshipMap = new Map<string, Set<string>>();

  // Build relationship map
  schema.relationships.forEach(rel => {
    if (!relationshipMap.has(rel.from)) {
      relationshipMap.set(rel.from, new Set());
    }
    relationshipMap.get(rel.from)!.add(rel.to);
  });

  const hasRelationship = (from: string, to: string): boolean => {
    return relationshipMap.get(from)?.has(to) || false;
  };

  return (
    <div className="w-full h-full overflow-auto p-4">
      <div className="inline-block min-w-full">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-20 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2 min-w-[150px]">
                <div className="font-semibold text-sm">From \ To</div>
              </th>
              {tables.map(table => (
                <th
                  key={table}
                  className="sticky top-0 z-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2 min-w-[40px]"
                >
                  <div className="transform -rotate-45 origin-left text-xs whitespace-nowrap">
                    {table}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tables.map(fromTable => (
              <tr key={fromTable}>
                <th className="sticky left-0 z-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2 text-left">
                  <div className="font-mono text-xs">{fromTable}</div>
                </th>
                {tables.map(toTable => {
                  const hasRel = hasRelationship(fromTable, toTable);
                  const isSelf = fromTable === toTable;
                  
                  return (
                    <td
                      key={toTable}
                      className={`border border-gray-300 dark:border-gray-700 p-1 text-center ${
                        isSelf
                          ? 'bg-gray-200 dark:bg-gray-800'
                          : hasRel
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : ''
                      }`}
                    >
                      {hasRel && !isSelf && (
                        <div className="w-4 h-4 mx-auto bg-blue-500 rounded-full" />
                      )}
                      {isSelf && <div className="text-gray-400 text-xs">—</div>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 border border-gray-300 dark:border-gray-700 rounded" />
          <span>Has Relationship</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded" />
          <span>Same Table</span>
        </div>
      </div>
    </div>
  );
}



