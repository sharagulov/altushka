import React from 'react';
import './button.scss';
import { HiLogout } from "react-icons/hi";

export default function Button({ highlight, color, children, variant = 'default', text, onClick, disabled }) {
  if(variant === "block") {
    return (
      <div onClick={onClick} className={`btn-block-container disabled-${disabled} ${color} highlight-${highlight}`}>
        {children}
        <span>{text}</span>
      </div>
    );
  } else {
  return (
    <button disabled={disabled} onClick={onClick}  className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}
}
