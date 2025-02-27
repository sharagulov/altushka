// altushka/client/src/pages/PasswordPage.jsx

import ClipboardIcon from "../components/ClipboardIcon";
import '../styles/global.scss'
import '../styles/RPstyle.scss'
import '../styles/PPstyle.scss'
import { useNavigate } from 'react-router-dom';
import Button from '../components/button/button'

import React from "react";
import { useSearchParams } from "react-router-dom";

function PasswordPage() {
  const [searchParams] = useSearchParams();
  const passwordFromUrl = searchParams.get("pass");
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/users')
  }

  const getPasswordFromCookies = () => {
    const cookies = document.cookie.split("; ");
    const userCookie = cookies.find((row) => row.startsWith("user="));
    if (!userCookie) return "";
  
    try {
      const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
      return userData.generatedPassword || "";
    } catch (error) {
      console.error("Ошибка чтения куки:", error);
      return "";
    }
  };

  const password = getPasswordFromCookies();

  return (
    <main>
      <h2 className='head-name'>Почти готово</h2>
      <div className="center-block">
        <div className='middle-block'>
          <span>Ваш пароль:</span>
          <span className="password">{passwordFromUrl}</span>
          <ClipboardIcon text={password} />
        </div>
        <span className="greyed-text">Этот пароль можно потерять, ничего страшного.</span>
      </div>
        <div className='footer-block '>
        <Button onClick={handleStart} variant="primary">Войти</Button>
      </div>
    </main>
  );
}

export default PasswordPage;
