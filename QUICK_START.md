# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Environment Setup

Create a `.env` file in the root `visualiser/` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Optional: Database Connection (not required for JSON mode)
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Step 2: Install Dependencies

All dependencies are already installed! ✅
- Root workspace dependencies
- Server dependencies
- Client dependencies

### Step 3: Run the Application

**Option A: Run everything at once**
```bash
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend app on http://localhost:5173

**Option B: Run separately**

Terminal 1 (Server):
```bash
npm run dev:server
```

Terminal 2 (Client):
```bash
npm run dev:client
```

## 📊 Using the Application

1. **Open your browser** to http://localhost:5173

2. **The schema will automatically load** from the JSON file:
   - `aged-math-99914024_production_neondb_2025-11-08_14-38-19.json`

3. **Explore the features:**
   - **Graph View**: Interactive ERD with draggable tables
   - **Matrix View**: Relationship grid
   - **Diagnostics Panel**: See health scores and issues
   - **Click any table**: View detailed information in the drawer

4. **Export options:**
   - Export SQL DDL
   - Export JSON schema
   - Import JSON schema

## 🎯 Key Features

### Interactive ERD Visualization
- Zoom, pan, and drag tables
- Color-coded health scores
- Mini-map for navigation
- Real-time statistics

### Schema Diagnostics
- **Orphan Tables**: Tables with no relationships
- **Circular Dependencies**: Detect FK loops
- **Type Mismatches**: FK type ≠ target type
- **Missing Indexes**: FK columns without indexes
- **Health Scores**: 0-100 rating per table

### Views
- **Graph View**: Visual ERD
- **Matrix View**: Table relationship matrix
- Click any table for detailed info

### Export/Import
- Generate SQL CREATE statements
- Export schema as JSON
- Import schema from JSON files

## 🛠️ Development

### Project Structure
```
visualiser/
├── server/          # Express API (TypeScript)
├── client/          # React app (TypeScript)
├── package.json     # Workspace config
└── README.md        # Full documentation
```

### API Endpoints

- `GET /api/schema` - Get full schema
- `GET /api/analyze` - Get diagnostics
- `GET /api/stats` - Get table statistics
- `POST /api/export-sql` - Generate SQL
- `POST /api/import-json` - Import schema

### Tech Stack

**Backend:**
- Node.js + TypeScript + Express
- PostgreSQL client (pg)
- Graphlib for graph analysis

**Frontend:**
- React + TypeScript
- React Flow (ERD visualization)
- Tailwind CSS + shadcn/ui
- Zustand (state management)

## 🐛 Troubleshooting

### Port already in use
If port 3001 or 5173 is already in use:

1. Edit `.env` to change `PORT`
2. Update `client/vite.config.ts` proxy target if needed

### JSON file not found
Make sure the JSON file exists in `server/` directory:
```bash
ls server/*.json
```

### Dependencies issues
Reinstall dependencies:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

## 📝 Next Steps

1. ✅ Explore the loaded schema
2. ✅ Check diagnostics for issues
3. ✅ Try exporting SQL
4. ✅ Import different schema files
5. 🔄 Connect to live database (optional)

For detailed documentation, see [README.md](./README.md)



