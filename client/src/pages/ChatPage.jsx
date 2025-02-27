// altushka/client/src/pages/ChatPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCookieValue } from "@/components/сookieValue.js";

export default function ChatPage() {
  const navigate = useNavigate();
  
  const [ws, setWs] = useState(null);
  const [historyData, setHistoryData] = useState([]); // тут будем хранить историю
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [targetUser, setTargerUser] = useState(null)
  
  const { userId: targetUserId } = useParams();

  const currentUser = getCookieValue("user");
  const currentUserId = currentUser.id;
  const myUsername = localStorage.getItem('username');

  useEffect(() => {
    // При первом рендере получим историю
    fetch(`/api/users?search=${targetUserId}`)
      .then((res) => res.json())
      .then((data) => {
        setTargerUser(data[0]);
      })
      .catch((err) => console.error('Ошибка определения собеседника:', err));

    fetch(`/api/messages/${currentUserId}/${targetUserId}`)
      .then((res) => res.json())
      .then((data) => {
        setHistoryData(data); // сохраняем в стейт
      })
      .catch((err) => console.error('Ошибка загрузки истории:', err));
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    // if (!myId) {
    //   navigate('/register');
    //   return;
    // }


    // Инициируем WebSocket
    const isDev = window.location.hostname === 'localhost'; 
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // В дев-режиме WebSocket идёт на 3001, в продакшене — на тот же хост
    const wsHost = isDev ? 'localhost:3001' : window.location.host;
    const wsURL = `${protocol}//${wsHost}`;
    
    const socket = new WebSocket(wsURL);
    

    socket.onopen = () => {
      console.log('Вебсокет используется');
      // Отправляем init, чтобы сервер знал, кто мы
      socket.send(JSON.stringify({
        type: 'init',
        userId: currentUserId
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          // Сообщение от другого пользователя
          setMessages((prev) => [...prev, data]);
        }
      } catch (err) {
        console.error('Ошибка парсинга:', err);
      }
    };
    
    socket.onclose = () => {
      console.log('Вебсокет не используется');
    };

    socket.onerror = (err) => {
      console.log('Ошибка вебсокета на клиентской стороне', err);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [currentUserId, navigate]);

  const handleSend = () => {
    if (!inputValue.trim() || !ws) return;
    // Отправляем на сервер
    const msg = {
      type: 'chat',
      from: currentUserId,
      to: targetUserId,
      text: inputValue
    };
    ws.send(JSON.stringify(msg));
    console.log(msg)

    // Добавим своё сообщение в messages, чтобы сразу отобразить
    setInputValue('');
  };

  const allMessages = [...historyData, ...messages];

  return (
    <div>
      <h2>Чат с пользователем ID: {targetUser.username}</h2>
      <p>Вы: {myUsername} (ID: {currentUser.username})</p>

      <div className="chat-window">
        {allMessages.map((m, i) => {
          const isMe = m.from === currentUserId;
          return (
            <div key={i} style={{ textAlign: isMe ? 'right' : 'left' }}>
              <strong>{isMe ? 'Вы' : `User ${m.from}`}: </strong>
              {m.text}
            </div>
          );
        })}
      </div>

      <div>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Отправить</button>
      </div>
    </div>
  );
}
