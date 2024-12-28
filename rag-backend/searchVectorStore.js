import { OpenAIEmbeddings } from "@langchain/openai";
import { NomicEmbeddings } from "@langchain/nomic";
import { SingleStoreVectorStore } from "@langchain/community/vectorstores/singlestore";
import { OllamaEmbeddings } from "@langchain/ollama";
import "dotenv/config";

import fs from "fs"; // Replace require with import

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
			ca: fs.readFileSync('./singlestore_bundle.pem'), // Enter your PEM file for SSL
        },
    },
};
export async function searchVectorStore(query, numResults) {
    
    const embeddings_local = new OllamaEmbeddings({
        model: "nomic-embed-text:latest", // Replace with a valid model name
    });
    
    // OPEN AI EMBEDDIGN MODEL - OPENAI API KEY IS REQUIRED
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small"
    });
    
    /* NOMIC Embed queries */
    const nomicEmbeddings = new NomicEmbeddings();
    
    //const res = await nomicEmbeddings.embedQuery("Hello world");
    
    // Create vector store instance without adding new data
    const vectorStore = new SingleStoreVectorStore(nomicEmbeddings, ssConfig);

    // Perform the search
    const results = await vectorStore.similaritySearch(query, numResults);
    console.log("Search Results:", results);

    // End the connection
    await vectorStore.end();
    return results;
}

searchVectorStore('Can you explain Produce and Implement? what is it? Also what is explained here in terms of which model of LLM?',3);