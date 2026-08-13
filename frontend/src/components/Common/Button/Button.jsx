import React from 'react';

const Button = ({ children, onClick, variant = 'primary', type = 'button', className = '', ...props }) => {
  return (
    <button
      type={type}
      className={`bg-${variant}-500 text-white px-4 py-2 rounded-md hover:bg-${variant}-700 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;