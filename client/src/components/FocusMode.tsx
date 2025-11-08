import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { TableNode } from '../types';
import { Focus, X, Plus, Minus } from 'lucide-react';

interface FocusModeProps {
  selectedTable: TableNode | null;
  onFocusDepthChange: (depth: number) => void;
  focusDepth: number;
  onClearFocus: () => void;
}

export default function FocusMode({
  selectedTable,
  onFocusDepthChange,
  focusDepth,
  onClearFocus,
}: FocusModeProps) {
  if (!selectedTable) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-2xl border-2 border-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Focus className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Focus Mode</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFocus}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Focused on:
            </div>
            <div className="font-mono font-semibold text-blue-600">
              {selectedTable.name}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Show related tables:
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFocusDepthChange(Math.max(0, focusDepth - 1))}
                disabled={focusDepth === 0}
                className="h-8 w-8 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>

              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-blue-600">{focusDepth}</div>
                <div className="text-xs text-gray-500">
                  {focusDepth === 0 && 'Only this table'}
                  {focusDepth === 1 && 'Direct connections'}
                  {focusDepth === 2 && '2 levels deep'}
                  {focusDepth >= 3 && `${focusDepth} levels deep`}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onFocusDepthChange(Math.min(5, focusDepth + 1))}
                disabled={focusDepth === 5}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="pt-3 border-t text-xs space-y-1 text-gray-600 dark:text-gray-400">
            <div>• 0 = Just {selectedTable.name}</div>
            <div>• 1 = Immediate neighbors</div>
            <div>• 2+ = Extended connections</div>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={onClearFocus}
            className="w-full"
          >
            Show All Tables
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


