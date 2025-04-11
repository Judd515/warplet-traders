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
  
  // Check if we found no wallet addresses
  const noWalletsFound = traders.length === 1 && traders[0].username === "No wallets found";

  return (
    <div className="bg-[#1E3A8A] rounded-lg overflow-hidden shadow-lg">
      {/* No Wallets Found Notice */}
      {noWalletsFound && (
        <div className="bg-blue-900/50 text-white p-3 text-xs flex items-start gap-2 border-b border-gray-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">No wallet addresses found</p>
            <p className="text-gray-300 mt-0.5">
              We couldn't find any wallet addresses in your followers' profiles. Try clicking Refresh again.
            </p>
          </div>
        </div>
      )}
      
      {!noWalletsFound && (
        <>
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
        </>
      )}
      
      {noWalletsFound && (
        <div className="px-4 py-6 text-center text-gray-300">
          <p className="text-sm">Click "Refresh" to try again, or check back later when more of your followers have custody addresses displayed in their profiles.</p>
        </div>
      )}
    </div>
  );
};

export default TradersTable;
