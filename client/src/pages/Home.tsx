import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import Header from '@/components/Header';
import TimeframeControls from '@/components/TimeframeControls';
import TradersTable from '@/components/TradersTable';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorMessage from '@/components/ErrorMessage';
import { Timeframe, Trader } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Home: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('24h');
  const { toast } = useToast();

  // Fetch traders data
  const { 
    data: traders, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery<Trader[]>({
    queryKey: [`/api/traders?timeframe=${timeframe}`],
    refetchOnWindowFocus: false,
  });

  // Refresh data mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/refresh-data', { timeframe });
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Data refreshed",
        description: `Successfully fetched the latest ${timeframe} trading data.`,
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Refresh failed",
        description: (error as Error)?.message || "Failed to fetch the latest data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  // Handle share button click
  const handleShare = () => {
    // Open Farcaster cast composer if available
    try {
      // This uses the Farcaster protocol to open the cast composer
      window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(`Check out the top Warplet traders! ${window.location.href}`)}`);
    } catch (error) {
      console.error('Error opening share dialog:', error);
    }
  };

  // Handle retry when an error occurs
  const handleRetry = () => {
    refreshMutation.reset();
    refetch();
  };

  // Fetch data on initial load and timeframe change
  useEffect(() => {
    refetch();
  }, [timeframe, refetch]);
  
  // Create ref outside of useEffect
  const hasAutoFetched = React.useRef(false);
  
  // Auto-fetch data from API on initial load - only once when component mounts
  useEffect(() => {
    if (!hasAutoFetched.current) {
      console.log('Initial load, automatically fetching trader data...');
      refreshMutation.mutate();
      hasAutoFetched.current = true;
    }
  // Include refreshMutation in dependencies
  }, [refreshMutation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-indigo-900 to-purple-900 text-white relative">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(120,50,255,0.4)_0%,rgba(0,0,0,0)_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(60,100,255,0.4)_0%,rgba(0,0,0,0)_50%)]"></div>
        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
          {Array.from({ length: 24 }).map((_, i) => (
            <div 
              key={i} 
              className="border-[0.5px] border-indigo-500/5"
            />
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-lg relative z-10">
        <Header />
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="h-8 w-1 bg-indigo-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-medium text-white">
              BASE Leaderboard
            </h2>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border border-white/20 hover:bg-white/20 rounded-xl"
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <TimeframeControls 
          currentTimeframe={timeframe}
          onTimeframeChange={handleTimeframeChange}
          onShare={handleShare}
        />
        
        {isLoading || refreshMutation.isPending ? (
          <div className="relative">
            <LoadingSkeleton />
            <div className="absolute inset-0 flex items-center justify-center bg-indigo-950/50 backdrop-blur-sm rounded-xl">
              <div className="flex flex-col items-center">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-400 mb-3" />
                <p className="text-indigo-200 text-sm">Loading trader data...</p>
              </div>
            </div>
          </div>
        ) : isError ? (
          <ErrorMessage 
            message={(error as Error)?.message || 'Something went wrong. Please try again.'} 
            onRetry={handleRetry} 
          />
        ) : traders && traders.length > 0 ? (
          <TradersTable traders={traders} timeframe={timeframe} />
        ) : (
          <div className="bg-indigo-950/30 rounded-xl p-8 text-center border border-indigo-900/50 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-indigo-900/50 flex items-center justify-center mb-4">
                <RefreshCw className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No trader data available</h3>
              <p className="text-sm text-indigo-300 mb-6">
                Click the Refresh button to analyze trading activity for accounts you follow.
                <br/>Note: We look for custody addresses in profile information.
              </p>
              <Button 
                className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl"
                onClick={handleRefresh}
                disabled={refreshMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                Fetch Data
              </Button>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-10 text-center text-indigo-400/60 text-xs">
          <p>Powered by BASE & Warpcast • Data refreshed every 5 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
