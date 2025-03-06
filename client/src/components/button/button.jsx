import React from 'react';
import './button.scss';
import { HiLogout } from "react-icons/hi";

export default function Button({ children, variant = 'default', text, onClick }) {
  if(variant === "block") {
    return (
      <div onClick={onClick} className='btn-block-container'>
        {children}
        <span>{text}</span>
      </div>
    );
  } else {
  return (
    <button onClick={onClick}  className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}
}
