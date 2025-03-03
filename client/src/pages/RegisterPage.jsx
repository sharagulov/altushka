// altushka/client/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/RPstyle.scss'
import Button from '@/components/button/button'
import loadingSvg from '@/assets/vectors/loading.svg';

export default function RegisterPage() {
  const [username, setUsername] = useState('@');
  const [password, setPassword] = useState('');
  const [errorMessages, setErrorMessages] = useState([])
  const [errorPassMessages, setErrorPassMessages] = useState([])
  const [isValid, setIsValid] = useState(0);
  const [isValidPass, setIsValidPass] = useState(0);
  const [clickedInstance, setClickedInstance] = useState(false);
  const navigate = useNavigate();

  const usernameRegex = /^[а-яА-Я0-9a-zA-Z_]+$/;
  const onlyUnderscoresRegex = /^_+$/;


  
  const handleUsernameChange = (e) => {
    let value = e.target.value.trim();
    let messages = ["Слишком короткое", "Слишком длинное", "Некорректные символы", "Серьезно?"];
  
    
    if (!value.startsWith('@')) {
      value = '@' + value.replace(/^@+/, '');
    }
    let newErrors = [];
  
    if (value.length < 6 && !onlyUnderscoresRegex.test(value.slice(1))) {
      newErrors.push(messages[0]); 
    }
  
    if (value.length > 21) {
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
  
    if (value === '@') {
      setErrorMessages([]);
      setIsValid(0);
    }

    console.log(errorMessages, isValid)
  
    setUsername(value);
  };

  const handlePasswordChange = (e) => {
    let value = e.target.value.trim();
    let messages = ["Слишком короткий", "Слишком длинный"];
  
    let newErrors = [];
  
    if (value.length < 6) {
      newErrors.push(messages[0]); 
    }
  
    if (value.length > 50) {
      newErrors.push(messages[1]);
    }
  
    setErrorPassMessages(newErrors);
    setIsValidPass(newErrors.length > 0 ? 2 : 1);
  
    if (value === "") {
      setErrorPassMessages([]);
      setIsValidPass(0);
    }

    console.log(errorPassMessages, isValidPass, (isValid !== 1 && isValidPass !== 1) || clickedInstance)
  
    setPassword(value);
  };
  



  const handleRegister = async () => {
    if (!isValid) {
      return;
    }

    setClickedInstance(true);
    try {
      const res = await fetch('/api/register', {
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
        console.log(data.error || 'Ошибка регистрации');
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleGoToLogin = async () => {
    navigate("/login");
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
      <h2 className='head-name'>Регистрация 💫</h2>
        <div className='inputs'>
          <div className={`header-block ${"no" + errorMessages.length}`} >

            <div className='name-input'>
              <label><span>Ваше имя</span></label>
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
              <label><span>Пароль</span></label>
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

      <span className="mobile greyed-text">Генерация временного аккаунта. Не храните здесь важную информацию.</span>
      <div className="footer-block"> 
        <Button variant="primary" onClick={handleRegister} disabled={isValid !== 1 || isValidPass !== 1 || clickedInstance }>Регистрация</Button>
        <img src={loadingSvg} className={`img-svg ${clickedInstance ? "clicked" : ""}`} alt="loading" />
        <span className="desktop greyed-text">Генерация временного аккаунта. Не храните здесь важную информацию.</span>
      </div>
      <div className="login-ask greyed-text">Есть аккаунт? <Button variant="skelet" onClick={handleGoToLogin}>Войти</Button></div>
      
    </main>
  </div>
  );
}
