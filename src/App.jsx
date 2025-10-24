import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const AUTH_API_URL = "https://localhost:7275/api/auth";
const VAULT_API_URL = "https://localhost:7275/api/vault";

const calculatePasswordStrength = (password) => {
  let score = 0;
  let label = '';
  let color = '#ddd';

  if (!password) {
    return { score: 0, label: '', color: 'transparent' };
  }

  const lengthCriteria = password.length >= 8;
  const longLengthCriteria = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (lengthCriteria) score++;
  if (longLengthCriteria) score++;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;
  if (hasSymbol) score++;

  if (password.length > 0 && password.length < 8) {
    score = 1;
  }

  switch (score) {
    case 0:
      label = ''; color = 'transparent'; break;
    case 1:
      label = 'Very Weak'; color = '#e74c3c'; break;
    case 2:
      label = 'Weak'; color = '#f39c12'; break;
    case 3:
      label = 'Medium'; color = '#f1c40f'; break;
    case 4:
      label = 'Strong'; color = '#2ecc71'; break;
    case 5:
    case 6:
      label = 'Very Strong'; color = '#27ae60'; score = 5; break;
    default:
      label = ''; color = 'transparent';
  }

  return { width: (score / 5) * 100, label, color };
};

const PasswordStrengthIndicator = ({ password }) => {
  const { width, label, color } = calculatePasswordStrength(password);
  if (!password) return null;
  return (
    <div className="strength-indicator">
      <div className="strength-bar">
        <div className="strength-bar-fill" style={{ width: `${width}%`, backgroundColor: color }}></div>
      </div>
      <span className="strength-label" style={{ color: color }}>{label}</span>
    </div>
  );
};

const getRandomChar = (str) => str[Math.floor(Math.random() * str.length)];
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
const generateStrongPassword = (length = 16) => {
  const lower = 'abcdefghijklmnopqrstuvwxyz', upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789', symbols = '!@#$%^&*()_+-=[]{}|;:",.<>/?';
  const allChars = lower + upper + numbers + symbols;
  let passwordArray = [getRandomChar(lower), getRandomChar(upper), getRandomChar(numbers), getRandomChar(symbols)];
  for (let i = 4; i < length; i++) passwordArray.push(getRandomChar(allChars));
  return shuffleArray(passwordArray).join('');
};

