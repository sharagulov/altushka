// "/root/common/altushka/client/src/components/userList/UserList.jsx"

import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { IoIosSearch } from "react-icons/io";
import '@/styles/UPstyle.scss';
import '@/styles/CPstyle.scss';

import UserComponent from '@/components/user/UserComponent'

export default function UserListPage() {
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]); // Все пользователи (для поиска)
  const [chattedUsers, setChattedUsers] = useState([]); // Пользователи, с кем были чаты
  const [users, setUsers] = useState([]); // Те, кого сейчас отображаем (фильтрованный список)
  const [user, setUser] = useState({})

  const navigate = useNavigate();

  const accessToken = localStorage.getItem('accessToken');
  const currentUserId = accessToken ? jwtDecode(accessToken).userId : null;

  const fetchChattedUsers = useCallback(() => {
    if (!currentUserId) return;

    fetch(`/api/me/${currentUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if(!search) {
          setChattedUsers(data.chats);
          setUser(data.user)
        }
        
        console.log(data.chats);
      })
      .catch((err) => console.error("Ошибка загрузки информации о пользователе:", err));
  }, [currentUserId]);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setAllUsers(data))
      .catch((err) => console.error("Ошибка загрузки общего списка пользователей:", err));
  }, []);


  useEffect(() => {
    let interval;

    if(search === "") {
      fetchChattedUsers();
      interval = setInterval(fetchChattedUsers, 5000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [fetchChattedUsers, search]);


  useEffect(() => {
    setUsers(chattedUsers);
  }, [chattedUsers]);


  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    console.log(currentUserId)

    if (!value.trim()) {
      setUsers(chattedUsers);
    } else {
      setUsers(allUsers.filter((user) => user.username.toLowerCase().includes(value.toLowerCase())));
    }
  };

  return (
<main className='user-page-main'>
        <div className='top-block'>
          <div className='header-row-block'>
            <span>Чаты <span className='colored-text'>{user.username}</span></span>
            <IoIosSearch size={22} />
          </div>
          <div>
            <input
              placeholder="Поиск..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className='chats-block'>
          {users
            .filter((u) => u.id !== currentUserId) // Исключаем самого себя
            .map((u) => (
              <div key={u.id}>
                <UserComponent to={`/chat/${u.username}`} user={u}/>
              </div>
            ))}
        </div>
      </main>
  );
}
