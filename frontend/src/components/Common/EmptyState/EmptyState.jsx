import React from 'react';

const EmptyState = ({ message = 'No data available', icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <p className="text-lg">{message}</p>
    </div>
  );
};

export default EmptyState;