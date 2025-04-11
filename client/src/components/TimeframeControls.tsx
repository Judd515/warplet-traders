import React from 'react';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import { Timeframe } from '@/lib/types';

interface TimeframeControlsProps {
  currentTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  onShare: () => void;
}

const TimeframeControls: React.FC<TimeframeControlsProps> = ({
  currentTimeframe,
  onTimeframeChange,
  onShare
}) => {
  return (
    <div className="flex mb-6 space-x-2">
      <Button
        variant={currentTimeframe === '24h' ? 'default' : 'outline'}
        className={currentTimeframe === '24h' 
          ? 'bg-white text-[#1E3A8A] hover:bg-gray-100 hover:text-[#1E3A8A]' 
          : 'bg-white/20 text-white hover:bg-white/30'}
        onClick={() => onTimeframeChange('24h')}
      >
        24h
      </Button>
      
      <Button
        variant={currentTimeframe === '7d' ? 'default' : 'outline'}
        className={currentTimeframe === '7d' 
          ? 'bg-white text-[#1E3A8A] hover:bg-gray-100 hover:text-[#1E3A8A]' 
          : 'bg-white/20 text-white hover:bg-white/30'}
        onClick={() => onTimeframeChange('7d')}
      >
        7d
      </Button>
      
      <div className="flex-grow"></div>
      
      <Button
        variant="outline"
        className="bg-white/20 text-white hover:bg-white/30"
        onClick={onShare}
      >
        <Share className="h-4 w-4 mr-1" />
        Share
      </Button>
    </div>
  );
};

export default TimeframeControls;
