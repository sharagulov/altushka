// altushka/client/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import UserListPage from './pages/UserListPage';
import ChatPage from './pages/ChatPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/users" element={<UserListPage />} />
        <Route path="/chat/:userId" element={<ChatPage />} />
        <Route path="*" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
