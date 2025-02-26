// altushka/client/src/pages/ChatPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ChatPage() {
  const { userId: targetUserId } = useParams(); // с кем чатимся
  const navigate = useNavigate();

  const [ws, setWs] = useState(null);
  const [historyData, setHistoryData] = useState([]); // тут будем хранить историю
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const myId = localStorage.getItem('userId');
  const myUsername = localStorage.getItem('username');

  useEffect(() => {
    // При первом рендере получим историю
    fetch(`/api/messages/${myId}/${targetUserId}`)
      .then((res) => res.json())
      .then((data) => {
        setHistoryData(data); // сохраняем в стейт
      })
      .catch((err) => console.error('Ошибка загрузки истории:', err));
  }, [myId, targetUserId]);

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
      console.log('Вебсокет используется');
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

  const allMessages = [...historyData, ...messages];

  return (
    <div>
      <h2>Чат с пользователем ID: {targetUserId}</h2>
      <p>Вы: {myUsername} (ID: {myId})</p>

      <div className="chat-window">
        {allMessages.map((m, i) => {
          const isMe = m.from === myId;
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
