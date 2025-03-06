// "/root/common/altushka/client/src/components/user/UserComponent.jsx"

import React, {useRef, useEffect} from 'react';
import './user.scss';
import '@/components/user/user.scss';
import { useNavigate } from 'react-router-dom';
import { useCurtain } from "@/contexts/CurtainContext";
import getNormalTime from '@/components/utils/utils'

export default function User({ user, highlight, searched }) {
  const navigate = useNavigate()
  const navigateTimeoutRef = useRef(null);
  const { showCurtain, hideCurtain } = useCurtain();

  const time = getNormalTime(user.lastMessage?.created_at, "user")

  const handleGoToChat = async () => {
    navigate(`/chat/${user.username}`);
  }

  const lastMessage = (user.lastMessage?.text);
  const maxStringLength = 20;
  const truncateString = (str) => str?.length > maxStringLength ? str.slice(0, maxStringLength) + "..." : str;



  return (
    <div className={`user-component ${highlight ? "highlight" : ""} ${searched ? "searched" : ""}`} onClick={handleGoToChat}> 
      <div className="user-flex-component">
        <div className='user-avatar'/>
        <div className='user-text-component'>
          <div className='user-top-text-component'>
            <span>{user.username.slice(1)}</span> 
            <span className='greyed-text user-last-time'>{time}</span> 
          </div>
          {user.id !== user.lastMessage?.fromId
          ? <span className='super-greyed-span-text user-last-message'>Вы: <span className='super-greyed-span-text'>{truncateString(lastMessage)}</span></span>
          : <span className='super-greyed-span-text user-last-message'>{user.username.slice(1)}: <span className='super-greyed-span-text '>{truncateString(lastMessage)}</span></span>}
           
        </div>
      </div>
    </div>
  );
}
