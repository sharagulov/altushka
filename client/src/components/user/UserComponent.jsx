// "/root/common/altushka/client/src/components/user/UserComponent.jsx"

import React from 'react';
import './user.scss';
import '@/components/user/user.scss';
import { useNavigate } from 'react-router-dom';
import getNormalTime from '@/components/utils/utils'

export default function User({ user, highlight, searched }) {
  const navigate = useNavigate()

  const time = getNormalTime(user.lastMessage?.created_at)

  return (
    <div className={`user-component ${highlight ? "highlight" : ""} ${searched ? "searched" : ""}`} onClick={() => navigate(`/chat/${user.username}`)}> 
      <div className="user-flex-component">
        <div className='user-avatar'></div>
        <div className='user-text-component'>
          <div className='user-top-text-component'>
            <span>{user.username.slice(1)}</span> 
            <span className='greyed-text user-last-time'>{time}</span> 
          </div>
          {user.id !== user.lastMessage?.fromId
          ? <span className='super-greyed-span-text user-last-message'>Вы: <span className='super-greyed-span-text'>{user.lastMessage?.text}</span></span>
          : <span className='super-greyed-span-text user-last-message'>{user.username.slice(1)}: <span className='super-greyed-span-text '>{user.lastMessage?.text}</span></span>}
           
        </div>
      </div>
    </div>
  );
}
