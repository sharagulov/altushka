// altushka/client/src/pages/PasswordPage.jsx

import ClipboardIcon from "@/components/ClipboardIcon";
import '@/styles/global.scss'
import '@/styles/RPstyle.scss'
import '@/styles/PPstyle.scss'
import { useNavigate } from 'react-router-dom';
import Button from '@/components/button/button'

import React from "react";
import { useSearchParams } from "react-router-dom";

function PasswordPage() {
  const [searchParams] = useSearchParams();
  const passwordFromUrl = searchParams.get("pass");
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/users')
  }

  return (
  <div className="flex-body">

    <main>
      <h2 className='head-name'>Почти готово</h2>
      <div className="pp-center-block">
        <div className='pp-middle-block'>
          <span>Ваш пароль:</span>
          <span className="text-highlighter">{passwordFromUrl}</span>
          <ClipboardIcon text={passwordFromUrl} />
        </div>
        <span className="greyed-text">Этот пароль можно потерять, ничего страшного.</span>
      </div>
      <div style={{ justifyContent: "center" }} className='footer-block'>
        <Button onClick={handleStart} variant="primary">Войти</Button>
      </div>
    </main>
  </div>
  );
}

export default PasswordPage;
