import { OpenAIEmbeddings } from "@langchain/openai";
import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { ChatGroq } from "@langchain/groq"
import "dotenv/config"

export const vectorSearchChroma = async (question) => {
    
    //const embeddings = new OllamaEmbeddings();
    const embeddings_local = new OllamaEmbeddings({
        model: "nomic-embed-text:latest", // Replace with a valid model name
    });
    
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small"
    });
    
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
    const directory = "./vectorStore";
    // Load the vector store from the same directory
    const loadedVectorStore = await FaissStore.load(directory,embeddings);
    const query = question;
    const searchResults = await loadedVectorStore.similaritySearch(query, 3);
    return searchResults;
};

export const generatePrompt = async (searches,question) =>
{
    let context = "";
    searches.forEach((search) => {
        context = context + "\n\n" + search.pageContent;
    });

    const prompt = PromptTemplate.fromTemplate(`
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
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


