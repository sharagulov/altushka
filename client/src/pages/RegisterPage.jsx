// altushka/client/src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/RPstyle.scss'
import Button from '@/components/button/button'
import loadingSvg from '@/assets/vectors/loading.svg';

export default function RegisterPage() {
  const [username, setUsername] = useState('@');
  const [errorMessages, setErrorMessages] = useState([])
  const [isValid, setIsValid] = useState(0);
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
  
    setUsername(value);
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
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok) {
        document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=3600`; 
        setTimeout(() => {
          navigate(`/password?pass=${encodeURIComponent(data.user.generatedPassword)}`);
        }, 2000)
      } else {
        console.log(data.error || 'Ошибка регистрации');
      }
    } catch (err) {
      console.error(err);
    }

    
  };
  
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
      <h2 className='head-name'>ALTUSHKA</h2>
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
      <span className="mobile greyed-text">Генерация временного аккаунта. Не храните здесь важную информацию.</span>
      <div className="footer-block"> 
        <Button variant="primary" onClick={handleRegister} disabled={isValid !== 1 || clickedInstance }>Продолжить</Button>
        <img src={loadingSvg} className={`${clickedInstance ? "clicked" : ""}`} alt="loading" />
        <span className="desktop greyed-text">Генерация временного аккаунта. Не храните здесь важную информацию.</span>
      </div>
    </main>
  </div>
  );
}
