import React from 'react';

const Alert = ({ type = 'info', message, onClose }) => {
  const classes = {
    info: 'bg-blue-500 text-white px-4 py-2 rounded-md',
    success: 'bg-green-500 text-white px-4 py-2 rounded-md',
    error: 'bg-red-500 text-white px-4 py-2 rounded-md',
    warning: 'bg-yellow-500 text-white px-4 py-2 rounded-md'
  };
  
  return (
    <div className={classes[type]}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} className='text-gray-800'>Close</button>}
    </div>
  );
};

export default Alert;