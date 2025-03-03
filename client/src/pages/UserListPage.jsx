// /root/common/altushka/client/src/pages/UserListPage.jsx
import React from 'react';
import '@/styles/UPstyle.scss'; // Можно оставить, если тут что-то нужно

export default function UserListPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Добро пожаловать!</h2>
      <p>Это правая часть экрана для главной страницы.</p>
      {/* Левый список уже рендерится в MainLayout, поэтому тут ничего лишнего не нужно */}
    </div>
  );
}
