import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="mt-4 bg-red-500 bg-opacity-25 p-4 rounded-lg">
      <div className="flex items-center mb-2">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        <p className="font-medium">Unable to fetch data</p>
      </div>
      <p className="text-sm mb-2">{message}</p>
      <Button 
        className="mt-2 bg-white text-[#1E3A8A] hover:bg-gray-100"
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  );
};

export default ErrorMessage;
