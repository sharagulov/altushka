// altushka/client/src/pages/RegisterPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/RPstyle.scss'
import { HiPencilAlt } from "react-icons/hi";
import Button from '@/components/button/button'
import loadingSvg from '@/assets/vectors/loading.svg';
import { useCurtain } from "@/contexts/CurtainContext";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordHardness, setPasswordHardness] = useState('');
  const [errorMessages, setErrorMessages] = useState([])
  const [errorMessage, setErrorMessage] = useState([])
  const [errorPassMessages, setErrorPassMessages] = useState([])
  const [isValid, setIsValid] = useState(0);
  const [isValidPass, setIsValidPass] = useState(0);
  const [clickedInstance, setClickedInstance] = useState(false);
  const navigate = useNavigate();
  const { showCurtain, hideCurtain } = useCurtain();
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);


  const usernameRegex = /^[а-яА-Я0-9a-zA-Z_]+$/;
  const onlyUnderscoresRegex = /^_+$/;

  const errorTimeoutRef = useRef(null);
  const navigateTimeoutRef = useRef(null);
  const instanceTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  

  
  const handleUsernameChange = (e) => {
    let value = e.target.value.trim();
    let messages = ["Слишком короткое", "Слишком длинное", "Некорректные символы", "Серьезно?"];

    let newErrors = [];

    if (value.length > 11) {
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
  
    setUsername(value);
  };

  const handlePasswordChange = (e) => {
    let value = e.target.value.trim();
    let messages = ["Слишком короткий", "Слишком длинный"];
  
    let newErrors = [];
  
    if (value.length < 6) {
      newErrors.push(messages[0]); 
      setPasswordHardness("Слабый");
    } else if (value.length < 15) {
      setPasswordHardness("Средний");
    } else {
      setPasswordHardness("Сильный");
    }
  
    if (value.length > 50) {
      newErrors.push(messages[1]);
    }
  
    setErrorPassMessages(newErrors);
    setIsValidPass(newErrors.length > 0 ? 2 : 1);
  
    if (value === "") {
      setErrorPassMessages([]);
      setIsValidPass(0);
      setPasswordHardness("");
    }
  
    setPassword(value);
  };


  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewSrc(URL.createObjectURL(file)); // Генерируем временный URL
    }
  };

  useEffect(() => {
    return () => {
      if (previewSrc) URL.revokeObjectURL(previewSrc);
    };
  }, [previewSrc]);
  



  const handleRegister = async () => {
    if (!isValid || !isValidPass) return;

    setClickedInstance(true);

    try {

      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await fetch('/api/register', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken); 
        setTimeout(() => {
          navigate(`/`);
        }, 2000)
      } else {
        errorTimeoutRef.current = setTimeout(() => {
          setErrorMessage(data.error || 'Ошибка регистрации');
        }, 1000)
        console.log(data.error || 'Ошибка регистрации');
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleGoToLogin = async () => {
    showCurtain(1500);
    navigateTimeoutRef.current = setTimeout(() => {
      navigate("/login");
    }, 200)
    return () => clearTimeout(navigateTimeoutRef.current);
  }
  
  useEffect(() => {
    if (clickedInstance) {
      instanceTimeoutRef.current = setTimeout(() => setClickedInstance(false), 7000);
    }
    return () => clearTimeout(instanceTimeoutRef.current);
  }, [clickedInstance]);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      if (instanceTimeoutRef.current) clearTimeout(instanceTimeoutRef.current);
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
    };
  }, []);


  return (
  <div className='flex-body'>
    <main>
  
      <h2 className='head-name'>Регистрация</h2>

      <div className='rp-couple'>
        <span className='super-greyed-span-text'>Ваша карточка:</span>

        <div className='preview'>

          <div className='preview-avatar'>
            <img src={previewSrc || "logo192.png"} className='avatar-image' alt="Предпросмотр аватарки" />
          </div>

          <div className='preview-info'>

            <div className='preview-block-container'>
              <span className='greyed-text'>Имя:</span>
              <div className='preview-block'>
                <span>{username}</span>
              </div>
            </div>


            <div className='preview-block-container'>
              <span className='greyed-text'>Cложность пароля:</span>
              <div className='preview-block'>
                <span>{passwordHardness}</span>
              </div>
            </div>

            <div className='preview-block-container'>
              <span className='greyed-text'>Аватарка:</span>
              <div onClick={handleButtonClick}  className='preview-block'>
                <div className='preview-svg'>
                  <HiPencilAlt size={22} className=''/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{position:"absolute"}}>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleAvatarChange} />
      </div>

        <div className='inputs'>
          <div className={`header-block ${"no" + errorMessages.length}`} >

            <div className='name-input'>
              <label><span className='super-greyed-span-text'>Альтнейм</span></label>
              <input
                type="text"
                placeholder='@'
                value={username}
                onChange={handleUsernameChange}
                className={isValid !== 1 ? 'error' : 'ok'}
                required
                />
            </div>
            {isValid === 2 && (
              <div className="error-container">
                {errorMessages.map((msg, index) => (
                  <span key={index} className="error-message greyed-text">{msg}</span>
                ))}
              </div>
            )}
          </div>
          <div className={`header-block ${"no" + errorPassMessages.length}`} >
            <div className='name-input'>
              <label><span className='super-greyed-span-text'>Пароль</span></label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className={isValidPass !== 1 ? 'error' : 'ok'}
                required
                />
            </div>
            {isValidPass === 2 && (
              <div className="error-container">
                {errorPassMessages.map((msg, index) => (
                  <span key={index} className="error-message greyed-text">{msg}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {errorMessage.length !== 0 ? (<span className='error-text login-error-message mobile'>{errorMessage}</span>) : (<span className="mobile greyed-text">Пет-проект. Не храните здесь важную информацию.</span>)}


      <div className="footer-block"> 
        <Button variant="primary" onClick={handleRegister} disabled={isValid !== 1 || isValidPass !== 1 || clickedInstance }>Регистрация</Button>
        <img src={loadingSvg} className={`img-svg ${clickedInstance ? "clicked" : ""}`} alt="loading" />
        {errorMessage.length !== 0 ? (<span className='error-text login-error-message desktop'>{errorMessage}</span>) : (<span className="desktop greyed-text">Пет-проект. Не храните здесь важную информацию.</span>)}
      </div>
      <div className="login-ask greyed-text">Есть аккаунт? <Button variant="skelet" onClick={handleGoToLogin}>Войти</Button></div>
      {/* <div className='page-logo desktop'>
        <img src="/nbg_logo192.png" alt="altushka logo" />
      </div> */}
    </main>
  </div>
  );
}
