// MainLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import UserList from '@/components/userList/UserList';
import { PopupProvider } from '@/contexts/PopupContext';
import PopupComponent from '@/components/popup/PopupComponent';

import '@/styles/CPstyle.scss'; // здесь у вас .cp-global-container и т.п.

// Мы считаем, что если путь начинается с '/chat/',
// то это «режим чата», иначе — «режим списка» ("/").
export default function MainLayout() {
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith('/chat/');

  return (
    <PopupProvider>
      <div className="cp-global-container">
        {/* Левая колонка */}
        <div
          className={
            isChatRoute ? 'cp-left-container hide-on-mobile' : 'cp-left-container'
          }
        >
          <UserList />
        </div>

        {/* Правая колонка */}
        <div
          className={
            !isChatRoute ? 'cp-right-container hide-on-mobile' : 'cp-right-container'
          }
        >
          <Outlet />
        </div>
      </div>
      <PopupComponent />
    </PopupProvider>
  );
}
