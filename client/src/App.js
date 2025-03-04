import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { CurtainProvider } from '@/contexts/CurtainContext';
import CurtainOverlay from '@/components/curtain/CurtainComponent';

import RegisterPage from '@/pages/RegisterPage';
import LoginPage from '@/pages/LoginPage';
import StubPage from '@/pages/StubPage';
import ChatPage from '@/pages/ChatPage';
import PasswordPage from '@/pages/PasswordPage';
import NotFoundPage from '@/pages/NotFoundPage';
import MainLayout from '@/components/layout/MainLayout';

import { RedirectIfAuthenticated, RedirectIfNotAuthenticated } from '@/pages/PageMiddleware/PageMiddleware.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <CurtainProvider>
        {/* Занавес поверх всех страниц */}
        <CurtainOverlay />

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
            <Route index element={<StubPage />} />
            <Route path="chat/:userId" element={<ChatPage />} />
            <Route path="password" element={<PasswordPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </CurtainProvider>
    </BrowserRouter>
  );
}
