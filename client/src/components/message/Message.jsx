import React from 'react';
import './message.scss'

export default function Message({ text, time }) {
  const sendTime = new Date(time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });


  return (
    <div className='msg-container'>
      <div className='msg-info-container'>
        <span className='msg-text-container'>{text}</span>
        <span className='greyed-text'>{sendTime}</span>
      </div>
    </div>
  );
}
