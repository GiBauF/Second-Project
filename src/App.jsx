import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Using our new custom CSS file

const AUTH_API_URL = "https://localhost:7275/api/auth";
const VAULT_API_URL = "https://localhost:7275/api/vault";

// --- Password Strength Calculation ---
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

// --- Password Generation Logic ---
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

// --- Axios API Client Setup ---
const apiClient = axios.create();
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

// --- Main App Component ---
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [vaultItems, setVaultItems] = useState([]);
  const [newWebsite, setNewWebsite] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [revealedPasswordInfo, setRevealedPasswordInfo] = useState(null);
  const [copyButtonText, setCopyButtonText] = useState("Copy");

  const strength = calculatePasswordStrength(newPassword);

  useEffect(() => {
    if (token) {
      apiClient.get(VAULT_API_URL)
        .then(response => setVaultItems(response.data))
        .catch(error => {
          console.error('Error fetching vault:', error);
          if (error.response?.status === 401 || error.response?.status === 403) handleLogout();
          else {
            setMessage('Could not fetch vault data.');
            setIsError(true);
          }
        });
    } else {
      if (userEmail) {
        localStorage.removeItem('userEmail');
        setUserEmail(null);
      }
    }
  }, [token, userEmail]);

  const handleRegister = async (e) => {
    e.preventDefault(); setMessage(''); setIsError(false);
    try {
      await axios.post(`${AUTH_API_URL}/register`, { email: authEmail, password: authPassword });
      setMessage('Registration successful! Please log in.');
      setIsError(false);
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data || 'Registration failed.');
      setIsError(true);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setMessage(''); setIsError(false);
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
      setIsError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUserEmail(null);
    setVaultItems([]);
    setMessage('');
    setIsError(false);
    setRevealedPasswordInfo(null);
  };

  const handleAddItem = async (e) => {
    e.preventDefault(); setMessage(''); setIsError(false);
    try {
      const response = await apiClient.post(VAULT_API_URL, { websiteName: newWebsite, username: newUsername, password: newPassword });
      setVaultItems([...vaultItems, response.data]);
      setNewWebsite(''); setNewUsername(''); setNewPassword(''); setShowNewPassword(false);
    } catch (error) {
      console.error('Error adding item:', error);
      setMessage(error.response?.data?.message || 'Error adding item. Please try again.');
      setIsError(true);
    }
  };

  const handleDeleteItem = async (id) => {
    // Replaced window.confirm with a simple confirm for this example.
    // In a real app, you'd build a custom modal.
    if (!confirm('Are you sure you want to delete this item?')) return;
    setMessage(''); setIsError(false);
    try {
      await apiClient.delete(`${VAULT_API_URL}/${id}`);
      setVaultItems(vaultItems.filter(item => item.vaultID !== id));
      if (revealedPasswordInfo?.id === id) {
        setRevealedPasswordInfo(null);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage(error.response?.data?.message || 'Error deleting item. Please try again.');
      setIsError(true);
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
      // A non-alert way to show a message
      setMessage("Clipboard API not available.");
      setIsError(true);
      // Auto-dismiss message
      setTimeout(() => {
        setMessage('');
        setIsError(false);
      }, 3000);
      return;
    }
    try {
      await navigator.clipboard.writeText(password);
      setCopyButtonText("Copied!");
      setTimeout(() => setCopyButtonText("Copy"), 1500);
    } catch (err) {
      console.error('Failed to copy password: ', err);
      setMessage("Failed to copy password.");
      setIsError(true);
      setTimeout(() => {
        setMessage('');
        setIsError(false);
      }, 3000);
    }
  };

  return (
    <div className="app-container">
      {!token ? (
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-icon-wrapper">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <h1>Password Manager</h1>
              <p>Secure your digital life</p>
            </div>

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <span className="material-symbols-outlined icon">email</span>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <span className="material-symbols-outlined icon">key</span>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="button-group">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={handleRegister}
                  className="btn btn-secondary"
                >
                  Register
                </button>
              </div>
            </form>

            {message && (
              <div className={`message-box ${isError ? 'message-error' : 'message-success'}`}>
                <p>{message}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="vault-page">
          <header className="vault-header">
            <div className="user-info">
              <div className="vault-icon-wrapper">
                <span className="material-symbols-outlined">security</span>
              </div>
              <div>
                <h1>{userEmail ? `${userEmail}'s Vault` : 'My Vault'}</h1>
                <p>{userEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-logout"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Sign Out</span>
            </button>
          </header>

          <div className="vault-layout">
            <div className="vault-sidebar">
              <div className="add-item-card">
                <h2>
                  <span className="material-symbols-outlined">add_circle</span>
                  Add New Password
                </h2>

                <form className="add-item-form" onSubmit={handleAddItem}>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Google, Facebook"
                      value={newWebsite}
                      onChange={(e) => setNewWebsite(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Username / Email</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter username or email"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-input-group">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Enter password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="btn-icon"
                        title={showNewPassword ? "Hide password" : "Show password"}
                      >
                        <span className="material-symbols-outlined">
                          {showNewPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="btn btn-generate"
                      >
                        Generate
                      </button>
                    </div>
                    {newPassword && (
                      <div className="strength-indicator">
                        <div className="strength-header">
                          <span>Password Strength</span>
                          <span className="strength-label" style={{ color: strength.color }}>
                            {strength.label}
                          </span>
                        </div>
                        <div className="strength-bar-track">
                          <div
                            className="strength-bar-fill"
                            style={{ width: `${strength.width}%`, backgroundColor: strength.color }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-full-width"
                  >
                    Add to Vault
                  </button>
                </form>
              </div>
            </div>

            <div className="vault-main">
              <div className="vault-list-header">
                <h2>Your Passwords</h2>
                {vaultItems.length > 0 ? (
                  <div className="vault-status-message">
                    <span className="material-symbols-outlined">info</span>
                    You have {vaultItems.length} password{vaultItems.length !== 1 ? 's' : ''} stored securely
                  </div>
                ) : (
                  <div className="vault-status-message">
                    <span className="material-symbols-outlined">info</span>
                    Your vault is empty. Add a new password to get started.
                  </div>
                )}
              </div>

              <div className="vault-list">
                {vaultItems.map(item => (
                  <div className="vault-item-card" key={item.vaultID}>
                    <div className="vault-item-content">
                      <div>
                        <div className="vault-item-header">
                          <div className="vault-item-icon-wrapper">
                            <span className="material-symbols-outlined">language</span>
                          </div>
                          <div>
                            <h3>{item.websiteName || 'No Website Name'}</h3>
                            <p>{item.username}</p>
                          </div>
                        </div>

                        {revealedPasswordInfo?.id === item.vaultID && (
                          <div className="revealed-password">
                            <div className="revealed-password-content">
                              <span className="revealed-password-text">
                                {revealedPasswordInfo.password}
                              </span>
                              <button
                                className={`btn btn-copy ${copyButtonText === 'Copied!' ? 'copied' : ''}`}
                                onClick={() => copyToClipboard(revealedPasswordInfo.password)}
                                disabled={copyButtonText === 'Copied!'}
                              >
                                {copyButtonText}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="vault-item-actions">
                      <button
                        onClick={() => handleShowPassword(item.vaultID, item.password)}
                        className="btn btn-icon-text btn-show"
                      >
                        <span className="material-symbols-outlined">
                          {revealedPasswordInfo?.id === item.vaultID ? 'visibility_off' : 'visibility'}
                        </span>
                        <span className="text-sm font-medium">
                          {revealedPasswordInfo?.id === item.vaultID ? 'Hide' : 'Show'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.vaultID)}
                        className="btn btn-icon-text btn-delete"
                      >
                        <span className="material-symbols-outlined">delete</span>
                        <span className="text-sm font-medium">Delete</span>
                      </button>
                    </div>
                  </div>
                ))}

                {vaultItems.length > 0 && (
                  <div className="vault-footer">
                    <div className="vault-footer-icon-wrapper">
                      <span className="material-symbols-outlined">security</span>
                    </div>
                    <p>Your vault is secure and encrypted</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
