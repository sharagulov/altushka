// "/root/common/altushka/client/src/components/userList/UserList.jsx"

import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiMenu } from "react-icons/hi";
import { usePopup } from '@/contexts/PopupContext';
import { jwtDecode } from 'jwt-decode';
import '@/styles/UPstyle.scss';
import '@/styles/CPstyle.scss';

import UserComponent from '@/components/user/UserComponent'
import SkeletonChats from '@/components/skeleton/SkeletonChats';

export default function UserListPage() {
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]); // Все пользователи (для поиска)
  const [chattedUsers, setChattedUsers] = useState([]); // Пользователи, с кем были чаты
  const [users, setUsers] = useState([]); // Те, кого сейчас отображаем (фильтрованный список)
  const [user, setUser] = useState({})
  const [showUser, setShowUser] = useState(false)
  const [showChats, setShowChats] = useState(false);

  const navigate = useNavigate();
  const { showPopup } = usePopup();

  const location = useLocation();
  const pathUsername = location.pathname.split("/").pop()

  const accessToken = localStorage.getItem('accessToken');
  const currentUserId = accessToken ? jwtDecode(accessToken).userId : null;

  const fetchChattedUsers = useCallback(() => {
    if (!currentUserId) return;

    fetch(`/api/me/${currentUserId}`)
      .then((res) => res.json())
      .then((data) => {
          setChattedUsers(data.chats);
          setUser(data.user)
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
    if(chattedUsers.length === 0) return;
    const timeout = setTimeout(() => {
      setShowChats(true);
    }, 200)
    setUsers(chattedUsers);
    return () => {clearTimeout(timeout)}
  }, [chattedUsers]);
  
  useEffect(() => {
    setShowChats(false);
  }, []);


  useEffect(() => {
    if(!user?.username) return;
    const timeout = setTimeout(() => {
      setShowUser(true);
    }, 200)
    setUsers(chattedUsers);
    return () => {clearTimeout(timeout)}
  }, [user]);
  
  useEffect(() => {
    setShowUser(false);
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




  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim().length === 0) {
      setUsers(chattedUsers);
    } else {
      setUsers(allUsers.filter((user) => user.username.toLowerCase().includes(value.toLowerCase())));
    }
  };

  return (
      <main className='user-page-main'>
        <div className='top-block'>
          <div className='header-row-block' >
            <div>
              <span className={`up-user ${showUser}-context`}>Чаты <span className='colored-text'>{user?.username}</span></span>
              <div className={`skeleton up-user-skeleton ${showUser}-context`}/>
            </div>
            <div className='pointer' onClick={showPopup}>
              <HiMenu size={22}/>
            </div>
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
            .sort((a, b) => {return new Date (b.lastMessage?.created_at).getTime() - new Date (a.lastMessage?.created_at).getTime()})
            .filter((u) => u.id !== currentUserId) // Исключаем самого себя
            .map((u) => {
              const searched = users[0]?.hasOwnProperty('lastMessage') ?? false;
              const highlight = u.username === pathUsername;
              return (
              <div key={u.id}>
                <UserComponent searched={!searched} user={u} highlight={highlight}/>
              </div>
              )
          })}

          <div className={`skeleton-chats-overlay ${!showChats ? "show-skeleton-chats" : "hide-skeleton-chats"}`}>
            <SkeletonChats />
          </div>
        </div>
      </main>
  );
}
