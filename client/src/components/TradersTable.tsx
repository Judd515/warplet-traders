import React from 'react';
import { Trader } from '@/lib/types';

interface TradersTableProps {
  traders: Trader[];
  timeframe: '24h' | '7d';
}

const TradersTable: React.FC<TradersTableProps> = ({ traders, timeframe }) => {
  // Format PnL values with proper sign and decimal places
  const formatPnL = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0.00';
    
    const formattedValue = Math.abs(value).toFixed(2);
    return value >= 0 ? `+${formattedValue}` : `-${formattedValue}`;
  };

  return (
    <div className="bg-[#1E3A8A] rounded-lg overflow-hidden shadow-lg">
      {/* Table Headers */}
      <div className="grid grid-cols-3 px-4 py-3 border-b border-gray-600 text-sm font-semibold">
        <div>Wallet</div>
        <div>Top Traded Token</div>
        <div className="text-right">{timeframe} PnL</div>
      </div>

      {/* Table Content */}
      <div>
        {traders.map((trader, index) => {
          const pnlValue = timeframe === '24h' ? trader.pnl24h : trader.pnl7d;
          const pnlFormatted = formatPnL(pnlValue || 0);
          const isPositive = (pnlValue || 0) >= 0;
          
          return (
            <div 
              key={trader.id || index}
              className={`grid grid-cols-3 px-4 py-4 items-center ${
                index < traders.length - 1 ? 'border-b border-gray-600' : ''
              }`}
            >
              <div className="font-medium">@{trader.username}</div>
              <div>{trader.topToken || 'N/A'}</div>
              <div className={`text-right ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {pnlFormatted}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TradersTable;
