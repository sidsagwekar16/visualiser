PRD: Advanced Schema Visualizer + Debugger
Version

v1.1 — November 2025

Owner

BluOrigin Studio — Internal Developer Tooling

Status

✅ Approved for Implementation (Cursor handoff)

1️⃣ Overview

A full-stack web tool that connects to a Postgres database (Neon, Supabase, RDS) and lets developers
visualize, inspect, edit, validate, and export schema structures safely.

It provides an interactive ERD, schema diagnostics, layered editing, SQL export, and optional migration apply capabilities — all without AI components.

2️⃣ Core Objectives
Goal	Description
Visualize schema	Interactive ERD with tables + relationships
Diagnose schema health	Detect orphans, cycles, type mismatches, missing indexes
Layered schema editing	Draft changes without touching live DB
SQL generation	Export valid CREATE / ALTER / DROP DDL
Schema comparison	Diff between base and draft layers
Performance insight	Row counts, index use, health scores
3️⃣ Feature Set
3.1 Visualization

React Flow graph (zoom / pan / drag)

Node color = health score

Node size = row count

Edge thickness = relationship density

Optional Matrix View (tabular table-to-table relations)

Auto-group tables by domain (clustering)

3.2 Schema Diagnostics
Check	Description
Orphan Tables	No inbound/outbound FKs
Circular Dependencies	Detect FK loops
Type Mismatches	FK type ≠ target type
Missing Indexes	FK or JOIN column not indexed
Dead Columns	Columns unused in PK/FK
Constraint Summary	All PKs/FKs/Uniques in one panel
Health Score	0–100 based on connectivity, constraints, indexing
3.3 Table Inspection

Click node → drawer shows:

Columns (name, type, nullable, default)

PKs, FKs, Unique keys

Index info, row count, size

“SELECT * LIMIT 10” preview

3.4 Layered Editing
Feature	Description
Base Layer	Live DB schema (read-only)
Draft Layer(s)	User-editable JSON schemas
Layer Diff	Visual compare (add/drop/alter)
Actions	Add/Edit/Drop table or column, add FK/index
Versioning	Save/Load layers as JSON
Health Recalc	Re-evaluate score per layer
3.5 SQL Generation & Export

Diff → SQL conversion (/api/export-sql)

Supports CREATE TABLE, ALTER TABLE, DROP TABLE, ADD COLUMN, etc.

Export to .sql file or copy to clipboard
Example:

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number TEXT NOT NULL
);

ALTER TABLE loads ADD COLUMN vehicle_id UUID REFERENCES vehicles(id);

3.6 Apply to DB (Phase 4)

Optional migration step:

Execute generated SQL statements on target DB with confirmation

Dry-run mode (default) shows execution plan only

3.7 Performance Metrics (Phase 3)

From pg_stat_all_tables: row counts, sequential vs indexed scans, cache hits

Displayed in Metrics Panel

3.8 Export / Import

Export diagram as PNG/SVG/JSON

Export SQL as file

Import schema JSON for offline visualization

4️⃣ Architecture Overview
Layer	Tech Stack
Frontend	React + React Flow + Tailwind + Zustand + shadcn/ui
Backend	Node.js (Typescript) + Express
DB Access	pg (Node-Postgres)
Graph Logic	graphlib or cytoscape
SQL Parser/Generator	pgsql-ast-parser + custom builder
Deployment	Vercel (frontend) + Railway (backend)
Formats	JSON (API), SQL (export)
5️⃣ System Modules
Module	Responsibility
Schema Parser	Introspect tables, columns, constraints
Analyzer	Run all health checks & score calc
Graph Builder	Build DAG for React Flow
Layer Manager	CRUD for schema layers & snapshots
SQL Generator	Produce valid DDL from diff
Exporter	PNG/SVG/SQL/JSON outputs
Metrics Collector	Query pg_stat_* views
Migration Runner	Execute generated SQL (optional)
6️⃣ API Design (Express)
Method	Route	Purpose
GET	/api/schema	Return full schema metadata
GET	/api/analyze	Return diagnostic issues + health scores
GET	/api/stats	Table row & index stats
POST	/api/layers	Save layer JSON
GET	/api/layers/:id	Retrieve layer
POST	/api/diff	Compare layers → diff object
POST	/api/export-sql	Generate SQL from diff
POST	/api/apply-sql	(Optional) Execute generated SQL
POST	/api/import-json	Import schema JSON
7️⃣ Frontend Components
Component	Purpose
SchemaGraph.tsx	Core ERD renderer (React Flow)
MatrixView.tsx	Tabular relationship grid
TableDrawer.tsx	Column & constraint details
LayerPanel.tsx	Manage Base/Draft layers
DiffViewer.tsx	Visual schema diff
SQLExportModal.tsx	Preview & export SQL
MetricsPanel.tsx	Performance stats
Toolbar.tsx	Search / zoom / export controls
CommandPalette.tsx	Keyboard shortcuts for power users
8️⃣ Data Structures

Table Node

{
  "id": "drivers",
  "columns": [
    { "name": "id", "type": "uuid", "nullable": false, "default": "gen_random_uuid()" },
    { "name": "name", "type": "text", "nullable": false }
  ],
  "foreignKeys": [{ "column": "company_id", "references": "companies.id" }],
  "indexes": ["id", "company_id"]
}


Schema Diff

{
  "drivers": {
    "action": "alter",
    "add_columns": [{ "name": "license_no", "type": "text" }]
  },
  "vehicles": {
    "action": "create",
    "columns": [
      { "name": "id", "type": "uuid" },
      { "name": "plate_number", "type": "text" }
    ]
  }
}


Health Score Example

{
  "table": "loads",
  "score": 82,
  "factors": {
    "indexed_fks": true,
    "cycles": false,
    "orphans": false,
    "type_mismatch": false
  }
}

9️⃣ Security

Read-only DB introspection (default)

Draft edits isolated in JSON layers

Sanitized SQL queries via pg parameters

.env config for credentials

CORS + HTTPS required

🔟 Rollout Phases
Phase	Focus	Deliverables
1	Visualization + Diagnostics	ERD graph, analysis engine
2	Layer Editing + Diff + SQL Export	CRUD layers, export DDL
3	Performance Metrics + Matrix View	pg_stat integration, grid view
4	Versioning + Migration Apply	History, apply SQL to DB (optional)
11️⃣ Success Metrics
KPI	Target
Graph render time	< 2 s for 200+ tables
SQL export accuracy	100 % valid Postgres DDL
Health issue coverage	> 90 % detected
Diff render latency	< 1 s
Apply dry-run accuracy	100 % safe simulation
12️⃣ Non-Goals

❌ AI schema inference

❌ Non-Postgres dialects

❌ Real-time DB updates

✅ Deliverables
Item	Path	Notes
Express backend	/server	TypeScript API + schema introspection + SQL generator
React frontend	/client	ERD UI, Layer editor, Diff viewer
SQL export output	/export/schema.sql	Generated DDL
Config	.env	DATABASE_URL (Postgres)
Docs	/README.md	Setup + Usage instructions