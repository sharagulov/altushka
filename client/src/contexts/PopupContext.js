import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const PopupContext = createContext();

export function PopupProvider({ children }) {
  const [isVisible, setIsVisible] = useState(false);

  const showPopup = () => {
    setIsVisible(true);
  }

  const hidePopup = () => {
    setIsVisible(false);
  };


  return (
    <PopupContext.Provider value={{ isVisible, showPopup, hidePopup }}>
      {children}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  return useContext(PopupContext);
}
