import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const AUTH_API_URL = "https://localhost:7275/api/auth";
const VAULT_API_URL = "https://localhost:7275/api/vault";

const apiClient = axios.create();

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const calculatePasswordStrength = (password) => {
  let score = 0;
  let label = '';
  let color = '#ddd'; // Default gray

  if (!password) {
    return { score: 0, label: '', color: 'transparent' };
  }

  // Criteria
  const lengthCriteria = password.length >= 8;
  const longLengthCriteria = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  // Calculate score (0-5)
  if (lengthCriteria) score++;
  if (longLengthCriteria) score++;
  if (hasUpper) score++;
  if (hasLower) score++; // We check this to ensure a mix, but a password will almost always have one.
  if (hasNumber) score++;
  if (hasSymbol) score++;

  // Adjust score for very short passwords
  if (password.length > 0 && password.length < 8) {
    score = 1;
  }

  // Determine label and color based on score
  switch (score) {
    case 0:
      label = '';
      color = 'transparent';
      break;
    case 1:
      label = 'Very Weak';
      color = '#e74c3c'; // red
      break;
    case 2:
      label = 'Weak';
      color = '#f39c12'; // orange
      break;
    case 3:
      label = 'Medium';
      color = '#f1c40f'; // yellow
      break;
    case 4:
      label = 'Strong';
      color = '#2ecc71'; // light green
      break;
    case 5:
    case 6: // Max score
      label = 'Very Strong';
      color = '#27ae60'; // dark green
      score = 5; // Cap score at 5 for bar width
      break;
    default:
      label = '';
      color = 'transparent';
  }
  
  // Return as an object
  // We use score / 5 for a 0-100% width (0, 20, 40, 60, 80, 100%)
  return { width: (score / 5) * 100, label, color };
};

const PasswordStrengthIndicator = ({ password }) => {
  const { width, label, color } = calculatePasswordStrength(password);

  if (!password) {
    return null; // Don't show anything if password is empty
  }

  return (
    <div className="strength-indicator">
      <div className="strength-bar">
        <div 
          className="strength-bar-fill" 
          style={{ width: `${width}%`, backgroundColor: color }}
        >
        </div>
      </div>
      <span className="strength-label" style={{ color: color }}>
        {label}
      </span>
    </div>
  );
};

function App() {
  // State for authentication
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [message, setMessage] = useState('');

  // State for the vault
  const [vaultItems, setVaultItems] = useState([]);
  const [newWebsite, setNewWebsite] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (token) {
      apiClient.get(VAULT_API_URL)
        .then(response => {
          setVaultItems(response.data);
        })
        .catch(error => {
          console.error('Error fetching vault:', error);
          handleLogout();
        });
    }
  }, [token]); // Re-run if token changes

  
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post(`${AUTH_API_URL}/register`, { email: authEmail, password: authPassword });
      setMessage('Registration successful! Please log in.');
    } catch (error) {
      setMessage(error.response?.data || 'Registration failed.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, { email: authEmail, password: authPassword });
      const newToken = response.data.token;
      
      localStorage.setItem('token', newToken);
      setToken(newToken); 
      setMessage('');
      
    } catch (error) {
      setMessage(error.response?.data || 'Invalid credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setVaultItems([]); 
  };

  
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post(VAULT_API_URL, {
        websiteName: newWebsite,
        username: newUsername,
        password: newPassword
        // optional weburl
      });
      
      setVaultItems([...vaultItems, response.data]);

      setNewWebsite('');
      setNewUsername('');
      setNewPassword('');

    } catch (error) {
      console.error('Error adding item:', error);
      setMessage('Error adding item. Please try again.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this?')) {
      return;
    }
    
    try {
      await apiClient.delete(`${VAULT_API_URL}/${id}`);
      
      setVaultItems(vaultItems.filter(item => item.vaultID !== id));

    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage('Error deleting item. Please try again.');
    }
  };

    //showPW
  const showPassword = (pass) => {
    alert(`Your password is: ${pass}`);
  };

  if (!token) {
    return (
      <div className="App">
        <div className="form-container">
          <h2>Password Manager</h2>
          <form onSubmit={handleLogin}>
            <h3>Login / Register</h3>
            <div>
              <label>Email:</label>
              <input type="email" onChange={(e) => setAuthEmail(e.target.value)} required />
            </div>
            <div>
              <label>Password:</label>
              <input type="password" onChange={(e) => setAuthPassword(e.target.value)} required />
            </div>
            <button type="submit">Login</button>
            <button type="button" onClick={handleRegister}>Register</button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="vault-container">
        <h2>My Vault <button className="logout-btn" onClick={handleLogout}>Log Out</button></h2>
        
        {/* --- Add New Item Form --- */}
        <form className="add-form" onSubmit={handleAddItem}>
          <h3>Add New Password</h3>
          <input type="text" placeholder="Website (e.g., Google)" value={newWebsite} onChange={(e) => setNewWebsite(e.target.value)} required />
          <input type="text" placeholder="Username / Email" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
          <input type="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <PasswordStrengthIndicator password={newPassword} />
          <button type="submit">Add Item</button>
        </form>

        {/* --- Vault Items List --- */}
        <div className="vault-list">
          {vaultItems.length === 0 && <p>Your vault is empty. Add an item to get started!</p>}
          
          {vaultItems.map(item => (
            <div className="vault-item" key={item.vaultID}>
              <h4>{item.websiteName}</h4>
              <p>Username: {item.username}</p>
              <div className="item-buttons">
                <button onClick={() => showPassword(item.password)}>Show Password</button>
                <button className="delete-btn" onClick={() => handleDeleteItem(item.vaultID)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default App;