const apiClient = axios.create();
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [message, setMessage] = useState('');

  const [vaultItems, setVaultItems] = useState([]);
  const [newWebsite, setNewWebsite] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [revealedPasswordInfo, setRevealedPasswordInfo] = useState(null); 
  const [copyButtonText, setCopyButtonText] = useState("Copy"); 

  useEffect(() => {
    if (token) {
      apiClient.get(VAULT_API_URL)
        .then(response => setVaultItems(response.data))
        .catch(error => {
          console.error('Error fetching vault:', error);
          if (error.response?.status === 401 || error.response?.status === 403) handleLogout();
          else setMessage('Could not fetch vault data.');
        });
    } else {
      if (userEmail) {
         localStorage.removeItem('userEmail');
         setUserEmail(null);
      }
    }
  }, [token, userEmail]);

  const handleRegister = async (e) => {
    e.preventDefault(); setMessage('');
    try {
      await axios.post(`${AUTH_API_URL}/register`, { email: authEmail, password: authPassword });
      setMessage('Registration successful! Please log in.');
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data || 'Registration failed.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setMessage('');
    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, { email: authEmail, password: authPassword });
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      localStorage.setItem('userEmail', authEmail);
      setToken(newToken);
      setUserEmail(authEmail);
      setMessage('');
      setAuthEmail('');
      setAuthPassword('');
    } catch (error) {
       setMessage(error.response?.data?.message || error.response?.data || 'Invalid credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUserEmail(null);
    setVaultItems([]);
    setMessage('');
    setRevealedPasswordInfo(null); 
  };

  const handleAddItem = async (e) => {
    e.preventDefault(); setMessage('');
    try {
      const response = await apiClient.post(VAULT_API_URL, { websiteName: newWebsite, username: newUsername, password: newPassword });
      setVaultItems([...vaultItems, response.data]);
      setNewWebsite(''); setNewUsername(''); setNewPassword(''); setShowNewPassword(false);
    } catch (error) {
      console.error('Error adding item:', error);
      setMessage(error.response?.data?.message || 'Error adding item. Please try again.');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setMessage('');
    try {
      await apiClient.delete(`${VAULT_API_URL}/${id}`);
      setVaultItems(vaultItems.filter(item => item.vaultID !== id));
      if (revealedPasswordInfo?.id === id) { 
        setRevealedPasswordInfo(null);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
       setMessage(error.response?.data?.message || 'Error deleting item. Please try again.');
    }
  };

   const handleGeneratePassword = () => {
    const newPass = generateStrongPassword(16);
    setNewPassword(newPass);
  };


  const handleShowPassword = (id, pass) => {
    if (revealedPasswordInfo?.id === id) {
      setRevealedPasswordInfo(null);
    } else {
      setRevealedPasswordInfo({ id, password: pass });
      setCopyButtonText("Copy"); 
    }
  };

  
  const copyToClipboard = async (password) => {
    if (!navigator.clipboard) {
      setMessage("Clipboard API not available in this browser."); 
      return;
    }
    try {
      await navigator.clipboard.writeText(password);
      setCopyButtonText("Copied!");
      setTimeout(() => setCopyButtonText("Copy"), 1500); 
    } catch (err) {
      console.error('Failed to copy password: ', err);
      setMessage("Failed to copy password.");
    }
  };


  if (!token) {
    return (
      <div className="App">
        <div className="form-container">
          <h2>Password Manager</h2>
          <form onSubmit={handleLogin}>
            <h3>Login / Register</h3>
            <div><label>Email:</label><input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required /></div>
            <div><label>Password:</label><input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required /></div>
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
        <h2>{userEmail ? `${userEmail}'s Vault` : 'My Vault'} <button className="logout-btn" onClick={handleLogout}>Log Out</button></h2>

        <form className="add-form" onSubmit={handleAddItem}>
          <h3>Add New Password</h3>
          <input type="text" placeholder="Website (e.g., Google)" value={newWebsite} onChange={(e) => setNewWebsite(e.target.value)} required />
          <input type="text" placeholder="Username / Email" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
          <div className="password-input-container">
            <input type={showNewPassword ? 'text' : 'password'} placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <button type="button" className="toggle-pw-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? 'Hide' : 'Show'}
            </button>
            <button type="button" className="generate-btn" onClick={handleGeneratePassword}>Generate</button>
          </div>
          <PasswordStrengthIndicator password={newPassword} />
          <button type="submit">Add Item</button>
        </form>

        {message && <p className="message">{message}</p>}

        <div className="vault-list">
          {vaultItems.length === 0 && <p>Your vault is empty. Add an item to get started!</p>}
          {vaultItems.map(item => (
            <div className="vault-item" key={item.vaultID}>
              <h4>{item.websiteName || 'No Website Name'}</h4>
              <p>Username: {item.username}</p>

              
              {revealedPasswordInfo?.id === item.vaultID ? (
                <div className="revealed-password-area">
                  <span className="revealed-password-text">{revealedPasswordInfo.password}</span>
                  <button
                    className={`copy-btn ${copyButtonText === 'Copied!' ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(revealedPasswordInfo.password)}
                    disabled={copyButtonText === 'Copied!'} // Disable for a while after copying
                  >
                    {copyButtonText}
                  </button>
                </div>
              ) : null}
              

              <div className="item-buttons">
                
                <button onClick={() => handleShowPassword(item.vaultID, item.password)}>
                   {revealedPasswordInfo?.id === item.vaultID ? 'Hide Password' : 'Show Password'}
                </button>
                <button className="delete-btn" onClick={() => handleDeleteItem(item.vaultID)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;