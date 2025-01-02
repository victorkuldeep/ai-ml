import { OpenAIEmbeddings } from "@langchain/openai";
import { NomicEmbeddings } from "@langchain/nomic";
import { OllamaEmbeddings } from "@langchain/ollama";
import { SingleStoreVectorStore } from "@langchain/community/vectorstores/singlestore";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import "dotenv/config";
import fs from "fs"; // Replace require with import

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

// Initialize embeddings
const embeddings_local = new OllamaEmbeddings({
    model: "nomic-embed-text:latest", // Replace with a valid model name
});

// OPEN AI EMBEDDIGN MODEL - OPENAI API KEY IS REQUIRED
const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small"
});

/* NOMIC Embed queries */
const nomicEmbeddings = new NomicEmbeddings();

// SingleStore configuration
const ssConfig = {
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
/*    
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

// Final Docs ready to go in DB
const documents = embeddedDocs.map((doc) => ({
    pageContent: doc.pageContent,
    metadata: doc.metadata,
}));

const ids = embeddedDocs.map((doc) => doc.id);

const vectorStore = await SingleStoreVectorStore.fromDocuments(
        documents,//Documents
        nomicEmbeddings, // Embedding model -> Use any Embeddign model here OPEN AI , NOMIC LOCAL or NOMIC ATLAS
        ssConfig // Database config
    );
// End the vector store connection
await vectorStore.end();
    
//await vectorStore.addDocuments(documents, { ids });

})();

*/    
async function main() {
	const data = [
        { id: 2, text: "Hello world" },
        { id: 1, text: "Bye bye" },
        { id: 3, text: "hello nice world" },
    ];
	const metadata = [{ id: 2 }, { id: 1 }, { id: 3 }];
    // Use `fromTexts` as a static method to create the vector store
    const vectorStore = await SingleStoreVectorStore.fromTexts(
        data, // Texts
        metadata, // Metadata
        embeddings_local, // Embedding model
        ssConfig // Database config
    );
    // End the vector store connection
    await vectorStore.end();
}

/*
// Run the main function
main().catch((err) => {
    console.error("Error:", err);
});
*/