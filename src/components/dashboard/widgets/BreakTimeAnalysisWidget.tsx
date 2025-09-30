import { Coffee, Clock, TrendingDown } from 'lucide-react';
import { ChartContainer, ChartTooltip } from '../../ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Badge } from '../../ui/badge';
import { Contract, TimeEntry, AppSettings } from '../../../hooks/useClockifyData';
import { useMemo } from 'react';

interface BreakTimeAnalysisWidgetProps {
  id: string;
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  settings: AppSettings;
  onRemove?: () => void;
}

export function BreakTimeAnalysisWidget({
  id,
  currentContract,
  timeEntries,
  settings,
  onRemove
}: BreakTimeAnalysisWidgetProps) {
  const breakAnalysis = useMemo(() => {
    if (!currentContract || !settings.breakTimeSettings.breakTimeMinutes) {
      return null;
    }

    const contractStart = new Date(currentContract.startDate);
    const contractEnd = new Date(currentContract.endDate);

    // Filter time entries for current contract period
    const contractEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= contractStart && entryDate <= contractEnd;
    });

    // Calculate break time metrics
    const breakTimePerEntry = settings.breakTimeSettings.breakTimeMinutes / 60; // hours
    const totalEntries = contractEntries.length;
    const entriesWithBreaks = contractEntries.filter(entry => 
      !entry.tags?.includes(settings.breakTimeSettings.noBreakTagId || '')
    ).length;
    const entriesWithoutBreaks = totalEntries - entriesWithBreaks;

    const totalBreakTime = entriesWithBreaks * breakTimePerEntry;
    const originalTotalHours = contractEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const adjustedTotalHours = originalTotalHours - totalBreakTime;

    // Weekly breakdown for last 4 weeks
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekEntries = contractEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      const weekBreakEntries = weekEntries.filter(entry => 
        !entry.tags?.includes(settings.breakTimeSettings.noBreakTagId || '')
      );

      const weekOriginalHours = weekEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const weekBreakTime = weekBreakEntries.length * breakTimePerEntry;
      const weekAdjustedHours = weekOriginalHours - weekBreakTime;

      weeklyData.push({
        week: `W${4-i}`,
        weekLabel: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        original: weekOriginalHours,
        adjusted: weekAdjustedHours,
        breakTime: weekBreakTime,
        entries: weekEntries.length,
        breakEntries: weekBreakEntries.length
      });
    }

    return {
      totalEntries,
      entriesWithBreaks,
      entriesWithoutBreaks,
      totalBreakTime,
      originalTotalHours,
      adjustedTotalHours,
      timeSaved: totalBreakTime,
      weeklyData,
      breakTimePerEntry: settings.breakTimeSettings.breakTimeMinutes
    };
  }, [currentContract, timeEntries, settings.breakTimeSettings]);

  if (!currentContract || !settings.breakTimeSettings.breakTimeMinutes || !breakAnalysis) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-4">
        <div className="text-center">
          <Coffee className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Break time tracking disabled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Coffee className="w-4 h-4" />
          <div>
            <h3 className="font-medium">Break Time Analysis</h3>
            <p className="text-xs text-muted-foreground">
              {breakAnalysis.breakTimePerEntry}min deducted per entry
            </p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <TrendingDown className="w-3 h-3" />
          -{breakAnalysis.timeSaved.toFixed(1)}h
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-muted/50 rounded">
          <div className="text-lg font-bold">{breakAnalysis.totalEntries}</div>
          <div className="text-xs text-muted-foreground">Total Entries</div>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded">
          <div className="text-lg font-bold text-blue-600">{breakAnalysis.entriesWithBreaks}</div>
          <div className="text-xs text-muted-foreground">With Breaks</div>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded">
          <div className="text-lg font-bold text-orange-600">{breakAnalysis.entriesWithoutBreaks}</div>
          <div className="text-xs text-muted-foreground">No Breaks</div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="flex-1">
        <div className="text-sm font-medium mb-2 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Weekly Comparison
        </div>
        <ChartContainer
          config={{
            original: {
              label: "Original Hours",
              color: "var(--chart-3)",
            },
            adjusted: {
              label: "Adjusted Hours",
              color: "var(--chart-2)",
            },
          }}
          className="h-32"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakAnalysis.weeklyData}>
              <XAxis 
                dataKey="week" 
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.weekLabel}</p>
                        <div className="space-y-1 mt-2 text-sm">
                          <div className="flex justify-between gap-4">
                            <span>Original:</span>
                            <span className="font-medium">{data.original.toFixed(1)}h</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span>Adjusted:</span>
                            <span className="font-medium text-green-600">{data.adjusted.toFixed(1)}h</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span>Break time:</span>
                            <span className="font-medium text-orange-600">{data.breakTime.toFixed(1)}h</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span>Entries:</span>
                            <span>{data.breakEntries}/{data.entries}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="original" 
                fill="var(--chart-3)" 
                radius={[2, 2, 0, 0]}
                opacity={0.7}
              />
              <Bar 
                dataKey="adjusted" 
                fill="var(--chart-2)" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Bottom Summary */}
      <div className="pt-3 border-t mt-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Total time adjustment:</span>
          <div className="flex items-center gap-1">
            <span className="font-medium text-red-600">
              -{breakAnalysis.timeSaved.toFixed(1)}h
            </span>
            <span className="text-xs text-muted-foreground">
              ({((breakAnalysis.timeSaved / breakAnalysis.originalTotalHours) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
        {settings.breakTimeSettings.noBreakTagId && (
          <div className="text-xs text-muted-foreground mt-1">
            Entries with "no break" tag are excluded from adjustment
          </div>
        )}
      </div>
    </div>
  );
}