import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TableNode, SchemaMetadata } from '../types';
import { getHealthColor, formatNumber } from '../lib/utils';
import { useStore } from '../store/useStore';
import TableNodeComponent from './TableNodeComponent';

interface SchemaGraphProps {
  schema: SchemaMetadata;
}

const nodeTypes = {
  table: TableNodeComponent,
};

export default function SchemaGraph({ schema }: SchemaGraphProps) {
  const { diagnostics, setSelectedTable, highlightedTables, searchResults, activeFilter } = useStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert schema to React Flow nodes and edges
  useEffect(() => {
    if (!schema) return;

    const healthMap = new Map(
      diagnostics?.healthScores.map(h => [h.table, h.score]) || []
    );

    // Filter tables based on active filter
    let filteredTables = schema.tables;
    if (activeFilter && diagnostics) {
      if (activeFilter === 'orphans') {
        filteredTables = schema.tables.filter(t => diagnostics.orphanTables.includes(t.name));
      } else if (activeFilter === 'cycles') {
        const cycledTables = new Set<string>();
        diagnostics.circularDependencies.forEach(cycle => cycle.forEach(t => cycledTables.add(t)));
        filteredTables = schema.tables.filter(t => cycledTables.has(t.name));
      } else if (activeFilter === 'types') {
        const typeTables = new Set(diagnostics.typeMismatches.map(tm => tm.table));
        filteredTables = schema.tables.filter(t => typeTables.has(t.name));
      } else if (activeFilter === 'indexes') {
        const indexTables = new Set(diagnostics.missingIndexes.map(mi => mi.table));
        filteredTables = schema.tables.filter(t => indexTables.has(t.name));
      }
    }

    // Filter by search results
    if (searchResults.length > 0) {
      filteredTables = filteredTables.filter(t => searchResults.includes(t.name));
    }

    // Create nodes
    const flowNodes: Node[] = filteredTables.map((table, index) => {
      const healthScore = healthMap.get(table.name) || 50;
      const color = getHealthColor(healthScore);
      const isHighlighted = highlightedTables.includes(table.name);
      const isSearchResult = searchResults.includes(table.name);

      // Auto-layout in a grid
      const cols = Math.ceil(Math.sqrt(filteredTables.length));
      const x = (index % cols) * 350;
      const y = Math.floor(index / cols) * 250;

      return {
        id: table.name,
        type: 'table',
        position: { x, y },
        data: {
          table,
          healthScore,
          color,
          isHighlighted,
          isSearchResult,
        },
        style: {
          opacity: isHighlighted || isSearchResult || highlightedTables.length === 0 ? 1 : 0.3,
        },
      };
    });

    // Create edges from relationships (only for filtered tables)
    const tableNames = new Set(filteredTables.map(t => t.name));
    const flowEdges: Edge[] = schema.relationships
      .filter(rel => tableNames.has(rel.from) && tableNames.has(rel.to))
      .map((rel, index) => {
        const isHighlighted = highlightedTables.includes(rel.from) && highlightedTables.includes(rel.to);
        
        return {
          id: `e-${index}-${rel.from}-${rel.to}`,
          source: rel.from,
          target: rel.to,
          type: 'smoothstep',
          animated: isHighlighted,
          label: `${rel.fromColumn} → ${rel.toColumn}`,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
          style: {
            strokeWidth: isHighlighted ? 3 : 2,
            stroke: isHighlighted ? '#3b82f6' : '#64748b',
            opacity: isHighlighted || highlightedTables.length === 0 ? 1 : 0.3,
          },
          labelStyle: {
            fontSize: 10,
            fill: isHighlighted ? '#3b82f6' : '#64748b',
          },
        };
      });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [schema, diagnostics, highlightedTables, searchResults, activeFilter, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const table = schema.tables.find(t => t.name === node.id);
      if (table) {
        setSelectedTable(table);
      }
    },
    [schema, setSelectedTable]
  );

  const miniMapNodeColor = useCallback((node: Node) => {
    return node.data.color || '#94a3b8';
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={miniMapNodeColor}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        <Panel position="top-left" className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
          <div className="text-sm space-y-1">
            <div className="font-semibold">Schema Overview</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Tables: {schema.tables.length} | Relations: {schema.relationships.length}
            </div>
            {diagnostics && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Health: {diagnostics.summary.averageHealth}% | Issues: {diagnostics.summary.totalIssues}
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}


