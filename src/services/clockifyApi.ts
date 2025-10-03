/**
 * Clockify API Service
 * Handles all interactions with the Clockify REST API
 * Documentation: https://docs.clockify.me/
 */

export interface ClockifyConfig {
  apiKey?: string;           // Manual API key (fallback)
  addonToken?: string;       // x-addon-token from URL params (primary)
  workspaceId: string;
  userId: string;
  baseUrl?: string;
}

export interface ClockifyTimeEntry {
  id: string;
  description: string;
  projectId: string | null;
  projectName?: string;
  clientName?: string;
  timeInterval: {
    start: string;
    end: string;
    duration: string;
  };
  billable: boolean;
  hourlyRate: {
    amount: number;
    currency: string;
  } | null;
  tags: ClockifyTag[];
}

export interface ClockifyProject {
  id: string;
  name: string;
  clientName: string;
  color: string;
  archived: boolean;
}

export interface ClockifyUser {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  timezone: string;
}

export interface ClockifyWorkspace {
  id: string;
  name: string;
  imageUrl: string;
  settings: {
    timeRoundingInReports: boolean;
    onlyAdminsSeeBillableRates: boolean;
    onlyAdminsCreateProject: boolean;
    onlyAdminsCreateClients: boolean;
    weekStart: string;
    timeFormat: string;
    dateFormat: string;
  };
}

export interface ClockifyTag {
  id: string;
  name: string;
  workspaceId: string;
}

export class ClockifyApiService {
  private config: ClockifyConfig;
  private baseUrl: string;

  constructor(config: ClockifyConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.clockify.me/api/v1';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Use x-addon-token if available, otherwise fall back to API key
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    
    if (this.config.addonToken) {
      headers['x-addon-token'] = this.config.addonToken;
    } else if (this.config.apiKey) {
      headers['X-Api-Key'] = this.config.apiKey;
    } else {
      throw new Error('No authentication token available. Either x-addon-token or API key is required.');
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Clockify API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<ClockifyUser> {
    return this.makeRequest<ClockifyUser>('/user');
  }

  /**
   * Get workspace information
   */
  async getWorkspace(): Promise<ClockifyWorkspace> {
    return this.makeRequest<ClockifyWorkspace>(`/workspaces/${this.config.workspaceId}`);
  }

  /**
   * Get projects for the workspace
   */
  async getProjects(): Promise<ClockifyProject[]> {
    return this.makeRequest<ClockifyProject[]>(`/workspaces/${this.config.workspaceId}/projects`);
  }

  /**
   * Get tags for the workspace
   */
  async getTags(): Promise<ClockifyTag[]> {
    return this.makeRequest<ClockifyTag[]>(`/workspaces/${this.config.workspaceId}/tags`);
  }

  /**
   * Get time entries for a specific date range
   */
  async getTimeEntries(params: {
    start?: string; // ISO 8601 format
    end?: string;   // ISO 8601 format
    page?: number;
    pageSize?: number;
  } = {}): Promise<ClockifyTimeEntry[]> {
    const searchParams = new URLSearchParams();
    
    if (params.start) searchParams.set('start', params.start);
    if (params.end) searchParams.set('end', params.end);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.pageSize) searchParams.set('page-size', params.pageSize.toString());

    const endpoint = `/workspaces/${this.config.workspaceId}/user/${this.config.userId}/time-entries?${searchParams.toString()}`;
    return this.makeRequest<ClockifyTimeEntry[]>(endpoint);
  }

  /**
   * Get all time entries for a contract period (handles pagination)
   */
  async getAllTimeEntriesInRange(startDate: string, endDate: string): Promise<ClockifyTimeEntry[]> {
    const allEntries: ClockifyTimeEntry[] = [];
    let page = 1;
    const pageSize = 200; // Max allowed by Clockify API
    
    while (true) {
      const entries = await this.getTimeEntries({
        start: startDate,
        end: endDate,
        page,
        pageSize
      });
      
      allEntries.push(...entries);
      
      // If we got fewer entries than the page size, we've reached the end
      if (entries.length < pageSize) {
        break;
      }
      
      page++;
    }
    
    return allEntries;
  }

  /**
   * Convert Clockify time entry to app format
   */
  convertTimeEntry(clockifyEntry: ClockifyTimeEntry, projects: ClockifyProject[] = []): {
    id: string;
    date: string;
    dateObject: Date;
    hours: number;
    duration: {
      hours: number;
      minutes: number;
      seconds: number;
      totalMinutes: number;
      totalSeconds: number;
    };
    timeInterval: {
      start: string;
      end: string;
      startTime: Date;
      endTime: Date;
    };
    projectName?: string;
    description?: string;
    tags?: string[];
  } {
    const project = projects.find(p => p.id === clockifyEntry.projectId);
    
    // Parse duration (PT format like PT1H30M or PT45M)
    const duration = clockifyEntry.timeInterval.duration;
    const durationDetails = this.parseDurationDetailed(duration);
    const hours = durationDetails.hours + (durationDetails.minutes / 60) + (durationDetails.seconds / 3600);
    
    // Extract date and create date objects
    const date = clockifyEntry.timeInterval.start.split('T')[0];
    const dateObject = new Date(date + 'T00:00:00.000Z');
    const startTime = new Date(clockifyEntry.timeInterval.start);
    const endTime = new Date(clockifyEntry.timeInterval.end);
    
    return {
      id: clockifyEntry.id,
      date,
      dateObject,
      hours,
      duration: durationDetails,
      timeInterval: {
        start: clockifyEntry.timeInterval.start,
        end: clockifyEntry.timeInterval.end,
        startTime,
        endTime
      },
      projectName: project?.name || clockifyEntry.projectName,
      description: clockifyEntry.description,
      tags: clockifyEntry.tags?.map(tag => tag.id) || []
    };
  }

  /**
   * Parse ISO 8601 duration to detailed time components
   */
  private parseDurationDetailed(duration: string): {
    hours: number;
    minutes: number;
    seconds: number;
    totalMinutes: number;
    totalSeconds: number;
  } {
    if (!duration || duration === 'PT0S') {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMinutes: 0,
        totalSeconds: 0
      };
    }
    
    // Parse PT1H30M15S format
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
    if (!match) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMinutes: 0,
        totalSeconds: 0
      };
    }
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = Math.floor(parseFloat(match[3] || '0'));
    
    return {
      hours,
      minutes,
      seconds,
      totalMinutes: (hours * 60) + minutes + Math.floor(seconds / 60),
      totalSeconds: (hours * 3600) + (minutes * 60) + seconds
    };
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Clockify API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get comprehensive data for the app
   */
  async getAppData(contractStartDate?: string, contractEndDate?: string): Promise<{
    user: ClockifyUser;
    workspace: ClockifyWorkspace;
    projects: ClockifyProject[];
    timeEntries: any[];
  }> {
    try {
      // Fetch user and workspace info in parallel
      const [user, workspace, projects] = await Promise.all([
        this.getCurrentUser(),
        this.getWorkspace(),
        this.getProjects()
      ]);

      // If contract dates are provided, fetch time entries for that range
      let timeEntries: any[] = [];
      if (contractStartDate && contractEndDate) {
        const clockifyEntries = await this.getAllTimeEntriesInRange(
          contractStartDate,
          contractEndDate
        );
        timeEntries = clockifyEntries.map(entry => this.convertTimeEntry(entry, projects));
      }

      return {
        user,
        workspace,
        projects,
        timeEntries
      };
    } catch (error) {
      console.error('Failed to fetch Clockify app data:', error);
      throw error;
    }
  }
}

