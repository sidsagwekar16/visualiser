# 🚀 START HERE - Schema Visualizer

## Quick Start (2 Minutes)

### Step 1: Start the Application
```bash
npm run dev
```

This starts:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

### Step 2: Open in Browser
```
http://localhost:5173
```

### Step 3: You're Done! 🎉

The app will automatically load your database schema from the JSON file.

---

## ✨ What You Can Do Now

### 🔍 Search Everything
**Try typing in the search bar:**
- Table names: `subscribers`, `users`
- Column names: `email`, `id`, `created_at`
- Any keyword you're looking for

**The graph will automatically highlight matching tables!**

---

### 🎯 Quick Filters  
**Click these buttons to filter tables:**
- **Orphan Tables** - Tables with no relationships
- **Circular Deps** - Tables in dependency loops  
- **Type Mismatches** - FK type problems
- **Missing Indexes** - Performance issues

---

### 🔗 Find Connections
**Want to see how two tables are related?**
1. Click "Find Connections" button
2. Pick a starting table (e.g., `subscribers`)
3. Pick an ending table (e.g., `ai_insights`)
4. See all possible paths!
5. Click "Highlight in Graph" to visualize

---

### 📊 Click Any Table
**See detailed information:**
- All columns with types
- Primary keys  
- Foreign keys
- Indexes
- Row counts
- Health score

---

## 🎨 Understanding the Graph

### Table Colors
- **Green** = Healthy (80-100 score)
- **Yellow** = Minor issues (60-79)
- **Orange** = Problems (40-59)  
- **Red** = Critical (0-39)

### What the Icons Mean
- 🔑 **Key icon** = Primary key column
- 🔗 **Link icon** = Foreign key column
- 📊 **Number** = Health score

---

## 💡 Real-World Examples

### Example 1: Find All User-Related Tables
```
1. Type "user" in search bar
2. See all tables with "user" in name or columns
3. Click any table to see details
```

### Example 2: See How Tables Connect
```
1. Click "Find Connections"
2. From: subscribers
3. To: ai_insights  
4. Click "Highlight in Graph"
5. See the visual path!
```

### Example 3: Find Performance Issues
```
1. Click "Missing Indexes" filter
2. See tables that need optimization
3. Click each table to see which columns need indexes
```

---

## 🛠️ Two Views Available

### Graph View (Default)
- Interactive visual ERD
- Drag tables around
- Zoom and pan
- Click to explore

### Matrix View
- Grid showing all table relationships
- Blue dots = connection exists
- Great for overview

**Switch between views with the buttons in toolbar!**

---

## 📤 Export Options

### Export SQL
- Get CREATE TABLE statements
- Copy or download
- Use to recreate schema

### Export JSON  
- Save complete schema metadata
- Import into other tools
- Backup your structure

---

## 🐛 Something Not Working?

### App won't start?
```bash
# Rebuild everything
cd server && npm run build
cd ../client && npm run build
cd ..
npm run dev
```

### 500 Error?
Check that the JSON file exists:
```bash
dir server\*.json
```

### Port already in use?
Someone else using port 3001 or 5173? 
Edit `.env` to change ports.

---

## 📚 Want to Learn More?

1. **FEATURES_GUIDE.md** - Detailed guide on all features
2. **HOW_TO_RUN.md** - Complete setup instructions  
3. **README.md** - Full technical documentation

---

## 🎯 Your Next Steps

1. ✅ Run `npm run dev`
2. ✅ Open http://localhost:5173
3. ✅ Try the search bar
4. ✅ Click some tables
5. ✅ Use "Find Connections"
6. ✅ Try the quick filters

**That's it! You're ready to explore your database schema! 🎊**

---

## 💬 Quick Help

**Q: How do I search?**  
A: Just type in the search bar at the top!

**Q: How do I see table details?**  
A: Click any table in the graph

**Q: How do I find relationships?**  
A: Click "Find Connections" in the toolbar

**Q: How do I clear my search?**  
A: Click the X in the search bar

**Q: What do the colors mean?**  
A: Health scores - Green=good, Red=problems

---

## 🎉 Have Fun Exploring!

This tool is designed to make understanding your database schema easy and visual. Click around, search everything, and discover connections you didn't know existed!


