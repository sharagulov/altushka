import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCookieValue } from "@/components/сookieValue.js";
import { IoChevronBackOutline } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import '@/styles/CPstyle.scss'

import Message from '@/components/message/Message.jsx'

export default function ChatPage() {
  const navigate = useNavigate();
  
  const [ws, setWs] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [targetUser, setTargerUser] = useState({});

  const { userId: targetUserId } = useParams();

  const currentUser = getCookieValue("user");
  const currentUserId = currentUser.id;

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch(`/api/users?search=${targetUserId}`)
      .then((res) => res.json())
      .then((data) => setTargerUser(data[0]))
      .catch((err) => console.error('Ошибка определения собеседника:', err));
  }, [targetUserId]);

  useEffect(() => {
    fetch(`/api/messages/${currentUserId}/${targetUser.id}`)
      .then((res) => res.json())
      .then((data) => setHistoryData(data))
      .catch((err) => console.error('Ошибка загрузки истории:', err));
  }, [currentUserId, targetUser]);

  useEffect(() => {
    const isDev = window.location.hostname === 'localhost'; 
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    const wsHost = isDev ? 'localhost:3001' : window.location.host;
    const wsURL = `${protocol}//${wsHost}`;
    
    const socket = new WebSocket(wsURL);
    
    socket.onopen = () => {
      console.log('Вебсокет используется');
      socket.send(JSON.stringify({
        type: 'init',
        userId: currentUserId
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          setMessages((prev) => [...prev, data]);
          console.log(data)
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historyData, messages]);

  const handleSend = () => {
    if (!inputValue.trim() || !ws) return;
    const msg = {
      type: 'chat',
      from: currentUserId,
      to: targetUser.id,
      text: inputValue,
      created_at: Date.now(),
    };
    ws.send(JSON.stringify(msg));

    setMessages((prev) => [...prev, msg]);
    setInputValue('');
  };

  const allMessages = [...historyData, ...messages];

  return (
    <div>
      <div className='cp-global-container'>
        <div className='cp-left-container cp-container'>
        </div>
        <div className='cp-right-container cp-container'>
          <div className='cp-right-top-container shadow-bottom cp-right cp-fc'>
            <div className='cp-back-button'>
              <IoChevronBackOutline size={30} />
            </div>
            <h2>Чат с пользователем ID: {targetUser.username}</h2>
          </div>
          <div className='cp-right-middle-container padding' ref={containerRef}>
            <div className='cp-right-middle-content'>
              {allMessages.map((m, i) => {
                const isMe = m.from === currentUserId;
                return (
                  <div key={i} className={`message-flex ${isMe ? "my" : ""}`}>
                    <Message text={m.text} time={m.created_at} />
                  </div>
                );
              })}
              <div ref={bottomRef}></div>
            </div>
          </div>
          <div className='cp-right-bottom-container padding cp-right cp-fc'>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder='Написать сообщение...'
            />
            <div className='cp-send-button'>
              <IoChevronBackOutline size={30} onClick={handleSend} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
