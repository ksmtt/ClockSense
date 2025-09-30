import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Contract, TimeEntry, AppSettings } from '../../../hooks/useClockifyData';
import { useMemo } from 'react';

interface OvertimeWidgetProps {
  id: string;
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  settings: AppSettings;
  onRemove?: () => void;
  size?: { width: number; height: number };
}

export function OvertimeWidget({
  id,
  currentContract,
  timeEntries,
  settings,
  onRemove,
  size = { width: 3, height: 2 }
}: OvertimeWidgetProps) {
  const overtimeData = useMemo(() => {
    if (!currentContract) return { overtime: 0, isOvertime: false };

    const contractStart = new Date(currentContract.startDate);
    const contractEnd = new Date(currentContract.endDate);
    const now = new Date();

    // Calculate expected hours up to now
    const daysSinceStart = Math.max(0, Math.ceil((now.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24)));
    const weeksSinceStart = daysSinceStart / 7;
    const expectedHours = weeksSinceStart * currentContract.weeklyHours;

    // Calculate actual hours
    const contractEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= contractStart && entryDate <= now;
    });

    const actualHours = contractEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const overtime = actualHours - expectedHours;
    const isOvertime = overtime > 0;

    return { overtime, isOvertime };
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

  const getOvertimeColor = () => {
    if (Math.abs(overtimeData.overtime) < 1) return 'text-blue-600';
    return overtimeData.isOvertime ? 'text-green-600' : 'text-red-600';
  };

  const getOvertimeText = () => {
    if (Math.abs(overtimeData.overtime) < 1) return 'On Track';
    return overtimeData.isOvertime ? 'Overtime' : 'Undertime';
  };

  return (
    <div className="h-full flex flex-col p-4">
      {!isCompact && (
        <div className="flex items-center gap-2 mb-4">
          <Clock className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <div>
            <h3 className={`font-medium ${isLarge ? 'text-base' : 'text-sm'}`}>Overtime</h3>
            <p className="text-xs text-muted-foreground">vs expected</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-full flex flex-col justify-center items-center text-center">
          <div className={`font-bold ${isLarge ? 'text-4xl' : isCompact ? 'text-xl' : 'text-3xl'} ${getOvertimeColor()} mb-2`}>
            {overtimeData.overtime > 0 ? '+' : ''}{overtimeData.overtime.toFixed(1)}h
          </div>
          {isCompact ? (
            <p className="text-xs text-muted-foreground">Overtime</p>
          ) : (
            <p className={`text-sm ${getOvertimeColor()}`}>
              {getOvertimeText()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}