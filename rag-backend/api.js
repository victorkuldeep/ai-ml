import express from "express";
import multer from "multer";
import cors from "cors";
import { SingleStoreVectorStore } from "@langchain/community/vectorstores/singlestore";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { NomicEmbeddings } from "@langchain/nomic";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { getUser } from "./db.js";  // Import the database functions
import {
  generateOutputStream,
  generatePrompt,
  vectorSearchSingleStore,
} from "./rag.js";
import path from "path";  // Import path to resolve file paths
import fs from "fs";

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
      const fileName = `${file.originalname}`;//"sample_x." + fileExtension; // ${Date.now()}-
      cb(null, fileName);
    },
  }),
});

// Create the /uploadfile endpoint
app.post("/uploadfile", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    let generatedFilename;
    if (!file) {
    return res.status(400).send("No file uploaded.");
    }else{
      // Access the generated filename
      generatedFilename = file.filename;
      console.log("Generated filename:", generatedFilename);
      const splits = await loadAndSplitTheDocs("./data/" + generatedFilename);
    
      // OPEN AI EMBEDDIGN MODEL - OPENAI API KEY IS REQUIRED
      const embeddings = new OpenAIEmbeddings({
          model: "text-embedding-3-small"
      });

      /* NOMIC Embed queries */
      const nomicEmbeddings = new NomicEmbeddings();

      // SingleStore configuration
      const ssConfig = {
          tableName: "DocumentVectorStore",
          connectionOptions: {
              host: process.env.SINGLESTORE_HOST,
              port: Number(process.env.SINGLESTORE_PORT),
              user: process.env.SINGLESTORE_USERNAME,
              password: process.env.SINGLESTORE_PASSWORD,
              database: process.env.SINGLESTORE_DATABASE,
              ssl: {
                  //rejectUnauthorized: true, // Set to false to bypass SSL verification for self-signed certs
                  ca: fs.readFileSync('./singlestore_bundle.pem'),
              },
          },
      };
      console.log(`Number of splits: ${splits.length}`);
      // Prepare data for ChromaDB
      const embeddedDocs = await Promise.all(
          splits.map(async (doc, index) => ({
          id: `doc-${index}`, // Unique ID for each document
          pageContent: doc.pageContent,
          metadata: doc.metadata,
      })));
      const vectorStoreInit = new SingleStoreVectorStore(embeddings, ssConfig);
      // Clear the table before adding new data
      try {
          await vectorStoreInit.connectionPool.query(`TRUNCATE TABLE ${ssConfig.tableName}`);
          console.log(`Table ${ssConfig.tableName} cleared successfully.`);
      } catch (error) {
          console.error(`Failed to clear table ${ssConfig.tableName}:`, error);
          throw error;
      }
      
      // Final Docs ready to go in DB
      const documents = embeddedDocs.map((doc) => ({
          pageContent: doc.pageContent,
          metadata: doc.metadata,
      }));
      const ids = embeddedDocs.map((doc) => doc.id);
      const vectorStore = await SingleStoreVectorStore.fromDocuments(
        documents,//Documents
        embeddings_local, // Embedding model -> Use any Embeddign model here OPEN AI , NOMIC LOCAL or NOMIC ATLAS
        ssConfig, // Database config
      );
    // End the vector store connection
    await vectorStore.end();
          
    }
    res.status(200).send("File uploaded and processed successfully: " + generatedFilename);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading file.");
  }
});

app.post("/chat", async (req, res) => {
    const question = req.body.question;
    const model = req.body.model;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    try {
        const searches = await vectorSearchSingleStore(question);
        const prompt = await generatePrompt(searches, question);
        console.log(prompt);
        const responseStream = await generateOutputStream(prompt, model);
        for await (const chunk of responseStream) {
            if (chunk && typeof chunk === "string") {
                res.write(chunk);  // Write each chunk to the response
            } else {
                console.error("Non-string content received:", chunk);
            }
        }
    } catch (error) {
        console.error("Error streaming response:", error);
        res.write("Error occurred during streaming.");
    } finally {
        res.end();
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