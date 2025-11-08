import { query } from './db.js';
import { TableNode, ColumnInfo, ForeignKey, IndexInfo, SchemaMetadata, Relationship } from './types.js';

export class SchemaParser {
  /**
   * Parse schema from database introspection
   */
  async parseSchema(schemaName: string = 'public'): Promise<SchemaMetadata> {
    const tables = await this.getTables(schemaName);
    const relationships = this.extractRelationships(tables);

    return {
      tables,
      relationships,
      schemas: [schemaName],
    };
  }

  /**
   * Parse schema from JSON file (for offline mode)
   */
  async parseFromJSON(jsonData: any[]): Promise<SchemaMetadata> {
    const tablesMap = new Map<string, TableNode>();

    // Group by table
    jsonData.forEach((row) => {
      const tableName = row.table_name;
      
      if (!tablesMap.has(tableName)) {
        tablesMap.set(tableName, {
          id: tableName,
          schema: row.table_schema || 'public',
          name: tableName,
          columns: [],
          foreignKeys: [],
          indexes: [],
          primaryKeys: [],
        });
      }

      const table = tablesMap.get(tableName)!;

      // Add column
      const column: ColumnInfo = {
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        default: row.column_default,
        isPrimaryKey: false, // Will be determined later
      };

      table.columns.push(column);

      // Add foreign key if present
      if (row.foreign_table && row.foreign_column) {
        const fk: ForeignKey = {
          column: row.column_name,
          references: `${row.foreign_table}.${row.foreign_column}`,
        };
        
        // Avoid duplicates
        if (!table.foreignKeys.some(f => f.column === fk.column && f.references === fk.references)) {
          table.foreignKeys.push(fk);
        }
      }
    });

    const tables = Array.from(tablesMap.values());
    const relationships = this.extractRelationships(tables);

    return {
      tables,
      relationships,
      schemas: ['public'],
    };
  }

  /**
   * Get all tables with columns, constraints, and indexes
   */
  private async getTables(schemaName: string): Promise<TableNode[]> {
    const tablesQuery = `
      SELECT DISTINCT table_name
      FROM information_schema.tables
      WHERE table_schema = $1
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const result = await query(tablesQuery, [schemaName]);
    const tableNames = result.rows.map((r: any) => r.table_name);

    const tables: TableNode[] = [];

    for (const tableName of tableNames) {
      const table = await this.getTableDetails(schemaName, tableName);
      tables.push(table);
    }

    return tables;
  }

  /**
   * Get detailed information about a specific table
   */
  private async getTableDetails(schema: string, tableName: string): Promise<TableNode> {
    // Get columns
    const columns = await this.getColumns(schema, tableName);
    
    // Get foreign keys
    const foreignKeys = await this.getForeignKeys(schema, tableName);
    
    // Get indexes
    const indexes = await this.getIndexes(schema, tableName);
    
    // Get primary keys
    const primaryKeys = await this.getPrimaryKeys(schema, tableName);

    // Mark primary key columns
    columns.forEach(col => {
      col.isPrimaryKey = primaryKeys.includes(col.name);
    });

    // Get row count and size
    const stats = await this.getTableStats(schema, tableName);

    return {
      id: tableName,
      schema,
      name: tableName,
      columns,
      foreignKeys,
      indexes,
      primaryKeys,
      rowCount: stats.rowCount,
      sizeBytes: stats.sizeBytes,
    };
  }

  /**
   * Get columns for a table
   */
  private async getColumns(schema: string, tableName: string): Promise<ColumnInfo[]> {
    const query_text = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position;
    `;

    const result = await query(query_text, [schema, tableName]);

    return result.rows.map((row: any) => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES',
      default: row.column_default,
    }));
  }

  /**
   * Get foreign keys for a table
   */
  private async getForeignKeys(schema: string, tableName: string): Promise<ForeignKey[]> {
    const query_text = `
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule,
        rc.update_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = $1
        AND tc.table_name = $2;
    `;

    const result = await query(query_text, [schema, tableName]);

    return result.rows.map((row: any) => ({
      column: row.column_name,
      references: `${row.foreign_table_name}.${row.foreign_column_name}`,
      onDelete: row.delete_rule,
      onUpdate: row.update_rule,
    }));
  }

  /**
   * Get indexes for a table
   */
  private async getIndexes(schema: string, tableName: string): Promise<IndexInfo[]> {
    const query_text = `
      SELECT
        i.relname AS index_name,
        array_agg(a.attname ORDER BY a.attnum) AS column_names,
        ix.indisunique AS is_unique
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = $1 AND t.relname = $2
      GROUP BY i.relname, ix.indisunique;
    `;

    const result = await query(query_text, [schema, tableName]);

    return result.rows.map((row: any) => ({
      name: row.index_name,
      columns: row.column_names,
      unique: row.is_unique,
    }));
  }

  /**
   * Get primary keys for a table
   */
  private async getPrimaryKeys(schema: string, tableName: string): Promise<string[]> {
    const query_text = `
      SELECT a.attname
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      JOIN pg_class t ON t.oid = i.indrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE i.indisprimary
        AND n.nspname = $1
        AND t.relname = $2;
    `;

    const result = await query(query_text, [schema, tableName]);
    return result.rows.map((row: any) => row.attname);
  }

  /**
   * Get table statistics
   */
  private async getTableStats(schema: string, tableName: string): Promise<{ rowCount: number; sizeBytes: number }> {
    try {
      const query_text = `
        SELECT
          (SELECT reltuples::bigint FROM pg_class WHERE oid = $1::regclass) AS row_count,
          pg_total_relation_size($1::regclass) AS size_bytes;
      `;

      const fullTableName = `${schema}.${tableName}`;
      const result = await query(query_text, [fullTableName]);

      return {
        rowCount: parseInt(result.rows[0]?.row_count || '0'),
        sizeBytes: parseInt(result.rows[0]?.size_bytes || '0'),
      };
    } catch (error) {
      console.warn(`Could not get stats for ${schema}.${tableName}:`, error);
      return { rowCount: 0, sizeBytes: 0 };
    }
  }

  /**
   * Extract relationships from tables
   */
  private extractRelationships(tables: TableNode[]): Relationship[] {
    const relationships: Relationship[] = [];

    tables.forEach(table => {
      table.foreignKeys.forEach(fk => {
        const [toTable, toColumn] = fk.references.split('.');
        
        relationships.push({
          from: table.name,
          to: toTable,
          fromColumn: fk.column,
          toColumn,
          type: 'one-to-many', // Simplified for now
        });
      });
    });

    return relationships;
  }
}



