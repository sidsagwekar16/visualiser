import React from 'react';
import { Handle, Position } from 'reactflow';
import { TableNode } from '../types';
import { Database, Key, Link } from 'lucide-react';
import { formatNumber } from '../lib/utils';

interface TableNodeProps {
  data: {
    table: TableNode;
    healthScore: number;
    color: string;
    isHighlighted?: boolean;
    isSearchResult?: boolean;
  };
}

export default function TableNodeComponent({ data }: TableNodeProps) {
  const { table, healthScore, color, isHighlighted, isSearchResult } = data;

  return (
    <div
      className={`bg-white dark:bg-gray-900 border-2 rounded-lg shadow-lg min-w-[250px] max-w-[300px] transition-all ${
        isHighlighted ? 'ring-4 ring-blue-400 scale-105' : ''
      } ${isSearchResult ? 'ring-2 ring-green-400' : ''}`}
      style={{ borderColor: isHighlighted ? '#3b82f6' : color }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      {/* Header */}
      <div
        className="px-3 py-2 rounded-t-md flex items-center justify-between"
        style={{ backgroundColor: color + '20', borderBottom: `2px solid ${color}` }}
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" style={{ color }} />
          <span className="font-bold text-sm truncate">{table.name}</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white dark:bg-gray-800">
          {healthScore}
        </span>
      </div>

      {/* Columns */}
      <div className="px-3 py-2 max-h-[150px] overflow-y-auto text-xs">
        {table.columns.slice(0, 5).map((col, idx) => (
          <div key={idx} className="flex items-center gap-1 py-0.5 text-gray-700 dark:text-gray-300">
            {col.isPrimaryKey && <Key className="w-3 h-3 text-yellow-500" />}
            {table.foreignKeys.some(fk => fk.column === col.name) && (
              <Link className="w-3 h-3 text-blue-500" />
            )}
            <span className="font-mono truncate">{col.name}</span>
            <span className="text-gray-400 text-[10px] ml-auto">{col.type}</span>
          </div>
        ))}
        {table.columns.length > 5 && (
          <div className="text-gray-400 text-[10px] italic mt-1">
            +{table.columns.length - 5} more...
          </div>
        )}
      </div>

      {/* Footer */}
      {table.rowCount !== undefined && (
        <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-b-md border-t text-[10px] text-gray-500 flex justify-between">
          <span>{formatNumber(table.rowCount)} rows</span>
          <span>{table.foreignKeys.length} FKs</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}


