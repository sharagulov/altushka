// "/root/common/altushka/client/src/components/user/UserComponent.jsx"

import React from 'react';
import './user.scss';
import '@/components/user/user.scss';
import { useNavigate } from 'react-router-dom';

export default function User({ user, to }) {
  const navigate = useNavigate()

  return (
    <div className='user-component' onClick={() => navigate(to)}> 
      <div className="user-flex-component">
        <div className='user-avatar'></div>
        <span>{user.username.slice(1)}</span> 
        <span>{user.lastMessage?.text}</span> 
      </div>
    </div>
  );
}
