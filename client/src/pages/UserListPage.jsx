// altushka/client/src/pages/UserListPage.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosSearch } from "react-icons/io";
import '@/styles/UPstyle.scss'
import { getCookieValue } from "@/components/сookieValue.js";

export default function UserListPage() {
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [chattedUserIds, setChattedUserIds] = useState([]);
  const [users, setUsers] = useState([]);

  const currentUser = getCookieValue("user");
  const currentUserId = currentUser.id
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!userId) {
  //     // Если не залогинен (нет в localStorage) → на регистрацию
  //     navigate('/register');
  //   }
  // }, [userId, navigate]);

  const loadAllUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setAllUsers(data);
    } catch (err) {
      console.error(err);
      alert('Ошибка');
    }
  };


  const loadRelatedUsers = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`/api/messages/${currentUserId}`);
      const data = await res.json();
      setChattedUserIds(data);
      console.log(data, currentUserId)
    } catch (err) {
      console.log(err, "Ошибка загрузки связанных пользователей");
    }
  }, [currentUserId]);

  useEffect(() => {
    loadAllUsers()
    loadRelatedUsers();
  }, [loadRelatedUsers]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (!value) {
      setUsers(chattedUserIds)
      console.log(chattedUserIds, users, value)
    } else {
      setUsers(
        allUsers.filter((user) =>
          user.username.toLowerCase().trim().includes(value.toLowerCase().trim())
        )
      );
      console.log(users, value)
    }
  };

  return (
    <main className='user-page-main'>
      <div className='top-block'>
        <div className='header-row-block'>
          <h2>Чаты</h2>
          <IoIosSearch size={22}/>
        </div>
        <div >
          <input
            placeholder="Поиск..."
            value={search}
            onChange={handleSearchChange}
            />
        </div>
      </div>
      <span className="greyed-text">Генерация временного аккаунта. Не храните здесь важную информацию.</span>
      <div className='chats-block'>
        {users
          .map((u) => (
            <li key={u.id}>
              <Link to={`/chat/${u.username}`}>{u.username}</Link>
            </li>
          ))}
      </div>
    </main>
  );
}
