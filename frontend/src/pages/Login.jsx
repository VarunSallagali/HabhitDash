import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const r = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response:', r); // Debug log
      
      if (r.token) {
        localStorage.setItem('token', r.token);
        if (r.user) {
          localStorage.setItem('user', JSON.stringify(r.user));
        }
        nav('/');
      } else {
        const errorMsg = r.error || 'Login failed. Check if backend is running.';
        console.error('Login error:', errorMsg, r);
        alert(errorMsg);
      }
    } catch (err) {
      console.error('Login exception:', err);
      alert('Network error: ' + (err.message || 'Cannot connect to server'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your HabitDash</p>
        <form onSubmit={submit} className="auth-form">
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-footer-text">
          No account?{' '}
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}


