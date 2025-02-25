// altushka/client/src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
const { users, messages } = require('../mockdb');

export default function ChatPage() {
  const { userId: targetUserId } = useParams(); // с кем чатимся
  const navigate = useNavigate();

  const [ws, setWs] = useState(null);
  const [messagesCurrent, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const myId = localStorage.getItem('userId');
  const myUsername = localStorage.getItem('username');
  const historyData = messages;

  useEffect(() => {
    if (!myId) {
      navigate('/register');
      return;
    }
    // Инициируем WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsURL = protocol + '//' + window.location.host;
    const socket = new WebSocket(wsURL);


    socket.onopen = () => {
      console.log('WS opened');
      // Отправляем init, чтобы сервер знал, кто мы
      socket.send(JSON.stringify({
        type: 'init',
        userId: myId
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
        console.error('Ошибка parse:', err);
      }
    };

    socket.onclose = () => {
      console.log('WS closed');
    };

    socket.onerror = (err) => {
      console.log('WS error', err);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [myId, navigate]);

  const handleSend = () => {
    if (!inputValue.trim() || !ws) return;
    // Отправляем на сервер
    const msg = {
      type: 'chat',
      from: myId,
      to: targetUserId,
      text: inputValue
    };

    ws.send(JSON.stringify(msg));

    // Добавим своё сообщение в messages, чтобы сразу отобразить
    setMessages((prev) => [...prev, { ...msg }]);
    setInputValue('');
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Чат с пользователем ID: {targetUserId}</h2>
      <p>Вы: {myUsername} (ID: {myId})</p>

      <div className="chat-window" style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'auto' }}>
        {messages.map((m, i) => {
          const isMe = m.from === myId;
          return (
            <div key={i} style={{ textAlign: isMe ? 'right' : 'left' }}>
              <strong>{isMe ? 'Вы' : `User ${m.from}`}: </strong>
              {m.text}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '10px' }}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Отправить</button>
      </div>

      <div>
        {messages}
      </div>
    </div>
  );
}
