import axios from 'axios';
import {
  SchemaMetadata,
  DiagnosticResult,
  TableStats,
  SchemaLayer,
  SchemaDiff,
} from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const schemaApi = {
  async getSchema(useDB: boolean = false, schema: string = 'public'): Promise<SchemaMetadata> {
    const response = await api.get('/schema', {
      params: { useDB, schema },
    });
    return response.data;
  },

  async analyze(useDB: boolean = false, schema: string = 'public'): Promise<DiagnosticResult> {
    const response = await api.get('/analyze', {
      params: { useDB, schema },
    });
    return response.data;
  },

  async getStats(schema: string = 'public'): Promise<TableStats[]> {
    const response = await api.get('/stats', {
      params: { schema },
    });
    return response.data;
  },

  async saveLayer(layer: Partial<SchemaLayer>): Promise<SchemaLayer> {
    const response = await api.post('/layers', layer);
    return response.data;
  },

  async getLayers(): Promise<SchemaLayer[]> {
    const response = await api.get('/layers');
    return response.data;
  },

  async getLayer(id: string): Promise<SchemaLayer> {
    const response = await api.get(`/layers/${id}`);
    return response.data;
  },

  async deleteLayer(id: string): Promise<void> {
    await api.delete(`/layers/${id}`);
  },

  async compareLayers(baseLayerId: string, draftLayerId: string): Promise<SchemaDiff> {
    const response = await api.post('/diff', {
      baseLayerId,
      draftLayerId,
    });
    return response.data;
  },

  async exportSQL(diff: SchemaDiff): Promise<string> {
    const response = await api.post('/export-sql', diff);
    return response.data.sql;
  },

  async importJSON(jsonData: any[]): Promise<SchemaLayer> {
    const response = await api.post('/import-json', jsonData);
    return response.data;
  },
};



