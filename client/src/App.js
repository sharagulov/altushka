// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import RegisterPage from '@/pages/RegisterPage';
import LoginPage from '@/pages/LoginPage';
import PasswordPage from '@/pages/PasswordPage';
import NotFoundPage from '@/pages/NotFoundPage';

import MainLayout from '@/components/layout/MainLayout'; // наш общий Layout
import StubPage from '@/pages/StubPage';   // страница-заглушка
import ChatPage from '@/pages/ChatPage';   // здесь логика чата

import { RedirectIfAuthenticated, RedirectIfNotAuthenticated } from '@/pages/PageMiddleware/PageMiddleware.jsx';
import '@/styles/global.scss';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные (регистрация, логин) */}
        <Route
          path="/register"
          element={
            <RedirectIfAuthenticated>
              <RegisterPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />

        {/* Частные (авторизованные) роуты */}
        <Route
          path="/"
          element={
            <RedirectIfNotAuthenticated>
              <MainLayout />
            </RedirectIfNotAuthenticated>
          }
        >
          {/* На "/" показываем вашу «заглушку» (StubPage) в правой колонке */}
          <Route index element={<StubPage />} />

          {/* На "/chat/:userId" показываем ChatPage */}
          <Route path="chat/:userId" element={<ChatPage />} />

          {/* "/password", если нужно */}
          <Route path="password" element={<PasswordPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
