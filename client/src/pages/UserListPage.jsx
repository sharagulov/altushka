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


  const fetchMessages = useCallback(() => {
    if (!currentUserId) return;
    
    fetch(`/api/messages/${currentUserId}`)
      .then((res) => res.json())
      .then((data) => setChattedUserIds(data))
      .catch((err) => console.error("Ошибка загрузки истории переписок:", err));
  }, [currentUserId]);

  useEffect(() => {
    try {
      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => setAllUsers(data))
        .catch((err) => console.error("Ошибка загрузки списка пользователей:", err))
    } catch (err) {
      console.log(err, "Ошибка загрузки связанных пользователей");
    }
  }, [])


  useEffect(() => {
    fetchMessages();
  
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    setUsers(chattedUserIds);
  }, [chattedUserIds])

  const handleSearchChange = (e) => {
    const value = typeof e === 'string' ? e : e.target.value;
    setSearch(value);
    if (!value) {
      setUsers(chattedUserIds)
      console.log(chattedUserIds, users, value)
    } else {
      setUsers(allUsers.filter((user) => user.username.toLowerCase().trim().includes(value.toLowerCase().trim())));
      console.log(users, value, currentUser.username)
    }
  };

  return (
  <div className='flex-body'>
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
        {users.filter((u) => u.username !== currentUser.username)
          .map((u) => (
            <li key={u.id}>
              <Link to={`/chat/${u.username}`}>{u.username}</Link>
            </li>
          ))}
      </div>
    </main>
  </div>
  );
}
