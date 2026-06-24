import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.get('http://127.0.0.1:8000/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setUser(res.data);
      }).catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    // Login uses OAuth2PasswordRequestForm, so we send URL-encoded data
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const res = await axios.post('http://127.0.0.1:8000/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    // Store token
    localStorage.setItem('token', res.data.access_token);
    setToken(res.data.access_token);
    // Fetch user info
    const userRes = await axios.get('http://127.0.0.1:8000/auth/me', {
      headers: { Authorization: `Bearer ${res.data.access_token}` }
    });
    setUser(userRes.data);
    return res.data;
  };

  const register = async (name, email, phone, password) => {
    // Register expects JSON
    const res = await axios.post('http://127.0.0.1:8000/auth/register', {
      name,
      email,
      phone,
      password
    });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};