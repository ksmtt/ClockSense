import { Zap, Loader2, Sun, Moon, Monitor } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ClockifyHeaderProps {
  settings: {
    useClockifyApi: boolean;
  };
  isLoadingApiData: boolean;
  clockifyApi: {
    isConnected: boolean;
  };
  theme: string;
  effectiveTheme: string;
  onThemeToggle: () => void;
}

export function ClockifyHeader({
  settings,
  isLoadingApiData,
  clockifyApi,
  theme,
  effectiveTheme,
  onThemeToggle
}: ClockifyHeaderProps) {
  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor className="w-4 h-4" />;
    if (effectiveTheme === 'dark') return <Moon className="w-4 h-4" />;
    return <Sun className="w-4 h-4" />;
  };

  const getThemeLabel = () => {
    if (theme === 'system') return 'System';
    if (effectiveTheme === 'dark') return 'Dark';
    return 'Light';
  };

  return (
    <div className="bg-secondary dark:bg-slate-800 border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Clockify Logo */}
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
            </div>
            <span className="font-normal text-foreground">Clockify</span>
            <span className="text-muted-foreground font-normal">Contract Hours Tracker</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* API Status Indicator */}
            {settings.useClockifyApi && (
              <div className="flex items-center gap-2">
                {isLoadingApiData ? (
                  <Badge variant="secondary" className="flex items-center gap-1 font-normal normal-case">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Syncing
                  </Badge>
                ) : clockifyApi.isConnected ? (
                  <Badge variant="default" className="flex items-center gap-1 font-normal normal-case">
                    <Zap className="w-3 h-3" />
                    API Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 font-normal normal-case">
                    <Zap className="w-3 h-3" />
                    API Disconnected
                  </Badge>
                )}
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="flex items-center gap-2 normal-case font-normal"
              title={`Theme: ${getThemeLabel()}`}
            >
              {getThemeIcon()}
              <span className="hidden sm:inline font-normal">{getThemeLabel()}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}