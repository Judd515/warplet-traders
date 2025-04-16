import React, { useState, useEffect } from 'react';
import { Trader } from '@/lib/types';
import { 
  AlertCircle, ExternalLink, ArrowUp, ArrowDown, Flame, Trophy, 
  Rocket, Diamond, Target, TrendingUp, Star, Medal, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface TradersTableProps {
  traders: Trader[];
  timeframe: '24h' | '7d';
}

// Define the achievement types
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const TradersTable: React.FC<TradersTableProps> = ({ traders, timeframe }) => {
  // State for tracking achievements
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  
  // Toast hook for notifications
  const { toast } = useToast();
  
  // Define possible achievements
  const achievements: Achievement[] = [
    {
      id: 'diamond-hands',
      title: 'Diamond Hands',
      description: 'Found a trader with exceptional holding skills',
      icon: <Diamond className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'rocket-moon',
      title: 'To The Moon!',
      description: 'Discovered a trader with over 90% gains',
      icon: <Rocket className="h-5 w-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'sharp-shooter',
      title: 'Sharp Shooter',
      description: 'Located a precision trader with consistent performance',
      icon: <Target className="h-5 w-5" />,
      color: 'bg-indigo-500'
    },
    {
      id: 'trend-master',
      title: 'Trend Master',
      description: 'Found someone who trades the hottest tokens',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-purple-500'
    },
    {
      id: 'whale-watcher',
      title: 'Whale Watcher',
      description: 'Spotted a significant player in the market',
      icon: <Star className="h-5 w-5" />,
      color: 'bg-yellow-500'
    }
  ];
  
  // Check for achievements when data changes
  useEffect(() => {
    if (!traders || traders.length === 0 || traders[0].username === "No wallets found") return;
    
    // Wait a bit to stagger the notifications
    setTimeout(() => {
      checkForAchievements();
    }, 500);
  }, [traders, timeframe]);
  
  // Function to check which achievements have been unlocked
  const checkForAchievements = () => {
    const newAchievements: Achievement[] = [];
    
    // Find top earner for "To The Moon" achievement
    const topEarner = [...traders].sort((a, b) => {
      const aEarnings = parseFloat(timeframe === '24h' ? a.earnings24h?.toString() || '0' : a.earnings7d?.toString() || '0');
      const bEarnings = parseFloat(timeframe === '24h' ? b.earnings24h?.toString() || '0' : b.earnings7d?.toString() || '0');
      return bEarnings - aEarnings;
    })[0];
    
    if (topEarner) {
      const earnings = parseFloat(timeframe === '24h' ? topEarner.earnings24h?.toString() || '0' : topEarner.earnings7d?.toString() || '0');
      
      // To The Moon achievement (high earning trader)
      if (earnings > 3000) { // Over $3000 in earnings
        newAchievements.push(achievements.find(a => a.id === 'rocket-moon')!);
      }
      
      // Diamond Hands (holding blue chip tokens)
      if (earnings > 1000 && ['ETH', 'BTC'].includes(topEarner.topToken || '')) {
        newAchievements.push(achievements.find(a => a.id === 'diamond-hands')!);
      }
      
      // Trend Master (trading hot tokens like ARB or DEGEN)
      if (['ARB', 'DEGEN'].includes(topEarner.topToken || '')) {
        newAchievements.push(achievements.find(a => a.id === 'trend-master')!);
      }
    }
    
    // Check traders for consistency (Sharpshooter) - traders with moderate but stable earnings
    if (traders.some(t => {
      const earnings = parseFloat(timeframe === '24h' ? t.earnings24h?.toString() || '0' : t.earnings7d?.toString() || '0');
      return earnings > 500 && earnings < 1500; // Moderate earnings range
    })) {
      newAchievements.push(achievements.find(a => a.id === 'sharp-shooter')!);
    }
    
    // Randomly unlock the whale-watcher achievement (for demonstration)
    if (Math.random() > 0.7) {
      newAchievements.push(achievements.find(a => a.id === 'whale-watcher')!);
    }
    
    // Only show one achievement at a time to avoid overwhelming the user
    if (newAchievements.length > 0) {
      // Get already unlocked achievement IDs for easier lookup
      const unlockedIds = new Set(unlockedAchievements.map(a => a.id));
      
      // Filter to get only new achievements not already unlocked
      const notYetUnlocked = newAchievements.filter(a => !unlockedIds.has(a.id));
      
      if (notYetUnlocked.length > 0) {
        // Pick a random achievement from the newly unlocked ones
        const achievement = notYetUnlocked[Math.floor(Math.random() * notYetUnlocked.length)];
        
        // Add to unlocked achievements
        setUnlockedAchievements(prev => [...prev, achievement]);
        setCurrentAchievement(achievement);
        setShowAchievement(true);
        
        // Hide the achievement after 3 seconds
        setTimeout(() => {
          setShowAchievement(false);
        }, 3000);
        
        // Show a toast notification
        toast({
          title: `Achievement Unlocked: ${achievement.title}`,
          description: achievement.description,
          duration: 3000,
        });
      }
    }
  };
  // Format earnings values with dollar sign
  const formatEarnings = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return '$0';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `$${numValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };
  
  // Format volume values with dollar sign and potentially K/M abbreviations
  const formatVolume = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return '$0';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(1)}M`;
    } else if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(1)}K`;
    } else {
      return `$${numValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
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
    <div className="bg-indigo-950/30 rounded-xl overflow-hidden shadow-xl border border-indigo-900/50 backdrop-blur-sm relative">
      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievement && currentAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="absolute top-12 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="flex flex-col items-center">
              <motion.div 
                className={`rounded-full p-3 ${currentAchievement.color} shadow-lg mb-2`}
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ 
                  type: 'spring', 
                  bounce: 0.6, 
                  delay: 0.1 
                }}
              >
                {currentAchievement.icon}
              </motion.div>
              
              <motion.div 
                className="bg-white text-gray-900 rounded-xl px-4 py-3 shadow-xl text-center min-w-[200px]"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="font-bold text-sm">Achievement Unlocked!</h4>
                <p className="font-semibold text-xs mt-1">{currentAchievement.title}</p>
                <p className="text-xs text-gray-600 mt-1">{currentAchievement.description}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Achievement Badges Display */}
      {unlockedAchievements.length > 0 && (
        <div className="absolute top-4 right-4 flex -space-x-2">
          {/* Filter out duplicates and ensure unique keys */}
          {Array.from(new Map(unlockedAchievements.map(item => [item.id, item])).values())
            .slice(0, 3)
            .map((achievement, index) => (
              <motion.div
                key={`achievement-${achievement.id}-${index}`}
                className={`rounded-full p-1.5 ${achievement.color} shadow-md border border-white/30`}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring',
                  bounce: 0.5,
                  delay: index * 0.1
                }}
                title={achievement.title}
              >
                {achievement.icon}
              </motion.div>
            ))}
          
          {/* Show the +X more achievements indicator */}
          {(() => {
            // Get unique achievements count
            const uniqueCount = new Map(unlockedAchievements.map(item => [item.id, item])).size;
            if (uniqueCount > 3) {
              return (
                <motion.div
                  className="rounded-full p-1.5 bg-indigo-500 shadow-md border border-white/30 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  title="More achievements"
                >
                  <div className="text-white text-xs font-bold">+{uniqueCount - 3}</div>
                </motion.div>
              );
            }
            return null;
          })()}
        </div>
      )}
      
      {/* Table Header/Title */}
      <div className="px-5 py-4 bg-indigo-900/30 border-b border-indigo-800/50 flex justify-between items-center">
        <div className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-indigo-300" />
          <h3 className="font-bold text-white">Top Earners</h3>
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
              const earnings = timeframe === '24h' ? trader.earnings24h : trader.earnings7d;
              const volume = timeframe === '24h' ? trader.volume24h : trader.volume7d;
              
              const earningsFormatted = formatEarnings(earnings || 0);
              const volumeFormatted = formatVolume(volume || 0);
              
              // Consider high performer if earnings are above $2000
              const isHighPerformer = (earnings || 0) > 2000;
              
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
                          <Flame className="h-4 w-4 text-green-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Earnings indicator */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center rounded-full px-3 py-1 text-sm font-medium bg-green-950/30 text-green-400 border border-green-800/30">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        {earningsFormatted}
                      </div>
                      <div className="text-xs text-indigo-400 mt-1">
                        {volumeFormatted} volume
                      </div>
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
                    
                    {/* View profile & Achievement links */}
                    <div className="flex items-center space-x-2">
                      <div 
                        className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        onClick={() => {
                          // Trigger a random achievement when clicking on this trader
                          const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)];
                          if (!unlockedAchievements.some(a => a.id === randomAchievement.id)) {
                            setUnlockedAchievements(prev => [...prev, randomAchievement]);
                            setCurrentAchievement(randomAchievement);
                            setShowAchievement(true);
                            setTimeout(() => {
                              setShowAchievement(false);
                            }, 3000);
                          }
                        }}
                      >
                        <Trophy className="h-3 w-3 inline mr-1" />
                        <span>Unlock</span>
                      </div>
                      <span className="text-indigo-700">•</span>
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
