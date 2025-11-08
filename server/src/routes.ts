import express from 'express';
import { SchemaParser } from './schema-parser.js';
import { SchemaAnalyzer } from './analyzer.js';
import { SQLGenerator } from './sql-generator.js';
import { LayerManager } from './layer-manager.js';
import { StatsCollector } from './stats-collector.js';
import { SchemaLayer } from './types.js';
import * as fs from 'fs/promises';

const router = express.Router();
const layerManager = new LayerManager();
const schemaParser = new SchemaParser();
const statsCollector = new StatsCollector();
const sqlGenerator = new SQLGenerator();

// Initialize layer manager
layerManager.initialize();

/**
 * GET /api/schema
 * Return full schema metadata
 */
router.get('/schema', async (req, res) => {
  try {
    const useDB = req.query.useDB === 'true';
    const schemaName = (req.query.schema as string) || 'public';

    let schema;

    if (useDB) {
      // Parse from live database
      schema = await schemaParser.parseSchema(schemaName);
    } else {
      // Parse from JSON file
      const jsonPath = './aged-math-99914024_production_neondb_2025-11-08_14-38-19.json';
      const jsonData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
      schema = await schemaParser.parseFromJSON(jsonData);
    }

    res.json(schema);
  } catch (error: any) {
    console.error('Error fetching schema:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analyze
 * Return diagnostic issues + health scores
 */
router.get('/analyze', async (req, res) => {
  try {
    const useDB = req.query.useDB === 'true';
    const schemaName = (req.query.schema as string) || 'public';

    let schema;

    if (useDB) {
      schema = await schemaParser.parseSchema(schemaName);
    } else {
      const jsonPath = './aged-math-99914024_production_neondb_2025-11-08_14-38-19.json';
      const jsonData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
      schema = await schemaParser.parseFromJSON(jsonData);
    }

    const analyzer = new SchemaAnalyzer(schema);
    const diagnostics = analyzer.analyze();

    res.json(diagnostics);
  } catch (error: any) {
    console.error('Error analyzing schema:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stats
 * Table row & index stats
 */
router.get('/stats', async (req, res) => {
  try {
    const schemaName = (req.query.schema as string) || 'public';
    const stats = await statsCollector.collectAllStats(schemaName);
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/layers
 * Save layer JSON
 */
router.post('/layers', async (req, res) => {
  try {
    const layer: SchemaLayer = req.body;
    const savedLayer = await layerManager.saveLayer(layer);
    res.json(savedLayer);
  } catch (error: any) {
    console.error('Error saving layer:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/layers
 * List all layers
 */
router.get('/layers', async (req, res) => {
  try {
    const layers = await layerManager.listLayers();
    res.json(layers);
  } catch (error: any) {
    console.error('Error listing layers:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/layers/:id
 * Retrieve layer
 */
router.get('/layers/:id', async (req, res) => {
  try {
    const layer = await layerManager.getLayer(req.params.id);
    
    if (!layer) {
      return res.status(404).json({ error: 'Layer not found' });
    }

    res.json(layer);
  } catch (error: any) {
    console.error('Error fetching layer:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/layers/:id
 * Delete layer
 */
router.delete('/layers/:id', async (req, res) => {
  try {
    const deleted = await layerManager.deleteLayer(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Layer not found' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting layer:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/diff
 * Compare layers → diff object
 */
router.post('/diff', async (req, res) => {
  try {
    const { baseLayerId, draftLayerId } = req.body;

    const baseLayer = await layerManager.getLayer(baseLayerId);
    const draftLayer = await layerManager.getLayer(draftLayerId);

    if (!baseLayer || !draftLayer) {
      return res.status(404).json({ error: 'Layer not found' });
    }

    const diff = layerManager.compareLayers(baseLayer, draftLayer);
    res.json(diff);
  } catch (error: any) {
    console.error('Error computing diff:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/export-sql
 * Generate SQL from diff
 */
router.post('/export-sql', async (req, res) => {
  try {
    const diff = req.body;
    const sql = sqlGenerator.generateSQL(diff);
    
    res.json({ sql });
  } catch (error: any) {
    console.error('Error generating SQL:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/import-json
 * Import schema JSON
 */
router.post('/import-json', async (req, res) => {
  try {
    const jsonData = req.body;
    const schema = await schemaParser.parseFromJSON(jsonData);
    
    // Create a new layer from imported schema
    const layer: SchemaLayer = {
      id: '',
      name: 'Imported Schema',
      description: 'Schema imported from JSON',
      tables: schema.tables,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedLayer = await layerManager.saveLayer(layer);
    res.json(savedLayer);
  } catch (error: any) {
    console.error('Error importing JSON:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;



