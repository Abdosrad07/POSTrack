import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-md h-16 flex items-center justify-between px-4">
      <div className="flex items-center">
        <img src="/path/to/logo.svg" alt="Logo" className="h-8" />
        <h1 className="text-xl font-bold ml-2">POSTrack</h1>
      </div>
      <div className="flex items-center">
        <div className="mr-4">User Menu</div>
        {/* User menu content here */}
      </div>
    </header>
  );
};

export default Header;
