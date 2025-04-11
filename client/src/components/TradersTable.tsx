import React from 'react';
import { Trader } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

interface TradersTableProps {
  traders: Trader[];
  timeframe: '24h' | '7d';
}

const TradersTable: React.FC<TradersTableProps> = ({ traders, timeframe }) => {
  // Format PnL values with proper sign and decimal places
  const formatPnL = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return '0.00';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const formattedValue = Math.abs(numValue).toFixed(2);
    return numValue >= 0 ? `+${formattedValue}` : `-${formattedValue}`;
  };
  
  // Check if these are known traders (fallback data) or actual followers
  const knownTraders = ['dwr', 'elonisrael', 'stkdeth', 'treycoin', 'dingaling'];
  const isUsingFallbackData = traders.some(trader => 
    knownTraders.includes(trader.username)
  );

  return (
    <div className="bg-[#1E3A8A] rounded-lg overflow-hidden shadow-lg">
      {/* Fallback Data Notice */}
      {isUsingFallbackData && (
        <div className="bg-blue-900/50 text-white p-3 text-xs flex items-start gap-2 border-b border-gray-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Using known BASE traders</p>
            <p className="text-gray-300 mt-0.5">
              No wallet addresses were found in your followers' profiles, so we're showing known active traders on BASE.
            </p>
          </div>
        </div>
      )}
      
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
          const isPositive = parseFloat(pnlFormatted) >= 0;
          
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
