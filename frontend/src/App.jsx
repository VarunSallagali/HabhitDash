import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={token ? <Dashboard /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;


