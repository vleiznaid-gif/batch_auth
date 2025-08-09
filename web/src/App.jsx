// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './Login.jsx';
import Register from './Register.jsx';
import HomePage from './pages/HomePage.jsx';
import Profile from './pages/Profile.jsx';
import Chat from './pages/Chat.jsx';
import { isTokenExpired } from './utils/auth.js';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const publicPaths = ['/', '/register']; // <- allow these without auth
    if (isTokenExpired(token) && !publicPaths.includes(location.pathname)) {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  return (
    <div style={{ padding: 24, display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/home' element={<HomePage />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/chat' element={<Chat />} />
      </Routes>
    </div>
  );
}
