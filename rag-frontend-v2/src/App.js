import './App.css';
import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Texts } from './textConstants'; // Import the text constants
import LoginContainer from './LoginContainer'; // Import LoginContainer
import { DefaultAIAnimation, BrainAnimation } from "./LottieAnimation";
function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [question, setQuestion] = useState("");
  const [model, setModel] = useState("llama-3.1-8b-instant");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('Establishing connection with LLM...');

  useEffect(() => {
    if (loading) {
      const messageTimer = setInterval(() => {
        setMessage((prevMessage) => {
          switch (prevMessage) {
            case 'Establishing connection with LLM...':
              return 'Connected to LLM, please wait...';
            case 'Connected to LLM, please wait...':
              return 'Waiting for Response from LLM...';
            default:
              return prevMessage;
          }
        });
      }, 2000); // Change message every 3 seconds

      // Clear the interval when loading finishes
      setMessage('Establishing connection with LLM...');
      return () => clearInterval(messageTimer);
    }
  }, [loading]);
  // Check login state on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setLoggedIn(true);
  };
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setLoggedIn(false);
    // setUsername("");  // Clear the username field
    // setPassword("");  // Clear the password field
  };
  const handleQuestionChange = (event) => setQuestion(event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResponse(); // Clear previous responses

    try {
      const responseStream = await fetch("http://localhost:3005/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          model,
        }),
      });

      if (!responseStream.ok) {
        throw new Error("Error in response stream");
      }

      const reader = responseStream.body.getReader();
      const textDecoder = new TextDecoder(); // To decode stream chunks as text
      let chunk = '';
      let done = false;

      while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;
        chunk += textDecoder.decode(value, { stream: true });

        // Directly append chunk to the response
        if (chunk) {
          setResponse(chunk); // Concatenate chunks
        } else {
          console.error("Received an invalid chunk:", chunk);
        }
      }
    } catch (error) {
      setResponse('Error occurred while processing the stream.');
      console.error("Error streaming response:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuestion("");
    setModel("llama-3.1-8b-instant");
    setResponse();
  };

  // Handlers for the file upload form
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error("Please select a file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Start processing
      setIsProcessing(true);
      const response = await axios.post("http://localhost:3005/uploadfile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const message = response.data;
      toast.success(message);
      // Clear the file state and input field only on success
      setFile(null);
      document.querySelector('input[type="file"]').value = ""; // Clear file input

    } catch (error) {
      console.error(error);
      toast.error("Error uploading the file.");
    } finally {
      // End processing
      setIsProcessing(false);
    }
  };

  if (!loggedIn) {
    return <LoginContainer onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      <div className="header-container">
        <h2>{Texts.header.title}</h2>
        <button onClick={handleLogout} className="logout-button">{Texts.header.logoutButton}</button>
      </div>

      <div className="container">
        <div className="left-container">
          <form onSubmit={handleSubmit} className="form-container">
            <div className="input-container">
              <label htmlFor="question">{Texts.form.questionLabel}</label>
              <textarea
                id="question"
                value={question}
                onChange={handleQuestionChange}
                placeholder={Texts.form.questionPlaceholder}
                rows={5}
              />
            </div>
            <div className="input-container">
              <label htmlFor="model">{Texts.form.modelLabel}</label>
              <select id="model" value={model} onChange={(e) => setModel(e.target.value)}>
                {Texts.form.models.map((modelOption) => (
                  <option key={modelOption.value} value={modelOption.value}>
                    {modelOption.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="button-container">
              <button type="submit" className="submit-button">
                {loading ? Texts.button.loading : Texts.button.submit}
              </button>
              <button type="button" className="reset-button" onClick={handleReset}>
                {Texts.button.reset}
              </button>
            </div>
          </form>
          <div className="file-upload-container">
            <form onSubmit={handleFileSubmit} className="file-upload-form">
              <input type="file" onChange={handleFileChange} className="file-upload-input" />
              <button type="submit" className="file-upload-button" disabled={isProcessing}>{isProcessing ? '' : Texts.fileUpload.processButtonText}</button>
            </form>
            <ToastContainer />
          </div>

          <div className="brain-animation-container">
            <BrainAnimation />
          </div>
        </div>

        <div className="right-container">
          {(loading && !response) && (
            <div className="loading-message-container">
              <p className="loading-message">{message}</p>
            </div>
          )}
          {(!response && !loading) && <DefaultAIAnimation />}
          {response && typeof response === 'string' ? (
            // Replace newline characters with <br /> tags for line breaks
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {response}
            </ReactMarkdown>
          ) : (
            <p>{response ? JSON.stringify(response) : ''}</p> // In case the response isn't a string
          )}
        </div>
      </div>
    </div>
  );
}
export default App;