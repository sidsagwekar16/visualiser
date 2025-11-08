# 🔍 Schema Visualizer - Search & Analysis Features

## New Features Added! 🎉

I've enhanced the Schema Visualizer with powerful search and analysis tools to help you easily find connections, dissect data, and unlock issues in your APIs.

---

## 🔎 1. Global Search Bar

**Location:** Top of the screen, below the toolbar

**What it does:** Searches across your entire database schema

**Searches in:**
- ✅ **Table names** - Find any table instantly
- ✅ **Column names** - Locate specific columns across all tables
- ✅ **Foreign keys** - Find relationships between tables
- ✅ **Indexes** - Search index names

**How to use:**
1. Type anything in the search bar
2. Results appear in real-time dropdown
3. Matching tables are highlighted in the graph
4. Each result shows:
   - Table name
   - Match type (Table, Column, FK, or Index)
   - Contextual info

**Example searches:**
- `user` - Finds all tables/columns related to users
- `email` - Shows everywhere email is used
- `created_at` - Finds timestamp columns
- `id` - Shows all ID columns and relationships

---

## 🎯 2. Quick Filters

**Location:** Below the search bar

**What it does:** Instantly filter to show only tables with specific issues

**Filter options:**

### 🔸 Orphan Tables
- Shows tables with NO relationships
- Useful for finding isolated data
- These might be leftover tables or missing connections

### 🔸 Circular Dependencies  
- Shows tables involved in circular relationships
- Example: A → B → C → A
- Important for preventing infinite loops in queries

### 🔸 Type Mismatches
- Shows foreign keys with wrong data types
- Critical for data integrity
- Helps fix JOIN issues

### 🔸 Missing Indexes
- Shows foreign key columns without indexes
- Performance killer in large databases
- Easy wins for optimization

**How to use:**
1. Click any filter button
2. Graph shows ONLY affected tables
3. Click same button again to clear
4. Only one filter active at a time

---

## 🔗 3. Find Connections (Connection Finder)

**Location:** Toolbar → "Find Connections" button

**What it does:** Discovers ALL paths between any two tables

**Perfect for:**
- Understanding complex relationships
- Finding how data flows between tables
- API debugging and analysis
- Joining distant tables

**How to use:**
1. Click "Find Connections" button
2. Select **From Table** (e.g., `users`)
3. Select **To Table** (e.g., `orders`)
4. Click "Find Connections"
5. See all possible paths:
   ```
   users → user_profiles → orders
   users → accounts → purchases → orders
   ```
6. Click "Highlight in Graph" to visualize the path

**Real-world example:**
```
Question: How are "ai_insights" connected to "subscribers"?

Answer: ai_insights → subscribers (direct FK)
```

---

## 🎨 4. Visual Highlighting

**What happens when you search/filter:**

### Highlighted Tables
- **Blue ring + enlarged** = Part of connection path
- **Green ring** = Matched in search
- **Dimmed (30% opacity)** = Not relevant to current search/filter

### Highlighted Edges (Connections)
- **Thick blue animated lines** = Part of highlighted path
- **Dimmed lines** = Not part of current focus
- Makes it easy to trace relationships visually

---

## 💡 5. How to Use for API Comparison & Debugging

### Scenario 1: Finding Missing Data
**Problem:** API returns incomplete data

**Solution:**
1. Search for the main table (e.g., `subscribers`)
2. Use Connection Finder to see all related tables
3. Check if your API includes all necessary JOINs

### Scenario 2: Slow Query Investigation
**Problem:** Query is slow

**Solution:**
1. Click "Missing Indexes" filter
2. See which FK columns need indexes
3. Add indexes to those columns

### Scenario 3: Understanding Data Flow
**Problem:** Need to trace how data connects

**Solution:**
1. Use Connection Finder
2. Enter start table and end table
3. See all possible paths
4. Choose the most efficient JOIN path for your API

### Scenario 4: Finding Related Tables
**Problem:** Don't know what tables to include in API response

