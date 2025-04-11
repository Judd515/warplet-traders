import React from 'react';
import { TrendingUp, Wallet } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="mb-8">
      {/* Logo and Title Section */}
      <div className="flex items-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 mr-4 border border-white/20 shadow-lg">
          <div className="relative">
            <TrendingUp className="h-8 w-8 text-white" strokeWidth={1.5} />
            <div className="absolute top-1 right-1">
              <Wallet className="h-4 w-4 text-indigo-400" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">
            TOP WARPLET
          </h1>
          <h1 className="text-2xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-200">
            TRADERS
          </h1>
        </div>
      </div>
      
      {/* Description */}
      <div className="mt-4 ml-1 text-sm text-indigo-200/70">
        <p>Tracking top traders among accounts you follow on Warpcast</p>
      </div>
    </div>
  );
};

export default Header;
