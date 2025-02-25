// src/App.js
import React, { useState } from 'react';
import useChatSocket from './hooks/useChatSocket';
import './App.css';

function App() {
  const [inputValue, setInputValue] = useState('');
  // Подключаем custom hook, указываем URL WebSocket-сервера
  const { messages, sendMessage, connectionStatus } = useChatSocket();

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage({ text: inputValue, date: Date.now() });
    setInputValue('');
  };

  return (
    <div className="App">
      <h1>Мессенджер</h1>
      <p>Статус соединения: {connectionStatus}</p>

      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className="message">
            {m.text}
          </div>
        ))}
      </div>

      <div className="controls">
        <input
          value={inputValue}
          placeholder="Напишите что-нибудь..."
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Отправить</button>
      </div>
    </div>
  );
}

export default App;
