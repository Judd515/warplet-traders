import React from 'react';
import { Button } from '@/components/ui/button';
import { Share, Clock, CalendarDays } from 'lucide-react';
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
    <div className="mb-6 space-y-4">
      <div className="text-sm text-indigo-200/80 mb-2 flex items-center">
        <span className="mr-2">Select timeframe</span>
        <div className="h-px flex-grow bg-indigo-500/20"></div>
      </div>
      
      <div className="flex space-x-3">
        <Button
          variant={currentTimeframe === '24h' ? 'default' : 'outline'}
          className={`rounded-xl flex-1 py-6 ${currentTimeframe === '24h' 
            ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700' 
            : 'bg-indigo-950/40 text-indigo-200 border border-indigo-800/50 hover:bg-indigo-900/60 hover:border-indigo-700/50'}`}
          onClick={() => onTimeframeChange('24h')}
        >
          <div className="flex flex-col items-center">
            <Clock className="h-5 w-5 mb-1 opacity-80" />
            <span className="font-semibold">24 Hours</span>
          </div>
        </Button>
        
        <Button
          variant={currentTimeframe === '7d' ? 'default' : 'outline'}
          className={`rounded-xl flex-1 py-6 ${currentTimeframe === '7d' 
            ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700' 
            : 'bg-indigo-950/40 text-indigo-200 border border-indigo-800/50 hover:bg-indigo-900/60 hover:border-indigo-700/50'}`}
          onClick={() => onTimeframeChange('7d')}
        >
          <div className="flex flex-col items-center">
            <CalendarDays className="h-5 w-5 mb-1 opacity-80" />
            <span className="font-semibold">7 Days</span>
          </div>
        </Button>
      </div>
      
      <div className="flex justify-end mt-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-indigo-600/30 text-white border border-indigo-500/40 hover:bg-indigo-600/50 hover:border-indigo-500/60 rounded-xl"
          onClick={onShare}
        >
          <Share className="h-4 w-4 mr-2" />
          Share Results
        </Button>
      </div>
    </div>
  );
};

export default TimeframeControls;
