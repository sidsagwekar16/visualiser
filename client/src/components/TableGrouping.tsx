import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { SchemaMetadata } from '../types';
import { Layers, Database } from 'lucide-react';

interface TableGroupingProps {
  isOpen: boolean;
  onClose: () => void;
  schema: SchemaMetadata;
  onSelectGroup: (tables: string[]) => void;
}

interface TableGroup {
  name: string;
  icon: string;
  color: string;
  keywords: string[];
  tables: string[];
}

export default function TableGrouping({ isOpen, onClose, schema, onSelectGroup }: TableGroupingProps) {
  const groups = useMemo(() => {
    const groupDefinitions: Omit<TableGroup, 'tables'>[] = [
      {
        name: 'Authentication & Users',
        icon: '🔐',
        color: 'bg-blue-100 dark:bg-blue-900',
        keywords: ['user', 'auth', 'login', 'session', 'password', 'token', 'account'],
      },
      {
        name: 'Drivers',
        icon: '🚚',
        color: 'bg-green-100 dark:bg-green-900',
        keywords: ['driver', 'vehicle', 'license', 'route', 'delivery'],
      },
      {
        name: 'Orders & Transactions',
        icon: '📦',
        color: 'bg-purple-100 dark:bg-purple-900',
        keywords: ['order', 'transaction', 'payment', 'invoice', 'purchase', 'cart'],
      },
      {
        name: 'Products & Inventory',
        icon: '📦',
        color: 'bg-orange-100 dark:bg-orange-900',
        keywords: ['product', 'inventory', 'stock', 'item', 'catalog'],
      },
      {
        name: 'Subscribers & Customers',
        icon: '👥',
        color: 'bg-pink-100 dark:bg-pink-900',
        keywords: ['subscriber', 'customer', 'client', 'member'],
      },
      {
        name: 'AI & Insights',
        icon: '🤖',
        color: 'bg-indigo-100 dark:bg-indigo-900',
        keywords: ['ai', 'insight', 'analytics', 'prediction', 'recommendation'],
      },
      {
        name: 'Notifications & Events',
        icon: '🔔',
        color: 'bg-yellow-100 dark:bg-yellow-900',
        keywords: ['notification', 'event', 'alert', 'message', 'email'],
      },
      {
        name: 'Billing & Subscriptions',
        icon: '💳',
        color: 'bg-teal-100 dark:bg-teal-900',
        keywords: ['billing', 'subscription', 'plan', 'pricing', 'charge'],
      },
      {
        name: 'Locations & Geography',
        icon: '📍',
        color: 'bg-red-100 dark:bg-red-900',
        keywords: ['location', 'address', 'geo', 'coordinate', 'place', 'region'],
      },
      {
        name: 'Settings & Configuration',
        icon: '⚙️',
        color: 'bg-gray-100 dark:bg-gray-800',
        keywords: ['config', 'setting', 'preference', 'option'],
      },
    ];

    return groupDefinitions.map(group => {
      const matchedTables = schema.tables.filter(table => {
        const tableName = table.name.toLowerCase();
        return group.keywords.some(keyword => tableName.includes(keyword));
      });

      return {
        ...group,
        tables: matchedTables.map(t => t.name),
      };
    }).filter(group => group.tables.length > 0);
  }, [schema]);

  const ungroupedTables = useMemo(() => {
    const groupedTableNames = new Set(groups.flatMap(g => g.tables));
    return schema.tables
      .filter(t => !groupedTableNames.has(t.name))
      .map(t => t.name);
  }, [schema, groups]);

  const handleSelectGroup = (tables: string[]) => {
    onSelectGroup(tables);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Smart Table Grouping
          </DialogTitle>
          <DialogDescription>
            Tables automatically organized by domain and functionality
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{schema.tables.length}</span>
              <span className="text-gray-600 dark:text-gray-400">Total Tables</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{groups.length}</span>
              <span className="text-gray-600 dark:text-gray-400">Groups Found</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{ungroupedTables.length}</span>
              <span className="text-gray-600 dark:text-gray-400">Ungrouped</span>
            </div>
          </div>

          {/* Groups */}
          <div className="grid grid-cols-2 gap-3">
            {groups.map(group => (
              <Card key={group.name} className="hover:shadow-lg transition-shadow">
                <CardHeader className={`${group.color} rounded-t-lg`}>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">{group.icon}</span>
                      <span>{group.name}</span>
                    </span>
                    <span className="text-sm font-normal bg-white dark:bg-gray-800 px-2 py-1 rounded">
                      {group.tables.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                    {group.tables.slice(0, 10).map(tableName => (
                      <div
                        key={tableName}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Database className="w-3 h-3 text-gray-400" />
                        <span className="font-mono text-xs">{tableName}</span>
                      </div>
                    ))}
                    {group.tables.length > 10 && (
                      <div className="text-xs text-gray-400 italic">
                        +{group.tables.length - 10} more...
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSelectGroup(group.tables)}
                  >
                    Focus This Group
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Ungrouped */}
          {ungroupedTables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Ungrouped Tables</span>
                  <span className="text-sm font-normal bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {ungroupedTables.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {ungroupedTables.map(tableName => (
                    <div
                      key={tableName}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Database className="w-3 h-3 text-gray-400" />
                      <span className="font-mono truncate">{tableName}</span>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSelectGroup(ungroupedTables)}
                >
                  Focus Ungrouped
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


