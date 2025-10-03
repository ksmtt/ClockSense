import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Settings, GripVertical, X, Minimize2, Maximize2 } from 'lucide-react';

export interface DashboardWidgetProps {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  isDragging?: boolean;
  size?: 'compact' | 'medium' | 'large';
  onSettings?: () => void;
  onRemove?: () => void;
  onResize?: (size: 'compact' | 'medium' | 'large') => void;
  className?: string;
  dragHandleProps?: any;
}

export function DashboardWidget({
  id: _id,
  title,
  description,
  icon,
  children,
  isDragging = false,
  size = 'medium',
  onSettings,
  onRemove,
  onResize,
  className = '',
  dragHandleProps
}: DashboardWidgetProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'compact':
        return 'h-48';
      case 'large':
        return 'h-96 lg:col-span-2';
      default:
        return 'h-80';
    }
  };

  return (
    <Card 
      className={`
        relative transition-all duration-200 group
        ${isDragging ? 'rotate-3 scale-105 shadow-2xl z-50' : 'shadow-sm hover:shadow-md'}
        ${getSizeClass()}
        ${className}
      `}
    >
      {/* Widget Header with Controls */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs mt-1">{description}</CardDescription>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Drag Handle */}
          {dragHandleProps && (
            <div 
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          
          {/* Resize Controls */}
          {onResize && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onResize('compact')}
                title="Compact view"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onResize('large')}
                title="Large view"
              >
                <Maximize2 className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          {/* Settings */}
          {onSettings && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onSettings}
              title="Widget settings"
            >
              <Settings className="w-3 h-3" />
            </Button>
          )}
          
          {/* Remove */}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onRemove}
              title="Remove widget"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        {children}
      </CardContent>
    </Card>
  );
}