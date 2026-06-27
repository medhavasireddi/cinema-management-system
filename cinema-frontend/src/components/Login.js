import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      setError('');
      navigate('/');
    } catch (err) {
      const detail = err.response?.data?.detail;
      let errorMsg = 'Invalid email or password';
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail.map(e => e.msg).join(', ');
      } else if (detail && typeof detail === 'object' && detail.msg) {
        errorMsg = detail.msg;
      }
      setError(errorMsg);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }}/>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }}/>
        <button type="submit" style={{ padding: '8px 16px' }}>Login</button>
      </form>
      <p style={{ textAlign: 'center' }}>New user? <Link to="/register">Register</Link></p>
    </div>
  );
}

export default Login;
