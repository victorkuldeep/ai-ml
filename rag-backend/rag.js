import { OpenAIEmbeddings } from "@langchain/openai";
import { NomicEmbeddings } from "@langchain/nomic";
import { SingleStoreVectorStore } from "@langchain/community/vectorstores/singlestore";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq"
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config"
import fs from "fs"; // Replace require with import

export const vectorSearchSingleStore = async (question) => {
    
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small"
    });
    /* NOMIC Embed queries NOMIC ATLAS */
    const nomicEmbeddings = new NomicEmbeddings();
    
    // SingleStore configuration
    const ssConfig = {
        tableName:"DocumentVectorStore",
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
You are a helpful AI Assistant tasked with answering questions based on the provided document. Please read and understand the context carefully before generating your response.

Context:
{context}

Instructions:
1. The answer must only be derived from the provided context. Do not include any external knowledge, and avoid making assumptions beyond what is provided in the context.
2. You must provide a detailed, step-by-step explanation where applicable, breaking down the information in a clear and structured manner.
3. If the question pertains to specific concepts or processes, provide examples or additional clarification to ensure the user fully understands the topic.
4. The question pertains from context shared from knowledgebase. Ensure your response is rooted entirely in the provided document context.
5. Always explain complex technical terms or concepts in simple language that is easy for users to grasp, without oversimplifying.
6. Most Important - Always Return Response in MARKDOWN FORMAT.

${separater}

Question: {question}

Please provide a detailed, well-explained, and well-supported answer based solely on the information available in the context. Break down your answer into clear points, and ensure that the response is comprehensive and easy to understand. If User Query cannot be answered from context provided, ask user to provide additioanl details in question.
`);
    const formattedPrompt = await prompt.format({
        context: context,
        question: question,
    });
    return formattedPrompt;
}

export const generateOutputStream = async (prompt, model) => {
    
    const llm = new ChatGroq({
        model: model ?? "llama-3.1-8b-instant",
        temperature: 0.5,
        maxTokens: undefined,
        maxRetries: 2,
        streaming: true, // Enable streaming
    });

    // Create a chat prompt template
    const finalPrompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful AI Assistant tasked with answering questions based on the provided document. Please read and understand the context carefully before generating your response and if question cannot be answered then ask user to provide more specifix context."],
        ["human", prompt],  // Use the dynamic prompt input here
    ]);

    // Create an output parser
    const outputParser = new StringOutputParser();

    // Pipe the prompt through the model and output parser
    const chain = finalPrompt.pipe(llm).pipe(outputParser);

    // Stream the response
    const response = await chain.stream({
        input: prompt,  // Pass the prompt string here
    });
    return response;
};

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