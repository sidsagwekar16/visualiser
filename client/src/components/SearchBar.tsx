import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { TableNode } from '../types';

interface SearchBarProps {
  tables: TableNode[];
  onSearchResults: (results: SearchResult[]) => void;
  onClear: () => void;
}

export interface SearchResult {
  table: TableNode;
  matchType: 'table_name' | 'column_name' | 'foreign_key' | 'index';
  matchedValue: string;
  context?: string;
}

export default function SearchBar({ tables, onSearchResults, onClear }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setShowResults(false);
      onClear();
      return;
    }

    const searchResults = performSearch(searchTerm.toLowerCase());
    setResults(searchResults);
    setShowResults(true);
    onSearchResults(searchResults);
  }, [searchTerm, tables]);

  const performSearch = (term: string): SearchResult[] => {
    const results: SearchResult[] = [];

    tables.forEach(table => {
      // Search in table name
      if (table.name.toLowerCase().includes(term)) {
        results.push({
          table,
          matchType: 'table_name',
          matchedValue: table.name,
        });
      }

      // Search in column names
      table.columns.forEach(col => {
        if (col.name.toLowerCase().includes(term)) {
          results.push({
            table,
            matchType: 'column_name',
            matchedValue: col.name,
            context: col.type,
          });
        }
      });

      // Search in foreign keys
      table.foreignKeys.forEach(fk => {
        if (fk.column.toLowerCase().includes(term) || fk.references.toLowerCase().includes(term)) {
          results.push({
            table,
            matchType: 'foreign_key',
            matchedValue: `${fk.column} → ${fk.references}`,
          });
        }
      });

      // Search in indexes
      table.indexes.forEach(idx => {
        if (idx.name.toLowerCase().includes(term)) {
          results.push({
            table,
            matchType: 'index',
            matchedValue: idx.name,
            context: idx.columns.join(', '),
          });
        }
      });
    });

    return results;
  };

  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
    onClear();
  };

  const getMatchTypeBadge = (type: SearchResult['matchType']) => {
    const badges = {
      table_name: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      column_name: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      foreign_key: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      index: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    };

    const labels = {
      table_name: 'Table',
      column_name: 'Column',
      foreign_key: 'FK',
      index: 'Index',
    };

    return (
      <span className={`text-xs px-2 py-0.5 rounded ${badges[type]}`}>
        {labels[type]}
      </span>
    );
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tables, columns, foreign keys..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-[400px] overflow-y-auto z-50 shadow-xl">
          <CardContent className="p-2">
            <div className="text-xs text-gray-500 px-2 py-1 mb-1">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </div>
            <div className="space-y-1">
              {results.slice(0, 50).map((result, idx) => (
                <div
                  key={idx}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
                  onClick={() => {
                    // Will be handled by parent component
                    setShowResults(false);
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{result.table.name}</span>
                    {getMatchTypeBadge(result.matchType)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-mono">{result.matchedValue}</span>
                    {result.context && (
                      <span className="ml-2 text-gray-400">({result.context})</span>
                    )}
                  </div>
                </div>
              ))}
              {results.length > 50 && (
                <div className="text-xs text-gray-400 text-center py-2">
                  Showing first 50 of {results.length} results
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && results.length === 0 && searchTerm && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-xl">
          <CardContent className="p-4 text-center text-gray-500">
            No results found for "{searchTerm}"
          </CardContent>
        </Card>
      )}
    </div>
  );
}


