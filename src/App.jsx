import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

const API_URL = "https://localhost:7275/api/auth"

function App() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setMessage('');
    try {
      const response = await axios.post(`${API_URL}/register`, {
        email: email,
        password: password
      });
      setMessage('Registration successful! Please log in.');
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      setMessage(error.response?.data || 'Registration failed.');
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: email,
        password: password
      });
      
      // SUCCESS! We got the token.
      const token = response.data.token;
      setMessage('Login successful!');
      
      // Store the token in localStorage to use for future requests
      localStorage.setItem('token', token);
      
      console.log('Token stored:', token);
      // In a real app, you'd redirect to a dashboard here
      
    } catch (error) {
      console.error('Login error:', error.response?.data);
      setMessage(error.response?.data || 'Invalid credentials.');
    }
  };

  return (
    <div className="App">
      <div className="form-container">
        <h2>Password Manager</h2>
        
        <form onSubmit={handleLogin}>
          <h3>Login</h3>
          <div>
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label>Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit">Login</button>
        </form>
        
        <hr />

        
        <form onSubmit={handleRegister}>
          <h3>Register</h3>
          <div>
            <label>Email:</label>
            <input 
              type="email" 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Use same fields as above..."
              required 
            />
          </div>
          <div>
            <label>Password:</label>
            <input 
              type="password" 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Use same fields as above..."
              required 
            />
          </div>
          <button type="submit">Register</button>
        </form>

        {/* Display messages */}
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default App;
