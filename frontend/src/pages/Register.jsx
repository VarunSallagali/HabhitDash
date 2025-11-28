import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const r = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      console.log('Register response:', r); // Debug log
      
      if (r.token) {
        localStorage.setItem('token', r.token);
        if (r.user) {
          localStorage.setItem('user', JSON.stringify(r.user));
        }
        nav('/');
      } else {
        const errorMsg = r.error || 'Registration failed. Check if backend is running and database is set up.';
        console.error('Register error:', errorMsg, r);
        alert(errorMsg);
      }
    } catch (err) {
      console.error('Register exception:', err);
      alert('Network error: ' + (err.message || 'Cannot connect to server'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start tracking better habits</p>
        <form onSubmit={submit} className="auth-form">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="input"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input"
          />
          <button className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}


