import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

interface ApiErrorHandlerProps {
  apiError: string | null;
  onRetry: () => void;
  className?: string;
}

export function ApiErrorHandler({ 
  apiError, 
  onRetry, 
  className = "" 
}: ApiErrorHandlerProps) {
  if (!apiError) {
    return null;
  }

  return (
    <Alert variant="destructive" className={`font-normal ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between font-normal">
        <span className="font-normal">Clockify API Error: {apiError}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="normal-case font-normal"
        >
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}