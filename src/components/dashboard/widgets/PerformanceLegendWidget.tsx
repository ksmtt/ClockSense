import { Info } from 'lucide-react';
import { AppSettings } from '../../../hooks/useClockifyData';

interface PerformanceLegendWidgetProps {
  id: string;
  settings: AppSettings;
  isDragging?: boolean;
  size?: 'compact' | 'medium' | 'large' | { width: number; height: number };
  onSettings?: () => void;
  onRemove?: () => void;
  onResize?: (size: 'compact' | 'medium' | 'large') => void;
  dragHandleProps?: any;
  showBreakTimeInfo?: boolean;
}

export function PerformanceLegendWidget({
  id: _id,
  settings,
  isDragging: _isDragging = false,
  size = 'medium',
  onSettings: _onSettings,
  onRemove: _onRemove,
  onResize: _onResize,
  dragHandleProps: _dragHandleProps,
  showBreakTimeInfo = true
}: PerformanceLegendWidgetProps) {
  const isCompact = size === 'compact';

  const legendItems = [
    {
      color: 'var(--chart-2)',
      lightColor: 'var(--chart-2-light)',
      title: 'On Track',
      description: '80-120% of target'
    },
    {
      color: 'var(--chart-4)',
      lightColor: 'var(--chart-4-light)',
      title: 'Moderate',
      description: '110-150% overtime'
    },
    {
      color: 'var(--chart-3)',
      lightColor: 'var(--chart-3-light)',
      title: 'High',
      description: '120-200% overtime'
    },
    {
      color: 'var(--chart-5)',
      lightColor: 'var(--chart-5-light)',
      title: 'Extreme',
      description: '150%+ overtime'
    },
    {
      color: 'var(--chart-6)',
      lightColor: 'var(--chart-6-light)',
      title: 'Undertime',
      description: 'Below 80% target'
    },
    {
      color: 'var(--chart-8)',
      lightColor: 'var(--chart-8-light)',
      title: 'Expected',
      description: 'Target hours'
    }
  ];

  // Show fewer items in compact mode
  const visibleItems = isCompact ? legendItems.slice(0, 4) : legendItems;
  const gridCols = isCompact 
    ? 'grid-cols-2' 
    : size === 'large' 
      ? 'grid-cols-3 lg:grid-cols-6' 
      : 'grid-cols-2 md:grid-cols-3';

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-4 h-4" />
        <div>
          <h3 className="font-medium">Performance Legend</h3>
          <p className="text-xs text-muted-foreground">Chart colors and meanings</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className={`grid ${gridCols} gap-4`}>
          {visibleItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded shadow-sm flex-shrink-0" 
                style={{ 
                  backgroundColor: item.color,
                  boxShadow: `0 0 6px ${item.lightColor}`
                }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Break Time Indicator */}
        {showBreakTimeInfo && settings.breakTimeSettings.breakTimeMinutes > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse flex-shrink-0" />
              <p className="text-sm">
                Break time adjustment: {settings.breakTimeSettings.breakTimeMinutes} minutes per entry
                {settings.breakTimeSettings.showAdjustedTime ? ' (currently active)' : ' (showing original times)'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}