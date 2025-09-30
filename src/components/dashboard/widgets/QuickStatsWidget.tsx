import { Clock, TrendingUp, Target, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';

import { Contract, TimeEntry } from '../../../hooks/useClockifyData';

interface QuickStatsWidgetProps {
  id: string;
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  isDragging?: boolean;
  size?: 'compact' | 'medium' | 'large';
  onSettings?: () => void;
  onRemove?: () => void;
  onResize?: (size: 'compact' | 'medium' | 'large') => void;
  dragHandleProps?: any;
  showStats?: {
    totalHours: boolean;
    thisWeek: boolean;
    contractProgress: boolean;
    overtime: boolean;
  };
}

export function QuickStatsWidget({
  id,
  currentContract,
  timeEntries,
  isDragging = false,
  size = 'medium',
  onSettings,
  onRemove,
  onResize,
  dragHandleProps,
  showStats = {
    totalHours: true,
    thisWeek: true,
    contractProgress: true,
    overtime: true
  }
}: QuickStatsWidgetProps) {
  if (!currentContract) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4" />
          <div>
            <h3 className="font-normal">Quick Stats</h3>
            <p className="text-caption text-muted-foreground font-normal">Contract overview at a glance</p>
          </div>
        </div>
        <div className="flex items-center justify-center flex-1 text-muted-foreground font-normal">
          No active contract
        </div>
      </div>
    );
  }

  const contractStart = new Date(currentContract.startDate);
  const contractEnd = new Date(currentContract.endDate);
  const now = new Date();

  // Filter time entries for current contract period
  const contractEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= contractStart && entryDate <= contractEnd;
  });

  // Calculate totals
  const vacationHours = (currentContract.vacationDays || 0) * 8;
  const totalHoursWorked = contractEntries.reduce((sum, entry) => sum + entry.hours, 0) + vacationHours;
  
  // Calculate expected hours up to now
  const daysSinceStart = Math.max(0, Math.floor((now.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24)));
  const weeksSinceStart = daysSinceStart / 7;
  const expectedHoursToDate = weeksSinceStart * currentContract.weeklyHours;

  // Contract progress
  const contractDays = Math.floor((contractEnd.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24));
  const contractProgress = Math.min(100, (daysSinceStart / contractDays) * 100);

  // This week's data
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + 1);
  thisWeekStart.setHours(0, 0, 0, 0);

  const thisWeekEntries = contractEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= thisWeekStart;
  });
  const thisWeekHours = thisWeekEntries.reduce((sum, entry) => sum + entry.hours, 0);

  const overtimeHours = totalHoursWorked - expectedHoursToDate;

  const isCompact = size === 'compact';
  const statsToShow = Object.entries(showStats).filter(([_, show]) => show);
  const visibleStats = statsToShow.slice(0, isCompact ? 2 : 4);

  const stats = [
    {
      key: 'totalHours',
      title: 'Total Hours',
      value: `${totalHoursWorked}h`,
      subtitle: `${expectedHoursToDate.toFixed(1)}h expected to date`,
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      extra: (currentContract.vacationDays || 0) > 0 && (
        <p className="text-caption text-muted-foreground font-normal">
          +{(currentContract.vacationDays * 8)}h vacation ({currentContract.vacationDays} days)
        </p>
      )
    },
    {
      key: 'thisWeek',
      title: 'This Week',
      value: `${thisWeekHours}h`,
      subtitle: `${currentContract.weeklyHours}h target`,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />
    },
    {
      key: 'contractProgress',
      title: 'Contract Progress',
      value: `${contractProgress.toFixed(1)}%`,
      subtitle: null,
      icon: <Target className="h-4 w-4 text-muted-foreground" />,
      extra: <Progress value={contractProgress} className="mt-2" />
    },
    {
      key: 'overtime',
      title: 'Overtime/Undertime',
      value: `${overtimeHours > 0 ? '+' : ''}${overtimeHours.toFixed(1)}h`,
      subtitle: null,
      icon: <Timer className="h-4 w-4 text-muted-foreground" />,
      extra: (
        <Badge variant={overtimeHours > 0 ? 'default' : 'secondary'} className="mt-2 font-normal normal-case">
          {overtimeHours > 0 ? 'Overtime' : 'Undertime'}
        </Badge>
      )
    }
  ];

  const displayStats = stats.filter(stat => 
    visibleStats.some(([key]) => key === stat.key)
  );

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4" />
        <div>
          <h3 className="font-medium">Quick Stats</h3>
          <p className="text-xs text-muted-foreground">Contract overview at a glance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-3 flex-1 ${
        isCompact 
          ? 'grid-cols-1 sm:grid-cols-2' 
          : size === 'large' 
            ? 'grid-cols-2 lg:grid-cols-4' 
            : 'grid-cols-1 sm:grid-cols-2'
      }`}>
        {displayStats.map((stat) => (
          <Card key={stat.key} className="border-0 shadow-none bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-normal">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-normal">{stat.value}</div>
              {stat.subtitle && (
                <p className="text-caption text-muted-foreground font-normal">{stat.subtitle}</p>
              )}
              {stat.extra}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}