// altushka/client/src/pages/RegisterPage.jsx
import React, { useEffect, useState, version } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.scss'
import '../styles/RPstyle.scss'
import Button from '../components/button/button'

export default function RegisterPage() {
  const [username, setUsername] = useState('@');
  const [password, setPassword] = useState('');
  const [errorMessages, setErrorMessages] = useState([])
  const [isValid, setIsValid] = useState(0);
  const navigate = useNavigate();

  const usernameRegex = /^[1-9a-zA-Z_]+$/;
  const onlyUnderscoresRegex = /^_+$/;


  
  const handleUsernameChange = (e) => {
    let value = e.target.value.trim();
    let messages = ["Слишком короткое", "Слишком длинное", "Некорректные символы", "Серьезно?"];
  
    if (!value.startsWith('@')) {
      value = '@' + value.replace(/^@+/, '');
    }
  
    let newErrors = [];
  
    if (value.length < 6 && !onlyUnderscoresRegex.test(value.slice(1))) {
      newErrors.push(messages[0]); // "Слишком короткое" только если есть буквы/цифры
    }
  
    if (value.length > 21) {
      newErrors.push(messages[1]);
    }
  
    if (!usernameRegex.test(value.slice(1))) {
      newErrors.push(messages[2]);
    }
  
    if (onlyUnderscoresRegex.test(value.slice(1))) {
      newErrors = [messages[3]]; // Если только `_`, удаляем другие ошибки и показываем "Серьезно?"
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
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        // Сохраняем user в localStorage
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('username', data.user.username);
        navigate('/users');
      } else {
        alert(data.error || 'Ошибка регистрации');
      }
    } catch (err) {
      console.error(err);
      alert('Сетевая ошибка');
    }
  };

  return (
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
      {/* <div>
        <label>Пароль:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div> */}
      <div className="footer-block"> 
        <Button disa variant="primary" onClick={handleRegister} disabled={isValid !== 1}>Войти</Button>
        <span className="greyed-text">Генерация временного аккаунта. Не храните здесь важную информацию.</span>
      </div>
    </main>
  );
}
