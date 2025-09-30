import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { Contract, TimeEntry, AppSettings } from '../../../hooks/useClockifyData';
import { useMemo } from 'react';

interface ContractTimelineWidgetProps {
  id: string;
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  settings: AppSettings;
  onRemove?: () => void;
}

export function ContractTimelineWidget({
  id,
  currentContract,
  timeEntries,
  settings,
  onRemove
}: ContractTimelineWidgetProps) {
  const timelineData = useMemo(() => {
    if (!currentContract) return null;

    const contractStart = new Date(currentContract.startDate);
    const contractEnd = new Date(currentContract.endDate);
    const now = new Date();

    // Calculate contract metrics
    const contractDays = Math.floor((contractEnd.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceStart = Math.max(0, Math.floor((now.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.floor((contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    const timeProgress = Math.min(100, (daysSinceStart / contractDays) * 100);
    
    // Calculate work metrics
    const contractEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= contractStart && entryDate <= contractEnd;
    });

    const vacationHours = (currentContract.vacationDays || 0) * 8;
    const totalHoursWorked = contractEntries.reduce((sum, entry) => sum + entry.hours, 0) + vacationHours;
    const totalContractHours = (contractDays / 7) * currentContract.weeklyHours;
    const expectedHoursToDate = (daysSinceStart / 7) * currentContract.weeklyHours;
    
    const workProgress = Math.min(100, (totalHoursWorked / totalContractHours) * 100);
    const expectedProgress = Math.min(100, (expectedHoursToDate / totalContractHours) * 100);

    // Status determination
    const isAhead = workProgress > expectedProgress + 5;
    const isBehind = workProgress < expectedProgress - 5;
    const isOnTrack = !isAhead && !isBehind;

    return {
      contractStart,
      contractEnd,
      contractDays,
      daysSinceStart,
      daysRemaining,
      timeProgress,
      workProgress,
      expectedProgress,
      totalHoursWorked,
      totalContractHours,
      expectedHoursToDate,
      isAhead,
      isBehind,
      isOnTrack,
      status: isAhead ? 'ahead' : isBehind ? 'behind' : 'on-track'
    };
  }, [currentContract, timeEntries]);

  if (!currentContract || !timelineData) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-4">
        <div className="text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No active contract</p>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (timelineData.status) {
      case 'ahead': return 'text-green-600';
      case 'behind': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusBadge = () => {
    switch (timelineData.status) {
      case 'ahead': return <Badge className="bg-green-100 text-green-800">Ahead of Schedule</Badge>;
      case 'behind': return <Badge variant="destructive">Behind Schedule</Badge>;
      default: return <Badge className="bg-blue-100 text-blue-800">On Track</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <div>
            <h3 className="font-medium">Contract Timeline</h3>
            <p className="text-xs text-muted-foreground">{currentContract.name}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Progress Section */}
      <div className="space-y-4 flex-1">
        {/* Time Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Time Progress
            </span>
            <span className="text-sm text-muted-foreground">
              {timelineData.daysSinceStart} / {timelineData.contractDays} days
            </span>
          </div>
          <Progress value={timelineData.timeProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{timelineData.contractStart.toLocaleDateString()}</span>
            <span>{timelineData.timeProgress.toFixed(1)}%</span>
            <span>{timelineData.contractEnd.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Work Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Work Progress
            </span>
            <span className="text-sm text-muted-foreground">
              {timelineData.totalHoursWorked.toFixed(1)} / {timelineData.totalContractHours.toFixed(1)}h
            </span>
          </div>
          <div className="relative">
            <Progress value={timelineData.workProgress} className="h-2" />
            {/* Expected progress indicator */}
            <div 
              className="absolute top-0 h-2 w-1 bg-red-500 opacity-70"
              style={{ left: `${timelineData.expectedProgress}%` }}
              title={`Expected: ${timelineData.expectedProgress.toFixed(1)}%`}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Started</span>
            <span className={getStatusColor()}>
              {timelineData.workProgress.toFixed(1)}% complete
            </span>
            <span>Contract end</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold">{timelineData.daysRemaining}</div>
            <div className="text-xs text-muted-foreground">Days Left</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${getStatusColor()}`}>
              {(timelineData.totalHoursWorked - timelineData.expectedHoursToDate).toFixed(1)}h
            </div>
            <div className="text-xs text-muted-foreground">
              {timelineData.status === 'ahead' ? 'Ahead' : timelineData.status === 'behind' ? 'Behind' : 'On Track'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{currentContract.weeklyHours}h</div>
            <div className="text-xs text-muted-foreground">Per Week</div>
          </div>
        </div>

        {/* Vacation Days */}
        {(currentContract.vacationDays || 0) > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Includes {currentContract.vacationDays} vacation days ({(currentContract.vacationDays * 8)}h)
          </div>
        )}
      </div>
    </div>
  );
}