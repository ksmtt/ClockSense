import { useState, useMemo } from 'react';
import { Calendar, TrendingUp, BarChart3, Target, Sun } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Area, AreaChart, Cell } from 'recharts';
import { Contract, TimeEntry, AppSettings } from '../hooks/useClockifyData';
import { TimeEntriesDataView } from './TimeEntriesDataView';

interface TimeAnalysisProps {
  contracts: Contract[];
  timeEntries: TimeEntry[];
  originalTimeEntries?: TimeEntry[];
  settings: AppSettings;
}

type TimeFrame = 'week' | 'last-week' | 'month' | 'last-month' | 'year' | 'last-year' | 'custom';
type ViewMode = 'daily' | 'weekly' | 'monthly';

export function TimeAnalysis({ contracts, timeEntries, originalTimeEntries, settings }: TimeAnalysisProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [selectedContract, setSelectedContract] = useState<string>('all');

  const analysisData = useMemo(() => {
    // Filter entries based on selected contract
    let filteredEntries = timeEntries;
    if (selectedContract !== 'all') {
      const contract = contracts.find(c => c.id === selectedContract);
      if (contract) {
        filteredEntries = timeEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          const start = new Date(contract.startDate);
          const end = new Date(contract.endDate);
          return entryDate >= start && entryDate <= end;
        });
      }
    }

    // Get date range based on timeFrame
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (timeFrame) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 6);
        break;
      case 'last-week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - startDate.getDay() - 6); // Start of last week
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() - endDate.getDay()); // End of last week
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(1);
        break;
      case 'last-month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        endDate = new Date(now);
        endDate.setDate(0); // Last day of previous month
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'last-year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3); // Default to 3 months
    }

    // Filter entries by date range
    const rangeEntries = filteredEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    // Generate chart data based on view mode
    const chartData = [];
    const expectedHoursPerPeriod = getExpectedHoursPerPeriod();

    if (viewMode === 'daily') {
      // Daily view
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const dayEntries = rangeEntries.filter(entry => entry.date === dateStr);
        const actualHours = dayEntries.reduce((sum, entry) => sum + entry.hours, 0);
        
        // Enhanced color coding based on performance with vibrant colors
        let performanceColor = 'var(--chart-1)'; // Electric Blue for normal
        let performanceGlow = 'var(--chart-1-light)';
        let performanceStatus = 'normal';
        
        if (actualHours > expectedHoursPerPeriod.daily * 2) {
          performanceColor = 'var(--chart-5)'; // Bright Red for extreme overtime
          performanceGlow = 'var(--chart-5-light)';
          performanceStatus = 'extreme';
        } else if (actualHours > expectedHoursPerPeriod.daily * 1.5) {
          performanceColor = 'var(--chart-3)'; // Bright Orange for high overtime
          performanceGlow = 'var(--chart-3-light)';
          performanceStatus = 'high';
        } else if (actualHours > expectedHoursPerPeriod.daily * 1.2) {
          performanceColor = 'var(--chart-4)'; // Electric Purple for moderate overtime
          performanceGlow = 'var(--chart-4-light)';
          performanceStatus = 'moderate';
        } else if (actualHours >= expectedHoursPerPeriod.daily * 0.8) {
          performanceColor = 'var(--chart-2)'; // Vibrant Green for on track
          performanceGlow = 'var(--chart-2-light)';
          performanceStatus = 'good';
        } else if (actualHours > 0) {
          performanceColor = 'var(--chart-6)'; // Electric Yellow for undertime
          performanceGlow = 'var(--chart-6-light)';
          performanceStatus = 'low';
        }
        
        chartData.push({
          period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          actual: actualHours,
          expected: expectedHoursPerPeriod.daily,
          cumulative: chartData.reduce((sum, item) => sum + item.actual, actualHours),
          performanceColor,
          performanceGlow,
          performanceStatus,
          isWeekend: date.getDay() === 0 || date.getDay() === 6
        });
      }
    } else if (viewMode === 'weekly') {
      // Weekly view
      const weeks = getWeeksInRange(startDate, endDate);
      weeks.forEach(week => {
        const weekEntries = rangeEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= week.start && entryDate <= week.end;
        });
        const actualHours = weekEntries.reduce((sum, entry) => sum + entry.hours, 0);
        
        // Enhanced color coding for weekly performance with vibrant colors
        let performanceColor = 'var(--chart-1)'; // Electric Blue
        let performanceGlow = 'var(--chart-1-light)';
        let performanceStatus = 'normal';
        
        if (actualHours > expectedHoursPerPeriod.weekly * 1.5) {
          performanceColor = 'var(--chart-5)'; // Bright Red for extreme overtime
          performanceGlow = 'var(--chart-5-light)';
          performanceStatus = 'extreme';
        } else if (actualHours > expectedHoursPerPeriod.weekly * 1.3) {
          performanceColor = 'var(--chart-3)'; // Bright Orange for high overtime
          performanceGlow = 'var(--chart-3-light)';
          performanceStatus = 'high';
        } else if (actualHours > expectedHoursPerPeriod.weekly * 1.1) {
          performanceColor = 'var(--chart-4)'; // Electric Purple for moderate overtime
          performanceGlow = 'var(--chart-4-light)';
          performanceStatus = 'moderate';
        } else if (actualHours >= expectedHoursPerPeriod.weekly * 0.9) {
          performanceColor = 'var(--chart-2)'; // Vibrant Green for on track
          performanceGlow = 'var(--chart-2-light)';
          performanceStatus = 'good';
        } else if (actualHours > 0) {
          performanceColor = 'var(--chart-7)'; // Bright Cyan for undertime
          performanceGlow = 'var(--chart-7-light)';
          performanceStatus = 'low';
        }
        
        chartData.push({
          period: `Week of ${week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          actual: actualHours,
          expected: expectedHoursPerPeriod.weekly,
          cumulative: chartData.reduce((sum, item) => sum + item.actual, actualHours),
          performanceColor,
          performanceGlow,
          performanceStatus
        });
      });
    } else {
      // Monthly view
      const months = getMonthsInRange(startDate, endDate);
      months.forEach(month => {
        const monthEntries = rangeEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === month.month && entryDate.getFullYear() === month.year;
        });
        const actualHours = monthEntries.reduce((sum, entry) => sum + entry.hours, 0);
        
        const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
        const expectedMonthly = (expectedHoursPerPeriod.weekly * daysInMonth) / 7;
        
        // Enhanced color coding for monthly performance with vibrant colors
        let performanceColor = 'var(--chart-1)'; // Electric Blue
        let performanceGlow = 'var(--chart-1-light)';
        let performanceStatus = 'normal';
        
        if (actualHours > expectedMonthly * 1.3) {
          performanceColor = 'var(--chart-5)'; // Bright Red for extreme overtime
          performanceGlow = 'var(--chart-5-light)';
          performanceStatus = 'extreme';
        } else if (actualHours > expectedMonthly * 1.2) {
          performanceColor = 'var(--chart-3)'; // Bright Orange for high overtime
          performanceGlow = 'var(--chart-3-light)';
          performanceStatus = 'high';
        } else if (actualHours > expectedMonthly * 1.1) {
          performanceColor = 'var(--chart-4)'; // Electric Purple for moderate overtime
          performanceGlow = 'var(--chart-4-light)';
          performanceStatus = 'moderate';
        } else if (actualHours >= expectedMonthly * 0.9) {
          performanceColor = 'var(--chart-2)'; // Vibrant Green for on track
          performanceGlow = 'var(--chart-2-light)';
          performanceStatus = 'good';
        } else if (actualHours > 0) {
          performanceColor = 'var(--chart-8)'; // Light Purple for undertime
          performanceGlow = 'var(--chart-8-light)';
          performanceStatus = 'low';
        }
        
        chartData.push({
          period: new Date(month.year, month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          actual: actualHours,
          expected: expectedMonthly,
          cumulative: chartData.reduce((sum, item) => sum + item.actual, actualHours),
          performanceColor,
          performanceGlow,
          performanceStatus
        });
      });
    }

    // Calculate totals and metrics (including vacation hours)
    let vacationHours = 0;
    if (selectedContract !== 'all') {
      const contract = contracts.find(c => c.id === selectedContract);
      vacationHours = (contract?.vacationDays || 0) * 8;
    } else {
      // For all contracts, sum vacation hours from all contracts that overlap with the date range
      vacationHours = contracts.reduce((sum, contract) => {
        const contractStart = new Date(contract.startDate);
        const contractEnd = new Date(contract.endDate);
        // Check if contract overlaps with the analysis date range
        if (contractStart <= endDate && contractEnd >= startDate) {
          return sum + ((contract.vacationDays || 0) * 8);
        }
        return sum;
      }, 0);
    }
    
    const totalActual = rangeEntries.reduce((sum, entry) => sum + entry.hours, 0) + vacationHours;
    const totalExpected = chartData.reduce((sum, item) => sum + item.expected, 0);
    const averageDaily = totalActual / Math.max(1, chartData.length);
    const trend = calculateTrend(chartData);

    return {
      chartData,
      totalActual,
      totalExpected,
      averageDaily,
      trend,
      overtime: totalActual - totalExpected,
      vacationHours
    };

    function getExpectedHoursPerPeriod() {
      // Get current contract or average
      const currentContract = contracts.find(contract => {
        const now = new Date();
        const start = new Date(contract.startDate);
        const end = new Date(contract.endDate);
        return now >= start && now <= end;
      });

      const weeklyHours = currentContract?.weeklyHours || 20;
      
      return {
        daily: weeklyHours / 7,
        weekly: weeklyHours,
        monthly: (weeklyHours * 4.33) // Average weeks per month
      };
    }
  }, [timeFrame, viewMode, selectedContract, contracts, timeEntries]);

  function getWeeksInRange(start: Date, end: Date) {
    const weeks = [];
    const current = new Date(start);
    
    // Adjust to start of week (Monday)
    current.setDate(current.getDate() - (current.getDay() + 6) % 7);
    
    while (current <= end) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push({ start: weekStart, end: weekEnd });
      current.setDate(current.getDate() + 7);
    }
    
    return weeks;
  }

  function getMonthsInRange(start: Date, end: Date) {
    const months = [];
    const current = new Date(start);
    
    while (current <= end) {
      months.push({ month: current.getMonth(), year: current.getFullYear() });
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  }

  function calculateTrend(data: any[]) {
    if (data.length < 2) return 0;
    
    const recent = data.slice(-3).reduce((sum, item) => sum + item.actual, 0) / 3;
    const previous = data.slice(-6, -3).reduce((sum, item) => sum + item.actual, 0) / 3;
    
    return recent - previous;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground">Time Analysis</h2>
          <p className="text-muted-foreground text-caption">Detailed analysis of your work hours and trends</p>
        </div>
        
        <div className="flex items-center gap-4">
          <TimeEntriesDataView
            timeEntries={timeEntries}
            originalTimeEntries={originalTimeEntries}
            contracts={contracts}
            currentContract={contracts.find(c => c.id === selectedContract)}
            timeFrame={timeFrame}
            selectedContract={selectedContract}
            isBreakAdjusted={settings.breakTimeSettings.showAdjustedTime}
            breakTimeMinutes={settings.breakTimeSettings.breakTimeMinutes}
          />
          
          <Select value={selectedContract} onValueChange={setSelectedContract}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contracts</SelectItem>
              {contracts.map(contract => (
                <SelectItem key={contract.id} value={contract.id}>
                  {contract.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeFrame} onValueChange={(value: TimeFrame) => setTimeFrame(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisData.totalActual.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {analysisData.totalExpected.toFixed(1)}h expected
            </p>
            {analysisData.vacationHours > 0 && (
              <p className="text-xs text-muted-foreground">
                +{analysisData.vacationHours}h vacation ({(analysisData.vacationHours / 8)} days)
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisData.averageDaily.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysisData.overtime > 0 ? '+' : ''}{analysisData.overtime.toFixed(1)}h
            </div>
            <Badge variant={analysisData.overtime > 0 ? 'default' : 'secondary'}>
              {analysisData.overtime > 0 ? 'Ahead' : 'Behind'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysisData.trend > 0 ? '+' : ''}{analysisData.trend.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">vs previous period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
        <TabsList>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
        </TabsList>

        <TabsContent value={viewMode} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Actual vs Expected Hours</CardTitle>
                <CardDescription>
                  Comparison of worked hours against targets with vibrant performance indicators
                  {settings.breakTimeSettings.showAdjustedTime && settings.breakTimeSettings.breakTimeMinutes > 0 && (
                    <span className="text-primary"> • Break-adjusted times</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    actual: {
                      label: "Actual Hours",
                      color: "var(--chart-1)",
                    },
                    expected: {
                      label: "Expected Hours",
                      color: "var(--chart-8)",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysisData.chartData}>
                      <defs>
                        {/* Enhanced gradient for expected hours */}
                        <linearGradient id="enhancedExpectedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--chart-8)" stopOpacity={0.8} />
                          <stop offset="50%" stopColor="var(--chart-8-light)" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="var(--chart-8)" stopOpacity={0.2} />
                        </linearGradient>
                        
                        {/* Glow effect for performance bars */}
                        <filter id="barGlowAnalysis" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                          <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <XAxis 
                        dataKey="period" 
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const actual = payload.find(p => p.dataKey === 'actual')?.value || 0;
                            const expected = payload.find(p => p.dataKey === 'expected')?.value || 0;
                            const data = payload[0].payload;
                            const performance = expected > 0 ? ((actual / expected - 1) * 100).toFixed(1) : '0';
                            const variance = actual - expected;
                            
                            return (
                              <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-xl">
                                <p className="font-medium text-foreground">{label}</p>
                                <div className="space-y-2 mt-3">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded shadow-lg" 
                                      style={{ 
                                        backgroundColor: data.performanceColor,
                                        boxShadow: `0 0 8px ${data.performanceGlow}60`
                                      }} 
                                    />
                                    <span className="text-sm font-medium">Actual: {actual}h</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-chart-8/70 shadow-sm" />
                                    <span className="text-sm text-muted-foreground">Expected: {expected.toFixed(1)}h</span>
                                  </div>
                                  <div className="mt-3 pt-2 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                      <span className={`text-xs font-medium ${
                                        variance > 2 ? 'text-chart-3' : 
                                        variance > 0 ? 'text-chart-2' : 
                                        variance < -2 ? 'text-chart-6' : 'text-muted-foreground'
                                      }`}>
                                        Performance: {performance > 0 ? '+' : ''}{performance}%
                                      </span>
                                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                        variance > 2 ? 'bg-chart-3/20 text-chart-3' : 
                                        variance > 0 ? 'bg-chart-2/20 text-chart-2' : 
                                        variance < -2 ? 'bg-chart-6/20 text-chart-6' : 'bg-muted/20 text-muted-foreground'
                                      }`}>
                                        {variance > 0 ? '↗' : variance < 0 ? '↘' : '→'}
                                        {variance > 0 ? '+' : ''}{variance.toFixed(1)}h
                                      </div>
                                    </div>
                                  </div>
                                  {data.isWeekend && (
                                    <div className="flex items-center gap-1 mt-2">
                                      <Sun className="w-3 h-3 text-chart-6" />
                                      <span className="text-xs text-muted-foreground">Weekend period</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="actual" 
                        radius={[4, 4, 0, 0]}
                        filter="url(#barGlowAnalysis)"
                      >
                        {analysisData.chartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.performanceColor} />
                        ))}
                      </Bar>
                      <Bar 
                        dataKey="expected" 
                        fill="url(#enhancedExpectedGradient)" 
                        radius={[4, 4, 0, 0]} 
                        opacity={0.8}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                {/* Bar Chart Performance Summary */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Performance Summary</h4>
                    <div className="text-xs text-muted-foreground">
                      {analysisData.chartData.length} periods analyzed
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-chart-2" />
                      <span>On track: {analysisData.chartData.filter((d: any) => d.performanceStatus === 'good').length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-chart-3" />
                      <span>Overtime: {analysisData.chartData.filter((d: any) => ['high', 'extreme'].includes(d.performanceStatus)).length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-chart-6" />
                      <span>Undertime: {analysisData.chartData.filter((d: any) => d.performanceStatus === 'low').length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Cumulative Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cumulative Hours Trend</CardTitle>
                <CardDescription>
                  Running total of hours worked over time with vibrant performance indicators
                  {settings.breakTimeSettings.showAdjustedTime && settings.breakTimeSettings.breakTimeMinutes > 0 && (
                    <span className="text-primary"> • Break-adjusted times</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    cumulative: {
                      label: "Cumulative Hours",
                      color: "var(--chart-1)",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analysisData.chartData}>
                      <defs>
                        {/* Vibrant multi-stop gradient for area fill */}
                        <linearGradient id="vibranceCumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--gradient-1-start)" stopOpacity={0.9} />
                          <stop offset="25%" stopColor="var(--gradient-2-start)" stopOpacity={0.7} />
                          <stop offset="50%" stopColor="var(--gradient-3-start)" stopOpacity={0.5} />
                          <stop offset="75%" stopColor="var(--gradient-4-start)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="var(--gradient-5-start)" stopOpacity={0.1} />
                        </linearGradient>
                        
                        {/* Dynamic stroke gradient based on performance */}
                        <linearGradient id="vibranceStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1} />
                          <stop offset="20%" stopColor="var(--chart-2)" stopOpacity={1} />
                          <stop offset="40%" stopColor="var(--chart-3)" stopOpacity={1} />
                          <stop offset="60%" stopColor="var(--chart-4)" stopOpacity={1} />
                          <stop offset="80%" stopColor="var(--chart-5)" stopOpacity={1} />
                          <stop offset="100%" stopColor="var(--chart-6)" stopOpacity={1} />
                        </linearGradient>
                        
                        {/* Glow filter for enhanced vibrancy */}
                        <filter id="cumulativeGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                        
                        {/* Shimmer effect for active dot */}
                        <radialGradient id="shimmerGradient" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1} />
                          <stop offset="50%" stopColor="var(--chart-1-light)" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                        </radialGradient>
                      </defs>
                      <XAxis 
                        dataKey="period" 
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const totalExpected = analysisData.chartData
                              .slice(0, analysisData.chartData.indexOf(data) + 1)
                              .reduce((sum, item) => sum + item.expected, 0);
                            const variance = payload[0].value - totalExpected;
                            const percentageVariance = totalExpected > 0 ? ((variance / totalExpected) * 100).toFixed(1) : '0';
                            
                            return (
                              <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-xl">
                                <p className="font-medium text-foreground">{label}</p>
                                <div className="space-y-2 mt-3">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full shadow-lg" 
                                      style={{ 
                                        backgroundColor: 'var(--chart-1)',
                                        boxShadow: '0 0 8px var(--chart-1-light)'
                                      }} 
                                    />
                                    <span className="text-sm font-medium">Total: {payload[0].value}h</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-chart-8/60 shadow-sm" />
                                    <span className="text-sm text-muted-foreground">Expected: {totalExpected.toFixed(1)}h</span>
                                  </div>
                                  <div className="mt-3 pt-2 border-t border-border/50">
                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                      variance > 10 ? 'bg-chart-5/20 text-chart-5' : 
                                      variance > 0 ? 'bg-chart-3/20 text-chart-3' : 
                                      variance < -10 ? 'bg-chart-6/20 text-chart-6' : 
                                      'bg-chart-2/20 text-chart-2'
                                    }`}>
                                      {variance > 0 ? '↗' : variance < 0 ? '↘' : '→'}
                                      {variance > 0 ? '+' : ''}{variance.toFixed(1)}h ({percentageVariance}%)
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        dataKey="cumulative" 
                        stroke="url(#vibranceStrokeGradient)" 
                        fill="url(#vibranceCumulativeGradient)" 
                        strokeWidth={4}
                        filter="url(#cumulativeGlow)"
                        dot={{ 
                          r: 5, 
                          strokeWidth: 3, 
                          fill: 'url(#shimmerGradient)',
                          stroke: 'var(--chart-1)'
                        }}
                        activeDot={{ 
                          r: 8, 
                          strokeWidth: 4, 
                          fill: 'var(--chart-1)',
                          stroke: 'var(--background)',
                          filter: 'url(#cumulativeGlow)'
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                {/* Enhanced Cumulative Chart Legend */}
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Performance Indicators</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-chart-1 animate-pulse" />
                      Live tracking
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded bg-chart-2/10 border border-chart-2/20">
                      <div className="w-3 h-3 rounded bg-chart-2 shadow-sm" />
                      <span>On Track (±10%)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-chart-3/10 border border-chart-3/20">
                      <div className="w-3 h-3 rounded bg-chart-3 shadow-sm" />
                      <span>Overtime (+10%)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-chart-5/10 border border-chart-5/20">
                      <div className="w-3 h-3 rounded bg-chart-5 shadow-sm" />
                      <span>Heavy OT (+20%)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-chart-6/10 border border-chart-6/20">
                      <div className="w-3 h-3 rounded bg-chart-6 shadow-sm" />
                      <span>Undertime (-10%)</span>
                    </div>
                  </div>
                  
                  {/* Break time indicator */}
                  {settings.breakTimeSettings.breakTimeMinutes > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded bg-primary/10 border border-primary/20">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs">
                        {settings.breakTimeSettings.breakTimeMinutes}min break deduction per entry
                        {!settings.breakTimeSettings.showAdjustedTime && ' (not applied to current view)'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Analysis Legend - Moved to Bottom */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis Legend</CardTitle>
              <CardDescription>Color coding system for time tracking performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Performance Levels */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Performance Levels</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded shadow-sm" 
                        style={{ 
                          backgroundColor: 'var(--chart-2)',
                          boxShadow: '0 0 6px var(--chart-2-light)'
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-chart-2">Excellent</p>
                        <p className="text-xs text-muted-foreground">90-110% of target</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded shadow-sm" 
                        style={{ 
                          backgroundColor: 'var(--chart-4)',
                          boxShadow: '0 0 6px var(--chart-4-light)'
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-chart-4">Moderate</p>
                        <p className="text-xs text-muted-foreground">110-150% overtime</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded shadow-sm" 
                        style={{ 
                          backgroundColor: 'var(--chart-3)',
                          boxShadow: '0 0 6px var(--chart-3-light)'
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-chart-3">High</p>
                        <p className="text-xs text-muted-foreground">120-200% overtime</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded shadow-sm" 
                        style={{ 
                          backgroundColor: 'var(--chart-5)',
                          boxShadow: '0 0 6px var(--chart-5-light)'
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-chart-5">Extreme</p>
                        <p className="text-xs text-muted-foreground">150%+ overtime</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart Types */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Chart Elements</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-chart-8/60 shadow-sm" />
                      <div>
                        <p className="text-sm font-medium">Expected Hours</p>
                        <p className="text-xs text-muted-foreground">Target based on contract</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded shadow-sm" 
                        style={{ 
                          backgroundColor: 'var(--chart-7)',
                          boxShadow: '0 0 6px var(--chart-7-light)'
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">Undertime</p>
                        <p className="text-xs text-muted-foreground">Below 80% of target</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded shadow-sm" 
                        style={{ 
                          backgroundColor: 'var(--chart-1)',
                          boxShadow: '0 0 6px var(--chart-1-light)'
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">Cumulative</p>
                        <p className="text-xs text-muted-foreground">Running total</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Break Time Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Break Time Settings</h4>
                  <div className="space-y-2">
                    {settings.breakTimeSettings.breakTimeMinutes > 0 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                          <div>
                            <p className="text-sm font-medium">Active</p>
                            <p className="text-xs text-muted-foreground">
                              {settings.breakTimeSettings.breakTimeMinutes} min deduction
                            </p>
                          </div>
                        </div>
                        <div className="p-2 rounded bg-primary/10 border border-primary/20">
                          <p className="text-xs">
                            {settings.breakTimeSettings.showAdjustedTime 
                              ? 'Showing break-adjusted times'
                              : 'Showing original times'
                            }
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-dashed border-muted-foreground/30" />
                        <div>
                          <p className="text-sm text-muted-foreground">Inactive</p>
                          <p className="text-xs text-muted-foreground">No break time deduction</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}