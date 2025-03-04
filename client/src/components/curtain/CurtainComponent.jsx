import React from 'react';
import { useCurtain } from '@/contexts/CurtainContext';
import './curtain.scss'; // стили занавеса

export default function CurtainOverlay() {
  const { isVisible } = useCurtain();

  return (
    <div className={`curtain-overlay ${isVisible ? 'visible' : ''}`}>
      {/* Контент занавеса, можно анимацию, лого, текст, спиннер */}
      <div className="curtain-content">
        <h2>Загрузка...</h2>
      </div>
    </div>
  );
}
