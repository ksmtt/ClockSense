import React, { useState, useCallback } from 'react';
import { DndContext, closestCenter, DragOverlay, DragStartEvent, DragEndEvent, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { LayoutGrid, Plus, Settings as SettingsIcon, RotateCcw } from 'lucide-react';
import { QuickStatsWidget } from './widgets/QuickStatsWidget';
import { DailyHoursWidget } from './widgets/DailyHoursWidget';
import { HoursDistributionWidget } from './widgets/HoursDistributionWidget';
import { PerformanceLegendWidget } from './widgets/PerformanceLegendWidget';
import { Contract, TimeEntry, AppSettings, DashboardLayoutConfig, DashboardWidgetConfig } from '../../hooks/useClockifyData';

interface DashboardLayoutProps {
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  originalTimeEntries?: TimeEntry[];
  settings: AppSettings;
  layoutConfig: DashboardLayoutConfig;
  onLayoutChange: (config: DashboardLayoutConfig) => void;
}

// Default widget configurations
const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
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

// Sortable widget wrapper
function SortableWidget({ 
  children, 
  id, 
  isDragging 
}: { 
  children: React.ReactNode; 
  id: string; 
  isDragging: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {React.cloneElement(children as React.ReactElement, {
        dragHandleProps: listeners,
        isDragging
      })}
    </div>
  );
}

export function DashboardLayout({
  currentContract,
  timeEntries,
  originalTimeEntries,
  settings,
  layoutConfig,
  onLayoutChange
}: DashboardLayoutProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const enabledWidgets = layoutConfig.widgets
    .filter(widget => widget.enabled)
    .sort((a, b) => a.position - b.position);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = enabledWidgets.findIndex(widget => widget.id === active.id);
      const newIndex = enabledWidgets.findIndex(widget => widget.id === over.id);
      
      const newWidgets = [...layoutConfig.widgets];
      const movedWidget = newWidgets.find(w => w.id === active.id);
      const targetWidget = newWidgets.find(w => w.id === over.id);
      
      if (movedWidget && targetWidget) {
        const tempPosition = movedWidget.position;
        movedWidget.position = targetWidget.position;
        targetWidget.position = tempPosition;
      }
      
      onLayoutChange({
        ...layoutConfig,
        widgets: newWidgets
      });
    }
    
    setActiveId(null);
  }, [enabledWidgets, layoutConfig, onLayoutChange]);

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

  const resetToDefault = () => {
    onLayoutChange({
      widgets: DEFAULT_WIDGETS,
      layout: 'grid',
      columns: 2
    });
    setConfigDialogOpen(false);
  };

  const renderWidget = (widgetConfig: DashboardWidgetConfig) => {
    const baseProps = {
      id: widgetConfig.id,
      currentContract,
      timeEntries,
      settings,
      size: widgetConfig.size,
      onResize: (size: 'compact' | 'medium' | 'large') => updateWidgetSize(widgetConfig.id, size),
      onRemove: () => toggleWidget(widgetConfig.id)
    };

    switch (widgetConfig.type) {
      case 'quickStats':
        return (
          <QuickStatsWidget
            {...baseProps}
            showStats={widgetConfig.settings?.showStats}
          />
        );
      case 'dailyHours':
        return (
          <DailyHoursWidget
            {...baseProps}
            timeRange={widgetConfig.settings?.timeRange || 7}
            showWeekends={widgetConfig.settings?.showWeekends ?? true}
          />
        );
      case 'hoursDistribution':
        return (
          <HoursDistributionWidget
            {...baseProps}
            showLegend={widgetConfig.settings?.showLegend ?? true}
          />
        );
      case 'performanceLegend':
        return (
          <PerformanceLegendWidget
            {...baseProps}
            showBreakTimeInfo={widgetConfig.settings?.showBreakTimeInfo ?? true}
          />
        );
      default:
        return null;
    }
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={enabledWidgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className={`grid gap-6 ${getGridCols()}`}>
            {enabledWidgets.map((widgetConfig) => (
              <SortableWidget
                key={widgetConfig.id}
                id={widgetConfig.id}
                isDragging={activeId === widgetConfig.id}
              >
                {renderWidget(widgetConfig)}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-80">
              {renderWidget(enabledWidgets.find(w => w.id === activeId)!)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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