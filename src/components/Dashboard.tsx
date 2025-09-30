import { useMemo } from 'react';
import { Calendar, Clock, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Contract, TimeEntry, AppSettings } from '../hooks/useClockifyData';
import { TimeEntriesDataView } from './TimeEntriesDataView';

interface DashboardProps {
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  originalTimeEntries?: TimeEntry[];
  settings: AppSettings;
}

export function Dashboard({ currentContract, timeEntries, originalTimeEntries, settings }: DashboardProps) {
  const dashboardData = useMemo(() => {
    if (!currentContract) return null;

    const contractStart = new Date(currentContract.startDate);
    const contractEnd = new Date(currentContract.endDate);
    const now = new Date();

    // Filter time entries for current contract period
    const contractEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= contractStart && entryDate <= contractEnd;
    });

    // Calculate totals (including vacation hours as worked time)
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

    // Last 7 days chart data with enhanced vibrant performance colors
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEntry = contractEntries.find(entry => entry.date === dateStr);
      const actualHours = dayEntry?.hours || 0;
      const expectedDaily = currentContract.weeklyHours / 7;
      
      // Enhanced color coding based on performance with vibrant colors
      let performanceColor = 'var(--chart-1)'; // Electric Blue for normal
      let performanceGlow = 'var(--chart-1-light)';
      let performanceStatus = 'normal';
      
      if (actualHours > expectedDaily * 1.5) {
        performanceColor = 'var(--chart-5)'; // Bright Red for heavy overtime
        performanceGlow = 'var(--chart-5-light)';
        performanceStatus = 'extreme';
      } else if (actualHours > expectedDaily * 1.2) {
        performanceColor = 'var(--chart-3)'; // Bright Orange for overtime
        performanceGlow = 'var(--chart-3-light)';
        performanceStatus = 'high';
      } else if (actualHours >= expectedDaily * 0.8 && actualHours <= expectedDaily * 1.2) {
        performanceColor = 'var(--chart-2)'; // Vibrant Green for on track
        performanceGlow = 'var(--chart-2-light)';
        performanceStatus = 'good';
      } else if (actualHours > 0) {
        performanceColor = 'var(--chart-4)'; // Electric Purple for undertime
        performanceGlow = 'var(--chart-4-light)';
        performanceStatus = 'low';
      }
      
      chartData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        actual: actualHours,
        expected: expectedDaily,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        performanceColor,
        performanceGlow,
        performanceStatus,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }

    // Enhanced progress chart data with vibrant colors and performance indicators
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

    return {
      totalHoursWorked,
      expectedHoursToDate,
      thisWeekHours,
      contractProgress,
      chartData,
      progressData,
      overtimeHours: totalHoursWorked - expectedHoursToDate
    };
  }, [currentContract, timeEntries]);

  if (!currentContract || !dashboardData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            No Active Contract
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please add a contract to view your dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clockify Theme Test */}
      <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-sm">
        <div className="flex items-center gap-2">
          <span className="text-caption text-muted-foreground">Clockify UI Kit Active:</span>
          <Badge variant="success">Enabled</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="normal-case">Primary Button</Button>
          <Button variant="outline" size="sm" className="normal-case">Secondary</Button>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalHoursWorked}h</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.expectedHoursToDate.toFixed(1)}h expected to date
            </p>
            {(currentContract.vacationDays || 0) > 0 && (
              <p className="text-xs text-muted-foreground">
                +{(currentContract.vacationDays * 8)}h vacation ({currentContract.vacationDays} days)
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.thisWeekHours}h</div>
            <p className="text-xs text-muted-foreground">
              {currentContract.weeklyHours}h target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.contractProgress.toFixed(1)}%</div>
            <Progress value={dashboardData.contractProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime/Undertime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.overtimeHours > 0 ? '+' : ''}{dashboardData.overtimeHours.toFixed(1)}h
            </div>
            <Badge variant={dashboardData.overtimeHours > 0 ? 'default' : 'secondary'} className="mt-2">
              {dashboardData.overtimeHours > 0 ? 'Overtime' : 'Undertime'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Hours - Last 7 Days</CardTitle>
            <CardDescription>
              Actual vs Expected Hours with Performance Colors
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
                <BarChart data={dashboardData.chartData}>
                  <defs>
                    {/* Enhanced gradients for vibrant bar charts */}
                    <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-8)" stopOpacity={0.9} />
                      <stop offset="50%" stopColor="var(--chart-8-light)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="var(--chart-8)" stopOpacity={0.3} />
                    </linearGradient>
                    
                    {/* Glowing filter effects for bars */}
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
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
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
                    {dashboardData.chartData.map((entry: any, index: number) => (
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
          </CardContent>
        </Card>

        {/* Progress Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Hours Distribution</CardTitle>
            <CardDescription>Performance vs Expected Hours with Vibrant Colors</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                worked: {
                  label: "Hours Worked",
                  color: "var(--chart-2)",
                },
                variance: {
                  label: "Over/Under Time",
                  color: "var(--chart-3)",
                },
              }}
              className="h-[300px]"
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
                    data={dashboardData.progressData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={3}
                    filter="url(#pieGlow)"
                  >
                    {dashboardData.progressData.map((entry, index) => (
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
                        const percentage = ((data.value / dashboardData.progressData.reduce((sum: number, item: any) => sum + item.value, 0)) * 100).toFixed(1);
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
            
            {/* Enhanced Legend with vibrant colors */}
            <div className="flex justify-center mt-4 gap-6">
              {dashboardData.progressData.map((item, index) => (
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
          </CardContent>
        </Card>
      </div>

      {/* Performance Legend - Moved to Bottom */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Color Legend</CardTitle>
          <CardDescription>Understanding chart colors and what they represent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded shadow-sm" 
                style={{ 
                  backgroundColor: 'var(--chart-2)',
                  boxShadow: '0 0 6px var(--chart-2-light)'
                }}
              />
              <div>
                <p className="text-sm font-medium">On Track</p>
                <p className="text-xs text-muted-foreground">80-120% of target</p>
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
                <p className="text-sm font-medium">Moderate</p>
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
                <p className="text-sm font-medium">High</p>
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
                <p className="text-sm font-medium">Extreme</p>
                <p className="text-xs text-muted-foreground">150%+ overtime</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded shadow-sm" 
                style={{ 
                  backgroundColor: 'var(--chart-6)',
                  boxShadow: '0 0 6px var(--chart-6-light)'
                }}
              />
              <div>
                <p className="text-sm font-medium">Undertime</p>
                <p className="text-xs text-muted-foreground">Below 80% target</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded shadow-sm" 
                style={{ 
                  backgroundColor: 'var(--chart-8)',
                  boxShadow: '0 0 6px var(--chart-8-light)'
                }}
              />
              <div>
                <p className="text-sm font-medium">Expected</p>
                <p className="text-xs text-muted-foreground">Target hours</p>
              </div>
            </div>
          </div>
          
          {/* Break Time Indicator */}
          {settings.breakTimeSettings.breakTimeMinutes > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <p className="text-sm">
                  Break time adjustment: {settings.breakTimeSettings.breakTimeMinutes} minutes per entry
                  {settings.breakTimeSettings.showAdjustedTime ? ' (currently active)' : ' (showing original times)'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}