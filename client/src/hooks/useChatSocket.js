//altushka/client/src/hooks/useChatSocket.js.js

import { useState, useEffect, useRef } from 'react';

/**
 * useChatSocket - кастомный React-хук, инкапсулирующий логику WebSocket.
 *
 * @param {string} url URL сервера WebSocket (например: 'ws://localhost:3001')
 * @returns {Object} { messages, sendMessage, connectionStatus }
 */
export default function useChatSocket(url) {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const wsRef = useRef(null);

  useEffect(() => {
    // Инициируем WebSocket
    wsRef.current = new WebSocket(
      window.location.origin.replace(/^http/, 'ws')
    );
    setConnectionStatus(`CONNECTING TO ${wsRef.current}`);

    // Событие: соединение установлено
    wsRef.current.onopen = () => {
      setConnectionStatus('CONNECTED');
      console.log('Вебсокет запущен');
    };

    // Событие: получение сообщения
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error('Ошибка парсинга сообщения:', err);
      }
    };

    // Событие: соединение закрыто
    wsRef.current.onclose = () => {
      setConnectionStatus('DISCONNECTED');
      console.log('Вебсокет закрыт');
    };

    // Событие: произошла ошибка
    wsRef.current.onerror = (error) => {
      console.error('Ошибка вебсокета:', error);
    };

    // Очистка при размонтировании компонента
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]); // Запуск эффекта, когда меняется url

  // Функция отправки сообщения
  const sendMessage = (payload) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Вебсокет не был открыт, сообщение не отправлено.');
      return;
    }
    wsRef.current.send(JSON.stringify(payload));
  };

  return {
    messages,
    sendMessage,
    connectionStatus,
  };
}
