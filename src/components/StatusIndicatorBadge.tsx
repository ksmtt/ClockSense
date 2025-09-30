import { Clock } from 'lucide-react';
import { Badge } from './ui/badge';

interface Contract {
  id: string;
  name: string;
  weeklyHours: number;
}

interface StatusIndicatorBadgeProps {
  currentContract?: Contract;
}

export function StatusIndicatorBadge({ currentContract }: StatusIndicatorBadgeProps) {
  if (!currentContract) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="flex items-center gap-1 font-normal normal-case">
        <Clock className="w-3 h-3" />
        {currentContract.weeklyHours}h/week
      </Badge>
      <Badge variant="outline" className="font-normal normal-case">
        {currentContract.name}
      </Badge>
    </div>
  );
}