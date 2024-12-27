import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import "dotenv/config"

export const loadAndSplitTheDocs = async (file_path) => {
  // load the uploaded file data
  const loader = new PDFLoader(file_path);
  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 50,
  });
  const allSplits = await textSplitter.splitDocuments(docs);
  return allSplits;
};

const embeddings_local = new OllamaEmbeddings({
    model: "nomic-embed-text:latest", // Replace with a valid model name
});

const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small"
});
    
const vectorStore = new FaissStore(embeddings, {});

(async () => {
  // Load and split documents
  const splits = await loadAndSplitTheDocs("./data/sample.pdf");
  console.log(`Number of splits: ${splits.length}`);
  //console.log(`First split content: ${splits[0].pageContent}`);
  
  // Prepare data for ChromaDB
const embeddedDocs = await Promise.all(
  splits.map(async (doc, index) => ({
    id: `doc-${index}`, // Unique ID for each document
    pageContent: doc.pageContent,
    metadata: doc.metadata,
  }))
);

const documents = embeddedDocs.map((doc) => ({
  pageContent: doc.pageContent,
  metadata: doc.metadata,
}));

const ids = embeddedDocs.map((doc) => doc.id);

// Store the documents in ChromaDB
await vectorStore.addDocuments(documents, { ids });
// Save the vector store to a directory
const directory = "./vectorStore";
await vectorStore.save(directory);
console.log("Documents successfully stored in FAISS VECTOR STORE! ");
})();