import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import Header from '@/components/Header';
import TimeframeControls from '@/components/TimeframeControls';
import TradersTable from '@/components/TradersTable';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorMessage from '@/components/ErrorMessage';
import { Timeframe, Trader } from '@/lib/types';

const Home: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('24h');

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
    },
  });

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
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
        <h2 className="text-xl mb-6 font-medium">Oxjudd's Top Traders</h2>
        
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
            <Button 
              className="mt-4 bg-white text-[#1E3A8A] hover:bg-gray-100"
              onClick={handleRetry}
            >
              Refresh Data
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

// Import Button component to avoid TypeScript error
import { Button } from '@/components/ui/button';
