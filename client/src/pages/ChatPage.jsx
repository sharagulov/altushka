

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { HiChevronLeft } from "react-icons/hi";
import '@/styles/CPstyle.scss';



import Message from '@/components/message/Message.jsx';
import SkeletonMessages from '@/components/skeleton/SkeletonMessages';

export default function ChatPage() {
  const navigate = useNavigate();
  
  const [ws, setWs] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [targetUser, setTargetUser] = useState({});
  const [showMessages, setShowMessages] = useState(false);
  const [showCompanion, setShowCompanion] = useState(false);
  const [isUserOnline, setIsUserOnline] = useState(false);


  const { userId: targetUserId } = useParams();
  
  const accessToken = localStorage.getItem('accessToken');
  const currentUserId = accessToken ? jwtDecode(accessToken).userId : null;

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  // --- 1) Загружаем информацию о собеседнике по ID ---
  useEffect(() => {
    fetch(`/api/users?search=${targetUserId}`)
      .then((res) => res.json())
      .then((data) => {
        setTargetUser(data[0]);
      })
      .catch((err) => console.error('Ошибка определения собеседника:', err));
  }, [targetUserId]);

  // --- 2) Загружаем историю сообщений ---

  useEffect(() => {
    if (!targetUser?.id) return;
  
    fetch(`/api/messages/${currentUserId}/${targetUser.id}`)
      .then((res) => res.json())
      .then((data) => {
          setHistoryData(data);
      })
      .catch((err) => console.error('Ошибка загрузки истории:', err));
  }, [currentUserId, targetUser]);


  useEffect(() => {
    if (!targetUser?.id) return;
  
    const checkOnlineStatus = () => {
      fetch(`/api/onlineStatus?userId=${targetUser?.id}`)
        .then((res) => res.json())
        .then((data) => {
          setIsUserOnline(data.online);
        })
        .catch((err) => console.error('Ошибка при проверке online-статуса:', err));
    };
  
    // Запрашиваем сразу
    checkOnlineStatus();
    // И можно опрашивать каждые 10 секунд
    const intervalId = setInterval(checkOnlineStatus, 10000);
  
    return () => clearInterval(intervalId);
  }, [targetUser?.id]);
  



  useEffect(() => {
    if (targetUser?.id === currentUserId) navigate('/')
    setMessages([]);
  }, [targetUser]);
  
  useEffect(() => {
    return () => {
      setMessages([]);
    };
  }, []);



  // --- 3) Создаём/обслуживаем WebSocket соединение ---
  useEffect(() => {
    if (!currentUserId || !targetUser?.id) return;


    const wsURL = 'wss://altushka.site/ws';

    let socket = null;
    let pingInterval = null;

    const createWebSocket = () => {
      console.log("[WS] Подключаемся к:", wsURL);
      socket = new WebSocket(wsURL);

      socket.onopen = () => {
        console.log('[WS] Соединение установлено');
        socket.send(JSON.stringify({
          type: 'init',
          userId: currentUserId
        }));

        pingInterval = setInterval(() => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 1000);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'pong') {
            return;
          }

      
          if (data.type === 'chat') {
            const isMyChat =
              (data.fromId === currentUserId && data.toId === targetUser.id) ||
              (data.fromId === targetUser.id && data.toId === currentUserId);
      
            if (isMyChat) {
              setMessages((prev) => [...prev, data]);
            } else {
              console.log('Пришло сообщение, но не для этого чата:', data);
            }
          }
        } catch (err) {
          console.error('Ошибка парсинга WebSocket-сообщения:', err);
        }
      };
      

      socket.onerror = (err) => {
        console.error('[WS] Ошибка вебсокета на клиентской стороне:', err);
      };

      socket.onclose = (event) => {
        console.warn(`[WS] Соединение закрыто (код: ${event.code}, причина: ${event.reason})`);
        clearInterval(pingInterval);
        pingInterval = null;
      };

      setWs(socket);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
          console.log('[WS] Вкладка активна -> переподключаемся к WS');
          createWebSocket();
        }
      }
    };

    createWebSocket();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (socket) {
        clearInterval(pingInterval);
        socket.close();
      }
    };
  }, [currentUserId, targetUser]);

  // --- 4) Скроллим вниз при появлении новых сообщений или обновлении истории ---
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [historyData, messages, showMessages]);


  useEffect(() => {
    setShowMessages(false);
    setShowCompanion(false);
  }, [targetUserId]);


  const isVisible = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    return rect && rect.bottom <= window.innerHeight;
  };
  

  useEffect(() => {
    if (historyData.length === 0) return;
    const timerId = setTimeout(() => {
      setShowMessages(true);
    }, 200);
    return () => clearTimeout(timerId);
  }, [historyData]);

  useEffect(() => {
    if (!targetUser?.id) return;
    const timerId = setTimeout(() => {
      setShowCompanion(true);
    }, 200);

    return () => clearTimeout(timerId);
  }, [targetUser]);

  // --- 5) Отправка нового сообщения ---
  const handleSend = () => {
    if (!inputValue.trim() || !ws) return;
    if (ws.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Попытка отправить сообщение, когда сокет не открыт');
      return;
    }

    const msg = {
      type: 'chat',
      fromId: currentUserId,
      toId: targetUser.id,
      text: inputValue.trim(),
      created_at: Date.now(),
    };
    ws.send(JSON.stringify(msg));
    setMessages((prev) => [...prev, msg]);
    setInputValue('');
  };

  let allMessages;
  if (Array.isArray(historyData)) {
    allMessages = [...historyData, ...messages];
  }

  return (
    <>
      <div className='cp-right-top-container shadow-bottom cp-right cp-fc'>
        <div className='cp-back-button' onClick={() => navigate("/")}>
          <HiChevronLeft size={30}  />
        </div>
        <div className={`cp-companion ${showCompanion}-context`}>
          <h2>{targetUser?.username} </h2>
          <span style={{lineHeight:"0.8"}} className='greyed-text'>{isUserOnline ? 'онлайн' : 'был(а) недавно'}</span>
        </div>
        <div className={`skeleton cp-companion-skeleton ${showCompanion}-context`}/>
      </div>

        
      <div className='cp-right-middle-container padding' ref={containerRef}>

          <div className={`cp-right-middle-content ${showMessages ? "show-real-messages" : "hide-real-messages"}`}>
            {allMessages ? allMessages.map((m, i) => {
              const isMe = m.fromId === currentUserId;
              return (
                <div key={i} className={`message-flex ${isMe ? "my" : ""}`}>
                  <Message message={m} highlight={isMe}/>
                </div>
              );
            }) : null}
            <div ref={bottomRef}></div>
          </div>
          
          <div className={`skeleton-overlay ${!showMessages ? "show-skeleton-messages" : "hide-skeleton-messages"}`}>
            <SkeletonMessages />
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
          <HiChevronLeft  size={30} onClick={handleSend} />
        </div>
      </div>
    </>
  );
}
