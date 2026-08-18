import React from 'react';

const Badge = ({ children, count = 0, color = 'blue' }) => {
  return (
    <span className={`bg-${color}-500 text-white px-2 py-1 rounded-md`}>{count}</span>
  );
};

export default Badge;