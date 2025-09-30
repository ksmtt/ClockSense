import { BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip } from '../../ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

import { Contract, TimeEntry, AppSettings } from '../../../hooks/useClockifyData';
import { useMemo } from 'react';
import { CHART_COLORS, getPerformanceColor, STANDARD_CHART_CONFIG } from '../../../constants/chartColors';

interface DailyHoursWidgetProps {
  id: string;
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  settings: AppSettings;
  isDragging?: boolean;
  size?: 'compact' | 'medium' | 'large' | { width: number; height: number };
  onSettings?: () => void;
  onRemove?: () => void;
  onResize?: (size: 'compact' | 'medium' | 'large') => void;
  dragHandleProps?: any;
  timeRange?: number; // days to show (default 7)
  showWeekends?: boolean;
}

export function DailyHoursWidget({
  id,
  currentContract,
  timeEntries,
  settings,
  isDragging = false,
  size = 'medium',
  onSettings,
  onRemove,
  onResize,
  dragHandleProps,
  timeRange = 7,
  showWeekends = true
}: DailyHoursWidgetProps) {
  
  // Determine dimensions based on size
  const dimensions = typeof size === 'object' ? size : { width: 8, height: 4 };
  const isCompact = dimensions.width <= 4 || dimensions.height <= 3;
  const isLarge = dimensions.width >= 10 || dimensions.height >= 5;
  const chartData = useMemo(() => {
    if (!currentContract) return [];

    const contractStart = new Date(currentContract.startDate);
    const contractEnd = new Date(currentContract.endDate);

    // Filter time entries for current contract period
    const contractEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= contractStart && entryDate <= contractEnd;
    });

    const data = [];
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      if (!showWeekends && isWeekend) continue;

      const dayEntry = contractEntries.find(entry => entry.date === dateStr);
      const actualHours = dayEntry?.hours || 0;
      const expectedDaily = currentContract.weeklyHours / 7;
      
      // Use uniform color system
      const performance = getPerformanceColor(actualHours, expectedDaily);
      
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        actual: actualHours,
        expected: expectedDaily,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        performanceColor: performance.color,
        performanceGlow: performance.light,
        performanceStatus: performance.status,
        isWeekend
      });
    }

    return data;
  }, [currentContract, timeEntries, timeRange, showWeekends]);

  if (!currentContract) {
    return (
      <div className="h-full flex flex-col p-4">
        {!isCompact && (
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4" />
            <div>
              <h3 className="font-medium">Daily Hours</h3>
              <p className="text-xs text-muted-foreground">Track your daily performance</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-center flex-1 text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className={isCompact ? "text-xs" : "text-sm"}>No active contract</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      {!isCompact && (
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <div>
            <h3 className={`font-medium ${isLarge ? 'text-base' : 'text-sm'}`}>
              Daily Hours - Last {timeRange} Days
            </h3>
            <p className="text-xs text-muted-foreground">
              Actual vs Expected Hours{
                settings.breakTimeSettings.showAdjustedTime && settings.breakTimeSettings.breakTimeMinutes > 0
                  ? ' • Break-adjusted times'
                  : ''
              }
            </p>
          </div>
        </div>
      )}

      {isCompact && (
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-3 h-3" />
          <h3 className="text-xs font-medium">Daily Hours</h3>
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ChartContainer
          config={STANDARD_CHART_CONFIG}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
            <defs>
              <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.TARGET_EXPECTED} stopOpacity={0.9} />
                <stop offset="50%" stopColor={CHART_COLORS.TARGET_EXPECTED_LIGHT} stopOpacity={0.6} />
                <stop offset="100%" stopColor={CHART_COLORS.TARGET_EXPECTED} stopOpacity={0.3} />
              </linearGradient>
              
              <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <XAxis 
              dataKey="day" 
              tickLine={false}
              axisLine={false}
              tick={{ 
                fill: 'hsl(var(--muted-foreground))', 
                fontSize: isCompact ? 10 : isLarge ? 14 : 12 
              }}
              height={isCompact ? 20 : 30}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tick={{ 
                fill: 'hsl(var(--muted-foreground))', 
                fontSize: isCompact ? 10 : isLarge ? 14 : 12 
              }}
              width={isCompact ? 25 : 40}
            />
            <ChartTooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const actual = payload.find(p => p.dataKey === 'actual')?.value || 0;
                  const expected = payload.find(p => p.dataKey === 'expected')?.value || 0;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg backdrop-blur-sm">
                      <p className="font-medium">{label}</p>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded shadow-sm" 
                            style={{ 
                              backgroundColor: data.performanceColor,
                              boxShadow: `0 0 8px ${data.performanceGlow}60`
                            }} 
                          />
                          <span className="text-sm font-medium">Actual: {actual}h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded shadow-sm bg-chart-8/70" />
                          <span className="text-sm">Expected: {expected.toFixed(1)}h</span>
                        </div>
                        {data.isWeekend && (
                          <p className="text-xs text-muted-foreground mt-1">🏖️ Weekend</p>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Bar 
              dataKey="actual" 
              radius={[4, 4, 0, 0]}
              filter="url(#barGlow)"
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.performanceColor} />
              ))}
            </Bar>
            <Bar 
              dataKey="expected" 
              fill="url(#expectedGradient)" 
              radius={[4, 4, 0, 0]} 
              opacity={0.7}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      </div>
    </div>
  );
}