**Solution:**
1. Search for your main entity
2. Click the table in the graph
3. See all FKs in the drawer
4. Use Connection Finder to explore deeper relationships

---

## 🛠️ Practical Workflow for API Development

### Step 1: Find Your Main Table
```
Search → Type "subscriber" → Click result
```

### Step 2: Check Its Health
```
Look at health score (0-100)
Red/Orange = Issues to fix
```

### Step 3: See Related Tables
```
Click table → View drawer
Check "Foreign Keys" tab
```

### Step 4: Find Connections to Other Entities
```
Click "Find Connections"
From: subscribers
To: ai_insights
```

### Step 5: Optimize
```
Click "Missing Indexes" filter
Add recommended indexes
```

---

## ⌨️ Quick Tips

### For Beginners:
1. **Start with search** - Type what you're looking for
2. **Click tables** - See detailed info in the drawer
3. **Use filters** - Focus on one issue at a time
4. **Export SQL** - Get CREATE TABLE statements

### For Advanced Users:
1. **Connection Finder** - Map complex relationships
2. **Type Mismatches** - Fix data integrity issues
3. **Circular Dependencies** - Identify potential problems
4. **Matrix View** - See all relationships in a grid

---

## 📊 Example Use Cases

### Use Case 1: "Where is user email stored?"
```
1. Search: "email"
2. Results show all tables with email column
3. Click each to see structure
```

### Use Case 2: "How do I join users to their orders?"
```
1. Find Connections
2. From: users
3. To: orders
4. Pick shortest path for your JOIN
```

### Use Case 3: "Which tables have performance issues?"
```
1. Click "Missing Indexes" filter
2. See problematic tables
3. Note which columns need indexes
```

### Use Case 4: "What tables reference subscribers?"
```
1. Search: "subscribers"
2. Click the table
3. Look at incoming relationships in the graph
```

---

## 🎓 Understanding Visual Cues

### Node Colors (Table Health)
- **Green (80-100)** - Healthy, well-designed
- **Yellow (60-79)** - Minor issues
- **Orange (40-59)** - Multiple problems
- **Red (0-39)** - Critical issues

### Node Size Indicators
- FK icon (🔗) = Foreign key column
- Key icon (🔑) = Primary key
- Number badges = Row counts

### Connection Lines
- **Solid lines** = Foreign key relationships
- **Labels** = Column names involved
- **Arrows** = Direction of relationship

---

## 🚀 Getting Started (Quick Actions)

### Action 1: Explore Everything
```
No search/filter = See all tables
Zoom/pan with mouse
Click any table for details
```

### Action 2: Find Specific Data
```
Search bar → Type anything
Click results
View in drawer
```

### Action 3: Fix Issues
```
Click filter (e.g., "Type Mismatches")
See affected tables
Note the issues
Export SQL to fix them
```

### Action 4: Map Relationships
```
Find Connections button
Select 2 tables
See all paths between them
```

---

## 💬 Common Questions

**Q: How do I clear search/filters?**  
A: Click the X in search bar, or click active filter button again

**Q: What if no connections found?**  
A: Tables might be truly disconnected (orphans) or too many hops away

**Q: Can I search multiple terms?**  
A: Search works on single terms, but Connection Finder can link multiple concepts

**Q: What's the difference between highlighted and dimmed?**  
A: Highlighted = relevant to your search/filter. Dimmed = not relevant right now

---

## 🎯 Pro Tips

1. **Combine tools:** Search for a table, then use Connection Finder to explore
2. **Check health scores:** Low scores = areas needing attention
3. **Use Matrix View:** Great for seeing all relationships at once
4. **Export findings:** SQL export gives you DDL to recreate schema
5. **Click everything:** Tables, filters, connections - it's all interactive!

---

## 📝 Summary

You now have:
- ✅ **Global search** across tables, columns, FKs, indexes
- ✅ **Quick filters** for common issues
- ✅ **Connection finder** to map relationships
- ✅ **Visual highlighting** to focus on what matters
- ✅ **Interactive exploration** of your entire schema

Perfect for API development, debugging, and understanding complex databases! 🎉


