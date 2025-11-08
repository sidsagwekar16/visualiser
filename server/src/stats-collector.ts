import { query } from './db.js';
import { TableStats } from './types.js';

export class StatsCollector {
  /**
   * Collect statistics for all tables
   */
  async collectAllStats(schema: string = 'public'): Promise<TableStats[]> {
    const query_text = `
      SELECT
        schemaname,
        relname AS table_name,
        n_tup_ins AS tuples_inserted,
        n_tup_upd AS tuples_updated,
        n_tup_del AS tuples_deleted,
        seq_scan AS sequential_scans,
        idx_scan AS index_scans,
        n_live_tup AS row_count
      FROM pg_stat_user_tables
      WHERE schemaname = $1
      ORDER BY relname;
    `;

    const result = await query(query_text, [schema]);

    const stats: TableStats[] = [];

    for (const row of result.rows) {
      const tableName = row.table_name;
      const sizeInfo = await this.getTableSize(schema, tableName);

      stats.push({
        tableName,
        rowCount: parseInt(row.row_count || '0'),
        sizeBytes: sizeInfo.tableSize,
        indexSizeBytes: sizeInfo.indexSize,
        sequentialScans: parseInt(row.sequential_scans || '0'),
        indexScans: parseInt(row.index_scans || '0'),
        tuplesInserted: parseInt(row.tuples_inserted || '0'),
        tuplesUpdated: parseInt(row.tuples_updated || '0'),
        tuplesDeleted: parseInt(row.tuples_deleted || '0'),
      });
    }

    return stats;
  }

  /**
   * Get table size information
   */
  private async getTableSize(schema: string, tableName: string): Promise<{ tableSize: number; indexSize: number }> {
    try {
      const query_text = `
        SELECT
          pg_table_size($1::regclass) AS table_size,
          pg_indexes_size($1::regclass) AS index_size;
      `;

      const fullTableName = `${schema}.${tableName}`;
      const result = await query(query_text, [fullTableName]);

      return {
        tableSize: parseInt(result.rows[0]?.table_size || '0'),
        indexSize: parseInt(result.rows[0]?.index_size || '0'),
      };
    } catch (error) {
      console.warn(`Could not get size for ${schema}.${tableName}:`, error);
      return { tableSize: 0, indexSize: 0 };
    }
  }

  /**
   * Get statistics for a specific table
   */
  async getTableStats(schema: string, tableName: string): Promise<TableStats | null> {
    const allStats = await this.collectAllStats(schema);
    return allStats.find(s => s.tableName === tableName) || null;
  }
}



