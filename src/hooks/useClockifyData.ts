import { useState, useEffect, useMemo } from 'react';
import { useClockifyApi } from './useClockifyApi';

export interface Contract {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  weeklyHours: number;
  vacationDays: number; // Can include half days (e.g., 4.5 days = 36 hours)
  isActive: boolean;
}

export interface TimeEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  dateObject: Date; // Full date object for calculations
  hours: number; // Total hours as decimal (e.g., 1.5 for 1h 30m)
  duration: {
    hours: number;
    minutes: number;
    seconds: number;
    totalMinutes: number;
    totalSeconds: number;
  };
  timeInterval: {
    start: string; // ISO string (e.g., "2024-01-01T09:00:00Z")
    end: string;   // ISO string (e.g., "2024-01-01T17:30:00Z")
    startTime: Date; // Date object for start time
    endTime: Date;   // Date object for end time
  };
  projectName?: string;
  project?: string; // Alternative project field
  description?: string;
  tags?: string[]; // Tag IDs from Clockify API
}

export interface DashboardWidgetConfig {
  id: string;
  type: 'totalHours' | 'thisWeek' | 'contractProgress' | 'overtime' | 'dailyHours' | 'hoursDistribution' | 'performanceLegend' | 'weeklyTrend' | 'contractTimeline' | 'breakTimeAnalysis' | 'quickStats';
  enabled: boolean;
  size: 'compact' | 'medium' | 'large';
  position: number;
  settings?: Record<string, any>;
}

export interface DashboardLayoutConfig {
  widgets: DashboardWidgetConfig[];
  layout: 'grid' | 'masonry';
  columns: number;
  gridSize?: string; // e.g., '12x12', '6x8', etc.
}

export interface AppSettings {
  notificationTiming: number; // weeks before contract end
  weeklyNotificationDay: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  overtimeThreshold: number; // percentage
  undertimeThreshold: number; // percentage
  runningTotalReference: 'contract' | 'calendar' | 'rolling';
  darkMode: boolean;
  useClockifyApi: boolean; // New setting to toggle API vs mock data
  breakTimeSettings: {
    breakTimeMinutes: number; // Default 30 minutes break time
    noBreakTagId?: string; // Tag ID that excludes break time deduction
    showAdjustedTime: boolean; // Show adjusted time by default
  };
  dashboardLayout: DashboardLayoutConfig;
}

// Mock data for testing
const mockContracts: Contract[] = [
  {
    id: '1',
    name: 'Student Assistant Contract Q1 2024',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    weeklyHours: 20,
    vacationDays: 5.0,
    isActive: true
  },
  {
    id: '2',
    name: 'Student Assistant Contract Q3 2024',
    startDate: '2024-07-01',
    endDate: '2024-12-31',
    weeklyHours: 15,
    vacationDays: 7.5,
    isActive: false
  }
];

const generateMockTimeEntries = (): TimeEntry[] => {
  const entries: TimeEntry[] = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date();
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    // Skip weekends mostly, but sometimes work
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (isWeekend && Math.random() > 0.2) continue;
    
    // Simulate varying work patterns
    const baseHours = isWeekend ? 2 : 4;
    const variation = (Math.random() - 0.5) * 2; // -1 to +1 hours
    const hours = Math.max(0, baseHours + variation);
    
    if (hours > 0) {
      const dateStr = date.toISOString().split('T')[0];
      const dateObject = new Date(date);
      
      // Create realistic start/end times
      const startHour = 9 + Math.floor(Math.random() * 2); // 9-10 AM start
      const startMinute = Math.floor(Math.random() * 60);
      const startTime = new Date(date);
      startTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setTime(startTime.getTime() + (hours * 3600000)); // Add hours in milliseconds
      
      // Calculate duration details
      const totalMinutes = Math.round(hours * 60);
      const durationHours = Math.floor(totalMinutes / 60);
      const durationMinutes = totalMinutes % 60;
      const totalSeconds = totalMinutes * 60;
      
      entries.push({
        id: `entry-${dateStr}`,
        date: dateStr,
        dateObject,
        hours: Math.round(hours * 2) / 2, // Round to nearest 0.5
        duration: {
          hours: durationHours,
          minutes: durationMinutes,
          seconds: 0,
          totalMinutes,
          totalSeconds
        },
        timeInterval: {
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          startTime,
          endTime
        },
        projectName: 'Development Work',
        description: 'Various development tasks'
      });
    }
  }
  
  return entries;
};

