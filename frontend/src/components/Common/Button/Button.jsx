import React from 'react';

const Button = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button
      className={`bg-${variant}-500 text-white px-4 py-2 rounded-md hover:bg-${variant}-700`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;