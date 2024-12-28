import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors"; // Add the cors package
import {
  generateOutput,
  generatePrompt,
  vectorSearchChroma,
  vectorSearchFaiss,
  vectorSearchSingleStore,
} from "./rag.js";

const PORT = 3005;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Enable CORS for all routes (you can customize the origin if needed)
app.use(cors());

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "data"); // Specify the directory to store uploaded files
    },
    filename: (req, file, cb) => {
      const splittedFileName = file.originalname.split(".");
      const fileExtension = splittedFileName[splittedFileName.length-1];
      const fileName = "sample_x." + fileExtension;
      cb(null, fileName);
    },
  }),
});

/** HTTP - POST ENDPOINT BEGIN */

app.post("/upload", upload.single("file"), async (req, res) => {
  
  const file = req.file;
  const question = req.body.question;
  const model = req.body.model;
  
  const searches = await vectorSearchSingleStore(question);
  
  const prompt = await generatePrompt(searches, question);
  console.log(prompt);
  const result = await generateOutput(prompt,model);
  console.log(`Content Generated Successfully - ${result.content}`);
  
  res.json({
    message: "Content has been generated successfully.",
    data: {
      content: result.content,
    },
  });
});

/** HTTP - POST ENDPOINT END */

app.listen(PORT, () => {
  console.log(`API is running on \n http//localhost:${PORT}`);
});
