// altushka/client/src/pages/RegisterPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/RPstyle.scss'
import Button from '@/components/button/button'
import loadingSvg from '@/assets/vectors/loading.svg';
import { useCurtain } from "@/contexts/CurtainContext";

export default function RegisterPage() {
  const [username, setUsername] = useState('@');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState("")
  const [isValid, setIsValid] = useState(0);
  const [isValidPass, setIsValidPass] = useState(0);
  const [clickedInstance, setClickedInstance] = useState(false);

  const navigate = useNavigate();
  const loginTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const navigateTimeoutRef = useRef(null);
  const instanceTimeoutRef = useRef(null);
  const { showCurtain, hideCurtain } = useCurtain();

  
  const handleUsernameChange = (e) => {
    let value = e.target.value.trim();

    if (!value.startsWith('@')) {
      value = '@' + value.replace(/^@+/, '');
    }

    setIsValid((value.length > 1) ? 1 : 2)
    setUsername(value);
  };

  const handlePasswordChange = (e) => {
    let value = e.target.value.trim();
    setIsValidPass((value) ? 1 : 2)
    setPassword(value);
  };
  
  const handleLogin = async () => {
    setClickedInstance(true);
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        loginTimeoutRef.current = setTimeout(() => {
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


  const handleGoToRegister = async () => {
    showCurtain(1500);
    navigateTimeoutRef.current = setTimeout(() => {
      navigate("/register");
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
      if (loginTimeoutRef.current) clearTimeout(loginTimeoutRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      if (instanceTimeoutRef.current) clearTimeout(instanceTimeoutRef.current);
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
    };
  }, []);


  return (
  <div className='flex-body'>
    <main>
      
      <h2 className='head-name'>Авторизация 💫</h2>
        <div className='inputs'>
          <div className={`header-block`} >

            <div className=' name-input'>
              <label><span>Ваше имя</span></label>
              <input
                type="text"
                placeholder='@'
                value={username}
                onChange={handleUsernameChange}
                required
                className={isValid !== 1 ? 'error' : 'ok'}
                />
            </div>
          </div>

          <div className={`header-block`} >
            <div className=' name-input'>
              <label><span>Пароль</span></label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                className={isValidPass !== 1 ? 'error' : 'ok'}
                />
            </div>
          </div>

        </div>
        {errorMessage.length !== 0 ? (<span className='error-text login-error-message mobile'>{errorMessage}</span>) : (<span className="mobile greyed-text">Убедитесь, что даннные введены корректно.</span>)}

      
      <div className="footer-block "> 
        <Button variant="primary" onClick={handleLogin} disabled={username.length < 2 || !password}>Продолжить</Button>
        <img src={loadingSvg} className={`img-svg ${clickedInstance ? "clicked" : ""}`} alt="loading" />
        {errorMessage.length !== 0 ? (<span className='error-text login-error-message desktop'>{errorMessage}</span>) : (<span className="desktop greyed-text">Убедитесь, что даннные введены корректно.</span>)}
        
      </div>
      <span className=" login-ask greyed-text">Нет аккаунта? <Button variant="skelet" onClick={handleGoToRegister}>Регистрация</Button></span>
      <div className='page-logo desktop'>
        <img src="/nbg_logo192.png" alt="altushka logo" />
      </div>
    </main>
  </div>
  );
}
