import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveToken } from './utils/auth.js';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('');

    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return setMsg('Enter a valid email');
    if (password.length < 8) return setMsg('Password must be at least 8 characters');

    setBusy(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setMsg(data.error || 'Registration failed');
      saveToken(data.token);
      navigate('/home');
    } catch { setMsg('Network error'); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ width: 360, margin: '0 auto' }}>
      <h2>Create your account</h2>
      <form onSubmit={onSubmit}>
        <input type='email' placeholder='you@example.com' value={email}
          onChange={(e) => setEmail(e.target.value)} required
          style={{ width:'100%', marginBottom: 10, padding: 10 }} />
        <input type='password' placeholder='Minimum 8 characters' value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={8}
          style={{ width:'100%', marginBottom: 10, padding: 10 }} />
        <button type='submit' disabled={busy} style={{ width:'100%', padding: 10 }}>
          {busy ? 'Creating…' : 'Sign up'}
        </button>
      </form>
      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
      <p style={{ marginTop: 12 }}>Already have an account? <Link to='/'>Login</Link></p>
    </div>
  );
}
