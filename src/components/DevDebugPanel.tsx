import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Contract, AppSettings } from '../hooks/useClockifyData';

interface DevDebugPanelProps {
  contracts: Contract[];
  addContract: (contract: Omit<Contract, 'id'>) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  refreshApiData: () => Promise<void>;
  settings: AppSettings;
}

/**
 * DevDebugPanel
 * A lightweight development-only harness to speed up manual testing.
 * Rendered only in Vite dev mode (import.meta.env.DEV) – excluded from production builds.
 */
export const DevDebugPanel: React.FC<DevDebugPanelProps> = ({
  contracts,
  addContract,
  updateSettings,
  refreshApiData,
  settings
}) => {
  // Environment guard: only render in development. Avoid direct typed access to import.meta.env
  // Vite injects import.meta.env.DEV at build time.
  const isDev = ((import.meta as any)?.env?.DEV ?? false) || process.env.NODE_ENV === 'development';
  if (!isDev) return null;

  const hasActiveContract = contracts.some(c => c.isActive);

  const seedContract = () => {
    if (hasActiveContract) return;
    const today = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 3);
    addContract({
      name: 'Dev Seed Contract',
      startDate: today.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      weeklyHours: 20,
      vacationDays: 5,
      isActive: true
    });
  };

  const toggleApiMode = async () => {
    updateSettings({ useClockifyApi: !settings.useClockifyApi });
    // Let state flush then optionally refresh
    setTimeout(() => {
      if (!settings.useClockifyApi) {
        // Just turned ON
        refreshApiData();
      }
    }, 150);
  };

  const clearStorage = () => {
    localStorage.removeItem('clockify-contracts');
    localStorage.removeItem('clockify-settings');
    localStorage.removeItem('clockify-time-entries');
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs">
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Dev Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex flex-col gap-2">
            <Button size="sm" variant={hasActiveContract ? 'secondary' : 'default'} onClick={seedContract} disabled={hasActiveContract}>
              {hasActiveContract ? 'Active Contract Present' : 'Seed Contract'}
            </Button>
            <Button size="sm" variant={settings.useClockifyApi ? 'destructive' : 'outline'} onClick={toggleApiMode}>
              {settings.useClockifyApi ? 'Disable API Mode' : 'Enable API Mode'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => refreshApiData()} disabled={!settings.useClockifyApi}>
              Refresh API Data
            </Button>
            <Button size="sm" variant="ghost" onClick={clearStorage}>
              Clear Local Data
            </Button>
          </div>
          <div className="pt-1 text-muted-foreground leading-snug">
            <p>contracts: {contracts.length}</p>
            <p>apiMode: {settings.useClockifyApi ? 'on' : 'off'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevDebugPanel;
