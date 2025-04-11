import React from 'react';

const LoadingSkeleton: React.FC = () => {
  // Create an array of 5 elements for the skeleton rows
  const skeletonRows = Array(5).fill(null);

  return (
    <div className="bg-[#1E3A8A] rounded-lg overflow-hidden shadow-lg">
      {/* Table Headers */}
      <div className="grid grid-cols-3 px-4 py-3 border-b border-gray-600 text-sm font-semibold">
        <div>Wallet</div>
        <div>Top Traded Token</div>
        <div className="text-right">PnL</div>
      </div>

      {/* Skeleton Content */}
      <div>
        {skeletonRows.map((_, index) => (
          <div 
            key={index} 
            className={`grid grid-cols-3 px-4 py-4 items-center ${
              index < skeletonRows.length - 1 ? 'border-b border-gray-600' : ''
            }`}
          >
            <div className="h-6 w-20 rounded bg-gradient-to-r from-[#2c4a9a] via-[#254092] to-[#2c4a9a] bg-[length:200%_100%] animate-[loading_1.5s_infinite]"></div>
            <div className="h-6 w-14 rounded bg-gradient-to-r from-[#2c4a9a] via-[#254092] to-[#2c4a9a] bg-[length:200%_100%] animate-[loading_1.5s_infinite]"></div>
            <div className="h-6 w-24 rounded ml-auto bg-gradient-to-r from-[#2c4a9a] via-[#254092] to-[#2c4a9a] bg-[length:200%_100%] animate-[loading_1.5s_infinite]"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
