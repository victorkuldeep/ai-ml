import React, { useState } from "react";
import axios from "axios";
import { Texts } from './textConstants'; // Import the text constants

const LoginContainer = ({ onLoginSuccess, setUsername, setPassword }) => {
    const [username, setLocalUsername] = useState("");  // Local state for username in the form
    const [password, setLocalPassword] = useState("");  // Local state for password in the form
    const [loginError, setLoginError] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const res = await axios.post("http://localhost:3005/login", {
                username,
                password,
            });
            if (res.data.success) {
                localStorage.setItem("authToken", "your-token");
                onLoginSuccess();
                setLoginError("");

            } else {
                setLoginError("Invalid credentials");
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setLoginError("Invalid credentials");
            } else {
                setLoginError("An error occurred during login. " + error.message);
            }
        }
    };

    const handleSingnup = async (event) => {
        event.preventDefault();
        try {

        } catch (error) {

        }
    };

    return (
        <div className="App">
            <div className="header-container">
                <h2>{Texts.login.title}</h2>
                <button onClick={handleSingnup} className="logout-button">{Texts.login.signupButton}</button>
            </div>
            <div className="login-container">
                <form onSubmit={handleLogin} className="login-form">
                    <h2>Login</h2>
                    <div className="input-container">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setLocalUsername(e.target.value)}
                            placeholder="Enter username"
                        />
                    </div>
                    <div className="input-container">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setLocalPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                    </div>
                    <button type="submit" className="submit-button">Login</button>
                    {loginError && <p className="error">{loginError}</p>}
                </form>
                <p className="admin-access">
                    {Texts.login.message}
                </p>
            </div>
        </div>
    );
};

export default LoginContainer;
