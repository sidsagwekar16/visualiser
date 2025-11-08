import React from 'react';
import { Button } from './ui/button';
import { AlertTriangle, Database, GitBranch, Activity, X } from 'lucide-react';
import { DiagnosticResult } from '../types';

interface QuickFiltersProps {
  diagnostics: DiagnosticResult | null;
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export default function QuickFilters({ diagnostics, activeFilter, onFilterChange }: QuickFiltersProps) {
  if (!diagnostics) return null;

  const filters = [
    {
      id: 'orphans',
      label: 'Orphan Tables',
      icon: Database,
      count: diagnostics.orphanTables.length,
      color: 'text-gray-500',
    },
    {
      id: 'cycles',
      label: 'Circular Deps',
      icon: GitBranch,
      count: diagnostics.circularDependencies.length,
      color: 'text-orange-500',
    },
    {
      id: 'types',
      label: 'Type Mismatches',
      icon: AlertTriangle,
      count: diagnostics.typeMismatches.length,
      color: 'text-red-500',
    },
    {
      id: 'indexes',
      label: 'Missing Indexes',
      icon: Activity,
      count: diagnostics.missingIndexes.length,
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        Quick Filters:
      </span>
      {filters.map(filter => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(activeFilter === filter.id ? null : filter.id)}
          className="flex items-center gap-2"
        >
          <filter.icon className={`w-4 h-4 ${activeFilter === filter.id ? '' : filter.color}`} />
          <span>{filter.label}</span>
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-white dark:bg-gray-800 rounded">
            {filter.count}
          </span>
        </Button>
      ))}
      {activeFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange(null)}
          className="flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
}


