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

  return (
    <div className="min-h-screen bg-[#1E3A8A] text-white">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <Header />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Oxjudd's Top Traders</h2>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30"
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <TimeframeControls 
          currentTimeframe={timeframe}
          onTimeframeChange={handleTimeframeChange}
          onShare={handleShare}
        />
        
        {isLoading || refreshMutation.isPending ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorMessage 
            message={(error as Error)?.message || 'Something went wrong. Please try again.'} 
            onRetry={handleRetry} 
          />
        ) : traders && traders.length > 0 ? (
          <TradersTable traders={traders} timeframe={timeframe} />
        ) : (
          <div className="bg-[#1E3A8A] rounded-lg p-6 text-center">
            <p>No trader data available.</p>
            <p className="text-sm text-gray-400 mt-2 mb-4">Click the Refresh button to fetch data from your followers.</p>
            <Button 
              className="bg-white text-[#1E3A8A] hover:bg-gray-100"
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              Fetch Data
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
