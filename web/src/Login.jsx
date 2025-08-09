import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveToken } from './utils/auth.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(''); setBusy(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setMsg(data.error || 'Login failed');
      saveToken(data.token);
      navigate('/home');
    } catch { setMsg('Network error'); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ width: 360, margin: '0 auto' }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input type='email' placeholder='you@example.com' value={email}
          onChange={e=>setEmail(e.target.value)} required
          style={{ width:'100%', marginBottom: 10, padding: 10 }} />
        <input type='password' placeholder='Password' value={password}
          onChange={e=>setPassword(e.target.value)} required
          style={{ width:'100%', marginBottom: 10, padding: 10 }} />
        <button type='submit' disabled={busy} style={{ width:'100%', padding: 10 }}>
          {busy ? 'Signing in…' : 'Login'}
        </button>
      </form>
      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
      <p style={{ marginTop: 12 }}>No account? <Link to='/register'>Register</Link></p>
    </div>
  );
}
