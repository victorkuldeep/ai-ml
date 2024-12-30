import sqlite3 from "sqlite3";
import path from "path";  // Import the path module
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now you can use the correct file path for the database
const dbPath = path.resolve(__dirname, "users.db");

// Open the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to the database:", err.message);
  } else {
    console.log("Connected to the database.");
  }
});

// Function to get user from the database
export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.get(query, [username, password], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);  // Return the user details if found
      }
    });
  });
};

// Function to insert a user into the database (for testing purposes)
export const insertUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.run(query, [username, password], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve("User inserted successfully.");
      }
    });
  });
};

// Function to close the database connection
export const closeDb = () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing the database:", err.message);
    } else {
      console.log("Database closed.");
    }
  });
};

// Create the "users" table if it doesn't already exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  );
`);

