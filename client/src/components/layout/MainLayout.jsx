// /root/common/altushka/client/src/components/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import UserList from '@/components/userList/UserList';

import '@/styles/UPstyle.scss';
import '@/styles/CPstyle.scss';

export default function MainLayout() {
  return (
    <div className="cp-global-container">
      {/* Левый блок: UserList (не будет размонтироваться при переходах) */}
      <div className="cp-left-container cp-container">
        <UserList />
      </div>

      {/* Правый блок: здесь будут рендериться конкретные страницы */}
      <div className="cp-right-container cp-container">
        <Outlet />
      </div>
    </div>
  );
}

// лабы проскура - в 1-й мет. номер 3, во 2-й мет. номер 4. 3872
