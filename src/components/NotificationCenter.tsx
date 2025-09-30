import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onDismissNotification: (id: string) => void;
}

export function NotificationCenter({ 
  notifications, 
  onDismissNotification 
}: NotificationCenterProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-6">
      {notifications.map((notification) => (
        <Alert 
          key={notification.id} 
          variant={notification.type === 'warning' ? 'warning' : 'default'}
          className="font-normal"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between font-normal">
            <span className="font-normal">{notification.message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismissNotification(notification.id)}
              className="normal-case font-normal"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}