/**
 * Factory function to create Clockify API service
 */
export function createClockifyApi(config: ClockifyConfig): ClockifyApiService {
  return new ClockifyApiService(config);
}

/**
 * Check if Clockify API is configured
 */
export function isClockifyConfigured(): boolean {
  // Check for URL-based auth first
  const urlAuth = getAuthFromUrlParams();
  const workspaceId = localStorage.getItem('clockify-workspace-id');
  
  if (urlAuth && workspaceId) {
    return true;
  }
  
  // Fall back to checking stored API key configuration
  const apiKey = localStorage.getItem('clockify-api-key');
  const userId = localStorage.getItem('clockify-user-id');
  
  return !!(apiKey && workspaceId && userId);
}

/**
 * Get authentication data from URL parameters (for Clockify addon integration)
 */
export function getAuthFromUrlParams(): { addonToken: string; userId: string } | null {
  const urlParams = new URLSearchParams(window.location.search);
  const authToken = urlParams.get('auth_token');
  const userIdParam = urlParams.get('userId');

  if (authToken && userIdParam) {
    return {
      addonToken: authToken,
      userId: userIdParam
    };
  }

  return null;
}

/**
 * Get Clockify configuration from storage and URL parameters
 * Prioritizes URL parameters (addon integration) over stored API key
 */
export function getClockifyConfig(): ClockifyConfig | null {
  // First, try to get auth from URL parameters (addon integration)
  const urlAuth = getAuthFromUrlParams();
  
  // Get stored configuration
  const storedApiKey = localStorage.getItem('clockify-api-key');
  const workspaceId = localStorage.getItem('clockify-workspace-id');
  const storedUserId = localStorage.getItem('clockify-user-id');

  // If we have URL auth and workspace, use that
  if (urlAuth && workspaceId) {
    return {
      addonToken: urlAuth.addonToken,
      userId: urlAuth.userId,
      workspaceId
    };
  }

  // Fall back to stored API key configuration
  if (storedApiKey && workspaceId && storedUserId) {
    return {
      apiKey: storedApiKey,
      workspaceId,
      userId: storedUserId
    };
  }

  return null;
}

/**
 * Save Clockify configuration to storage
 * Note: Only saves manually entered config (API key). URL-based auth is not stored.
 */
export function saveClockifyConfig(config: ClockifyConfig): void {
  if (config.apiKey) {
    localStorage.setItem('clockify-api-key', config.apiKey);
  }
  localStorage.setItem('clockify-workspace-id', config.workspaceId);
  if (config.userId) {
    localStorage.setItem('clockify-user-id', config.userId);
  }
}

/**
 * Clear Clockify configuration from storage
 */
export function clearClockifyConfig(): void {
  localStorage.removeItem('clockify-api-key');
  localStorage.removeItem('clockify-workspace-id');
  localStorage.removeItem('clockify-user-id');
}