import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { LayoutGrid, Plus, Settings as SettingsIcon, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';
import { QuickStatsWidget } from './widgets/QuickStatsWidget';
import { DailyHoursWidget } from './widgets/DailyHoursWidget';
import { HoursDistributionWidget } from './widgets/HoursDistributionWidget';
import { PerformanceLegendWidget } from './widgets/PerformanceLegendWidget';
import { Contract, TimeEntry, AppSettings, DashboardLayoutConfig, DashboardWidgetConfig } from '../../hooks/useClockifyData';

interface CustomizableDashboardProps {
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  originalTimeEntries?: TimeEntry[];
  settings: AppSettings;
  layoutConfig: DashboardLayoutConfig;
  onLayoutChange: (config: DashboardLayoutConfig) => void;
}

export function CustomizableDashboard({
  currentContract,
  timeEntries,
  originalTimeEntries,
  settings,
  layoutConfig,
  onLayoutChange
}: CustomizableDashboardProps) {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const enabledWidgets = layoutConfig.widgets
    .filter(widget => widget.enabled)
    .sort((a, b) => a.position - b.position);

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
    setConfigDialogOpen(false);
  };

  const renderWidget = (widgetConfig: DashboardWidgetConfig, index: number) => {
    const baseProps = {
      id: widgetConfig.id,
      currentContract,
      timeEntries,
      settings,
      size: widgetConfig.size,
      onResize: (size: 'compact' | 'medium' | 'large') => updateWidgetSize(widgetConfig.id, size),
      onRemove: () => toggleWidget(widgetConfig.id),
      className: ''
    };

    let widget: React.ReactNode;

    switch (widgetConfig.type) {
      case 'quickStats':
        widget = (
          <QuickStatsWidget
            {...baseProps}
            showStats={widgetConfig.settings?.showStats}
          />
        );
        break;
      case 'dailyHours':
        widget = (
          <DailyHoursWidget
            {...baseProps}
            timeRange={widgetConfig.settings?.timeRange || 7}
            showWeekends={widgetConfig.settings?.showWeekends ?? true}
          />
        );
        break;
      case 'hoursDistribution':
        widget = (
          <HoursDistributionWidget
            {...baseProps}
            showLegend={widgetConfig.settings?.showLegend ?? true}
          />
        );
        break;
      case 'performanceLegend':
        widget = (
          <PerformanceLegendWidget
            {...baseProps}
            showBreakTimeInfo={widgetConfig.settings?.showBreakTimeInfo ?? true}
          />
        );
        break;
      default:
        return null;
    }

    return (
      <div key={widgetConfig.id} className="group relative">
        {widget}
        {/* Position Controls */}
        <div className="absolute top-2 right-16 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => moveWidget(widgetConfig.id, 'up')}
            disabled={index === 0}
            className="h-6 w-6 p-0"
            title="Move up"
          >
            <ArrowUp className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => moveWidget(widgetConfig.id, 'down')}
            disabled={index === enabledWidgets.length - 1}
            className="h-6 w-6 p-0"
            title="Move down"
          >
            <ArrowDown className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  };

  const getGridCols = () => {
    const largeWidgets = enabledWidgets.filter(w => w.size === 'large').length;
    if (largeWidgets > 0) {
      return 'grid-cols-1 lg:grid-cols-2';
    }
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5" />
          <h2 className="text-lg font-medium">Customizable Dashboard</h2>
        </div>
        
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Configure Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Dashboard Configuration</DialogTitle>
              <DialogDescription>
                Customize which widgets are shown and their settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {layoutConfig.widgets.map((widget) => (
                  <Card key={widget.id} className={widget.enabled ? 'border-primary' : 'border-muted'}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm capitalize">
                          {widget.type.replace(/([A-Z])/g, ' $1').trim()}
                        </CardTitle>
                        <Button
                          variant={widget.enabled ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleWidget(widget.id)}
                          className="text-xs"
                        >
                          {widget.enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                    </CardHeader>
                    {widget.enabled && (
                      <CardContent className="pt-0">
                        <div className="flex gap-2">
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
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={resetToDefault}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Default
                </Button>
                <Button onClick={() => setConfigDialogOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard Grid */}
      <div className={`grid gap-6 ${getGridCols()}`}>
        {enabledWidgets.map((widgetConfig, index) => 
          renderWidget(widgetConfig, index)
        )}
      </div>

      {/* Empty State */}
      {enabledWidgets.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LayoutGrid className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Widgets Enabled</h3>
            <p className="text-muted-foreground text-center mb-4">
              Configure your dashboard to show the widgets you want to see
            </p>
            <Button onClick={() => setConfigDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Widgets
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}