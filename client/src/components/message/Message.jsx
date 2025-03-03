import React from 'react';
import './message.scss'
import getNormalTime from '@/components/utils/utils'

export default function Message({ message, highlight }) {
  const sendTime = getNormalTime(message.created_at)
  return (
    <div className={`msg-container ${highlight ? "highlight" : ""}`}>
      <div className='msg-info-container'>
        <span className='msg-text'>{message.text}</span>
        <span className={`greyed-text msg-send-time ${highlight ? "highlight" : ""}`}>{sendTime}</span>
      </div>
    </div>
  );
}
