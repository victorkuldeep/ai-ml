// textConstants.js

export const Texts = {
    header: {
        title: "Processing Files with Ease — Ask Me Anything..!! Lets get started by uploading file",
        logoutButton: "Logout"
    },
    login: {
        title: "Processing Files with Ease —  Lets get started by logging in to RAG AI System",
        signupButton: "Signup",
        message: "Don't have an account? Please Signup now to get started."
    },
    form: {
        questionLabel: "Please Enter your question:",
        questionPlaceholder: "Ask a question...",
        modelLabel: "Select LLM Model:",
        models: [
            { value: "llama-3.1-8b-instant", label: "llama-3.1-8b-instant" },
            { value: "llama3-8b-8192", label: "llama3-8b-8192" },
            { value: "gemma2-9b-it", label: "gemma2-9b-it" }
        ]
    },
    button: {
        submit: "Submit",
        loading: "Loading...",
        reset: "Reset",
        processFile: "Process File"
    },
    fileUpload: {
        fileInputPlaceholder: "Choose a file to upload",
        processButtonText: "Process File"
    },
    loadingMessage: {
        text: "Connecting to LLM..!! Please wait..."
    },
    defaultAIMessage: "No response yet. Please wait for analysis..."
};
