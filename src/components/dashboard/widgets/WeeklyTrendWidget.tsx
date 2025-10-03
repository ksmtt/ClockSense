import { TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip } from '../../ui/chart';
import { LineChart, Line, XAxis, YAxis, ReferenceLine } from 'recharts';
import { Contract, TimeEntry, AppSettings } from '../../../hooks/useClockifyData';
import { useMemo } from 'react';
import { CHART_COLORS, STANDARD_CHART_CONFIG } from '../../../constants/chartColors';

interface WeeklyTrendWidgetProps {
  id: string;
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  settings: AppSettings;
  onRemove?: () => void;
  size?: { width: number; height: number };
}

export function WeeklyTrendWidget({
  id: _id,
  currentContract,
  timeEntries,
  settings: _settings,
  onRemove: _onRemove,
  size = { width: 6, height: 4 }
}: WeeklyTrendWidgetProps) {
  
  // Determine dimensions based on size
  const isCompact = size.width <= 5 || size.height <= 3;
  const isLarge = size.width >= 8 || size.height >= 5;
  
  // Calculate chart dimensions
  const gridCellWidth = 60; // Base cell width in pixels
  const gridCellHeight = 60; // Base cell height in pixels
  const padding = 32; // Widget padding
  const headerHeight = isCompact ? 32 : 64; // Header height
  
  const widgetWidth = size.width * gridCellWidth;
  const widgetHeight = size.height * gridCellHeight;
  const chartWidth = widgetWidth - padding;
  const chartHeight = widgetHeight - headerHeight;
  const chartData = useMemo(() => {
    if (!currentContract) return [];

    const contractStart = new Date(currentContract.startDate);
    const contractEnd = new Date(currentContract.endDate);
    const now = new Date();

    // Filter time entries for current contract period
    const contractEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= contractStart && entryDate <= contractEnd;
    });

    // Get weeks
    const weeks = [];
    const weekStart = new Date(contractStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday

    while (weekStart <= now && weekStart <= contractEnd) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekEntries = contractEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      const weekHours = weekEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const weekNum = Math.ceil((weekStart.getTime() - contractStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

      weeks.push({
        week: `W${weekNum}`,
        fullWeek: `Week ${weekNum} (${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
        actual: weekHours,
        target: currentContract.weeklyHours,
        variance: weekHours - currentContract.weeklyHours,
        efficiency: (weekHours / currentContract.weeklyHours) * 100
      });

      weekStart.setDate(weekStart.getDate() + 7);
    }

    return weeks.slice(-12); // Last 12 weeks max
  }, [currentContract, timeEntries]);

  if (!currentContract) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-4">
        <div className="text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className={isCompact ? "text-xs" : "text-sm"}>No active contract</p>
        </div>
      </div>
    );
  }

  const averageEfficiency = chartData.length > 0 
    ? chartData.reduce((sum, week) => sum + week.efficiency, 0) / chartData.length 
    : 0;

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      {!isCompact && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
            <div>
              <h3 className={`font-medium ${isLarge ? 'text-base' : 'text-sm'}`}>Weekly Trend</h3>
              <p className="text-xs text-muted-foreground">
                Avg efficiency: {averageEfficiency.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {isCompact && (
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-3 h-3" />
          <h3 className="text-xs font-medium">Weekly</h3>
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ChartContainer
          config={STANDARD_CHART_CONFIG}
          className="h-full w-full"
        >
          <LineChart data={chartData} width={chartWidth} height={chartHeight}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.ACTUAL_HOURS} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={CHART_COLORS.ACTUAL_HOURS} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="week" 
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
                content={({ active, payload, label: _label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.fullWeek}</p>
                        <div className="space-y-1 mt-2">
                          <div className="flex justify-between gap-4">
                            <span className="text-sm">Actual:</span>
                            <span className="text-sm font-medium">{data.actual}h</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-sm">Target:</span>
                            <span className="text-sm">{data.target}h</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-sm">Variance:</span>
                            <span className={`text-sm font-medium ${data.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {data.variance > 0 ? '+' : ''}{data.variance.toFixed(1)}h
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-sm">Efficiency:</span>
                            <span className="text-sm font-medium">{data.efficiency.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine 
                y={currentContract.weeklyHours} 
                stroke={CHART_COLORS.TARGET_EXPECTED} 
                strokeDasharray="5 5" 
                strokeOpacity={0.6}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke={CHART_COLORS.ACTUAL_HOURS} 
                strokeWidth={3}
                fill="url(#actualGradient)"
                dot={{ fill: 'var(--chart-1)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'var(--chart-1)', strokeWidth: 2 }}
              />
            </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}