import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import path from "path";

const dbPath = path.resolve("D:/Projects/Node/AIML/GIT_Projects/ai-ml/rag-backend/users.db");
// Use import.meta.url to get the directory name of the current module
// Convert file URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now you can use the correct file path for the database
const dbPathq = path.resolve(__dirname, "users.db");

console.log("dbPathq-----------", dbPathq);  // Path to your database file
/*
// Open or create the SQLite database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error("Failed to connect to the database:", err.message);
  } else {
    console.log("Connected to the database.");
    // Optionally, create the table here if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
      );
    `;
    db.run(createTableQuery);
  }
});
*/



// Open the SQLite database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error("Failed to connect to the database:", err.message);
  } else {
    console.log("Connected to the database.");
    // Insert a test user
    //insertUser("admin", "admin123");
  }
});

// Function to insert a new user
const insertUser = (username, password) => {
  const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
  db.run(query, [username, password], function(err) {
    if (err) {
      console.error("Error inserting user:", err.message);
    } else {
      console.log(`User ${username} inserted with ID ${this.lastID}`);
    }
  });
};

// Close the database connection
const closeDb = () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing the database:", err.message);
    } else {
      console.log("Database closed.");
    }
  });
};

// Optionally, close the DB when done
setTimeout(closeDb, 2000);  // Give it a few seconds to ensure the query runs
