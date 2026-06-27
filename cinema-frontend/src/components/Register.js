import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, phone, password);
      setSuccess('Registration successful! Redirecting to login...');
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      let errorMsg = 'Registration failed';
      if (typeof detail === 'string') errorMsg = detail;
      else if (Array.isArray(detail) && detail.length) errorMsg = detail.map(e => e.msg).join(', ');
      else if (detail && typeof detail === 'object' && detail.msg) errorMsg = detail.msg;
      setError(errorMsg);
      setSuccess('');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }}/>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }}/>
        <input type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }}/>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }}/>
        <button type="submit" style={{ padding: '8px 16px' }}>Register</button>
      </form>
      <p style={{ textAlign: 'center' }}>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default Register;