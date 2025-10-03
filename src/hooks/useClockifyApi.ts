import { useState, useEffect, useCallback } from 'react';
import { 
  ClockifyApiService, 
  ClockifyConfig, 
  ClockifyUser, 
  ClockifyWorkspace,
  ClockifyProject,
  ClockifyTag,
  createClockifyApi,
  getClockifyConfig,
  saveClockifyConfig,
  clearClockifyConfig
} from '../services/clockifyApi';
import { TimeEntry, Contract } from './useClockifyData';

export interface ClockifyApiState {
  isConfigured: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  user: ClockifyUser | null;
  workspace: ClockifyWorkspace | null;
  projects: ClockifyProject[];
  tags: ClockifyTag[];
}

export function useClockifyApi() {
  const [state, setState] = useState<ClockifyApiState>({
    isConfigured: false,
    isConnected: false,
    isLoading: false,
    error: null,
    user: null,
    workspace: null,
    projects: [],
    tags: []
  });

  const [apiService, setApiService] = useState<ClockifyApiService | null>(null);

  // Initialize API service on mount
  useEffect(() => {
    const config = getClockifyConfig();
    setState(prev => ({ ...prev, isConfigured: !!config }));
    
    if (config) {
      const service = createClockifyApi(config);
      setApiService(service);
    }
  }, []);

  /**
   * Connect to Clockify API with provided credentials
   */
  const connect = useCallback(async (config: ClockifyConfig): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const service = createClockifyApi(config);
      
      // Test the connection
      const isValid = await service.testConnection();
      
      if (isValid) {
        // Fetch initial data
        const [user, workspace, projects, tags] = await Promise.all([
          service.getCurrentUser(),
          service.getWorkspace(),
          service.getProjects(),
          service.getTags()
        ]);
        
        // Save config and update state
        saveClockifyConfig(config);
        setApiService(service);
        setState(prev => ({
          ...prev,
          isConfigured: true,
          isConnected: true,
          isLoading: false,
          user,
          workspace,
          projects,
          tags
        }));
        
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to connect to Clockify API'
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
      return false;
    }
  }, []);

  /**
   * Disconnect from Clockify API
   */
  const disconnect = useCallback(() => {
    clearClockifyConfig();
    setApiService(null);
    setState({
      isConfigured: false,
      isConnected: false,
      isLoading: false,
      error: null,
      user: null,
      workspace: null,
      projects: [],
      tags: []
    });
  }, []);

  /**
   * Refresh connection and data
   */
  const refresh = useCallback(async (): Promise<boolean> => {
    const config = getClockifyConfig();
    if (!config || !apiService) return false;
    
    return connect(config);
  }, [apiService, connect]);

  /**
   * Fetch time entries for a specific contract period
   */
  const fetchTimeEntries = useCallback(async (contract: Contract): Promise<TimeEntry[]> => {
    if (!apiService) {
      throw new Error('Clockify API not configured');
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Convert dates from YYYY-MM-DD format to ISO 8601 format required by Clockify API
      const startDateISO = new Date(contract.startDate + 'T00:00:00.000Z').toISOString();
      const endDateISO = new Date(contract.endDate + 'T23:59:59.999Z').toISOString();
      
      const clockifyEntries = await apiService.getAllTimeEntriesInRange(
        startDateISO,
        endDateISO
      );
      
      const timeEntries = clockifyEntries.map(entry => 
        apiService.convertTimeEntry(entry, state.projects)
      );
      
      setState(prev => ({ ...prev, isLoading: false }));
      return timeEntries;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch time entries';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, [apiService, state.projects]);

  /**
   * Fetch time entries for multiple contracts
   */
  const fetchAllTimeEntries = useCallback(async (contracts: Contract[]): Promise<TimeEntry[]> => {
    if (!apiService) {
      throw new Error('Clockify API not configured');
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const allEntries: TimeEntry[] = [];
      
      for (const contract of contracts) {
        const contractEntries = await fetchTimeEntries(contract);
        allEntries.push(...contractEntries);
      }
      
      // Remove duplicates based on ID
      const uniqueEntries = allEntries.filter((entry, index, self) => 
        index === self.findIndex(e => e.id === entry.id)
      );
      
      setState(prev => ({ ...prev, isLoading: false }));
      return uniqueEntries;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch time entries';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, [apiService, fetchTimeEntries]);

  /**
   * Fetch tags from Clockify API
   */
  const fetchTags = useCallback(async (): Promise<ClockifyTag[]> => {
    if (!apiService) {
      throw new Error('Clockify API not configured');
    }
    
    try {
      const tags = await apiService.getTags();
      setState(prev => ({ ...prev, tags }));
      return tags;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tags';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [apiService]);

  /**
   * Auto-connect on hook initialization if configured
   */
  useEffect(() => {
    const autoConnect = async () => {
      const config = getClockifyConfig();
      if (config && !state.isConnected && !state.isLoading) {
        try {
          await connect(config);
        } catch (error) {
          console.warn('Auto-connect to Clockify failed:', error);
        }
      }
    };
    
    autoConnect();
  }, [connect, state.isConnected, state.isLoading]);

  return {
    ...state,
    connect,
    disconnect,
    refresh,
    fetchTimeEntries,
    fetchAllTimeEntries,
    fetchTags,
    apiService
  };
}