# How to Run the Schema Visualizer

## ✅ Everything is Ready!

Both the server and client are now built and ready to run.

## 🚀 Quick Start (Easiest Method)

### Option 1: Run Everything Together

Open a terminal in the `visualiser` folder and run:

```bash
npm run dev
```

This will start:
- ✅ Backend API on **http://localhost:3001**
- ✅ Frontend on **http://localhost:5173**

Then open your browser to: **http://localhost:5173**

---

### Option 2: Run Server and Client Separately

**Terminal 1 - Start the Server:**
```bash
cd visualiser
npm run dev:server
```

**Terminal 2 - Start the Client:**
```bash
cd visualiser
npm run dev:client
```

Then open your browser to: **http://localhost:5173**

---

### Option 3: Windows Batch File

Double-click `start.bat` in the visualiser folder.

---

## 🔧 What's Running?

### Backend Server (Port 3001)
- Express API with TypeScript
- Schema parser and analyzer
- SQL generator
- Layer management
- **Data Source:** `aged-math-99914024_production_neondb_2025-11-08_14-38-19.json`

### Frontend Client (Port 5173)
- React app with Vite
- React Flow ERD visualization
- Interactive diagnostics
- SQL export functionality

---

## 📊 Using the Application

Once both are running:

1. **Open http://localhost:5173** in your browser

2. **You'll see:**
   - Interactive ERD graph with your database schema
   - Diagnostics panel on the left
   - Table details on click

3. **Features to Try:**
   - Click any table to see columns, foreign keys, indexes
   - Switch between Graph and Matrix views
   - Check the diagnostics for issues
   - Export SQL or JSON

---

## 🐛 Troubleshooting

### 500 Error or Server Not Responding

**Solution:** Make sure the server is built and running

```bash
cd visualiser/server
npm run build
npm run dev
```

### Port Already in Use

If port 3001 or 5173 is busy:

1. Stop the other process using that port
2. Or change the port in `.env` (for server) or `client/vite.config.ts` (for client)

### JSON File Not Found

The file should be in: `visualiser/server/aged-math-99914024_production_neondb_2025-11-08_14-38-19.json`

Check with:
```bash
cd visualiser/server
ls *.json
```

### Build Errors

Rebuild everything:
```bash
cd visualiser
cd server && npm run build
cd ../client && npm run build
cd ..
```

---

## 📁 Project Structure

```
visualiser/
├── server/                          # Backend API
│   ├── src/                         # TypeScript source
│   │   ├── index.ts                 # Express server entry
│   │   ├── routes.ts                # API endpoints
│   │   ├── schema-parser.ts         # Schema introspection
│   │   ├── analyzer.ts              # Diagnostics engine
│   │   ├── sql-generator.ts         # SQL DDL generation
│   │   └── ...
│   ├── dist/                        # Compiled JavaScript
│   └── aged-math...json             # Your database schema
│
├── client/                          # Frontend
│   ├── src/
│   │   ├── App.tsx                  # Main application
│   │   ├── components/              # React components
│   │   │   ├── SchemaGraph.tsx      # ERD visualization
│   │   │   ├── TableDrawer.tsx      # Table details
│   │   │   ├── DiagnosticsPanel.tsx # Health & issues
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── api.ts               # API client
│   │   │   └── utils.ts             # Helper functions
│   │   └── store/
│   │       └── useStore.ts          # State management
│   └── dist/                        # Production build
│
├── package.json                     # Workspace config
├── start.bat                        # Windows startup script
└── README.md                        # Full documentation
```

---

## 🎯 API Endpoints

Your backend exposes these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/schema` | GET | Full schema metadata |
| `/api/analyze` | GET | Diagnostics & health scores |
| `/api/stats` | GET | Table statistics |
| `/api/layers` | GET/POST | Schema layers (CRUD) |
| `/api/diff` | POST | Compare schema layers |
| `/api/export-sql` | POST | Generate SQL DDL |
| `/api/import-json` | POST | Import schema |

Test the API directly:
- http://localhost:3001/health (health check)
- http://localhost:3001/api/schema (get schema)
- http://localhost:3001/api/analyze (get diagnostics)

---

## 💡 Tips

### Viewing Your Schema
- The schema loads automatically from the JSON file
- No database connection required
- All data is processed in-memory

### Diagnostics
- **Green (80-100)**: Healthy table
- **Yellow (60-79)**: Minor issues
- **Orange (40-59)**: Multiple issues
- **Red (0-39)**: Critical issues

### Export Options
- **Export SQL**: Generate CREATE TABLE statements
- **Export JSON**: Save schema metadata
- **Import JSON**: Load different schema files

---

## 🚀 Next Steps

1. ✅ Run `npm run dev`
2. ✅ Open http://localhost:5173
3. ✅ Explore your database schema
4. ✅ Check diagnostics for issues
5. ✅ Export SQL if needed

For detailed documentation, see [README.md](./README.md)

---

## Need Help?

If you're still getting errors:

1. Check that both server and client are running
2. Check the browser console (F12) for errors
3. Check the terminal for server errors
4. Make sure ports 3001 and 5173 are available


