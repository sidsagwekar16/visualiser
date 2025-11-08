export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  isPrimaryKey?: boolean;
}

export interface ForeignKey {
  column: string;
  references: string;
  onDelete?: string;
  onUpdate?: string;
}

export interface IndexInfo {
  name: string;
  columns: string[];
  unique: boolean;
}

export interface TableNode {
  id: string;
  schema: string;
  name: string;
  columns: ColumnInfo[];
  foreignKeys: ForeignKey[];
  indexes: IndexInfo[];
  rowCount?: number;
  sizeBytes?: number;
  primaryKeys: string[];
}

export interface Relationship {
  from: string;
  to: string;
  fromColumn: string;
  toColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface SchemaMetadata {
  tables: TableNode[];
  relationships: Relationship[];
  schemas: string[];
}

export interface SchemaHealth {
  table: string;
  score: number;
  factors: {
    indexed_fks: boolean;
    cycles: boolean;
    orphans: boolean;
    type_mismatch: boolean;
  };
  issues: string[];
}

export interface DiagnosticResult {
  orphanTables: string[];
  circularDependencies: string[][];
  typeMismatches: TypeMismatch[];
  missingIndexes: MissingIndex[];
  healthScores: SchemaHealth[];
  summary: {
    totalTables: number;
    totalRelationships: number;
    totalIssues: number;
    averageHealth: number;
  };
}

export interface TypeMismatch {
  table: string;
  column: string;
  columnType: string;
  referencedTable: string;
  referencedColumn: string;
  referencedType: string;
}

export interface MissingIndex {
  table: string;
  column: string;
  reason: string;
}

export interface TableStats {
  tableName: string;
  rowCount: number;
  sizeBytes: number;
  indexSizeBytes: number;
  sequentialScans: number;
  indexScans: number;
  tuplesInserted: number;
  tuplesUpdated: number;
  tuplesDeleted: number;
}

export interface SchemaLayer {
  id: string;
  name: string;
  description?: string;
  baseSchema?: string;
  tables: TableNode[];
  createdAt: string;
  updatedAt: string;
}

export interface SchemaDiff {
  added: TableNode[];
  removed: string[];
  modified: TableModification[];
}

export interface TableModification {
  tableName: string;
  addedColumns: ColumnInfo[];
  removedColumns: string[];
  modifiedColumns: ColumnModification[];
  addedForeignKeys: ForeignKey[];
  removedForeignKeys: ForeignKey[];
  addedIndexes: IndexInfo[];
  removedIndexes: string[];
}

export interface ColumnModification {
  name: string;
  oldType?: string;
  newType?: string;
  oldNullable?: boolean;
  newNullable?: boolean;
  oldDefault?: string | null;
  newDefault?: string | null;
}



