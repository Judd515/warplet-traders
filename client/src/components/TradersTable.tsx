import React from 'react';
import { Trader } from '@/lib/types';
import { AlertCircle, ExternalLink, ArrowUp, ArrowDown, Flame, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  
  // Helper function to truncate wallet address
  const truncateAddress = (address: string): string => {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  };
  
  // Helper to get token icon color
  const getTokenColor = (token: string | null): string => {
    if (!token) return 'bg-gray-500';
    
    const tokenColors: Record<string, string> = {
      'ETH': 'bg-blue-500',
      'BTC': 'bg-orange-500',
      'USDC': 'bg-blue-400',
      'DEGEN': 'bg-purple-500',
      'ARB': 'bg-blue-600',
      'OP': 'bg-red-500'
    };
    
    return tokenColors[token] || 'bg-gray-500';
  };
  
  // Check if we found no wallet addresses
  const noWalletsFound = traders.length === 1 && traders[0].username === "No wallets found";

  return (
    <div className="bg-indigo-950/30 rounded-xl overflow-hidden shadow-xl border border-indigo-900/50 backdrop-blur-sm">
      {/* Table Header/Title */}
      <div className="px-5 py-4 bg-indigo-900/30 border-b border-indigo-800/50 flex justify-between items-center">
        <div className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-indigo-300" />
          <h3 className="font-bold text-white">Top Traders</h3>
        </div>
        <div className="text-xs text-indigo-300">
          {timeframe === '24h' ? 'Last 24 Hours' : 'Past 7 Days'}
        </div>
      </div>
      
      {/* No Wallets Found Notice */}
      {noWalletsFound && (
        <div className="bg-indigo-950/50 text-white p-4 text-xs flex items-start gap-3 border-b border-indigo-800/30">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-indigo-400" />
          <div>
            <p className="font-medium text-indigo-200">No wallet addresses found</p>
            <p className="text-indigo-300/80 mt-1">
              We couldn't find any wallet addresses in the profiles of the accounts you follow. Try clicking Refresh again.
            </p>
          </div>
        </div>
      )}
      
      {!noWalletsFound && (
        <>
          {/* Table Content */}
          <div className="divide-y divide-indigo-900/50">
            {traders.map((trader, index) => {
              const pnlValue = timeframe === '24h' ? trader.pnl24h : trader.pnl7d;
              const pnlFormatted = formatPnL(pnlValue || 0);
              const isPositive = parseFloat(pnlValue?.toString() || '0') >= 0;
              const pnlAmount = Math.abs(parseFloat(pnlValue?.toString() || '0'));
              const isHighPerformer = pnlAmount > 50; // Consider high performance if >50% change
              
              return (
                <div 
                  key={trader.id || index}
                  className={`p-4 hover:bg-indigo-900/10 transition-colors ${index === 0 ? 'bg-indigo-900/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {/* Rank indicator */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mr-2 ${
                        index === 0 ? 'bg-indigo-600 text-white' : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* Username */}
                      <div className="font-semibold text-white">@{trader.username}</div>
                      
                      {/* High performer badge */}
                      {isHighPerformer && (
                        <div className="ml-2">
                          <Flame className={`h-4 w-4 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
                        </div>
                      )}
                    </div>
                    
                    {/* PnL indicator */}
                    <div className={`flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                      isPositive 
                        ? 'bg-green-950/30 text-green-400 border border-green-800/30' 
                        : 'bg-red-950/30 text-red-400 border border-red-800/30'
                    }`}>
                      {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      {pnlFormatted}%
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-indigo-300">
                    {/* Wallet & Token */}
                    <div className="flex space-x-2">
                      {/* Token badge */}
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-1 ${getTokenColor(trader.topToken)}`}></div>
                        <span>{trader.topToken || 'N/A'}</span>
                      </div>
                      
                      <span>•</span>
                      
                      {/* Wallet address */}
                      <div className="flex items-center">
                        <span className="font-mono">{truncateAddress(trader.walletAddress)}</span>
                        <a 
                          href={`https://basescan.org/address/${trader.walletAddress}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-indigo-400 hover:text-indigo-300"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                    
                    {/* View profile link */}
                    <a
                      href={`https://warpcast.com/${trader.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      View profile →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {noWalletsFound && (
        <div className="px-4 py-6 text-center text-indigo-300">
          <p className="text-sm">Click "Refresh" to try again, or check back later when more of the accounts you follow have their custody addresses displayed.</p>
          <Button 
            variant="outline"
            size="sm"
            className="mt-4 bg-indigo-600/40 border-indigo-500/30 text-white hover:bg-indigo-600/60"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </Button>
        </div>
      )}
    </div>
  );
};

export default TradersTable;