export const defaultSettings: AppSettings = {
  notificationTiming: 2,
  weeklyNotificationDay: 'monday',
  overtimeThreshold: 20,
  undertimeThreshold: 20,
  runningTotalReference: 'contract',
  darkMode: true,
  useClockifyApi: false,
  breakTimeSettings: {
    breakTimeMinutes: 30,
    noBreakTagId: undefined,
    showAdjustedTime: true
  },
  dashboardLayout: {
    widgets: [
      {
        id: 'totalHours',
        type: 'totalHours',
        enabled: true,
        size: 'medium',
        position: 0,
        settings: {
          gridPosition: { x: 0, y: 0, width: 3, height: 2 }
        }
      },
      {
        id: 'thisWeek',
        type: 'thisWeek',
        enabled: true,
        size: 'medium',
        position: 1,
        settings: {
          gridPosition: { x: 3, y: 0, width: 3, height: 2 }
        }
      },
      {
        id: 'contractProgress',
        type: 'contractProgress',
        enabled: true,
        size: 'medium',
        position: 2,
        settings: {
          gridPosition: { x: 6, y: 0, width: 3, height: 2 }
        }
      },
      {
        id: 'overtime',
        type: 'overtime',
        enabled: true,
        size: 'medium',
        position: 3,
        settings: {
          gridPosition: { x: 9, y: 0, width: 3, height: 2 }
        }
      },
      {
        id: 'dailyHours',
        type: 'dailyHours',
        enabled: true,
        size: 'medium',
        position: 4,
        settings: {
          gridPosition: { x: 0, y: 2, width: 8, height: 4 },
          timeRange: 7,
          showWeekends: true
        }
      },
      {
        id: 'hoursDistribution',
        type: 'hoursDistribution',
        enabled: true,
        size: 'medium',
        position: 5,
        settings: {
          gridPosition: { x: 8, y: 2, width: 4, height: 4 },
          showLegend: true
        }
      },
      {
        id: 'performanceLegend',
        type: 'performanceLegend',
        enabled: true,
        size: 'medium',
        position: 6,
        settings: {
          gridPosition: { x: 0, y: 6, width: 12, height: 2 },
          showBreakTimeInfo: true
        }
      }
    ],
    layout: 'grid',
    columns: 12,
    gridSize: '12x12'
  }
};

