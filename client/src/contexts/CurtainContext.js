import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const CurtainContext = createContext();

export function CurtainProvider({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  const location = useLocation();
  const prevLocation = useRef(location.pathname);

  const showCurtain = (duration) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(true);
    if (duration && typeof duration === 'number') {
      timeoutRef.current = setTimeout(hideCurtain, duration);
    }
  };

  const hideCurtain = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    const from = prevLocation.current;
    const to = location.pathname;

    const allowedTransitions = [
      // ["/login", "/register"],
      // ["/register", "/login"],
    ];

    const shouldShowCurtain = allowedTransitions.some(
      ([fromPath, toPath]) => from === fromPath && to === toPath
    );

    if (shouldShowCurtain) {
      showCurtain(1500);
    }

    prevLocation.current = to;
  }, [location]);

  return (
    <CurtainContext.Provider value={{ isVisible, showCurtain, hideCurtain }}>
      {children}
    </CurtainContext.Provider>
  );
}

export function useCurtain() {
  return useContext(CurtainContext);
}
