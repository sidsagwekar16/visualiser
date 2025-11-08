# Advanced Schema Visualizer + Debugger

A full-stack web tool that connects to Postgres databases and provides interactive visualization, diagnostics, and schema management capabilities.

## Features

✅ **Interactive ERD Visualization**
- React Flow-based graph with zoom, pan, and drag
- Color-coded health scores
- Detailed table information on click

✅ **Schema Diagnostics**
- Orphan table detection
- Circular dependency detection
- Type mismatch identification
- Missing index warnings
- Comprehensive health scoring

✅ **Multiple Views**
- Graph View (ERD)
- Matrix View (tabular relationships)

✅ **Export Capabilities**
- SQL DDL generation
- JSON schema export
- Import from JSON

✅ **Performance Insights**
- Table row counts
- Size tracking
- Index information

## Tech Stack

### Backend
- Node.js + TypeScript + Express
- PostgreSQL (pg driver)
- Graphlib for dependency analysis

### Frontend
- React + TypeScript
- React Flow for ERD visualization
- Tailwind CSS + shadcn/ui
- Zustand for state management

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (optional, can use JSON export)

### Installation

1. **Install root dependencies:**
```bash
npm install
```

2. **Install server dependencies:**
```bash
cd server
npm install
```

3. **Install client dependencies:**
```bash
cd client
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
# Database (optional - can work with JSON files)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Server
PORT=3001
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Running the Application

**Development mode (runs both server and client):**
```bash
npm run dev
```

**Or run separately:**

Server:
```bash
npm run dev:server
```

Client:
```bash
npm run dev:client
```

### Accessing the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/health

## Usage

### Loading Schema

The application can load schema in two ways:

1. **From JSON File** (default)
   - Place your schema export JSON in the server directory
   - Named: `aged-math-99914024_production_neondb_2025-11-08_14-38-19.json`
   - Format: Array of column/table metadata

2. **From Live Database**
   - Configure `DATABASE_URL` in `.env`
   - The app will introspect the database schema

### Viewing Schema

- **Graph View:** Interactive ERD with draggable nodes
- **Matrix View:** Tabular relationship grid
- Click on any table to see detailed information

### Diagnostics

The diagnostics panel shows:
- Orphan tables (no relationships)
- Circular dependencies
- Type mismatches in foreign keys
- Missing indexes on FK columns
- Overall health scores

### Exporting

- **Export SQL:** Generate CREATE TABLE statements
- **Export JSON:** Download schema metadata
- **Import JSON:** Load schema from file

## API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/schema` | Return full schema metadata |
| GET | `/api/analyze` | Return diagnostics + health scores |
| GET | `/api/stats` | Table statistics |
| POST | `/api/layers` | Save schema layer |
| GET | `/api/layers` | List all layers |
| GET | `/api/layers/:id` | Get specific layer |
| DELETE | `/api/layers/:id` | Delete layer |
| POST | `/api/diff` | Compare two layers |
| POST | `/api/export-sql` | Generate SQL from diff |
| POST | `/api/import-json` | Import schema from JSON |

## Project Structure

```
visualiser/
├── server/               # Backend API
│   ├── src/
│   │   ├── index.ts      # Express server
│   │   ├── routes.ts     # API routes
│   │   ├── db.ts         # Database connection
│   │   ├── schema-parser.ts
│   │   ├── analyzer.ts
│   │   ├── sql-generator.ts
│   │   ├── layer-manager.ts
│   │   ├── stats-collector.ts
│   │   └── types.ts
│   └── package.json
├── client/               # Frontend React app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities & API client
│   │   ├── store/        # Zustand state
│   │   ├── types.ts      # TypeScript types
│   │   ├── App.tsx       # Main app
│   │   └── main.tsx      # Entry point
│   └── package.json
├── .env                  # Environment variables
├── package.json          # Root package (workspace)
└── README.md
```

## Development

### Building for Production

```bash
npm run build
```

### Running Production Build

```bash
npm start
```

## Roadmap

### Phase 1 ✅
- [x] ERD visualization
- [x] Schema diagnostics
- [x] Graph and Matrix views
- [x] Basic export functionality

### Phase 2 (Future)
- [ ] Layered editing with draft schemas
- [ ] Schema diff viewer
- [ ] Migration SQL generation from diffs

### Phase 3 (Future)
- [ ] Performance metrics integration
- [ ] Advanced filtering and search
- [ ] Schema versioning

### Phase 4 (Future)
- [ ] Migration apply to database
- [ ] Real-time schema updates
- [ ] Multi-database support

## Contributing

This is an internal tool for BluOrigin Studio. For issues or feature requests, contact the development team.

## License

ISC



