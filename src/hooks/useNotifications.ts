import { useState, useEffect, useMemo } from 'react';
import { Contract, TimeEntry, AppSettings } from './useClockifyData';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

export function useNotifications(
  _contracts: Contract[],
  currentContract: Contract | undefined,
  timeEntries: TimeEntry[],
  settings: AppSettings
) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Memoize the notifications calculation to prevent unnecessary recalculations
  const calculatedNotifications = useMemo(() => {
    const newNotifications: Notification[] = [];

    // Only show threshold-related notifications (overtime/undertime alerts)
    if (currentContract) {
      // Check for weekly overtime/undertime thresholds
      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + 1); // Monday
      thisWeekStart.setHours(0, 0, 0, 0);

      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekEnd.getDate() + 6); // Sunday

      const thisWeekEntries = timeEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= thisWeekStart && entryDate <= thisWeekEnd;
      });

      const thisWeekHours = thisWeekEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const expectedHours = currentContract.weeklyHours;

      if (expectedHours > 0) {
        const overtimePercentage = ((thisWeekHours - expectedHours) / expectedHours) * 100;
        
        if (overtimePercentage > settings.overtimeThreshold) {
          newNotifications.push({
            id: 'weekly-overtime',
            type: 'warning',
            message: `You're ${overtimePercentage.toFixed(1)}% over your weekly target (${thisWeekHours}h vs ${expectedHours}h expected)`,
            timestamp: new Date()
          });
        } else if (Math.abs(overtimePercentage) > settings.undertimeThreshold && overtimePercentage < 0) {
          newNotifications.push({
            id: 'weekly-undertime',
            type: 'info',
            message: `You're ${Math.abs(overtimePercentage).toFixed(1)}% under your weekly target (${thisWeekHours}h vs ${expectedHours}h expected)`,
            timestamp: new Date()
          });
        }
      }
    }

    return newNotifications;
  }, [currentContract, timeEntries, settings.overtimeThreshold, settings.undertimeThreshold]);

  useEffect(() => {
    setNotifications(calculatedNotifications);
  }, [calculatedNotifications]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return {
    notifications,
    dismissNotification
  };
}