import React, { useState } from "react";
import axios from "axios";
import './App.css'; // This file will contain our custom styles

function App() {
  const [question, setQuestion] = useState("");
  const [model, setModel] = useState("llama-3.1-8b-instant");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleModelChange = (event) => {
    console.log('Model Setting - ' + event.target.value)
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
      <h1>Document: AI driven Test Case Generation</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="input-container">
          <label htmlFor="question">Enter your question:</label>
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
            {/* Add more models here if necessary */}
          </select>
        </div>
        <button type="submit" className="submit-button">
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>

      {response && (
        <div className="response-container">
          <h2>Response:</h2>
          {response.error ? (
            <p className="error">{response.error}</p>
          ) : (
            <p>{response.data.content}</p> // Assuming your response includes an 'answer' field
          )}
        </div>
      )}
    </div>
  );
}

export default App;
