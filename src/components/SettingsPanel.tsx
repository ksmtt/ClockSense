import { useState, useEffect } from 'react';
import { Settings, Bell, Download, Upload, Trash2, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { ClockifySettings } from './ClockifySettings';
import { DashboardSettings } from './dashboard/DashboardSettings';
import { AppSettings, Contract } from '../hooks/useClockifyData';

interface SettingsPanelProps {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  contracts: Contract[];
  clockifyApi?: any;
}

export function SettingsPanel({ settings, onUpdateSettings, contracts, clockifyApi }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setLocalSettings({ ...localSettings, [key]: value });
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    onUpdateSettings(localSettings);
    setHasUnsavedChanges(false);
  };

  const resetSettings = () => {
    setLocalSettings(settings);
    setHasUnsavedChanges(false);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Fetch tags when settings open and API is connected
  useEffect(() => {
    const fetchTagsIfNeeded = async () => {
      if (clockifyApi?.isConnected && clockifyApi?.fetchTags && !clockifyApi.tags?.length) {
        setIsLoadingTags(true);
        setTagsError(null);
        try {
          await clockifyApi.fetchTags();
        } catch (error) {
          setTagsError(error instanceof Error ? error.message : 'Failed to fetch tags');
        } finally {
          setIsLoadingTags(false);
        }
      }
    };

    fetchTagsIfNeeded();
  }, [clockifyApi?.isConnected, clockifyApi?.fetchTags, clockifyApi?.tags?.length]);

  const handleBreakSettingChange = (key: string, value: any) => {
    setLocalSettings({
      ...localSettings,
      breakTimeSettings: {
        ...localSettings.breakTimeSettings,
        [key]: value
      }
    });
    setHasUnsavedChanges(true);
  };

  const refreshTags = async () => {
    if (!clockifyApi?.fetchTags) return;
    
    setIsLoadingTags(true);
    setTagsError(null);
    try {
      await clockifyApi.fetchTags();
    } catch (error) {
      setTagsError(error instanceof Error ? error.message : 'Failed to fetch tags');
    } finally {
      setIsLoadingTags(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground">Settings</h2>
          <p className="text-muted-foreground text-caption">Configure your preferences and notifications</p>
        </div>
        
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Unsaved Changes</Badge>
            <Button onClick={saveSettings} className="normal-case">Save Changes</Button>
            <Button variant="outline" onClick={resetSettings} className="normal-case">Reset</Button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Clockify API Integration */}
        {clockifyApi && (
          <ClockifySettings
            isConfigured={clockifyApi.isConfigured}
            isConnected={clockifyApi.isConnected}
            isLoading={clockifyApi.isLoading}
            error={clockifyApi.error}
            user={clockifyApi.user}
            workspace={clockifyApi.workspace}
            useClockifyApi={settings.useClockifyApi}
            onConnect={clockifyApi.connect}
            onDisconnect={clockifyApi.disconnect}
            onRefresh={clockifyApi.refresh}
            onToggleApi={(enabled) => handleSettingChange('useClockifyApi', enabled)}
          />
        )}

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure when and how you receive notifications about your work hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notification-timing">Contract End Notification</Label>
                <Select
                  value={localSettings.notificationTiming.toString()}
                  onValueChange={(value) => handleSettingChange('notificationTiming', parseInt(value))}
                >
                  <SelectTrigger
                    id="notification-timing"
                    aria-label="Select contract end notification timing"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 week before</SelectItem>
                    <SelectItem value="2">2 weeks before</SelectItem>
                    <SelectItem value="3">3 weeks before</SelectItem>
                    <SelectItem value="4">4 weeks before</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How far in advance to notify about contract ending
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekly-notification">Weekly Notification Day</Label>
                <Select
                  value={localSettings.weeklyNotificationDay}
                  onValueChange={(value: any) => handleSettingChange('weeklyNotificationDay', value)}
                >
                  <SelectTrigger
                    id="weekly-notification"
                    aria-label="Select weekly notification day"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Day of the week for weekly summary notifications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threshold Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Alert Thresholds
            </CardTitle>
            <CardDescription>
              Set when to receive alerts for overtime and undertime
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overtime-threshold">Overtime Threshold (%)</Label>
                <Input
                  id="overtime-threshold"
                  type="number"
                  min="5"
                  max="100"
                  value={localSettings.overtimeThreshold}
                  onChange={(e) => handleSettingChange('overtimeThreshold', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Alert when over this percentage of expected hours
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="undertime-threshold">Undertime Threshold (%)</Label>
                <Input
                  id="undertime-threshold"
                  type="number"
                  min="5"
                  max="100"
                  value={localSettings.undertimeThreshold}
                  onChange={(e) => handleSettingChange('undertimeThreshold', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Alert when under this percentage of expected hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Break Time Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Break Time Settings
            </CardTitle>
            <CardDescription>
              Configure automatic break time deduction from time entries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="break-time">Break Time (minutes)</Label>
                <Input
                  id="break-time"
                  type="number"
                  min="0"
                  max="480"
                  value={localSettings.breakTimeSettings.breakTimeMinutes}
                  onChange={(e) => handleBreakSettingChange('breakTimeMinutes', parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Minutes to deduct from each time entry (default: 30 minutes)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="no-break-tag">No Break Time Tag</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshTags}
                    disabled={!clockifyApi?.isConnected || isLoadingTags}
                    className="flex items-center gap-1 normal-case"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingTags ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                
                {!clockifyApi?.isConnected ? (
                  <div className="space-y-2">
                    <Input
                      id="no-break-tag"
                      value={localSettings.breakTimeSettings.noBreakTagId || ''}
                      onChange={(e) => handleBreakSettingChange('noBreakTagId', e.target.value || undefined)}
                      placeholder="Enter tag ID manually"
                    />
                    <p className="text-xs text-muted-foreground">
                      Connect to Clockify API to select from available tags, or enter tag ID manually
                    </p>
                  </div>
                ) : tagsError ? (
                  <div className="space-y-2">
                    <Input
                      id="no-break-tag"
                      value={localSettings.breakTimeSettings.noBreakTagId || ''}
                      onChange={(e) => handleBreakSettingChange('noBreakTagId', e.target.value || undefined)}
                      placeholder="Enter tag ID manually"
                    />
                    <p className="text-xs text-destructive">
                      Error loading tags: {tagsError}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Select
                      value={localSettings.breakTimeSettings.noBreakTagId || 'none'}
                      onValueChange={(value) => handleBreakSettingChange('noBreakTagId', value === 'none' ? undefined : value)}
                    >
                      <SelectTrigger
                        id="no-break-tag"
                        aria-label="Select tag to exclude from break time"
                      >
                        <SelectValue placeholder={isLoadingTags ? "Loading tags..." : "Select tag"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No tag selected</SelectItem>
                        {clockifyApi?.tags?.map((tag: any) => (
                          <SelectItem key={tag.id} value={tag.id}>
                            {tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Time entries with this tag will not have break time deducted
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-adjusted-time"
                  checked={localSettings.breakTimeSettings.showAdjustedTime}
                  onCheckedChange={(checked) => handleBreakSettingChange('showAdjustedTime', checked)}
                />
                <Label htmlFor="show-adjusted-time">Show adjusted time by default</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, displays break-adjusted hours in charts and analysis by default
              </p>
            </div>

            <Alert>
              <AlertDescription>
                Break time is deducted per individual time entry. Entries shorter than the break time, 
                vacation entries, and entries with the selected tag are not affected. 
                All calculations use adjusted time when enabled.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Analysis Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Settings</CardTitle>
            <CardDescription>
              Configure how your time analysis is calculated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="running-total">Running Total Reference</Label>
              <Select
                value={localSettings.runningTotalReference}
                onValueChange={(value: any) => handleSettingChange('runningTotalReference', value)}
              >
                <SelectTrigger
                  id="running-total"
                  aria-label="Select running total reference"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract Start Date</SelectItem>
                  <SelectItem value="calendar">Calendar Year</SelectItem>
                  <SelectItem value="rolling">Rolling 12 Months</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Reference point for calculating running totals and progress
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export, import, or reset your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  const data = {
                    contracts,
                    settings: localSettings,
                    exportDate: new Date().toISOString()
                  };
                  
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `clockify-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 normal-case"
              >
                <Download className="w-4 h-4" />
                Export Settings
              </Button>

              <Button
                variant="outline"
                onClick={() => document.getElementById('import-settings')?.click()}
                className="flex items-center gap-2 normal-case"
              >
                <Upload className="w-4 h-4" />
                Import Settings
              </Button>
              
              <input
                id="import-settings"
                type="file"
                accept=".json"
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      try {
                        const data = JSON.parse(e.target?.result as string);
                        if (data.settings) {
                          setLocalSettings(data.settings);
                          setHasUnsavedChanges(true);
                        }
                      } catch (err) {
                        alert('Error importing settings file');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />

              <Button
                variant="destructive"
                onClick={clearAllData}
                className="flex items-center gap-2 normal-case"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </Button>
            </div>

            <Alert>
              <AlertDescription>
                Your data is stored locally in your browser. Use export/import to backup and restore your settings across devices.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Dashboard Settings */}
        <DashboardSettings 
          layoutConfig={localSettings.dashboardLayout}
          onLayoutChange={(newLayout) => handleSettingChange('dashboardLayout', newLayout)}
        />

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Total Contracts</Label>
                <p className="text-muted-foreground">{contracts.length}</p>
              </div>
              <div>
                <Label>Data Storage</Label>
                <p className="text-muted-foreground">Browser Local Storage</p>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <Label>Version</Label>
                <p className="text-muted-foreground">1.0.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}