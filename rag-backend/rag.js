import { OpenAIEmbeddings } from "@langchain/openai";
import { NomicEmbeddings } from "@langchain/nomic";
import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import { SingleStoreVectorStore } from "@langchain/community/vectorstores/singlestore";
import { PromptTemplate } from "@langchain/core/prompts";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { ChatGroq } from "@langchain/groq"
import "dotenv/config"
import fs from "fs"; // Replace require with import

export const vectorSearchChroma = async (question) => {
    
    //const embeddings = new OllamaEmbeddings();
    const embeddings_local = new OllamaEmbeddings({
        model: "nomic-embed-text:latest", // Replace with a valid model name
    });
    
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small"
    });
    
    /* NOMIC Embed queries NOMIC ATLAS */
    const nomicEmbeddings = new NomicEmbeddings();
    
    const vectorStore = new Chroma(embeddings_local, {
        collectionName: "a-test-collection",
        url: "http://localhost:8000", // Optional, will default to this value
        collectionMetadata: {
            "hnsw:space": "cosine",
        }, // Optional, can be used to specify the distance method of the embedding space https://docs.trychroma.com/usage-guide#changing-the-distance-function
    });
    const query = question;
    const searchResults = await vectorStore.similaritySearch(query, 3);
    return searchResults;
};

export const vectorSearchFaiss = async (question) => {
    
    const embeddings_local = new OllamaEmbeddings({
        model: "nomic-embed-text:latest", // Replace with a valid model name
    });
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small"
    });
    /* NOMIC Embed queries NOMIC ATLAS */
    const nomicEmbeddings = new NomicEmbeddings();
    
    const directory = "./vectorStore";
    // Load the vector store from the same directory
    const loadedVectorStore = await FaissStore.load(directory,embeddings);
    const query = question;
    const searchResults = await loadedVectorStore.similaritySearch(query, 3);
    return searchResults;
};

export const vectorSearchSingleStore = async (question) => {
    const embeddings_local = new OllamaEmbeddings({
        model: "nomic-embed-text:latest", // Replace with a valid model name
    });
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small"
    });
    /* NOMIC Embed queries NOMIC ATLAS */
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
                ca: fs.readFileSync('./singlestore_bundle.pem'), // Enter your PEM file for SSL
            },
        },
    };
    // Create vector store instance without adding new data
    const vectorStore = new SingleStoreVectorStore(nomicEmbeddings, ssConfig);
    const query = question;
    const numResults = 3;
    // Perform the search
    const searchResults = await vectorStore.similaritySearch(query, numResults);
    return searchResults;
}

export const generatePrompt = async (searches,question) =>
{
	let separater = "\n-----------------------------------------------\n";
    let context = separater;
    
	searches.forEach((search) => {
        context = context + search.pageContent + separater;
    });
	
    const prompt = PromptTemplate.fromTemplate(`
You are tasked with answering questions based on the provided document. Please read and understand the context carefully before generating your response.

Context:
{context}

Instructions:
1. The answer must only be derived from the provided context. Do not include any external knowledge, and avoid making assumptions beyond what is provided in the context.
2. You must provide a detailed, step-by-step explanation where applicable, breaking down the information in a clear and structured manner.
3. If the question pertains to specific concepts or processes, provide examples or additional clarification to ensure the user fully understands the topic.
4. The question pertains to the document titled: "Salesforce Governor Limits Documentation." Ensure your response is rooted entirely in the provided document.
5. Always explain complex technical terms or concepts in simple language that is easy for users to grasp, without oversimplifying.
6. Most Important - Always Return Response in MARKDOWN FORMAT as out frontends are designed for Markdown rendering.
7. We are using reach-markdown to render response to UI. So make sure to send resposne in PURE Markdown compatible with react-markdown library to avoid rendering issues.

${separater}

Question: {question}

Please provide a detailed, well-explained, and well-supported answer based solely on the information available in the context. Break down your answer into clear points, and ensure that the response is comprehensive and easy to understand.
`);


    const formattedPrompt = await prompt.format({
        context: context,
        question: question,
    });
    return formattedPrompt;
}



export const generateOutput = async (prompt,model) =>
{   
    console.log(`Model Received ---> ${model}`)
    console.log(`LLM model used ->  ${model??"llama-3.1-8b-instant"}` )
    
    const ollamaLlm = new ChatOllama({
        baseUrl: "http://localhost:11434", // Default value
        model: model??"llama3.1", // Default value or llama3.1
    });
    
    const llm = new ChatGroq({
        model : model??"llama-3.1-8b-instant", // Default value or llama3.1
        temperature : 0.5,
        maxTokens : undefined,
        maxRetries: 2
    });

    //const response = await ollamaLlm.invoke(prompt);
    const aiResponse = await llm.invoke([
        {
            role: "system",
            content: "Act like a Computer Science Expert and help in answering user queries from context provided along with User Query."
        },{
            role: "user",
            content: prompt
        }
    ])
    console.log('aiResponse --->>>>>> ' + aiResponse);
    return aiResponse;
}


