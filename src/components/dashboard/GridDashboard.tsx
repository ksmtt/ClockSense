import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { LayoutGrid, Plus, Settings as SettingsIcon, RotateCcw, Maximize2, Minimize2, Edit3, Save, X, Grid3X3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { ChartLegend } from './ChartLegend';
import { WidgetContextMenu } from './WidgetContextMenu';
import { WidgetConfigurationPanel } from './WidgetConfigurationPanel';
import { TotalHoursWidget } from './widgets/TotalHoursWidget';
import { ThisWeekWidget } from './widgets/ThisWeekWidget';
import { ContractProgressWidget } from './widgets/ContractProgressWidget';
import { OvertimeWidget } from './widgets/OvertimeWidget';
import { DailyHoursWidget } from './widgets/DailyHoursWidget';
import { HoursDistributionWidget } from './widgets/HoursDistributionWidget';
import { PerformanceLegendWidget } from './widgets/PerformanceLegendWidget';
import { WeeklyTrendWidget } from './widgets/WeeklyTrendWidget';
import { ContractTimelineWidget } from './widgets/ContractTimelineWidget';
import { BreakTimeAnalysisWidget } from './widgets/BreakTimeAnalysisWidget';
import { Contract, TimeEntry, AppSettings, DashboardLayoutConfig } from '../../hooks/useClockifyData';

interface GridItem {
  id: string;
  type: string;
  x: number;      // Grid column (0-11)
  y: number;      // Grid row (0-11)
  width: number;  // Grid cells width (1-12)
  height: number; // Grid cells height (1-12)
  settings?: Record<string, any>;
}

interface GridDashboardProps {
  currentContract?: Contract;
  timeEntries: TimeEntry[];
  originalTimeEntries?: TimeEntry[];
  settings: AppSettings;
  layoutConfig: DashboardLayoutConfig;
  onLayoutChange: (config: DashboardLayoutConfig) => void;
}

// Grid configuration options
const GRID_PRESETS = {
  '6x8': { cols: 6, rows: 8 },
  '8x10': { cols: 8, rows: 10 },
  '10x12': { cols: 10, rows: 12 },
  '12x12': { cols: 12, rows: 12 },
  '12x16': { cols: 12, rows: 16 },
  '16x20': { cols: 16, rows: 20 }
};

const DEFAULT_GRID_SIZE = '12x12';
const MIN_CELL_SIZE = 60; // Minimum cell size in pixels
const GRID_GAP = 8; // Gap between grid cells

const WIDGET_TYPES = {
  totalHours: { 
    name: 'Total Hours', 
    defaultSize: { width: 3, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 6, height: 3 }
  },
  thisWeek: { 
    name: 'This Week', 
    defaultSize: { width: 3, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 6, height: 3 }
  },
  contractProgress: { 
    name: 'Contract Progress', 
    defaultSize: { width: 3, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 6, height: 3 }
  },
  overtime: { 
    name: 'Overtime', 
    defaultSize: { width: 3, height: 2 },
    minSize: { width: 2, height: 2 },
    maxSize: { width: 6, height: 3 }
  },
  dailyHours: { 
    name: 'Daily Hours Chart', 
    defaultSize: { width: 6, height: 4 },
    minSize: { width: 4, height: 3 },
    maxSize: { width: 12, height: 8 }
  },
  hoursDistribution: { 
    name: 'Hours Distribution', 
    defaultSize: { width: 4, height: 4 },
    minSize: { width: 3, height: 3 },
    maxSize: { width: 8, height: 8 }
  },
  performanceLegend: { 
    name: 'Performance Legend', 
    defaultSize: { width: 8, height: 2 },
    minSize: { width: 4, height: 2 },
    maxSize: { width: 12, height: 3 }
  },
  weeklyTrend: { 
    name: 'Weekly Trend', 
    defaultSize: { width: 6, height: 3 },
    minSize: { width: 4, height: 3 },
    maxSize: { width: 12, height: 6 }
  },
  contractTimeline: { 
    name: 'Contract Timeline', 
    defaultSize: { width: 12, height: 3 },
    minSize: { width: 6, height: 2 },
    maxSize: { width: 12, height: 6 }
  },
  breakTimeAnalysis: { 
    name: 'Break Time Analysis', 
    defaultSize: { width: 4, height: 3 },
    minSize: { width: 3, height: 3 },
    maxSize: { width: 8, height: 6 }
  }
};

export function GridDashboard({
  currentContract,
  timeEntries,
  originalTimeEntries,
  settings,
  layoutConfig,
  onLayoutChange
}: GridDashboardProps) {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [dragItem, setDragItem] = useState<GridItem | null>(null);
  const [resizeItem, setResizeItem] = useState<GridItem | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [layoutMode, setLayoutMode] = useState(false);
  const [configuringWidget, setConfiguringWidget] = useState<GridItem | null>(null);
  const [gridSize, setGridSize] = useState(layoutConfig.gridSize || DEFAULT_GRID_SIZE);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const gridRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic grid dimensions and cell sizes
  const { cols: GRID_COLS, rows: GRID_ROWS } = GRID_PRESETS[gridSize] || GRID_PRESETS[DEFAULT_GRID_SIZE];
  
  const CELL_SIZE = useMemo(() => {
    if (!containerDimensions.width || !containerDimensions.height) return MIN_CELL_SIZE;
    
    const padding = 32; // 16px padding on each side
    const availableWidth = containerDimensions.width - padding;
    const availableHeight = containerDimensions.height - padding;
    
    // Calculate cell size based on available space
    const cellWidthBasedOnWidth = (availableWidth - (GRID_COLS - 1) * GRID_GAP) / GRID_COLS;
    const cellHeightBasedOnHeight = (availableHeight - (GRID_ROWS - 1) * GRID_GAP) / GRID_ROWS;
    
    // Use the smaller dimension to maintain square cells, but give preference to width
    const calculatedSize = Math.min(cellWidthBasedOnWidth, cellHeightBasedOnHeight);
    
    // Round to nearest integer to avoid sub-pixel issues
    const roundedSize = Math.round(Math.max(MIN_CELL_SIZE, calculatedSize));
    
    return roundedSize;
  }, [containerDimensions, GRID_COLS, GRID_ROWS]);

  // Resize observer to track container dimensions
  useEffect(() => {
    if (!gridRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerDimensions({ width, height });
      }
    });

    // Set initial dimensions
    const rect = gridRef.current.getBoundingClientRect();
    setContainerDimensions({ width: rect.width, height: rect.height });

    resizeObserver.observe(gridRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Set default container dimensions on mount if not set by ResizeObserver
  useEffect(() => {
    if (!containerDimensions.width && gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      if (rect.width > 0) {
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    }
  }, [containerDimensions.width]);

  // Convert layout config to grid items
  const gridItems: GridItem[] = layoutConfig.widgets
    .filter(widget => widget.enabled)
    .map(widget => ({
      id: widget.id,
      type: widget.type,
      x: widget.settings?.gridPosition?.x || 0,
      y: widget.settings?.gridPosition?.y || 0,
      width: widget.settings?.gridPosition?.width || WIDGET_TYPES[widget.type]?.defaultSize.width || 4,
      height: widget.settings?.gridPosition?.height || WIDGET_TYPES[widget.type]?.defaultSize.height || 3,
      settings: widget.settings
    }));

  const updateGridItem = (id: string, updates: Partial<GridItem>) => {
    const newWidgets = layoutConfig.widgets.map(widget => {
      if (widget.id === id) {
        return {
          ...widget,
          settings: {
            ...widget.settings,
            gridPosition: {
              x: updates.x ?? widget.settings?.gridPosition?.x ?? 0,
              y: updates.y ?? widget.settings?.gridPosition?.y ?? 0,
              width: updates.width ?? widget.settings?.gridPosition?.width ?? 4,
              height: updates.height ?? widget.settings?.gridPosition?.height ?? 3
            }
          }
        };
      }
      return widget;
    });

    onLayoutChange({
      ...layoutConfig,
      widgets: newWidgets
    });
  };

  const handleGridSizeChange = (newGridSize: string) => {
    setGridSize(newGridSize);
    
    // Update layout config with new grid size
    onLayoutChange({
      ...layoutConfig,
      gridSize: newGridSize
    });
    
    // Optionally, you could also validate and adjust widget positions here
    // to ensure they fit within the new grid bounds
    const { cols, rows } = GRID_PRESETS[newGridSize];
    const adjustedWidgets = layoutConfig.widgets.map(widget => {
      const gridPos = widget.settings?.gridPosition;
      if (!gridPos) return widget;
      
      return {
        ...widget,
        settings: {
          ...widget.settings,
          gridPosition: {
            ...gridPos,
            x: Math.min(gridPos.x, cols - gridPos.width),
            y: Math.min(gridPos.y, rows - gridPos.height),
            width: Math.min(gridPos.width, cols),
            height: Math.min(gridPos.height, rows)
          }
        }
      };
    });
    
    onLayoutChange({
      ...layoutConfig,
      gridSize: newGridSize,
      widgets: adjustedWidgets
    });
  };

  const addWidget = (type: string, position?: { x: number; y: number }, config?: Record<string, any>) => {
    const widgetConfig = WIDGET_TYPES[type];
    if (!widgetConfig) return;

    // Find available position
    const findAvailablePosition = (preferredPos?: { x: number; y: number }) => {
      // If a preferred position is provided, try it first
      if (preferredPos) {
        const isPositionFree = !gridItems.some(item => 
          preferredPos.x < item.x + item.width &&
          preferredPos.x + widgetConfig.defaultSize.width > item.x &&
          preferredPos.y < item.y + item.height &&
          preferredPos.y + widgetConfig.defaultSize.height > item.y
        );
        
        // Check if the widget fits within grid bounds
        if (isPositionFree && 
            preferredPos.x + widgetConfig.defaultSize.width <= GRID_COLS &&
            preferredPos.y + widgetConfig.defaultSize.height <= GRID_ROWS) {
          return preferredPos;
        }
      }
      
      // Fall back to automatic positioning
      for (let y = 0; y <= GRID_ROWS - widgetConfig.defaultSize.height; y++) {
        for (let x = 0; x <= GRID_COLS - widgetConfig.defaultSize.width; x++) {
          const isPositionFree = !gridItems.some(item => 
            x < item.x + item.width &&
            x + widgetConfig.defaultSize.width > item.x &&
            y < item.y + item.height &&
            y + widgetConfig.defaultSize.height > item.y
          );
          if (isPositionFree) {
            return { x, y };
          }
        }
      }
      return { x: 0, y: 0 }; // Fallback to top-left
    };

    const finalPosition = findAvailablePosition(position);
    const newId = `${type}-${Date.now()}`;

    const newWidget = {
      id: newId,
      type: type as any,
      enabled: true,
      size: 'medium' as const,
      position: layoutConfig.widgets.length,
      settings: {
        gridPosition: {
          x: finalPosition.x,
          y: finalPosition.y,
          width: widgetConfig.defaultSize.width,
          height: widgetConfig.defaultSize.height
        },
        ...config // Merge any additional configuration
      }
    };

    onLayoutChange({
      ...layoutConfig,
      widgets: [...layoutConfig.widgets, newWidget]
    });
  };

  const removeWidget = (id: string) => {
    const newWidgets = layoutConfig.widgets.filter(widget => widget.id !== id);
    onLayoutChange({
      ...layoutConfig,
      widgets: newWidgets
    });
    
    // Close configuration panel if this widget was being configured
    if (configuringWidget?.id === id) {
      setConfiguringWidget(null);
    }
  };

  const updateWidgetConfig = (widgetId: string, newSettings: Record<string, any>) => {
    const newWidgets = layoutConfig.widgets.map(widget => {
      if (widget.id === widgetId) {
        const updatedWidget = {
          ...widget,
          settings: {
            ...widget.settings,
            ...newSettings
          }
        };
        
        // Update configuringWidget if this is the widget being configured
        if (configuringWidget?.id === widgetId) {
          setConfiguringWidget({
            ...configuringWidget,
            settings: updatedWidget.settings
          });
        }
        
        return updatedWidget;
      }
      return widget;
    });

    onLayoutChange({
      ...layoutConfig,
      widgets: newWidgets
    });
  };

  const getGridPosition = (clientX: number, clientY: number) => {
    if (!gridRef.current) return { x: 0, y: 0 };
    
    const rect = gridRef.current.getBoundingClientRect();
    const padding = 16; // Account for grid padding
    const cellWithGap = CELL_SIZE + GRID_GAP;
    
    const x = Math.floor((clientX - rect.left - padding) / cellWithGap);
    const y = Math.floor((clientY - rect.top - padding) / cellWithGap);
    
    return {
      x: Math.max(0, Math.min(GRID_COLS - 1, x)),
      y: Math.max(0, Math.min(GRID_ROWS - 1, y))
    };
  };

  const handleMouseDown = (e: React.MouseEvent, item: GridItem, action: 'drag' | 'resize') => {
    if (!layoutMode) return; // Only allow dragging/resizing in layout mode
    
    e.preventDefault();
    const position = getGridPosition(e.clientX, e.clientY);
    
    if (action === 'drag') {
      setDragItem(item);
      setDragOffset({
        x: position.x - item.x,
        y: position.y - item.y
      });
    } else if (action === 'resize') {
      setResizeItem(item);
      setIsResizing(true);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragItem) {
      const position = getGridPosition(e.clientX, e.clientY);
      const newX = Math.max(0, Math.min(GRID_COLS - dragItem.width, position.x - dragOffset.x));
      const newY = Math.max(0, Math.min(GRID_ROWS - dragItem.height, position.y - dragOffset.y));
      
      updateGridItem(dragItem.id, { x: newX, y: newY });
    } else if (resizeItem && isResizing) {
      const position = getGridPosition(e.clientX, e.clientY);
      const widgetType = WIDGET_TYPES[resizeItem.type];
      
      const newWidth = Math.max(
        widgetType?.minSize.width || 2,
        Math.min(
          widgetType?.maxSize.width || GRID_COLS,
          Math.min(GRID_COLS - resizeItem.x, position.x - resizeItem.x + 1)
        )
      );
      
      const newHeight = Math.max(
        widgetType?.minSize.height || 2,
        Math.min(
          widgetType?.maxSize.height || GRID_ROWS,
          Math.min(GRID_ROWS - resizeItem.y, position.y - resizeItem.y + 1)
        )
      );
      
      updateGridItem(resizeItem.id, { width: newWidth, height: newHeight });
    }
  }, [dragItem, resizeItem, isResizing, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDragItem(null);
    setResizeItem(null);
    setIsResizing(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (dragItem || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragItem, isResizing, handleMouseMove, handleMouseUp]);

  const renderWidget = (item: GridItem) => {
    const style = {
      gridColumn: `${item.x + 1} / ${item.x + item.width + 1}`,
      gridRow: `${item.y + 1} / ${item.y + item.height + 1}`,
    };

    const baseProps = {
      id: item.id,
      currentContract,
      timeEntries,
      settings,
      onRemove: () => removeWidget(item.id),
    };

    let widget: React.ReactNode;

    switch (item.type) {
      case 'totalHours':
        widget = (
          <TotalHoursWidget 
            {...baseProps} 
            size={{ width: item.width, height: item.height }}
            showDetails={item.settings?.showDetails ?? false}
            showTrend={item.settings?.showTrend ?? true}
            timePeriod={item.settings?.timePeriod || 'current'}
          />
        );
        break;
      case 'thisWeek':
        widget = (
          <ThisWeekWidget 
            {...baseProps} 
            size={{ width: item.width, height: item.height }}
            showProgress={item.settings?.showProgress ?? true}
            showTarget={item.settings?.showTarget ?? true}
            showRemaining={item.settings?.showRemaining ?? false}
          />
        );
        break;
      case 'contractProgress':
        widget = (
          <ContractProgressWidget 
            {...baseProps} 
            size={{ width: item.width, height: item.height }}
            showTimeRemaining={item.settings?.showTimeRemaining ?? true}
            showEndDate={item.settings?.showEndDate ?? true}
            progressType={item.settings?.progressType || 'time'}
          />
        );
        break;
      case 'overtime':
        widget = (
          <OvertimeWidget 
            {...baseProps} 
            size={{ width: item.width, height: item.height }}
            alertThreshold={item.settings?.alertThreshold || 5}
            showWeekly={item.settings?.showWeekly ?? true}
            showMonthly={item.settings?.showMonthly ?? false}
          />
        );
        break;
      case 'dailyHours':
        widget = (
          <DailyHoursWidget 
            {...baseProps} 
            size={{ width: item.width, height: item.height }} 
            timeRange={item.settings?.timeRange || 7} 
            showWeekends={item.settings?.showWeekends ?? true}
            chartType={item.settings?.chartType || 'bar'}
            showTargetLine={item.settings?.showTargetLine ?? false}
          />
        );
        break;
      case 'hoursDistribution':
        widget = (
          <HoursDistributionWidget 
            {...baseProps} 
            size={{ width: item.width, height: item.height }} 
            showLegend={item.settings?.showLegend ?? true}
            showPercentages={item.settings?.showPercentages ?? true}
            chartType={item.settings?.chartType || 'pie'}
            groupBy={item.settings?.groupBy || 'day'}
          />
        );
        break;
      case 'performanceLegend':
        widget = (
          <PerformanceLegendWidget 
            {...baseProps} 
            size={{ width: item.width, height: item.height }} 
            showBreakTimeInfo={item.settings?.showBreakTimeInfo ?? true}
            showColorCoding={item.settings?.showColorCoding ?? true}
            compactMode={item.settings?.compactMode ?? false}
          />
        );
        break;
      case 'weeklyTrend':
        widget = (
          <WeeklyTrendWidget 
            {...baseProps} 
            size={{ width: item.width, height: item.height }}
            weekCount={item.settings?.weekCount || 8}
            showAverage={item.settings?.showAverage ?? true}
            showTarget={item.settings?.showTarget ?? false}
          />
        );
        break;
      case 'contractTimeline':
        widget = (
          <ContractTimelineWidget 
            {...baseProps}
            showMilestones={item.settings?.showMilestones ?? true}
            showProgress={item.settings?.showProgress ?? true}
            timelineView={item.settings?.timelineView || 'all'}
          />
        );
        break;
      case 'breakTimeAnalysis':
        widget = (
          <BreakTimeAnalysisWidget 
            {...baseProps}
            analysisPeriod={item.settings?.analysisPeriod || 'week'}
            showRecommendations={item.settings?.showRecommendations ?? true}
          />
        );
        break;
      default:
        return null;
    }

    return (
      <div
        key={item.id}
        style={style}
        className={`relative group border rounded-lg bg-card shadow-sm hover:shadow-md transition-all duration-200 ${
          dragItem?.id === item.id ? 'z-50 opacity-75 scale-105 ring-2 ring-primary shadow-lg' : ''
        } ${resizeItem?.id === item.id ? 'ring-2 ring-primary shadow-lg' : ''} ${
          layoutMode ? 'ring-1 ring-primary/30 bg-card/60 backdrop-blur-sm hover:ring-primary/50 hover:bg-card/80' : ''
        } ${layoutMode ? 'cursor-move' : ''}`}
        onMouseDown={layoutMode ? (e) => handleMouseDown(e, item, 'drag') : undefined}
      >
        {/* Layout Mode Controls */}
        {layoutMode && (
          <>
            {/* Corner Resize Handles */}
            <div
              className={`absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full transition-all duration-200 cursor-nw-resize z-20 border-2 border-white shadow-md ${
                resizeItem?.id === item.id ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
              }`}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, item, 'resize');
              }}
            />
            <div
              className={`absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full transition-all duration-200 cursor-ne-resize z-20 border-2 border-white shadow-md ${
                resizeItem?.id === item.id ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
              }`}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, item, 'resize');
              }}
            />
            <div
              className={`absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full transition-all duration-200 cursor-sw-resize z-20 border-2 border-white shadow-md ${
                resizeItem?.id === item.id ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
              }`}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, item, 'resize');
              }}
            />
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full transition-all duration-200 cursor-se-resize z-20 border-2 border-white shadow-md ${
                resizeItem?.id === item.id ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
              }`}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, item, 'resize');
              }}
            />

            {/* Edge Resize Handles */}
            <div
              className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-primary rounded-full transition-all duration-200 cursor-n-resize z-20 border border-white shadow-sm ${
                resizeItem?.id === item.id ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
              }`}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, item, 'resize');
              }}
            />
            <div
              className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-primary rounded-full transition-all duration-200 cursor-s-resize z-20 border border-white shadow-sm ${
                resizeItem?.id === item.id ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
              }`}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, item, 'resize');
              }}
            />
            <div
              className={`absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-primary rounded-full transition-all duration-200 cursor-w-resize z-20 border border-white shadow-sm ${
                resizeItem?.id === item.id ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
              }`}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, item, 'resize');
              }}
            />
            <div
              className={`absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-primary rounded-full transition-all duration-200 cursor-e-resize z-20 border border-white shadow-sm ${
                resizeItem?.id === item.id ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
              }`}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, item, 'resize');
              }}
            />

            {/* Widget Controls */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfiguringWidget(item);
                }}
                className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
                title="Configure widget"
              >
                <SettingsIcon className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeWidget(item.id);
                }}
                className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                title="Remove widget"
              >
                ×
              </Button>
            </div>
          </>
        )}

        {/* Widget Content */}
        <div className="h-full overflow-hidden">
          {widget}
        </div>
      </div>
    );
  };

  const resetToDefault = () => {
    const defaultWidgets = [
      {
        id: 'totalHours',
        type: 'totalHours' as const,
        enabled: true,
        size: 'medium' as const,
        position: 0,
        settings: {
          gridPosition: { x: 0, y: 0, width: 3, height: 2 }
        }
      },
      {
        id: 'thisWeek',
        type: 'thisWeek' as const,
        enabled: true,
        size: 'medium' as const,
        position: 1,
        settings: {
          gridPosition: { x: 3, y: 0, width: 3, height: 2 }
        }
      },
      {
        id: 'contractProgress',
        type: 'contractProgress' as const,
        enabled: true,
        size: 'medium' as const,
        position: 2,
        settings: {
          gridPosition: { x: 6, y: 0, width: 3, height: 2 }
        }
      },
      {
        id: 'overtime',
        type: 'overtime' as const,
        enabled: true,
        size: 'medium' as const,
        position: 3,
        settings: {
          gridPosition: { x: 9, y: 0, width: 3, height: 2 }
        }
      },
      {
        id: 'dailyHours',
        type: 'dailyHours' as const,
        enabled: true,
        size: 'medium' as const,
        position: 4,
        settings: {
          gridPosition: { x: 0, y: 2, width: 8, height: 4 },
          timeRange: 7,
          showWeekends: true
        }
      },
      {
        id: 'hoursDistribution',
        type: 'hoursDistribution' as const,
        enabled: true,
        size: 'medium' as const,
        position: 5,
        settings: {
          gridPosition: { x: 8, y: 2, width: 4, height: 4 },
          showLegend: true
        }
      },
      {
        id: 'performanceLegend',
        type: 'performanceLegend' as const,
        enabled: true,
        size: 'medium' as const,
        position: 6,
        settings: {
          gridPosition: { x: 0, y: 6, width: 12, height: 2 },
          showBreakTimeInfo: true
        }
      }
    ];

    onLayoutChange({
      widgets: defaultWidgets,
      layout: 'grid',
      columns: 12,
      gridSize: DEFAULT_GRID_SIZE
    });
    setConfigDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5" />
          <h2 className="text-lg font-medium">Grid Dashboard</h2>
          <Badge variant="outline">{GRID_COLS}×{GRID_ROWS} Grid</Badge>
          <Badge variant="outline" className="font-mono">{Math.round(CELL_SIZE)}px cells</Badge>
          {layoutMode && <Badge variant="secondary">Layout Mode</Badge>}
        </div>
        
        <div className="flex items-center gap-2">
          {!layoutMode ? (
            <>
              <div className="flex items-center gap-2">
                <Label htmlFor="grid-size-select" className="text-sm">Grid:</Label>
                <Select value={gridSize} onValueChange={handleGridSizeChange}>
                  <SelectTrigger id="grid-size-select" className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GRID_PRESETS).map(([size, { cols, rows }]) => (
                      <SelectItem key={size} value={size}>
                        {cols}×{rows}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLayoutMode(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Layout
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Label htmlFor="grid-size-select-edit" className="text-sm">Grid:</Label>
                <Select value={gridSize} onValueChange={handleGridSizeChange}>
                  <SelectTrigger id="grid-size-select-edit" className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GRID_PRESETS).map(([size, { cols, rows }]) => (
                      <SelectItem key={size} value={size}>
                        {cols}×{rows}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Widget
                  </Button>
                </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Dashboard Widget</DialogTitle>
                <DialogDescription>
                  Choose a widget to add to your dashboard
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(WIDGET_TYPES).map(([type, config]) => (
                  <Card key={type} className="cursor-pointer hover:border-primary" onClick={() => {
                    addWidget(type);
                    setConfigDialogOpen(false);
                  }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{config.name}</CardTitle>
                      <CardDescription className="text-xs">
                        Size: {config.defaultSize.width}×{config.defaultSize.height} cells
                      </CardDescription>
                    </CardHeader>
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
            </DialogContent>
          </Dialog>
          
          <Button variant="default" size="sm" onClick={() => setLayoutMode(false)}>
            <Save className="w-4 h-4 mr-2" />
            Save Layout
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => setLayoutMode(false)}>
            <X className="w-4 h-4" />
          </Button>
            </>
          )}
        </div>
      </div>

      {/* Grid Dashboard */}
      <WidgetContextMenu 
        onAddWidget={addWidget} 
        disabled={!layoutMode}
      >
        <div
          ref={gridRef}
          className={`relative bg-muted/20 rounded-lg p-4 w-full transition-all duration-300 ${
            layoutMode ? 'grid-overlay bg-muted/40' : ''
          }`}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`,
            gap: `${GRID_GAP}px`,
            minHeight: `${GRID_ROWS * CELL_SIZE + (GRID_ROWS - 1) * GRID_GAP + 32}px`, // Dynamic min-height
            justifyContent: 'center', // Center the grid
            alignContent: 'start',
            ...(layoutMode && {
              '--grid-cell-size': `${CELL_SIZE + GRID_GAP}px`,
              '--grid-offset-x': '4px',
              '--grid-offset-y': '4px',
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary) / 0.15) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary) / 0.15) 1px, transparent 1px),
                linear-gradient(to right, hsl(var(--border)) 0.5px, transparent 0.5px),
                linear-gradient(to bottom, hsl(var(--border)) 0.5px, transparent 0.5px)
              `,
              backgroundSize: `${CELL_SIZE + GRID_GAP}px ${CELL_SIZE + GRID_GAP}px, ${CELL_SIZE + GRID_GAP}px ${CELL_SIZE + GRID_GAP}px, ${(CELL_SIZE + GRID_GAP) / 2}px ${(CELL_SIZE + GRID_GAP) / 2}px, ${(CELL_SIZE + GRID_GAP) / 2}px ${(CELL_SIZE + GRID_GAP) / 2}px`,
              backgroundPosition: '4px 4px, 4px 4px, 4px 4px, 4px 4px'
            } as React.CSSProperties)
          }}
        >
          {/* Grid Coordinates Overlay - Only in Layout Mode */}
          {layoutMode && (
            <>
              {/* Column Headers */}
              {Array.from({ length: GRID_COLS }, (_, i) => (
                <div
                  key={`col-${i}`}
                  className="absolute text-xs text-primary/60 font-mono pointer-events-none flex items-center justify-center"
                  style={{
                    top: '-20px',
                    left: `${4 + i * (CELL_SIZE + GRID_GAP)}px`,
                    width: `${CELL_SIZE}px`,
                    height: '16px'
                  }}
                >
                  {i}
                </div>
              ))}
              
              {/* Row Headers */}
              {Array.from({ length: GRID_ROWS }, (_, i) => (
                <div
                  key={`row-${i}`}
                  className="absolute text-xs text-primary/60 font-mono pointer-events-none flex items-center justify-center"
                  style={{
                    top: `${4 + i * (CELL_SIZE + GRID_GAP)}px`,
                    left: '-20px',
                    width: '16px',
                    height: `${CELL_SIZE}px`
                  }}
                >
                  {i}
                </div>
              ))}
              
              {/* Grid Origin Marker */}
              <div
                className="absolute w-2 h-2 bg-primary rounded-full pointer-events-none"
                style={{
                  top: '2px',
                  left: '2px',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </>
          )}

          {/* Render Widgets */}
          {gridItems.map(renderWidget)}

          {/* Empty State */}
          {gridItems.length === 0 && (
            <div className="col-span-full row-span-full flex items-center justify-center">
              <div className="text-center">
                <LayoutGrid className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Empty Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  {layoutMode ? 'Right-click anywhere to add widgets or use the Add Widget button' : 'Enter layout mode to add widgets'}
                </p>
                {layoutMode ? (
                  <Button onClick={() => setConfigDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Widget
                  </Button>
                ) : (
                  <Button onClick={() => setLayoutMode(true)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Layout
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </WidgetContextMenu>

      {/* Widget Configuration Panel */}
      {configuringWidget && (
        <WidgetConfigurationPanel
          widget={configuringWidget}
          onUpdateConfig={updateWidgetConfig}
          onClose={() => setConfiguringWidget(null)}
          isVisible={true}
        />
      )}

      {/* Instructions - Only show in layout mode */}
      {layoutMode && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span>Drag anywhere on the widget to move it</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Drag the colored handles on edges/corners to resize</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Right-click on empty areas to add widgets</span>
              </div>
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-primary" />
                <span>Click gear icon to configure widgets</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart Legend */}
      <ChartLegend />
    </div>
  );
}