import React, { useEffect, useState } from 'react';
import { useCurtain } from '@/contexts/CurtainContext';
import './curtain.scss';
import '@/styles/RPstyle.scss';

export default function CurtainOverlay() {
  const { isVisible } = useCurtain();


  const hints = [
    "Был(а) недавно",
    "Был(а) давно",
    "Сейчас она пересматривает ваш чат",
    "Быстро с ней пройдет только лето",
    "На самом деле у нее нет парня",
    "Кофе без сиги — просто какао",
    "Среднее время ответа: декада лет",
    "Помнишь, как вы встретились? Никто не помнит",
    "Целуй, пока не исчезла",
    "Альтушка сказала «ладно» — ты делаешь что-то не так",
    "Не пытайся спорить",
    "Случайное грехопадение",
    "Подик, вкус «черника»",
    "Кается, грешила",
  ];

  let shuffledHints = [...hints].sort(() => 0.5 - Math.random());
  let hintIndex = 0;

const getRandomHint = () => {
  if (hintIndex >= shuffledHints.length) {
    shuffledHints = [...hints].sort(() => 0.5 - Math.random());
    hintIndex = 0;
  }
  return shuffledHints[hintIndex++];
};
  const [randomHint, setRandomHint] = useState(getRandomHint());

  useEffect(() => {
    if (isVisible) {
      setRandomHint(getRandomHint());
    }
  }, [isVisible]);
  

  return (
    <div className={`curtain-overlay ${isVisible ? 'visible' : ''}`}>
      {/* Контент занавеса */}
      <div className="curtain-content">
        <div className='page-logo '>
          <img src="/nbg_logo192.png" alt="altushka logo" />
        </div>
        <div className='skeleton curtain-loading'/>
        <span className='super-greyed-span-text'>{randomHint}</span>
      </div>
    </div>
  );
}
