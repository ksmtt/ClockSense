import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '../ui/context-menu';
import { 
  TrendingUp, 
  Clock, 
  Calendar, 
  PieChart, 
  BarChart3, 
  Activity, 
  Timer, 
  LineChart,
  Target,
  Coffee,
  Plus
} from 'lucide-react';

export interface WidgetSuggestion {
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'stats' | 'charts' | 'tracking';
  suggestedConfig?: Record<string, any>;
}

const WIDGET_SUGGESTIONS: WidgetSuggestion[] = [
  // Quick Stats
  {
    type: 'totalHours',
    name: 'Total Hours',
    description: 'Shows total time logged',
    icon: <Clock className="w-4 h-4" />,
    category: 'stats'
  },
  {
    type: 'thisWeek',
    name: 'This Week Stats',
    description: 'Current week progress',
    icon: <Calendar className="w-4 h-4" />,
    category: 'stats'
  },
  {
    type: 'contractProgress',
    name: 'Contract Progress',
    description: 'Shows contract completion',
    icon: <Target className="w-4 h-4" />,
    category: 'stats'
  },
  {
    type: 'overtime',
    name: 'Overtime Tracker',
    description: 'Track overtime hours',
    icon: <TrendingUp className="w-4 h-4" />,
    category: 'stats'
  },

  // Charts & Trends
  {
    type: 'dailyHours',
    name: 'Daily Hours Chart',
    description: 'Bar chart of daily hours',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'charts',
    suggestedConfig: { timeRange: 7, showWeekends: true }
  },
  {
    type: 'weeklyTrend',
    name: 'Weekly Trend',
    description: 'Line chart of weekly patterns',
    icon: <LineChart className="w-4 h-4" />,
    category: 'charts'
  },
  {
    type: 'hoursDistribution',
    name: 'Hours Distribution',
    description: 'Pie chart of time distribution',
    icon: <PieChart className="w-4 h-4" />,
    category: 'charts',
    suggestedConfig: { showLegend: true }
  },

  // Tracking & Analysis
  {
    type: 'breakTimeAnalysis',
    name: 'Break Time Analysis',
    description: 'Analyze break patterns',
    icon: <Coffee className="w-4 h-4" />,
    category: 'tracking'
  },
  {
    type: 'contractTimeline',
    name: 'Contract Timeline',
    description: 'Visual timeline of contracts',
    icon: <Activity className="w-4 h-4" />,
    category: 'tracking'
  },
  {
    type: 'performanceLegend',
    name: 'Performance Legend',
    description: 'Shows performance indicators',
    icon: <Timer className="w-4 h-4" />,
    category: 'tracking'
  }
];

interface WidgetContextMenuProps {
  children: React.ReactNode;
  onAddWidget: (type: string, position?: { x: number; y: number }, config?: Record<string, any>) => void;
  disabled?: boolean;
}

export function WidgetContextMenu({ children, onAddWidget, disabled }: WidgetContextMenuProps) {
  const handleAddWidget = (suggestion: WidgetSuggestion, event?: React.MouseEvent) => {
    let position: { x: number; y: number } | undefined;
    
    if (event) {
      // Calculate grid position from context menu trigger position
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const CELL_SIZE = 80;
      const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
      const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);
      position = { x: Math.max(0, x), y: Math.max(0, y) };
    }
    
    onAddWidget(suggestion.type, position, suggestion.suggestedConfig);
  };

  if (disabled) {
    return <>{children}</>;
  }

  const statWidgets = WIDGET_SUGGESTIONS.filter(w => w.category === 'stats');
  const chartWidgets = WIDGET_SUGGESTIONS.filter(w => w.category === 'charts');
  const trackingWidgets = WIDGET_SUGGESTIONS.filter(w => w.category === 'tracking');

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Widget
        </ContextMenuLabel>
        <ContextMenuSeparator />
        
        {/* Quick Stats */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Quick Stats
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56">
            {statWidgets.map((widget) => (
              <ContextMenuItem
                key={widget.type}
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={(e) => handleAddWidget(widget, e)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {widget.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{widget.name}</div>
                  <div className="text-xs text-muted-foreground">{widget.description}</div>
                </div>
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Charts & Trends */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Charts & Trends
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56">
            {chartWidgets.map((widget) => (
              <ContextMenuItem
                key={widget.type}
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={(e) => handleAddWidget(widget, e)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {widget.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{widget.name}</div>
                  <div className="text-xs text-muted-foreground">{widget.description}</div>
                </div>
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Tracking & Analysis */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Tracking & Analysis
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-56">
            {trackingWidgets.map((widget) => (
              <ContextMenuItem
                key={widget.type}
                className="flex items-start gap-3 p-3 cursor-pointer"
                onClick={(e) => handleAddWidget(widget, e)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {widget.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{widget.name}</div>
                  <div className="text-xs text-muted-foreground">{widget.description}</div>
                </div>
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />
        
        {/* Quick Suggestions */}
        <ContextMenuLabel className="text-xs text-muted-foreground">Suggested</ContextMenuLabel>
        <ContextMenuItem
          className="flex items-start gap-3 p-3 cursor-pointer"
          onClick={(e) => handleAddWidget(
            { ...WIDGET_SUGGESTIONS.find(w => w.type === 'totalHours')!, suggestedConfig: { showDetails: true } },
            e
          )}
        >
          <Clock className="w-4 h-4 mt-0.5 text-chart-1" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">Total Time Stats</div>
            <div className="text-xs text-muted-foreground">Quick overview with total logged time</div>
          </div>
        </ContextMenuItem>
        
        <ContextMenuItem
          className="flex items-start gap-3 p-3 cursor-pointer"
          onClick={(e) => handleAddWidget(
            { ...WIDGET_SUGGESTIONS.find(w => w.type === 'dailyHours')!, suggestedConfig: { timeRange: 14, showWeekends: false } },
            e
          )}
        >
          <BarChart3 className="w-4 h-4 mt-0.5 text-chart-2" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">Last 2 Weeks Chart</div>
            <div className="text-xs text-muted-foreground">Daily hours for the past 14 days</div>
          </div>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}