import { useState, useMemo } from 'react';
import { Calendar, Settings, Clock, TrendingUp } from 'lucide-react';
import { GridDashboard } from './components/dashboard/GridDashboard';
import { ContractManager } from './components/ContractManager';
import { SettingsPanel } from './components/SettingsPanel';
import { TimeAnalysis } from './components/TimeAnalysis';
import { ClockifyHeader } from './components/ClockifyHeader';
import { NotificationCenter } from './components/NotificationCenter';
import { StatusIndicatorBadge } from './components/StatusIndicatorBadge';
import { DataImportExportButtons } from './components/DataImportExportButtons';
import { ApiErrorHandler } from './components/ApiErrorHandler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { useClockifyData } from './hooks/useClockifyData';
import { useNotifications } from './hooks/useNotifications';
import { useTheme } from './hooks/useTheme';
import { TimeEntriesDataView } from './components/TimeEntriesDataView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme, effectiveTheme, toggleTheme } = useTheme();
  const { 
    contracts, 
    currentContract, 
    timeEntries, 
    adjustedTimeEntries,
    settings,
    updateContract,
    addContract,
    deleteContract,
    updateSettings,
    exportData,
    importData,
    refreshApiData,
    isLoadingApiData,
    apiError,
    clockifyApi
  } = useClockifyData();
  
  // Use adjusted or original time entries based on settings - memoized to prevent infinite re-renders
  const effectiveTimeEntries = useMemo(() => {
    return settings.breakTimeSettings.showAdjustedTime ? adjustedTimeEntries : timeEntries;
  }, [settings.breakTimeSettings.showAdjustedTime, adjustedTimeEntries, timeEntries]);
  
  const { notifications, dismissNotification } = useNotifications(contracts, currentContract, effectiveTimeEntries, settings);

  return (
    <div className="min-h-screen bg-background">
      {/* Clockify Header */}
      <ClockifyHeader
        settings={settings}
        isLoadingApiData={isLoadingApiData}
        clockifyApi={clockifyApi}
        theme={theme}
        effectiveTheme={effectiveTheme}
        onThemeToggle={toggleTheme}
      />

      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-foreground font-normal">Contract Hours Tracker</h1>
            <p className="text-caption text-muted-foreground font-normal">Supercharged Clockify time analysis</p>
          </div>
          
          <div className="flex items-center gap-4">
            <StatusIndicatorBadge currentContract={currentContract} />
            
            <div className="flex gap-2">
              <TimeEntriesDataView
                timeEntries={effectiveTimeEntries}
                originalTimeEntries={timeEntries}
                contracts={contracts}
                currentContract={currentContract}
                timeFrame="Current Period"
                selectedContract={currentContract?.id || 'all'}
                isBreakAdjusted={settings.breakTimeSettings.showAdjustedTime}
                breakTimeMinutes={settings.breakTimeSettings.breakTimeMinutes}
              />
              
              <DataImportExportButtons
                onExportData={exportData}
                onImportData={importData}
              />
            </div>
          </div>
        </div>

        {/* API Error Alert */}
        <ApiErrorHandler
          apiError={apiError}
          onRetry={refreshApiData}
          className="mb-6"
        />

        {/* Notifications */}
        <NotificationCenter
          notifications={notifications}
          onDismissNotification={dismissNotification}
        />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted border border-border font-normal normal-case">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 normal-case font-normal">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2 normal-case font-normal">
              <Clock className="w-4 h-4" />
              Contracts
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2 normal-case font-normal">
              <Calendar className="w-4 h-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 normal-case font-normal">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <GridDashboard 
              currentContract={currentContract}
              timeEntries={effectiveTimeEntries}
              originalTimeEntries={timeEntries}
              settings={settings}
              layoutConfig={settings.dashboardLayout}
              onLayoutChange={(newLayout) => updateSettings({ ...settings, dashboardLayout: newLayout })}
            />
          </TabsContent>

          <TabsContent value="contracts" className="space-y-6">
            <ContractManager
              contracts={contracts}
              currentContract={currentContract}
              onUpdateContract={updateContract}
              onAddContract={addContract}
              onDeleteContract={deleteContract}
            />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <TimeAnalysis
              contracts={contracts}
              timeEntries={effectiveTimeEntries}
              originalTimeEntries={timeEntries}
              settings={settings}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPanel
              settings={settings}
              onUpdateSettings={updateSettings}
              contracts={contracts}
              clockifyApi={clockifyApi}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}