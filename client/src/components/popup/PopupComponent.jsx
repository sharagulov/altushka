import React, { useEffect, useState, useRef } from 'react';
import { usePopup } from '@/contexts/PopupContext';
import { HiOutlineX, HiLogout, HiOutlinePencilAlt, HiOutlineUserCircle, HiPencil  } from "react-icons/hi";
import { jwtDecode } from 'jwt-decode';
import './popup.scss';
import Button from '@/components/button/button'
import { useNavigate } from 'react-router-dom';
import { useCurtain } from "@/contexts/CurtainContext";


export default function PopupComponent() {
  const { isVisible, hidePopup } = usePopup();
  const [user, setUser] = useState({})
  const [newUsername, setNewUsername] = useState('')
  const [errorMessages, setErrorMessages] = useState([]);
  const [isValid, setIsValid] = useState(0);

  const [avatarFile, setAvatarFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);

  const [isEditingUsername, setIsEditingUsername] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false)
  const navigate = useNavigate();
  const { showCurtain } = useCurtain();

  const inputUsernameRef = useRef(null);
  const fileInputRef = useRef(null);

  const accessToken = localStorage.getItem('accessToken');
  let currentUserId = null;
  if (accessToken) {
    try {
      currentUserId = jwtDecode(accessToken).userId;
    } catch (error) {
      console.error("Ошибка при декодировании токена:", error);
      localStorage.removeItem("accessToken"); // Удаляем битый токен
    }
  }

  useEffect(() => {
    if (!currentUserId) return;
    fetch(`/api/me/${currentUserId}`)
    .then((res) => res.json())
    .then((data) => {setUser(data.user)})
    .catch((err) => console.error("Ошибка загрузки информации о пользователе:", err));
}, [currentUserId]);

const handleConfirmEdit = async () => {
  if (!currentUserId) return;
  try {
    const formData = new FormData();
    formData.append('username', newUsername);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    const res = await fetch(`/api/update/${currentUserId}`, {
      method: 'PUT',
      body: formData,
    });

    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      showCurtain(3000)
    } else {
      console.log(data.error || 'Ошибка регистрации');
    }

  } catch (err) {
    console.error(err);
  }
}

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

  const handleUsernameChangeButtonClick = () => {
    if(!isEditingUsername) {
      inputUsernameRef.current.focus(); 
      setIsEditingUsername(true)
      setNewUsername(user?.username)
    } else {
      setIsEditingUsername(false)
      if (isValid === 1) {
        setUser((prevUser) => ({ ...prevUser, username: newUsername }));
        handleConfirmEdit();
      }
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewSrc(URL.createObjectURL(file)); // Генерируем временный URL
    }
  };

  useEffect(() => {
    if (avatarFile) {
      handleConfirmEdit();
    }
  }, [avatarFile]);
  

  const handleAvatarChangeButtonClick = () => {
    fileInputRef.current.click();
  }

  useEffect(() => {
    return () => {
      if (previewSrc) URL.revokeObjectURL(previewSrc);
    };
  }, [previewSrc]);



  const usernameRegex = /^[а-яА-Я0-9a-zA-Z_]+$/;
  const onlyUnderscoresRegex = /^_+$/;

  const handleUsernameChange = (e) => {
    let value = e.target.value.trim();
    let messages = ["Слишком короткое", "Слишком длинное", "Некорректные символы", "Серьезно?"];

    let newErrors = [];

    if (value.length > 15) {
      value = value.slice(0, 15);
    }
  
    if (value.length < 4 && !onlyUnderscoresRegex.test(value.slice(1))) {
      newErrors.push(messages[0]); 
    }
  
    if (value.length > 15) {
      newErrors.push(messages[1]);
    }
  
    if (!usernameRegex.test(value.slice(1))) {
      newErrors.push(messages[2]);
    }
  
    if (onlyUnderscoresRegex.test(value.slice(1))) {
      newErrors = [messages[3]];
    }
  
    setErrorMessages(newErrors);
    setIsValid(newErrors.length > 0 ? 2 : 1);
  
    if (value === '') {
      setErrorMessages([]);
      setIsValid(0);
    }
  
    setNewUsername(value);
  };

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
            <div className="up-avatar-block">
              <img
                src={previewSrc || user.avatarUrl}
                alt="Аватар"
                className="up-avatar"
              />
            </div>
            <div className='popup-info-text-block'>
              <div className='popup-text-block'>
                {isLoaded && (<span>{!isEditingUsername ? user?.username : newUsername}</span>)}
              </div>
            </div>
          </div>
          <div className='popup-buttons'>
            <Button variant={"block"} onClick={handleUsernameChangeButtonClick} highlight={isEditingUsername} text={"Редактировать ник"}><HiPencil size={22} /></Button>
            <Button variant={"block"} text={"Сменить аву"} onClick={handleAvatarChangeButtonClick}><HiOutlineUserCircle size={22} /></Button>
          </div>
        </div>
        <div className='line'/>
        <div className='popup-bottom'>
            <Button variant={"block"} color={"errorr"} text={"Выйти"} onClick={handleLogout}><HiLogout size={22} /></Button>
            <div className='popup-text-block popup-uuid-block'>
                {isLoaded && (<span className='greyed-text'>uuid: {user.id?.slice(0, 18)}...</span>)}
            </div>
        </div>
      </div>


      <div style={{position:"absolute"}}>
        <input 
          value={newUsername}
          ref={inputUsernameRef}
          style={{ opacity: "0" }}
          onChange={handleUsernameChange} />
      </div>

      <div style={{position:"absolute"}}>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleAvatarChange} />
      </div>

    </div>
  );
}

