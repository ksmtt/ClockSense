import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Contract, TimeEntry, AppSettings } from '../../../hooks/useClockifyData';
import { useMemo } from 'react';

interface TotalHoursWidgetProps {
  id: string;
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  settings: AppSettings;
  onRemove?: () => void;
  size?: { width: number; height: number };
}

export function TotalHoursWidget({
  id,
  currentContract,
  timeEntries,
  settings,
  onRemove,
  size = { width: 3, height: 2 }
}: TotalHoursWidgetProps) {
  const totalHours = useMemo(() => {
    if (!currentContract) return 0;

    const contractStart = new Date(currentContract.startDate);
    const contractEnd = new Date(currentContract.endDate);

    const contractEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= contractStart && entryDate <= contractEnd;
    });

    return contractEntries.reduce((sum, entry) => sum + entry.hours, 0);
  }, [currentContract, timeEntries]);

  const isCompact = size.width <= 2 || size.height <= 2;
  const isLarge = size.width >= 4 && size.height >= 3;

  if (!currentContract) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-4">
        <div className="text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className={isCompact ? "text-xs" : "text-sm"}>No contract</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {!isCompact && (
        <div className="flex items-center gap-2 mb-4">
          <Clock className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <div>
            <h3 className={`font-medium ${isLarge ? 'text-base' : 'text-sm'}`}>Total Hours</h3>
            <p className="text-xs text-muted-foreground">Contract period</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-full flex flex-col justify-center items-center text-center">
          <div className={`font-bold ${isLarge ? 'text-4xl' : isCompact ? 'text-xl' : 'text-3xl'} mb-2`}>
            {totalHours.toFixed(1)}h
          </div>
          {isCompact && (
            <p className="text-xs text-muted-foreground">Total</p>
          )}
          {!isCompact && (
            <p className="text-sm text-muted-foreground">
              Since {new Date(currentContract.startDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}