import React, { useEffect, useState } from 'react';
import { usePopup } from '@/contexts/PopupContext';
import { HiOutlineX, HiLogout } from "react-icons/hi";
import { jwtDecode } from 'jwt-decode';
import './popup.scss';
import Button from '@/components/button/button'
import { useNavigate } from 'react-router-dom';
import { useCurtain } from "@/contexts/CurtainContext";


export default function PopupComponent() {
  const { isVisible, hidePopup } = usePopup();
  const [user, setUser] = useState({})
  const [isLoaded, setIsLoaded] = useState(false)
  const navigate = useNavigate();
  const { showCurtain } = useCurtain();

  const accessToken = localStorage.getItem('accessToken');
  const currentUserId = accessToken ? jwtDecode(accessToken).userId : null;

  useEffect(() => {
    if (!currentUserId) return;
    fetch(`/api/me/${currentUserId}`)
    .then((res) => res.json())
    .then((data) => {setUser(data.user)})
    .catch((err) => console.error("Ошибка загрузки информации о пользователе:", err));
}, [currentUserId]);


  useEffect(() => {
    setIsLoaded(false);
    const isLoadedTimeout = setTimeout(setIsLoaded(true), 1000);
    return () => (clearTimeout(isLoadedTimeout));
  }, [user])

  const handleLogout = () => {
    showCurtain(1500);
    const timeout = setTimeout(() => {
      localStorage.removeItem("accessToken");
      navigate("/login")
    }, 500)
    return () => {clearTimeout(timeout)};
  }

  return (
    <div className={`popup-overlay ${isVisible ? "visible" : ""}`}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className='popup-header'>
          <h2 className='unchosable'>Настройки</h2>
          <HiOutlineX className="popup-close pointer" size={22} onClick={hidePopup}/>
        </div>
        <div className='line'/>
        <div className='popup-middle'>
          <div className='popup-info-block'>
            <div className='user-avatar'/>
            <div className='popup-info-text-block'>
              {isLoaded && (<span>{user.username}</span>)}
              {isLoaded && (<span className='greyed-text'>uuid: {user.id}</span>)}
            </div>
          </div>
          <div>
            <Button variant={"block"} text={"Выйти"} onClick={handleLogout}><HiLogout size={22} /></Button>
          </div>
        </div>
        {/* <div className='popup-bottom'></div> */}
      </div>
    </div>
  );
}

