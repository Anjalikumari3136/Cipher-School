const mongoose = require('mongoose');
const initSqlJs = require('sql.js');
require('dotenv').config();

let db = null;

// Initialize SQLite In-Memory Database (No PostgreSQL needed!)
const initSQLite = async () => {
  const SQL = await initSqlJs();
  db = new SQL.Database();

  // Create the students table with sample data
  db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            grade TEXT NOT NULL
        );
    `);

  // Insert sample data
  db.run(`INSERT INTO students (id, name, age, grade) VALUES (1, 'Aarav Sharma', 20, 'A');`);
  db.run(`INSERT INTO students (id, name, age, grade) VALUES (2, 'Priya Patel', 19, 'B+');`);
  db.run(`INSERT INTO students (id, name, age, grade) VALUES (3, 'Rohan Kumar', 17, 'A-');`);
  db.run(`INSERT INTO students (id, name, age, grade) VALUES (4, 'Sneha Gupta', 21, 'A+');`);
  db.run(`INSERT INTO students (id, name, age, grade) VALUES (5, 'Vikram Singh', 18, 'B');`);
  db.run(`INSERT INTO students (id, name, age, grade) VALUES (6, 'Anjali Verma', 22, 'A');`);
  db.run(`INSERT INTO students (id, name, age, grade) VALUES (7, 'Karan Joshi', 16, 'B+');`);
  db.run(`INSERT INTO students (id, name, age, grade) VALUES (8, 'Meera Reddy', 19, 'A-');`);

  console.log('✅ SQLite In-Memory DB Ready (8 students loaded)');
  return db;
};

// Get SQLite DB instance
const getDB = () => {
  if (!db) throw new Error('SQLite not initialized. Call initSQLite() first.');
  return db;
};

// Execute a SQL query on the in-memory SQLite DB (returns PostgreSQL-like format)
const executeSQL = (query) => {
  const result = db.exec(query);

  if (result.length === 0) {
    return { rows: [], fields: [], rowCount: 0 };
  }

  const columns = result[0].columns;
  const values = result[0].values;
  const rows = values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });

  return {
    rows,
    fields: columns.map(name => ({ name })),
    rowCount: rows.length
  };
};

// MongoDB Connection for persistence (assignments, attempts)
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = { initSQLite, getDB, executeSQL, connectMongo };
