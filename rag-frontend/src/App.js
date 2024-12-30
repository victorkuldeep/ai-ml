import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";
import { DefaultAIAnimation, BrainAnimation, RoboticBrain, NeuralNetworkAnimation } from "./LottieAnimation";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [question, setQuestion] = useState("");
  const [model, setModel] = useState("llama-3.1-8b-instant");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check login state on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const res = await axios.post("http://localhost:3005/login", {
        username,
        password,
      });
      if (res.data.success) {
        localStorage.setItem("authToken", "your-token");
        setLoggedIn(true);
        setLoginError("");
      } else {
        setLoginError("Invalid credentials");
      }
    } catch (error) {
      // This will only catch network errors, not the 401 response from the backend
        if (error.response && error.response.status === 401) {
          setLoginError("Invalid credentials");
        } else {
          setLoginError("An error occurred during login. " + error.message);
        }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setLoggedIn(false);
    setUsername("");  // Clear the username field
    setPassword("");  // Clear the password field
  };

  const handleQuestionChange = (event) => setQuestion(event.target.value);
  const handleModelChange = (event) => setModel(event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.post("http://localhost:3005/upload", {
        question,
        model,
      });
      setResponse(res.data);
    } catch (error) {
      setResponse({ error: "An error occurred, please try again later." });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuestion("");
    setModel("llama-3.1-8b-instant");
    setResponse(null);
  };

  if (!loggedIn) {
    return (
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Login</h2>
          <div className="input-container">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>
          <div className="input-container">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <button type="submit" className="submit-button">Login</button>
          {loginError && <p className="error">{loginError}</p>}
        </form>
        <p className="admin-access">
          Don't have an account? Please request admin to gain access.
        </p>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="header-container">
        <h2>Ask me from - Salesforce Developer Limits and Allocations Quick Reference</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <div className="main-container">
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
          <div className="button-container">
            <button type="submit" className="submit-button">
              {loading ? "Loading..." : "Submit"}
            </button>
            <button type="button" className="reset-button" onClick={handleReset}>
              Reset
            </button>
          </div>
          <div className="brain-animation-container">
            <BrainAnimation />
          </div>
        </form>
        <div className="response-container">
          {response && (
            <div className="markdown-container">
              {response.error ? (
                <p className="error">{response.error}</p>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {response.data.content}
                </ReactMarkdown>
              )}
            </div>
          )}
          {!response && (loading ? <RoboticBrain /> : <DefaultAIAnimation />)}
        </div>
      </div>
    </div>
  );
}

export default App;
