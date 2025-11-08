import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { SchemaMetadata, TableNode } from '../types';
import { Database, ArrowRight } from 'lucide-react';

interface RelationshipAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  schema: SchemaMetadata;
}

interface RelationshipDetail {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  fromColumn: string;
  toColumn: string;
  isUnique: boolean;
  explanation: string;
}

export default function RelationshipAnalyzer({ isOpen, onClose, schema }: RelationshipAnalyzerProps) {
  const analyzeRelationships = (): RelationshipDetail[] => {
    const details: RelationshipDetail[] = [];
    const junctionTables = detectJunctionTables();

    schema.tables.forEach(table => {
      table.foreignKeys.forEach(fk => {
        const [refTable, refColumn] = fk.references.split('.');
        
        // Check if FK column is unique (indicates one-to-one)
        const isUnique = table.indexes.some(idx => 
          idx.unique && idx.columns.length === 1 && idx.columns[0] === fk.column
        ) || table.primaryKeys.includes(fk.column);

        // Check if this is part of a many-to-many relationship
        const isJunction = junctionTables.has(table.name);
        
        let type: 'one-to-one' | 'one-to-many' | 'many-to-many';
        let explanation: string;

        if (isJunction) {
          type = 'many-to-many';
          explanation = `${table.name} is a junction table connecting ${refTable} with other tables`;
        } else if (isUnique) {
          type = 'one-to-one';
          explanation = `Each ${table.name} has exactly one ${refTable} (FK column is unique)`;
        } else {
          type = 'one-to-many';
          explanation = `One ${refTable} can have many ${table.name} records`;
        }

        details.push({
          from: table.name,
          to: refTable,
          type,
          fromColumn: fk.column,
          toColumn: refColumn,
          isUnique,
          explanation,
        });
      });
    });

    return details;
  };

  const detectJunctionTables = (): Set<string> => {
    const junctions = new Set<string>();
    
    schema.tables.forEach(table => {
      // A junction table typically has:
      // 1. Multiple foreign keys (usually 2)
      // 2. Few or no other columns
      // 3. Composite primary key from FKs
      
      const fkCount = table.foreignKeys.length;
      const totalColumns = table.columns.length;
      
      if (fkCount >= 2 && totalColumns <= fkCount + 2) {
        junctions.add(table.name);
      }
    });

    return junctions;
  };

  const relationships = analyzeRelationships();
  
  const oneToOne = relationships.filter(r => r.type === 'one-to-one');
  const oneToMany = relationships.filter(r => r.type === 'one-to-many');
  const manyToMany = relationships.filter(r => r.type === 'many-to-many');

  const RelationshipCard = ({ rel }: { rel: RelationshipDetail }) => (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <Database className="w-4 h-4 text-blue-500" />
            <span className="font-mono font-semibold text-sm">{rel.from}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <Database className="w-4 h-4 text-green-500" />
            <span className="font-mono font-semibold text-sm">{rel.to}</span>
          </div>
          {rel.isUnique && (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
              Unique
            </span>
          )}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span className="font-mono">{rel.fromColumn}</span> → <span className="font-mono">{rel.toColumn}</span>
        </div>
        <div className="text-xs text-gray-500 italic">
          {rel.explanation}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Relationship Analysis</DialogTitle>
          <DialogDescription>
            Understanding your database relationships
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{oneToMany.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">One-to-Many</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{oneToOne.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">One-to-One</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{manyToMany.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Many-to-Many</div>
              </CardContent>
            </Card>
          </div>

          {/* One-to-Many */}
          {oneToMany.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-blue-600">One-to-Many Relationships</span>
                <span className="text-xs text-gray-500">({oneToMany.length})</span>
              </h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {oneToMany.map((rel, idx) => (
                  <RelationshipCard key={idx} rel={rel} />
                ))}
              </div>
            </div>
          )}

          {/* One-to-One */}
          {oneToOne.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-green-600">One-to-One Relationships</span>
                <span className="text-xs text-gray-500">({oneToOne.length})</span>
              </h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {oneToOne.map((rel, idx) => (
                  <RelationshipCard key={idx} rel={rel} />
                ))}
              </div>
            </div>
          )}

          {/* Many-to-Many */}
          {manyToMany.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-purple-600">Many-to-Many Relationships</span>
                <span className="text-xs text-gray-500">({manyToMany.length})</span>
              </h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {manyToMany.map((rel, idx) => (
                  <RelationshipCard key={idx} rel={rel} />
                ))}
              </div>
              <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-xs text-purple-800 dark:text-purple-200">
                  <strong>Junction Tables Detected:</strong> These tables exist to connect many-to-many relationships
                </div>
              </div>
            </div>
          )}

          {/* Educational Section */}
          <Card className="bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-sm">💡 Quick Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div>
                <strong>One-to-Many:</strong> The most common relationship. One parent record can have multiple child records.
              </div>
              <div>
                <strong>One-to-One:</strong> Each record in one table matches exactly one record in another table. The FK column is unique.
              </div>
              <div>
                <strong>Many-to-Many:</strong> Multiple records in each table can relate to multiple records in the other table. Requires a junction table.
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}


