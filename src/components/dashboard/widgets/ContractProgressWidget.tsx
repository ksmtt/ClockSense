import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Contract, TimeEntry, AppSettings } from '../../../hooks/useClockifyData';
import { useMemo } from 'react';

interface ContractProgressWidgetProps {
  id: string;
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  settings: AppSettings;
  onRemove?: () => void;
  size?: { width: number; height: number };
}

export function ContractProgressWidget({
  id,
  currentContract,
  timeEntries,
  settings,
  onRemove,
  size = { width: 3, height: 2 }
}: ContractProgressWidgetProps) {
  const progressData = useMemo(() => {
    if (!currentContract) return { progress: 0, daysRemaining: 0 };

    const contractStart = new Date(currentContract.startDate);
    const contractEnd = new Date(currentContract.endDate);
    const now = new Date();

    const totalDays = Math.ceil((contractEnd.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.max(0, Math.ceil((now.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.ceil((contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    const progress = Math.min(100, (daysPassed / totalDays) * 100);

    return { progress, daysRemaining };
  }, [currentContract]);

  const isCompact = size.width <= 2 || size.height <= 2;
  const isLarge = size.width >= 4 && size.height >= 3;

  if (!currentContract) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-4">
        <div className="text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className={isCompact ? "text-xs" : "text-sm"}>No contract</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {!isCompact && (
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <div>
            <h3 className={`font-medium ${isLarge ? 'text-base' : 'text-sm'}`}>Contract Progress</h3>
            <p className="text-xs text-muted-foreground">Time remaining</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-full flex flex-col justify-center items-center text-center space-y-2">
          <div className={`font-bold ${isLarge ? 'text-4xl' : isCompact ? 'text-xl' : 'text-3xl'}`}>
            {progressData.progress.toFixed(1)}%
          </div>
          {!isCompact && (
            <Progress value={progressData.progress} className="h-2 w-full max-w-48" />
          )}
          {isCompact ? (
            <p className="text-xs text-muted-foreground">
              {progressData.daysRemaining}d left
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {progressData.daysRemaining} days remaining
            </p>
          )}
        </div>
      </div>
    </div>
  );
}