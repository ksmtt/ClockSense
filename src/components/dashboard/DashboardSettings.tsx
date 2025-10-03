import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { LayoutGrid, RotateCcw, Settings as SettingsIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { DashboardLayoutConfig, DashboardWidgetConfig } from '../../hooks/useClockifyData';

interface DashboardSettingsProps {
  layoutConfig: DashboardLayoutConfig;
  onLayoutChange: (config: DashboardLayoutConfig) => void;
}

const WIDGET_TYPES = {
  quickStats: {
    name: 'Quick Stats Overview',
    description: 'Contract totals, weekly hours, progress, and overtime summary'
  },
  totalHours: {
    name: 'Total Hours',
    description: 'Total hours worked on the contract'
  },
  thisWeek: {
    name: 'This Week',
    description: 'Hours worked this week'
  },
  contractProgress: {
    name: 'Contract Progress',
    description: 'Progress towards contract completion'
  },
  overtime: {
    name: 'Overtime',
    description: 'Overtime hours tracking'
  },
  dailyHours: {
    name: 'Daily Hours Chart',
    description: 'Bar chart showing actual vs expected hours over time'
  },
  weeklyTrend: {
    name: 'Weekly Trend',
    description: 'Trend analysis of weekly hours'
  },
  hoursDistribution: {
    name: 'Hours Distribution',
    description: 'Pie chart showing work hours breakdown and overtime'
  },
  contractTimeline: {
    name: 'Contract Timeline',
    description: 'Timeline view of contract progress'
  },
  breakTimeAnalysis: {
    name: 'Break Time Analysis',
    description: 'Analysis of break times and patterns'
  },
  performanceLegend: {
    name: 'Performance Legend',
    description: 'Color coding guide and break time information'
  }
};

export function DashboardSettings({ layoutConfig, onLayoutChange }: DashboardSettingsProps) {
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

  const enabledWidgets = layoutConfig.widgets
    .filter(widget => widget.enabled)
    .sort((a, b) => a.position - b.position);

  const disabledWidgets = layoutConfig.widgets.filter(widget => !widget.enabled);

  const toggleWidget = (widgetId: string) => {
    const newWidgets = layoutConfig.widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, enabled: !widget.enabled }
        : widget
    );

    onLayoutChange({
      ...layoutConfig,
      widgets: newWidgets
    });
  };

  const updateWidgetSize = (widgetId: string, size: 'compact' | 'medium' | 'large') => {
    const newWidgets = layoutConfig.widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, size }
        : widget
    );

    onLayoutChange({
      ...layoutConfig,
      widgets: newWidgets
    });
  };

  const updateWidgetSettings = (widgetId: string, settings: Record<string, any>) => {
    const newWidgets = layoutConfig.widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, settings: { ...widget.settings, ...settings } }
        : widget
    );

    onLayoutChange({
      ...layoutConfig,
      widgets: newWidgets
    });
  };

  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    const currentIndex = enabledWidgets.findIndex(w => w.id === widgetId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === enabledWidgets.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newWidgets = [...layoutConfig.widgets];
    
    const currentWidget = newWidgets.find(w => w.id === widgetId);
    const targetWidget = newWidgets.find(w => w.id === enabledWidgets[targetIndex].id);
    
    if (currentWidget && targetWidget) {
      const tempPosition = currentWidget.position;
      currentWidget.position = targetWidget.position;
      targetWidget.position = tempPosition;
    }

    onLayoutChange({
      ...layoutConfig,
      widgets: newWidgets
    });
  };

  const resetToDefault = () => {
    const defaultWidgets: DashboardWidgetConfig[] = [
      {
        id: 'quickStats',
        type: 'quickStats',
        enabled: true,
        size: 'large',
        position: 0,
        settings: {
          showStats: {
            totalHours: true,
            thisWeek: true,
            contractProgress: true,
            overtime: true
          }
        }
      },
      {
        id: 'dailyHours',
        type: 'dailyHours',
        enabled: true,
        size: 'medium',
        position: 1,
        settings: {
          timeRange: 7,
          showWeekends: true
        }
      },
      {
        id: 'hoursDistribution',
        type: 'hoursDistribution',
        enabled: true,
        size: 'medium',
        position: 2,
        settings: {
          showLegend: true
        }
      },
      {
        id: 'performanceLegend',
        type: 'performanceLegend',
        enabled: true,
        size: 'medium',
        position: 3,
        settings: {
          showBreakTimeInfo: true
        }
      }
    ];

    onLayoutChange({
      widgets: defaultWidgets,
      layout: 'grid',
      columns: 2
    });
  };

  const renderWidgetSettings = (widget: DashboardWidgetConfig) => {
    const settings = widget.settings || {};

    switch (widget.type) {
      case 'quickStats':
        const showStats = settings.showStats || {};
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Displayed Statistics</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {Object.entries({
                  totalHours: 'Total Hours',
                  thisWeek: 'This Week',
                  contractProgress: 'Contract Progress',
                  overtime: 'Overtime/Undertime'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Switch
                      id={`${widget.id}-${key}`}
                      checked={showStats[key] ?? true}
                      onCheckedChange={(checked) =>
                        updateWidgetSettings(widget.id, {
                          showStats: { ...showStats, [key]: checked }
                        })
                      }
                    />
                    <Label htmlFor={`${widget.id}-${key}`} className="text-sm">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'dailyHours':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Time Range (Days)</Label>
              <div className="mt-2">
                <Slider
                  value={[settings.timeRange || 7]}
                  onValueChange={([value]) =>
                    updateWidgetSettings(widget.id, { timeRange: value })
                  }
                  max={30}
                  min={3}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>3 days</span>
                  <span>{settings.timeRange || 7} days</span>
                  <span>30 days</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id={`${widget.id}-weekends`}
                checked={settings.showWeekends ?? true}
                onCheckedChange={(checked) =>
                  updateWidgetSettings(widget.id, { showWeekends: checked })
                }
              />
              <Label htmlFor={`${widget.id}-weekends`} className="text-sm">
                Show Weekends
              </Label>
            </div>
          </div>
        );

      case 'hoursDistribution':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id={`${widget.id}-legend`}
                checked={settings.showLegend ?? true}
                onCheckedChange={(checked) =>
                  updateWidgetSettings(widget.id, { showLegend: checked })
                }
              />
              <Label htmlFor={`${widget.id}-legend`} className="text-sm">
                Show Legend
              </Label>
            </div>
          </div>
        );

      case 'performanceLegend':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id={`${widget.id}-breakinfo`}
                checked={settings.showBreakTimeInfo ?? true}
                onCheckedChange={(checked) =>
                  updateWidgetSettings(widget.id, { showBreakTimeInfo: checked })
                }
              />
              <Label htmlFor={`${widget.id}-breakinfo`} className="text-sm">
                Show Break Time Info
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5" />
          <div>
            <h3 className="text-lg font-medium">Dashboard Layout</h3>
            <p className="text-sm text-muted-foreground">
              Customize your dashboard widgets and their settings
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={resetToDefault}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Default
        </Button>
      </div>

      {/* Enabled Widgets */}
      <div>
        <h4 className="font-medium mb-3">Active Widgets</h4>
        <div className="space-y-3">
          {enabledWidgets.map((widget, index) => (
            <Card key={widget.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveWidget(widget.id, 'up')}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveWidget(widget.id, 'down')}
                        disabled={index === enabledWidgets.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                    <div>
                      <CardTitle className="text-sm">
                        {WIDGET_TYPES[widget.type]?.name || widget.type}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {WIDGET_TYPES[widget.type]?.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{widget.size}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedWidget(expandedWidget === widget.id ? null : widget.id)
                      }
                    >
                      <SettingsIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleWidget(widget.id)}
                    >
                      Disable
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedWidget === widget.id && (
                <>
                  <Separator />
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {/* Size Selection */}
                      <div>
                        <Label className="text-sm font-medium">Widget Size</Label>
                        <div className="flex gap-2 mt-2">
                          {(['compact', 'medium', 'large'] as const).map((size) => (
                            <Button
                              key={size}
                              variant={widget.size === size ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateWidgetSize(widget.id, size)}
                              className="text-xs flex-1"
                            >
                              {size}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Widget-specific Settings */}
                      {renderWidgetSettings(widget)}
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Disabled Widgets */}
      {disabledWidgets.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Available Widgets</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {disabledWidgets.map((widget) => (
              <Card key={widget.id} className="border-dashed">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">
                        {WIDGET_TYPES[widget.type]?.name || widget.type}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {WIDGET_TYPES[widget.type]?.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleWidget(widget.id)}
                    >
                      Enable
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}