import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Contract, TimeEntry, AppSettings } from '../../../hooks/useClockifyData';
import { useMemo } from 'react';

interface ThisWeekWidgetProps {
  id: string;
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  settings: AppSettings;
  onRemove?: () => void;
  size?: { width: number; height: number };
}

export function ThisWeekWidget({
  id,
  currentContract,
  timeEntries,
  settings,
  onRemove,
  size = { width: 3, height: 2 }
}: ThisWeekWidgetProps) {
  const weeklyData = useMemo(() => {
    if (!currentContract) return { thisWeek: 0, target: 0, variance: 0 };

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const thisWeekEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    });

    const thisWeek = thisWeekEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const target = currentContract.weeklyHours;
    const variance = thisWeek - target;

    return { thisWeek, target, variance };
  }, [currentContract, timeEntries]);

  const isCompact = size.width <= 2 || size.height <= 2;
  const isLarge = size.width >= 4 && size.height >= 3;

  if (!currentContract) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-4">
        <div className="text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className={isCompact ? "text-xs" : "text-sm"}>No contract</p>
        </div>
      </div>
    );
  }

  const getVarianceColor = () => {
    if (weeklyData.variance > 2) return 'text-green-600';
    if (weeklyData.variance < -2) return 'text-red-600';
    return 'text-blue-600';
  };

  return (
    <div className="h-full flex flex-col p-4">
      {!isCompact && (
        <div className="flex items-center gap-2 mb-4">
          <Calendar className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <div>
            <h3 className={`font-medium ${isLarge ? 'text-base' : 'text-sm'}`}>This Week</h3>
            <p className="text-xs text-muted-foreground">Hours worked</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-full flex flex-col justify-center items-center text-center">
          <div className={`font-bold ${isLarge ? 'text-4xl' : isCompact ? 'text-xl' : 'text-3xl'} mb-2`}>
            {weeklyData.thisWeek.toFixed(1)}h
          </div>
          {isCompact && (
            <p className="text-xs text-muted-foreground">This Week</p>
          )}
          {!isCompact && (
            <p className={`text-sm ${getVarianceColor()}`}>
              {weeklyData.variance > 0 ? '+' : ''}{weeklyData.variance.toFixed(1)}h vs target
            </p>
          )}
          {isCompact && weeklyData.variance !== 0 && (
            <p className={`text-xs ${getVarianceColor()}`}>
              {weeklyData.variance > 0 ? '+' : ''}{weeklyData.variance.toFixed(1)}h
            </p>
          )}
        </div>
      </div>
    </div>
  );
}