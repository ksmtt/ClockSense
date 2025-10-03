import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Settings, Save, X, BarChart3, PieChart, LineChart, Calendar, Timer } from 'lucide-react';

interface WidgetConfig {
  id: string;
  type: string;
  settings?: Record<string, any>;
}

interface WidgetConfigurationPanelProps {
  widget: WidgetConfig;
  onUpdateConfig: (widgetId: string, newSettings: Record<string, any>) => void;
  onClose: () => void;
  isVisible: boolean;
}

export function WidgetConfigurationPanel({ 
  widget, 
  onUpdateConfig, 
  onClose, 
  isVisible 
}: WidgetConfigurationPanelProps) {
  const updateSetting = (key: string, value: any) => {
    onUpdateConfig(widget.id, {
      ...(widget.settings || {}),
      [key]: value
    });
  };

  const renderConfigForWidget = () => {
    switch (widget.type) {
      case 'totalHours':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showDetails">Show detailed breakdown</Label>
              <Switch
                id="showDetails"
                checked={(widget.settings || {}).showDetails ?? false}
                onCheckedChange={(checked) => updateSetting('showDetails', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showTrend">Show trend indicator</Label>
              <Switch
                id="showTrend"
                checked={(widget.settings || {}).showTrend ?? true}
                onCheckedChange={(checked) => updateSetting('showTrend', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Time period</Label>
              <Select 
                value={(widget.settings || {}).timePeriod || 'current'} 
                onValueChange={(value) => updateSetting('timePeriod', value)}
              >
                <SelectTrigger aria-label="Select time period" title="Select time period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current contract period</SelectItem>
                  <SelectItem value="thisWeek">This week</SelectItem>
                  <SelectItem value="thisMonth">This month</SelectItem>
                  <SelectItem value="lastWeek">Last week</SelectItem>
                  <SelectItem value="lastMonth">Last month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'thisWeek':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showProgress">Show progress bar</Label>
              <Switch
                id="showProgress"
                checked={(widget.settings || {}).showProgress ?? true}
                onCheckedChange={(checked) => updateSetting('showProgress', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showTarget">Show weekly target</Label>
              <Switch
                id="showTarget"
                checked={(widget.settings || {}).showTarget ?? true}
                onCheckedChange={(checked) => updateSetting('showTarget', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showRemaining">Show remaining hours</Label>
              <Switch
                id="showRemaining"
                checked={(widget.settings || {}).showRemaining ?? false}
                onCheckedChange={(checked) => updateSetting('showRemaining', checked)}
              />
            </div>
          </div>
        );

      case 'dailyHours':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Time range (days)</Label>
              <div className="px-3">
                <Slider
                  value={[(widget.settings || {}).timeRange || 7]}
                  onValueChange={([value]) => updateSetting('timeRange', value)}
                  max={30}
                  min={3}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>3 days</span>
                  <span>{(widget.settings || {}).timeRange || 7} days</span>
                  <span>30 days</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showWeekends">Show weekends</Label>
              <Switch
                id="showWeekends"
                checked={(widget.settings || {}).showWeekends ?? true}
                onCheckedChange={(checked) => updateSetting('showWeekends', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showTargetLine">Show target line</Label>
              <Switch
                id="showTargetLine"
                checked={(widget.settings || {}).showTargetLine ?? false}
                onCheckedChange={(checked) => updateSetting('showTargetLine', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Chart type</Label>
              <Select 
                value={(widget.settings || {}).chartType || 'bar'} 
                onValueChange={(value) => updateSetting('chartType', value)}
              >
                <SelectTrigger aria-label="Select chart type" title="Select chart type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Bar Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <LineChart className="w-4 h-4" />
                      Line Chart
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'hoursDistribution':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showLegend">Show legend</Label>
              <Switch
                id="showLegend"
                checked={(widget.settings || {}).showLegend ?? true}
                onCheckedChange={(checked) => updateSetting('showLegend', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showPercentages">Show percentages</Label>
              <Switch
                id="showPercentages"
                checked={(widget.settings || {}).showPercentages ?? true}
                onCheckedChange={(checked) => updateSetting('showPercentages', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Chart type</Label>
              <Select 
                value={(widget.settings || {}).chartType || 'pie'} 
                onValueChange={(value) => updateSetting('chartType', value)}
              >
                <SelectTrigger aria-label="Select chart type" title="Select chart type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pie">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4" />
                      Pie Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="donut">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4" />
                      Donut Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Horizontal Bar
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Group by</Label>
              <Select 
                value={(widget.settings || {}).groupBy || 'day'} 
                onValueChange={(value) => updateSetting('groupBy', value)}
              >
                <SelectTrigger aria-label="Select grouping option" title="Select grouping option">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">By day of week</SelectItem>
                  <SelectItem value="week">By week</SelectItem>
                  <SelectItem value="project">By project</SelectItem>
                  <SelectItem value="contract">By contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'weeklyTrend':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Number of weeks</Label>
              <div className="px-3">
                <Slider
                  value={[(widget.settings || {}).weekCount || 8]}
                  onValueChange={([value]) => updateSetting('weekCount', value)}
                  max={26}
                  min={4}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>4 weeks</span>
                  <span>{(widget.settings || {}).weekCount || 8} weeks</span>
                  <span>26 weeks</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showAverage">Show average line</Label>
              <Switch
                id="showAverage"
                checked={(widget.settings || {}).showAverage ?? true}
                onCheckedChange={(checked) => updateSetting('showAverage', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showTarget">Show target line</Label>
              <Switch
                id="showTarget"
                checked={(widget.settings || {}).showTarget ?? false}
                onCheckedChange={(checked) => updateSetting('showTarget', checked)}
              />
            </div>
          </div>
        );

      case 'contractProgress':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showTimeRemaining">Show time remaining</Label>
              <Switch
                id="showTimeRemaining"
                checked={(widget.settings || {}).showTimeRemaining ?? true}
                onCheckedChange={(checked) => updateSetting('showTimeRemaining', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showEndDate">Show end date</Label>
              <Switch
                id="showEndDate"
                checked={(widget.settings || {}).showEndDate ?? true}
                onCheckedChange={(checked) => updateSetting('showEndDate', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Progress calculation</Label>
              <Select 
                value={(widget.settings || {}).progressType || 'time'} 
                onValueChange={(value) => updateSetting('progressType', value)}
              >
                <SelectTrigger aria-label="Select progress calculation method" title="Select progress calculation method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">By time elapsed</SelectItem>
                  <SelectItem value="hours">By hours worked</SelectItem>
                  <SelectItem value="combined">Combined view</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'overtime':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Alert threshold (hours)</Label>
              <div className="px-3">
                <Slider
                  value={[(widget.settings || {}).alertThreshold || 5]}
                  onValueChange={([value]) => updateSetting('alertThreshold', value)}
                  max={20}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1h</span>
                  <span>{(widget.settings || {}).alertThreshold || 5}h</span>
                  <span>20h</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showWeekly">Show weekly overtime</Label>
              <Switch
                id="showWeekly"
                checked={(widget.settings || {}).showWeekly ?? true}
                onCheckedChange={(checked) => updateSetting('showWeekly', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showMonthly">Show monthly overtime</Label>
              <Switch
                id="showMonthly"
                checked={(widget.settings || {}).showMonthly ?? false}
                onCheckedChange={(checked) => updateSetting('showMonthly', checked)}
              />
            </div>
          </div>
        );

      case 'performanceLegend':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showBreakTimeInfo">Show break time info</Label>
              <Switch
                id="showBreakTimeInfo"
                checked={(widget.settings || {}).showBreakTimeInfo ?? true}
                onCheckedChange={(checked) => updateSetting('showBreakTimeInfo', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showColorCoding">Show color coding</Label>
              <Switch
                id="showColorCoding"
                checked={(widget.settings || {}).showColorCoding ?? true}
                onCheckedChange={(checked) => updateSetting('showColorCoding', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="compactMode">Compact mode</Label>
              <Switch
                id="compactMode"
                checked={(widget.settings || {}).compactMode ?? false}
                onCheckedChange={(checked) => updateSetting('compactMode', checked)}
              />
            </div>
          </div>
        );

      case 'breakTimeAnalysis':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Analysis period</Label>
              <Select 
                value={(widget.settings || {}).analysisPeriod || 'week'} 
                onValueChange={(value) => updateSetting('analysisPeriod', value)}
              >
                <SelectTrigger aria-label="Select analysis period" title="Select analysis period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="contract">Current contract</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showRecommendations">Show recommendations</Label>
              <Switch
                id="showRecommendations"
                checked={(widget.settings || {}).showRecommendations ?? true}
                onCheckedChange={(checked) => updateSetting('showRecommendations', checked)}
              />
            </div>
          </div>
        );

      case 'contractTimeline':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showMilestones">Show milestones</Label>
              <Switch
                id="showMilestones"
                checked={(widget.settings || {}).showMilestones ?? true}
                onCheckedChange={(checked) => updateSetting('showMilestones', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showProgress">Show progress indicators</Label>
              <Switch
                id="showProgress"
                checked={(widget.settings || {}).showProgress ?? true}
                onCheckedChange={(checked) => updateSetting('showProgress', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Timeline view</Label>
              <Select 
                value={(widget.settings || {}).timelineView || 'all'} 
                onValueChange={(value) => updateSetting('timelineView', value)}
              >
                <SelectTrigger aria-label="Select timeline view" title="Select timeline view">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All contracts</SelectItem>
                  <SelectItem value="active">Active only</SelectItem>
                  <SelectItem value="recent">Recent contracts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-muted-foreground">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No configuration options available for this widget type.</p>
          </div>
        );
    }
  };

  if (!isVisible) return null;

  const getWidgetIcon = () => {
    switch (widget.type) {
      case 'dailyHours': return <BarChart3 className="w-4 h-4" />;
      case 'hoursDistribution': return <PieChart className="w-4 h-4" />;
      case 'weeklyTrend': return <LineChart className="w-4 h-4" />;
      case 'thisWeek': return <Calendar className="w-4 h-4" />;
      case 'breakTimeAnalysis': return <Timer className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getWidgetName = () => {
    const names = {
      totalHours: 'Total Hours',
      thisWeek: 'This Week',
      contractProgress: 'Contract Progress',
      overtime: 'Overtime',
      dailyHours: 'Daily Hours Chart',
      hoursDistribution: 'Hours Distribution',
      performanceLegend: 'Performance Legend',
      weeklyTrend: 'Weekly Trend',
      contractTimeline: 'Contract Timeline',
      breakTimeAnalysis: 'Break Time Analysis'
    };
    return names[widget.type as keyof typeof names] || 'Widget';
  };

  return (
    <Card className="fixed top-4 right-4 w-80 max-h-[80vh] overflow-auto shadow-lg border-2 border-primary/20 z-50 bg-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getWidgetIcon()}
            <CardTitle className="text-base">{getWidgetName()}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Configure widget settings and display options
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {renderConfigForWidget()}
        
        <Separator />
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Widget ID: {widget.id.split('-')[0]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {widget.type}
          </Badge>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={onClose} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save & Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}