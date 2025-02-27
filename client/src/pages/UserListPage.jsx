// altushka/client/src/pages/UserListPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function UserListPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!userId) {
  //     // Если не залогинен (нет в localStorage) → на регистрацию
  //     navigate('/register');
  //   }
  // }, [userId, navigate]);

  const handleSearch = async () => {
    try {
      const res = await fetch('/api/users?search=' + search);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки списка пользователей');
    }
  };

  const loadAllUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert('Ошибка');
    }
  };

  useEffect(() => {
    loadAllUsers();
  }, []);

  return (
    <div style={{ margin: '20px' }}>
      <h2>Список пользователей</h2>
      <p>Вы вошли как: {username}</p>

      <div style={{ marginBottom: '10px' }}>
        <input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Найти</button>
      </div>

      <ul>
        {users
          .filter((u) => u.id !== userId) // не показывать себя
          .map((u) => (
            <li key={u.id}>
              <Link to={`/chat/${u.id}`}>{u.username}</Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
