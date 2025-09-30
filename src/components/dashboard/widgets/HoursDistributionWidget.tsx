import { PieChart as PieChartIcon } from 'lucide-react';
import { ChartContainer, ChartTooltip } from '../../ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { Contract, TimeEntry } from '../../../hooks/useClockifyData';
import { useMemo } from 'react';
import { CHART_COLORS, STANDARD_CHART_CONFIG } from '../../../constants/chartColors';

interface HoursDistributionWidgetProps {
  id: string;
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  isDragging?: boolean;
  size?: 'compact' | 'medium' | 'large' | { width: number; height: number };
  onSettings?: () => void;
  onRemove?: () => void;
  onResize?: (size: 'compact' | 'medium' | 'large') => void;
  dragHandleProps?: any;
  showLegend?: boolean;
}

export function HoursDistributionWidget({
  id,
  currentContract,
  timeEntries,
  isDragging = false,
  size = 'medium',
  onSettings,
  onRemove,
  onResize,
  dragHandleProps,
  showLegend = true
}: HoursDistributionWidgetProps) {
  
  // Determine dimensions based on size
  const dimensions = typeof size === 'object' ? size : { width: 4, height: 4 };
  const isCompact = dimensions.width <= 3 || dimensions.height <= 3;
  const isLarge = dimensions.width >= 6 || dimensions.height >= 5;
  const { progressData, totalHoursWorked, expectedHoursToDate } = useMemo(() => {
    if (!currentContract) return { progressData: [], totalHoursWorked: 0, expectedHoursToDate: 0 };

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

    const isOvertime = totalHoursWorked > expectedHoursToDate;
    const isSignificantOvertime = totalHoursWorked > expectedHoursToDate * 1.2;
    const isOnTrack = Math.abs(totalHoursWorked - expectedHoursToDate) <= 2;
    
    const progressData = [
      { 
        name: 'Hours Worked', 
        value: totalHoursWorked,
        color: isSignificantOvertime ? 'var(--chart-5)' : isOvertime ? 'var(--chart-3)' : isOnTrack ? 'var(--chart-2)' : 'var(--chart-4)',
        gradientId: isSignificantOvertime ? 'gradient5' : isOvertime ? 'gradient3' : isOnTrack ? 'gradient2' : 'gradient4',
        percentage: totalHoursWorked / Math.max(expectedHoursToDate, totalHoursWorked) * 100
      },
      { 
        name: isOvertime ? 'Overtime' : 'Remaining', 
        value: Math.abs(expectedHoursToDate - totalHoursWorked),
        color: isOvertime ? 'var(--chart-6)' : 'var(--chart-7)',
        gradientId: isOvertime ? 'gradient6' : 'gradient7',
        percentage: Math.abs(expectedHoursToDate - totalHoursWorked) / Math.max(expectedHoursToDate, totalHoursWorked) * 100
      }
    ].filter(item => item.value > 0);

    return { progressData, totalHoursWorked, expectedHoursToDate };
  }, [currentContract, timeEntries]);

  if (!currentContract) {
    return (
      <div className="h-full flex flex-col p-4">
        {!isCompact && (
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4" />
            <div>
              <h3 className="font-medium">Hours Distribution</h3>
              <p className="text-xs text-muted-foreground">Performance vs expected hours</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-center flex-1 text-muted-foreground">
          <div className="text-center">
            <PieChartIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className={isCompact ? "text-xs" : "text-sm"}>No active contract</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate responsive sizing based on widget dimensions
  const outerRadius = Math.min(dimensions.width * 8, dimensions.height * 8, isCompact ? 40 : isLarge ? 80 : 60);
  const innerRadius = outerRadius * 0.5;

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      {!isCompact && (
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <div>
            <h3 className={`font-medium ${isLarge ? 'text-base' : 'text-sm'}`}>Hours Distribution</h3>
            <p className="text-xs text-muted-foreground">Performance vs Expected Hours</p>
          </div>
        </div>
      )}

      {isCompact && (
        <div className="flex items-center gap-2 mb-2">
          <PieChartIcon className="w-3 h-3" />
          <h3 className="text-xs font-medium">Distribution</h3>
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-0">
        <ChartContainer
          config={STANDARD_CHART_CONFIG}
          className="flex-1 min-h-0"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {/* Enhanced vibrant gradients for pie chart */}
                <linearGradient id="gradient2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--gradient-2-start)" stopOpacity={1} />
                  <stop offset="50%" stopColor="var(--gradient-2-mid)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--gradient-2-end)" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="gradient3" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--gradient-3-start)" stopOpacity={1} />
                  <stop offset="50%" stopColor="var(--gradient-3-mid)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--gradient-3-end)" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="gradient4" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--gradient-4-start)" stopOpacity={1} />
                  <stop offset="50%" stopColor="var(--gradient-4-mid)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--gradient-4-end)" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="gradient5" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--gradient-5-start)" stopOpacity={1} />
                  <stop offset="50%" stopColor="var(--gradient-5-mid)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--gradient-5-end)" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="gradient6" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--chart-6)" stopOpacity={1} />
                  <stop offset="50%" stopColor="var(--chart-6-light)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--chart-6)" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="gradient7" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--chart-7)" stopOpacity={1} />
                  <stop offset="50%" stopColor="var(--chart-7-light)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--chart-7)" stopOpacity={0.7} />
                </linearGradient>
                
                {/* Glowing filter for pie chart */}
                <filter id="pieGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <Pie
                data={progressData}
                cx="50%"
                cy="50%"
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                paddingAngle={2}
                dataKey="value"
                stroke="hsl(var(--background))"
                strokeWidth={3}
                filter="url(#pieGlow)"
              >
                {progressData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#${entry.gradientId})`}
                  />
                ))}
              </Pie>
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percentage = ((data.value / progressData.reduce((sum: number, item: any) => sum + item.value, 0)) * 100).toFixed(1);
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg backdrop-blur-sm">
                        <p className="font-medium">{data.name}</p>
                        <div className="space-y-1 mt-2">
                          <p className="text-sm font-medium">{data.value.toFixed(1)}h</p>
                          <p className="text-xs text-muted-foreground">{percentage}% of total</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Enhanced Legend */}
        {showLegend && !isCompact && (
          <div className="flex justify-center gap-6 mt-2">
            {progressData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded shadow-sm" 
                  style={{ 
                    backgroundColor: item.color,
                    boxShadow: `0 0 6px ${item.color}50`
                  }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}