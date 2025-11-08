import {
  SchemaDiff,
  TableNode,
  ColumnInfo,
  ForeignKey,
  IndexInfo,
  TableModification,
} from './types.js';

export class SQLGenerator {
  /**
   * Generate SQL statements from schema diff
   */
  generateSQL(diff: SchemaDiff): string {
    const statements: string[] = [];

    // Drop tables first (reverse order to handle dependencies)
    diff.removed.forEach(tableName => {
      statements.push(this.generateDropTable(tableName));
    });

    // Create new tables
    diff.added.forEach(table => {
      statements.push(this.generateCreateTable(table));
    });

    // Modify existing tables
    diff.modified.forEach(mod => {
      const modStatements = this.generateAlterTable(mod);
      statements.push(...modStatements);
    });

    // Add foreign keys after all tables are created
    diff.added.forEach(table => {
      if (table.foreignKeys.length > 0) {
        const fkStatements = this.generateAddForeignKeys(table.name, table.foreignKeys);
        statements.push(...fkStatements);
      }
    });

    // Add indexes
    diff.added.forEach(table => {
      if (table.indexes.length > 0) {
        const indexStatements = this.generateCreateIndexes(table.name, table.indexes);
        statements.push(...indexStatements);
      }
    });

    return statements.join('\n\n');
  }

  /**
   * Generate CREATE TABLE statement
   */
  private generateCreateTable(table: TableNode): string {
    const columns = table.columns.map(col => this.formatColumn(col));
    
    // Add primary key constraint if present
    if (table.primaryKeys.length > 0) {
      const pkCols = table.primaryKeys.join(', ');
      columns.push(`  PRIMARY KEY (${pkCols})`);
    }

    const columnDefs = columns.join(',\n');

    return `CREATE TABLE ${table.name} (\n${columnDefs}\n);`;
  }

  /**
   * Generate DROP TABLE statement
   */
  private generateDropTable(tableName: string): string {
    return `DROP TABLE IF EXISTS ${tableName} CASCADE;`;
  }

  /**
   * Generate ALTER TABLE statements
   */
  private generateAlterTable(mod: TableModification): string[] {
    const statements: string[] = [];

    // Add columns
    mod.addedColumns.forEach(col => {
      statements.push(
        `ALTER TABLE ${mod.tableName} ADD COLUMN ${this.formatColumn(col)};`
      );
    });

    // Drop columns
    mod.removedColumns.forEach(colName => {
      statements.push(
        `ALTER TABLE ${mod.tableName} DROP COLUMN ${colName};`
      );
    });

    // Modify columns
    mod.modifiedColumns.forEach(colMod => {
      if (colMod.newType && colMod.newType !== colMod.oldType) {
        statements.push(
          `ALTER TABLE ${mod.tableName} ALTER COLUMN ${colMod.name} TYPE ${colMod.newType};`
        );
      }

      if (colMod.newNullable !== undefined && colMod.newNullable !== colMod.oldNullable) {
        const constraint = colMod.newNullable ? 'DROP NOT NULL' : 'SET NOT NULL';
        statements.push(
          `ALTER TABLE ${mod.tableName} ALTER COLUMN ${colMod.name} ${constraint};`
        );
      }

      if (colMod.newDefault !== colMod.oldDefault) {
        if (colMod.newDefault) {
          statements.push(
            `ALTER TABLE ${mod.tableName} ALTER COLUMN ${colMod.name} SET DEFAULT ${colMod.newDefault};`
          );
        } else {
          statements.push(
            `ALTER TABLE ${mod.tableName} ALTER COLUMN ${colMod.name} DROP DEFAULT;`
          );
        }
      }
    });

    // Add foreign keys
    if (mod.addedForeignKeys.length > 0) {
      statements.push(...this.generateAddForeignKeys(mod.tableName, mod.addedForeignKeys));
    }

    // Drop foreign keys
    mod.removedForeignKeys.forEach(fk => {
      const constraintName = `${mod.tableName}_${fk.column}_fkey`;
      statements.push(
        `ALTER TABLE ${mod.tableName} DROP CONSTRAINT IF EXISTS ${constraintName};`
      );
    });

    // Add indexes
    if (mod.addedIndexes.length > 0) {
      statements.push(...this.generateCreateIndexes(mod.tableName, mod.addedIndexes));
    }

    // Drop indexes
    mod.removedIndexes.forEach(indexName => {
      statements.push(`DROP INDEX IF EXISTS ${indexName};`);
    });

    return statements;
  }

  /**
   * Format column definition
   */
  private formatColumn(col: ColumnInfo): string {
    let def = `  ${col.name} ${col.type.toUpperCase()}`;

    if (!col.nullable) {
      def += ' NOT NULL';
    }

    if (col.default) {
      def += ` DEFAULT ${col.default}`;
    }

    return def;
  }

  /**
   * Generate ADD FOREIGN KEY statements
   */
  private generateAddForeignKeys(tableName: string, foreignKeys: ForeignKey[]): string[] {
    return foreignKeys.map(fk => {
      const [refTable, refColumn] = fk.references.split('.');
      let sql = `ALTER TABLE ${tableName} ADD CONSTRAINT ${tableName}_${fk.column}_fkey\n`;
      sql += `  FOREIGN KEY (${fk.column}) REFERENCES ${refTable}(${refColumn})`;

      if (fk.onDelete) {
        sql += ` ON DELETE ${fk.onDelete}`;
      }

      if (fk.onUpdate) {
        sql += ` ON UPDATE ${fk.onUpdate}`;
      }

      return sql + ';';
    });
  }

  /**
   * Generate CREATE INDEX statements
   */
  private generateCreateIndexes(tableName: string, indexes: IndexInfo[]): string[] {
    return indexes.map(idx => {
      const unique = idx.unique ? 'UNIQUE ' : '';
      const columns = idx.columns.join(', ');
      return `CREATE ${unique}INDEX ${idx.name} ON ${tableName} (${columns});`;
    });
  }
}



