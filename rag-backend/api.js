import express from "express";
import multer from "multer";
import cors from "cors";
import { getUser } from "./db.js";  // Import the database functions
import {
  generateOutput,
  generatePrompt,
  vectorSearchSingleStore,
} from "./rag.js";
import path from "path";  // Import path to resolve file paths

const PORT = 3005;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// File upload configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "data");
    },
    filename: (req, file, cb) => {
      const fileExtension = file.originalname.split(".").pop();
      const fileName = "sample_x." + fileExtension;
      cb(null, fileName);
    },
  }),
});

// HTTP POST endpoint for file upload
app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  const question = req.body.question;
  const model = req.body.model;

  try {
    const searches = await vectorSearchSingleStore(question);
    const prompt = await generatePrompt(searches, question);
    console.log(prompt);
    const result = await generateOutput(prompt, model);
    console.log(`Content Generated Successfully - ${result.content}`);

    res.json({
      message: "Content has been generated successfully.",
      data: {
        content: result.content,
      },
    });
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Login Endpoint - Checking credentials against the SQLite DB
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await getUser(username, password);

    if (user) {
      res.status(200).json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error checking credentials:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// Handle server shutdown and close the database connection
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`API is running on http://localhost:${PORT}`);
});
