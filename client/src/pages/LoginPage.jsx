// altushka/client/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/RPstyle.scss'
import Button from '@/components/button/button'
import loadingSvg from '@/assets/vectors/loading.svg';

export default function RegisterPage() {
  const [username, setUsername] = useState('@');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState("")
  const [isValid, setIsValid] = useState(0);
  const [isValidPass, setIsValidPass] = useState(0);
  const [clickedInstance, setClickedInstance] = useState(false);
  const navigate = useNavigate();

  
  const handleUsernameChange = (e) => {
    let value = e.target.value.trim();

    if (!value.startsWith('@')) {
      value = '@' + value.replace(/^@+/, '');
    }

    setIsValid((value.length > 1) ? 1 : 2)
    console.log(value.length, isValid)
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
        setTimeout(() => {
          navigate(`/`);
        }, 2000)
      } else {
        setErrorMessage(data.error);
        console.log(data.error || 'Ошибка регистрации');
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleGoToRegister = async () => {
    navigate("/register");
  }
  
  useEffect(() => {
    let timeoutId;
    if (clickedInstance) {
      timeoutId = setTimeout(() => setClickedInstance(false), 7000);
    }
    return () => clearTimeout(timeoutId);
  }, [clickedInstance]);

  return (
  <div className='flex-body'>
    <main>
      <h2 className='head-name'>Авторизация 💫</h2>
        <div className='inputs'>
          <div className={`header-block`} >

            <div className='name-input'>
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
            <div className='name-input'>
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
      <span className="mobile greyed-text">Генерация временного аккаунта. Не храните здесь важную информацию.</span>
      <div className="footer-block"> 
        <Button variant="primary" onClick={handleLogin} disabled={username.length < 2 || !password}>Продолжить</Button>
        <img src={loadingSvg} className={`img-svg ${clickedInstance ? "clicked" : ""}`} alt="loading" />
        <span className="desktop greyed-text">Генерация временного аккаунта. Не храните здесь важную информацию.</span>
      </div>
      <span className="login-ask greyed-text">Нет аккаунта? <Button variant="skelet" onClick={handleGoToRegister}>Регистрация</Button></span>
      
    </main>
  </div>
  );
}
