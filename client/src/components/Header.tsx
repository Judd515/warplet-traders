import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="flex items-center mb-6">
      <div className="bg-white rounded-lg p-2 mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1E3A8A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12z"></path>
          <line x1="4" y1="22" x2="4" y2="15"></line>
          <path d="M9 9l5 3-5 3V9z"></path>
        </svg>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-wide">TOP WARPLET</h1>
        <h1 className="text-2xl font-bold tracking-wide">TRADERS</h1>
      </div>
    </div>
  );
};

export default Header;
