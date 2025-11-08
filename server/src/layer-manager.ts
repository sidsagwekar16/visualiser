import { SchemaLayer, TableNode, SchemaDiff, TableModification, ColumnModification, ColumnInfo } from './types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export class LayerManager {
  private layersDir: string;
  private layers: Map<string, SchemaLayer>;

  constructor(layersDir: string = './layers') {
    this.layersDir = layersDir;
    this.layers = new Map();
  }

  /**
   * Initialize the layer manager
   */
  async initialize() {
    try {
      await fs.mkdir(this.layersDir, { recursive: true });
      await this.loadLayers();
    } catch (error) {
      console.error('Error initializing layer manager:', error);
    }
  }

  /**
   * Load all layers from disk
   */
  private async loadLayers() {
    try {
      const files = await fs.readdir(this.layersDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.layersDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const layer: SchemaLayer = JSON.parse(content);
          this.layers.set(layer.id, layer);
        }
      }
    } catch (error) {
      console.warn('No existing layers found or error loading:', error);
    }
  }

  /**
   * Save a schema layer
   */
  async saveLayer(layer: SchemaLayer): Promise<SchemaLayer> {
    const now = new Date().toISOString();
    
    if (!layer.id) {
      layer.id = this.generateLayerId();
      layer.createdAt = now;
    }
    
    layer.updatedAt = now;

    this.layers.set(layer.id, layer);

    // Save to disk
    const filePath = path.join(this.layersDir, `${layer.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(layer, null, 2), 'utf-8');

    return layer;
  }

  /**
   * Get a layer by ID
   */
  async getLayer(id: string): Promise<SchemaLayer | null> {
    return this.layers.get(id) || null;
  }

  /**
   * List all layers
   */
  async listLayers(): Promise<SchemaLayer[]> {
    return Array.from(this.layers.values());
  }

  /**
   * Delete a layer
   */
  async deleteLayer(id: string): Promise<boolean> {
    const layer = this.layers.get(id);
    if (!layer) {
      return false;
    }

    this.layers.delete(id);

    try {
      const filePath = path.join(this.layersDir, `${id}.json`);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting layer file:', error);
      return false;
    }
  }

  /**
   * Compare two layers and generate a diff
   */
  compareLayers(baseLayer: SchemaLayer, draftLayer: SchemaLayer): SchemaDiff {
    const baseTables = new Map(baseLayer.tables.map(t => [t.name, t]));
    const draftTables = new Map(draftLayer.tables.map(t => [t.name, t]));

    const added: TableNode[] = [];
    const removed: string[] = [];
    const modified: TableModification[] = [];

    // Find added and modified tables
    draftTables.forEach((draftTable, tableName) => {
      const baseTable = baseTables.get(tableName);

      if (!baseTable) {
        added.push(draftTable);
      } else {
        const mod = this.compareTable(baseTable, draftTable);
        if (this.hasModifications(mod)) {
          modified.push(mod);
        }
      }
    });

    // Find removed tables
    baseTables.forEach((baseTable, tableName) => {
      if (!draftTables.has(tableName)) {
        removed.push(tableName);
      }
    });

    return { added, removed, modified };
  }

  /**
   * Compare two table versions
   */
  private compareTable(baseTable: TableNode, draftTable: TableNode): TableModification {
    const baseColumns = new Map(baseTable.columns.map(c => [c.name, c]));
    const draftColumns = new Map(draftTable.columns.map(c => [c.name, c]));

    const addedColumns = draftTable.columns.filter(c => !baseColumns.has(c.name));
    const removedColumns = baseTable.columns.filter(c => !draftColumns.has(c.name)).map(c => c.name);
    const modifiedColumns: ColumnModification[] = [];

    // Check for modified columns
    draftColumns.forEach((draftCol, colName) => {
      const baseCol = baseColumns.get(colName);
      if (baseCol) {
        const colMod = this.compareColumn(baseCol, draftCol);
        if (colMod) {
          modifiedColumns.push(colMod);
        }
      }
    });

    // Compare foreign keys
    const baseFKs = new Set(baseTable.foreignKeys.map(fk => `${fk.column}:${fk.references}`));
    const draftFKs = new Set(draftTable.foreignKeys.map(fk => `${fk.column}:${fk.references}`));

    const addedForeignKeys = draftTable.foreignKeys.filter(
      fk => !baseFKs.has(`${fk.column}:${fk.references}`)
    );
    const removedForeignKeys = baseTable.foreignKeys.filter(
      fk => !draftFKs.has(`${fk.column}:${fk.references}`)
    );

    // Compare indexes
    const baseIdxs = new Set(baseTable.indexes.map(idx => idx.name));
    const draftIdxs = new Set(draftTable.indexes.map(idx => idx.name));

    const addedIndexes = draftTable.indexes.filter(idx => !baseIdxs.has(idx.name));
    const removedIndexes = baseTable.indexes.filter(idx => !draftIdxs.has(idx.name)).map(idx => idx.name);

    return {
      tableName: draftTable.name,
      addedColumns,
      removedColumns,
      modifiedColumns,
      addedForeignKeys,
      removedForeignKeys,
      addedIndexes,
      removedIndexes,
    };
  }

  /**
   * Compare two column versions
   */
  private compareColumn(baseCol: ColumnInfo, draftCol: ColumnInfo): ColumnModification | null {
    const changes: ColumnModification = {
      name: draftCol.name,
    };

    let hasChanges = false;

    if (baseCol.type !== draftCol.type) {
      changes.oldType = baseCol.type;
      changes.newType = draftCol.type;
      hasChanges = true;
    }

    if (baseCol.nullable !== draftCol.nullable) {
      changes.oldNullable = baseCol.nullable;
      changes.newNullable = draftCol.nullable;
      hasChanges = true;
    }

    if (baseCol.default !== draftCol.default) {
      changes.oldDefault = baseCol.default;
      changes.newDefault = draftCol.default;
      hasChanges = true;
    }

    return hasChanges ? changes : null;
  }

  /**
   * Check if a table modification has any actual changes
   */
  private hasModifications(mod: TableModification): boolean {
    return (
      mod.addedColumns.length > 0 ||
      mod.removedColumns.length > 0 ||
      mod.modifiedColumns.length > 0 ||
      mod.addedForeignKeys.length > 0 ||
      mod.removedForeignKeys.length > 0 ||
      mod.addedIndexes.length > 0 ||
      mod.removedIndexes.length > 0
    );
  }

  /**
   * Generate a unique layer ID
   */
  private generateLayerId(): string {
    return `layer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}


