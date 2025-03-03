import React from 'react';
import './button.scss';

export default function Button({ children, variant = 'default', onClick, ...props }) {
  return (
    <button  className={`btn ${(variant === "primary") ? `btn-${variant}` : `btn-${variant}`}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
