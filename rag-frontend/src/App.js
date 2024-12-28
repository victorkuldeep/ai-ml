import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown"; // Import react-markdown
import remarkGfm from 'remark-gfm';
import './App.css'; // This file will contain our custom styles
import { DefaultAIAnimation, BrainAnimation } from "./LottieAnimation";

function App() {
  const [question, setQuestion] = useState("");
  const [model, setModel] = useState("llama-3.1-8b-instant");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleModelChange = (event) => {
    console.log('Model Setting - ' + event.target.value);
    setModel(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.post("http://localhost:3005/upload", {
        question: question,
        model: model,
      });
      console.log('>>>>>>>>>>>>> ' + JSON.stringify(res));
      setResponse(res.data);
    } catch (error) {
      console.error("Error:", error);
      setResponse({ error: "An error occurred, please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h2>Ask me from - Salesforce Developer Limits and Allocations Quick Reference</h2>
      <div className="main-container">
        {/* Left Container: Form */}
        <form onSubmit={handleSubmit} className="form-container">
          <div className="input-container">
            <label htmlFor="question">Please Enter your question:</label>
            <textarea
              id="question"
              value={question}
              onChange={handleQuestionChange}
              placeholder="Ask a question..."
            />
          </div>
          <div className="input-container">
            <label htmlFor="model">Select LLM Model:</label>
            <select id="model" value={model} onChange={handleModelChange}>
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
              <option value="llama3-8b-8192">llama3-8b-8192</option>
              <option value="gemma2-9b-it">gemma2-9b-it</option>
            </select>
          </div>
          <button type="submit" className="submit-button">
            {loading ? "Loading..." : "Submit"}
          </button>
          {/* Brain Animation under Submit Button */}
          <div className="brain-animation-container">
            <BrainAnimation />
          </div>
        </form>

        {/* Right Container: Response */}
        {!response && <DefaultAIAnimation />}
        {response && (
          <div className="response-container">
            {response.error ? (
              <p className="error">{response.error}</p>
            ) : (
              <div className="markdown-container">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{response.data.content}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default App;