import { Graph } from 'graphlib';
import {
  TableNode,
  DiagnosticResult,
  SchemaHealth,
  TypeMismatch,
  MissingIndex,
  SchemaMetadata,
} from './types.js';

export class SchemaAnalyzer {
  private graph: Graph;
  private tables: Map<string, TableNode>;

  constructor(private schema: SchemaMetadata) {
    this.graph = new Graph({ directed: true });
    this.tables = new Map(schema.tables.map(t => [t.name, t]));
    this.buildGraph();
  }

  /**
   * Build dependency graph from schema
   */
  private buildGraph() {
    // Add all tables as nodes
    this.schema.tables.forEach(table => {
      this.graph.setNode(table.name, table);
    });

    // Add edges for foreign keys
    this.schema.relationships.forEach(rel => {
      this.graph.setEdge(rel.from, rel.to);
    });
  }

  /**
   * Run all diagnostic checks
   */
  analyze(): DiagnosticResult {
    const orphanTables = this.findOrphanTables();
    const circularDependencies = this.findCircularDependencies();
    const typeMismatches = this.findTypeMismatches();
    const missingIndexes = this.findMissingIndexes();
    const healthScores = this.calculateHealthScores(orphanTables, circularDependencies, typeMismatches, missingIndexes);

    const totalIssues = orphanTables.length + 
                       circularDependencies.length + 
                       typeMismatches.length + 
                       missingIndexes.length;

    const averageHealth = healthScores.length > 0
      ? healthScores.reduce((sum, h) => sum + h.score, 0) / healthScores.length
      : 0;

    return {
      orphanTables,
      circularDependencies,
      typeMismatches,
      missingIndexes,
      healthScores,
      summary: {
        totalTables: this.schema.tables.length,
        totalRelationships: this.schema.relationships.length,
        totalIssues,
        averageHealth: Math.round(averageHealth),
      },
    };
  }

  /**
   * Find tables with no foreign key relationships
   */
  private findOrphanTables(): string[] {
    const orphans: string[] = [];

    this.schema.tables.forEach(table => {
      const hasOutbound = table.foreignKeys.length > 0;
      const hasInbound = this.schema.relationships.some(rel => rel.to === table.name);

      if (!hasOutbound && !hasInbound) {
        orphans.push(table.name);
      }
    });

    return orphans;
  }

  /**
   * Find circular dependencies in foreign keys
   */
  private findCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const dfs = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const successors = this.graph.successors(node) || [];
      
      for (const successor of successors) {
        if (!visited.has(successor)) {
          if (dfs(successor)) {
            return true;
          }
        } else if (recursionStack.has(successor)) {
          // Found a cycle
          const cycleStart = path.indexOf(successor);
          if (cycleStart !== -1) {
            const cycle = path.slice(cycleStart);
            cycle.push(successor); // Complete the cycle
            cycles.push(cycle);
          }
          return true;
        }
      }

      path.pop();
      recursionStack.delete(node);
      return false;
    };

    this.graph.nodes().forEach(node => {
      if (!visited.has(node)) {
        dfs(node);
      }
    });

    // Remove duplicate cycles
    const uniqueCycles = cycles.filter((cycle, index, self) => {
      const cycleKey = [...cycle].sort().join(',');
      return self.findIndex(c => [...c].sort().join(',') === cycleKey) === index;
    });

    return uniqueCycles;
  }

  /**
   * Find type mismatches in foreign keys
   */
  private findTypeMismatches(): TypeMismatch[] {
    const mismatches: TypeMismatch[] = [];

    this.schema.tables.forEach(table => {
      table.foreignKeys.forEach(fk => {
        const [refTable, refColumn] = fk.references.split('.');
        const referencedTable = this.tables.get(refTable);

        if (!referencedTable) {
          return; // Referenced table doesn't exist (different issue)
        }

        const sourceColumn = table.columns.find(c => c.name === fk.column);
        const targetColumn = referencedTable.columns.find(c => c.name === refColumn);

        if (sourceColumn && targetColumn) {
          // Normalize types for comparison
          const sourceType = this.normalizeType(sourceColumn.type);
          const targetType = this.normalizeType(targetColumn.type);

          if (sourceType !== targetType) {
            mismatches.push({
              table: table.name,
              column: fk.column,
              columnType: sourceColumn.type,
              referencedTable: refTable,
              referencedColumn: refColumn,
              referencedType: targetColumn.type,
            });
          }
        }
      });
    });

    return mismatches;
  }

  /**
   * Normalize PostgreSQL types for comparison
   */
  private normalizeType(type: string): string {
    const typeMap: Record<string, string> = {
      'character varying': 'varchar',
      'character': 'char',
      'timestamp without time zone': 'timestamp',
      'timestamp with time zone': 'timestamptz',
      'time without time zone': 'time',
      'time with time zone': 'timetz',
      'double precision': 'float8',
      'integer': 'int4',
      'smallint': 'int2',
      'bigint': 'int8',
      'boolean': 'bool',
      'USER-DEFINED': 'custom',
    };

    const normalized = type.toLowerCase().trim();
    return typeMap[normalized] || normalized;
  }

  /**
   * Find foreign key columns without indexes
   */
  private findMissingIndexes(): MissingIndex[] {
    const missing: MissingIndex[] = [];

    this.schema.tables.forEach(table => {
      table.foreignKeys.forEach(fk => {
        const isIndexed = table.indexes.some(idx => 
          idx.columns.includes(fk.column)
        );

        const isPrimaryKey = table.primaryKeys.includes(fk.column);

        // Primary keys are automatically indexed in Postgres
        if (!isIndexed && !isPrimaryKey) {
          missing.push({
            table: table.name,
            column: fk.column,
            reason: 'Foreign key column not indexed',
          });
        }
      });
    });

    return missing;
  }

  /**
   * Calculate health score for each table
   */
  private calculateHealthScores(
    orphans: string[],
    cycles: string[][],
    typeMismatches: TypeMismatch[],
    missingIndexes: MissingIndex[]
  ): SchemaHealth[] {
    return this.schema.tables.map(table => {
      const isOrphan = orphans.includes(table.name);
      const inCycle = cycles.some(cycle => cycle.includes(table.name));
      const hasTypeMismatch = typeMismatches.some(tm => tm.table === table.name);
      const hasMissingIndex = missingIndexes.some(mi => mi.table === table.name);

      const issues: string[] = [];
      let score = 100;

      if (isOrphan) {
        issues.push('Orphan table (no relationships)');
        score -= 20;
      }

      if (inCycle) {
        issues.push('Part of circular dependency');
        score -= 15;
      }

      if (hasTypeMismatch) {
        issues.push('Foreign key type mismatch');
        score -= 25;
      }

      if (hasMissingIndex) {
        const count = missingIndexes.filter(mi => mi.table === table.name).length;
        issues.push(`${count} foreign key(s) without index`);
        score -= count * 10;
      }

      // Bonus points for good practices
      if (table.primaryKeys.length > 0) {
        score += 5;
      }

      if (table.indexes.length > table.foreignKeys.length) {
        score += 5;
      }

      score = Math.max(0, Math.min(100, score));

      return {
        table: table.name,
        score,
        factors: {
          indexed_fks: !hasMissingIndex,
          cycles: inCycle,
          orphans: isOrphan,
          type_mismatch: hasTypeMismatch,
        },
        issues,
      };
    });
  }
}