export function useClockifyData() {
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoadingApiData, setIsLoadingApiData] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const clockifyApi = useClockifyApi();

  // Get current active contract
  const currentContract = contracts.find(contract => {
    const now = new Date();
    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);
    return now >= start && now <= end;
  });

  // Load time entries from Clockify API when configured and enabled
  const loadApiTimeEntries = async () => {
    if (!settings.useClockifyApi || !clockifyApi.isConnected || contracts.length === 0) {
      return;
    }

    setIsLoadingApiData(true);
    setApiError(null);

    try {
      const apiTimeEntries = await clockifyApi.fetchAllTimeEntries(contracts);
      setTimeEntries(apiTimeEntries);
      // Save to localStorage as backup
      localStorage.setItem('clockify-time-entries', JSON.stringify(apiTimeEntries));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load time entries from Clockify';
      setApiError(errorMessage);
      console.error('Failed to load time entries from Clockify API:', error);
    } finally {
      setIsLoadingApiData(false);
    }
  };

  useEffect(() => {
    // Load data from localStorage (simulating Clockify structured settings)
    const savedContracts = localStorage.getItem('clockify-contracts');
    const savedTimeEntries = localStorage.getItem('clockify-time-entries');
    const savedSettings = localStorage.getItem('clockify-settings');

    if (savedContracts) {
      const loadedContracts = JSON.parse(savedContracts);
      // Migrate existing contracts to include vacation days field
      const migratedContracts = loadedContracts.map((contract: any) => ({
        ...contract,
        vacationDays: contract.vacationDays ?? 0
      }));
      setContracts(migratedContracts);
      // Save migrated data back to localStorage
      if (JSON.stringify(migratedContracts) !== JSON.stringify(loadedContracts)) {
        localStorage.setItem('clockify-contracts', JSON.stringify(migratedContracts));
      }
    }

    if (savedSettings) {
      const loadedSettings = JSON.parse(savedSettings);
      const loadedDashboardLayout = (loadedSettings.dashboardLayout ?? {}) as Partial<DashboardLayoutConfig>;
      // Migrate settings to include break time settings and dashboard layout
      const migratedSettings = {
        ...defaultSettings,
        ...loadedSettings,
        breakTimeSettings: {
          ...defaultSettings.breakTimeSettings,
          ...(loadedSettings.breakTimeSettings ?? {})
        },
        dashboardLayout: {
          ...defaultSettings.dashboardLayout,
          ...loadedDashboardLayout,
          gridSize: typeof loadedDashboardLayout.gridSize === 'string' ? loadedDashboardLayout.gridSize : defaultSettings.dashboardLayout.gridSize,
          widgets: Array.isArray(loadedDashboardLayout.widgets) && loadedDashboardLayout.widgets.length > 0
            ? loadedDashboardLayout.widgets
            : defaultSettings.dashboardLayout.widgets
        }
      };
      setSettings(migratedSettings);
      // Save migrated settings back if they changed
      if (JSON.stringify(migratedSettings) !== JSON.stringify(loadedSettings)) {
        localStorage.setItem('clockify-settings', JSON.stringify(migratedSettings));
      }
    }

    const parsedSettings = savedSettings ? JSON.parse(savedSettings) : null;

    if (savedTimeEntries && !parsedSettings?.useClockifyApi) {
      setTimeEntries(JSON.parse(savedTimeEntries));
    } else if (!parsedSettings?.useClockifyApi) {
      // Generate mock data if none exists and not using API
      const mockEntries = generateMockTimeEntries();
      setTimeEntries(mockEntries);
      localStorage.setItem('clockify-time-entries', JSON.stringify(mockEntries));
    }
  }, []);

  // Load API data when API is enabled and connected
  useEffect(() => {
    if (settings.useClockifyApi && clockifyApi.isConnected) {
      loadApiTimeEntries();
    }
  }, [settings.useClockifyApi, clockifyApi.isConnected, contracts]);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const updateContract = (id: string, updates: Partial<Contract>) => {
    const updatedContracts = contracts.map(contract =>
      contract.id === id ? { ...contract, ...updates } : contract
    );
    setContracts(updatedContracts);
    saveToStorage('clockify-contracts', updatedContracts);
  };

  const addContract = (contract: Omit<Contract, 'id'>) => {
    const newContract = {
      ...contract,
      id: Date.now().toString()
    };
    const updatedContracts = [...contracts, newContract];
    setContracts(updatedContracts);
    saveToStorage('clockify-contracts', updatedContracts);
  };

  const deleteContract = (id: string) => {
    const updatedContracts = contracts.filter(contract => contract.id !== id);
    setContracts(updatedContracts);
    saveToStorage('clockify-contracts', updatedContracts);
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...updates };
    setSettings(updatedSettings);
    saveToStorage('clockify-settings', updatedSettings);
  };

  const exportData = () => {
    const data = {
      contracts,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clockify-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (data: any) => {
    if (data.contracts) {
      setContracts(data.contracts);
      saveToStorage('clockify-contracts', data.contracts);
    }
    if (data.settings) {
      const incomingSettings = data.settings;
      const incomingDashboardLayout = (incomingSettings.dashboardLayout ?? {}) as Partial<DashboardLayoutConfig>;
      const mergedSettings: AppSettings = {
        ...defaultSettings,
        ...incomingSettings,
        breakTimeSettings: {
          ...defaultSettings.breakTimeSettings,
          ...(incomingSettings.breakTimeSettings ?? {})
        },
        dashboardLayout: {
          ...defaultSettings.dashboardLayout,
          ...incomingDashboardLayout,
          gridSize: typeof incomingDashboardLayout.gridSize === 'string'
            ? incomingDashboardLayout.gridSize
            : defaultSettings.dashboardLayout.gridSize,
          widgets: Array.isArray(incomingDashboardLayout.widgets) && incomingDashboardLayout.widgets.length > 0
            ? incomingDashboardLayout.widgets
            : defaultSettings.dashboardLayout.widgets
        }
      };
      setSettings(mergedSettings);
      saveToStorage('clockify-settings', mergedSettings);
    }
  };

  const refreshApiData = async () => {
    if (settings.useClockifyApi) {
      await loadApiTimeEntries();
    }
  };

  // Calculate adjusted time entries (with break time deducted) - memoized to prevent infinite re-renders
  const getAdjustedTimeEntries = (entries: TimeEntry[]): TimeEntry[] => {
    if (!settings.breakTimeSettings.breakTimeMinutes) return entries;

    return entries.map(entry => {
      const breakHours = settings.breakTimeSettings.breakTimeMinutes / 60;
      
      // Skip break time deduction if:
      // 1. Entry has the no-break tag
      // 2. Entry is shorter than break time
      // 3. Entry is a vacation day (description contains "vacation" - simple heuristic)
      const hasNoBreakTag = settings.breakTimeSettings.noBreakTagId && 
                           entry.tags?.includes(settings.breakTimeSettings.noBreakTagId);
      const isShorterThanBreak = entry.hours < breakHours;
      const isVacationEntry = entry.description?.toLowerCase().includes('vacation') || 
                             entry.description?.toLowerCase().includes('urlaub') ||
                             entry.projectName?.toLowerCase().includes('vacation') ||
                             entry.projectName?.toLowerCase().includes('urlaub');

      if (hasNoBreakTag || isShorterThanBreak || isVacationEntry) {
        return entry;
      }

      return {
        ...entry,
        hours: Math.max(0, entry.hours - breakHours)
      };
    });
  };

  // Memoize adjusted time entries to prevent infinite re-renders
  const adjustedTimeEntries = useMemo(() => {
    return getAdjustedTimeEntries(timeEntries);
  }, [timeEntries, settings.breakTimeSettings.breakTimeMinutes, settings.breakTimeSettings.noBreakTagId]);

  return {
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
    clockifyApi,
    getAdjustedTimeEntries
  };
}