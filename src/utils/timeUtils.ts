/**
 * Time utilities for working with enhanced time entry data
 */

import { TimeEntry } from '../hooks/useClockifyData';

/**
 * Format duration as human-readable string
 */
export function formatDuration(duration: TimeEntry['duration']): string {
  const { hours, minutes, seconds } = duration;
  
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds}s`);
  
  return parts.join(' ') || '0m';
}

/**
 * Format time interval as human-readable string
 */
export function formatTimeInterval(timeInterval: TimeEntry['timeInterval']): string {
  const startTime = timeInterval.startTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const endTime = timeInterval.endTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  return `${startTime} - ${endTime}`;
}

/**
 * Get total work time for a day
 */
export function getDayTotalTime(entries: TimeEntry[], date: string): {
  hours: number;
  duration: TimeEntry['duration'];
  intervals: Array<{ start: Date; end: Date; duration: number }>;
} {
  const dayEntries = entries.filter(entry => entry.date === date);
  
  let totalMinutes = 0;
  const intervals: Array<{ start: Date; end: Date; duration: number }> = [];
  
  dayEntries.forEach(entry => {
    totalMinutes += entry.duration.totalMinutes;
    intervals.push({
      start: entry.timeInterval.startTime,
      end: entry.timeInterval.endTime,
      duration: entry.hours
    });
  });
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return {
    hours: totalMinutes / 60,
    duration: {
      hours,
      minutes,
      seconds: 0,
      totalMinutes,
      totalSeconds: totalMinutes * 60
    },
    intervals: intervals.sort((a, b) => a.start.getTime() - b.start.getTime())
  };
}

/**
 * Check if entries have overlapping time intervals
 */
export function hasOverlappingIntervals(entries: TimeEntry[]): Array<{
  entry1: TimeEntry;
  entry2: TimeEntry;
  overlapMinutes: number;
}> {
  const overlaps: Array<{
    entry1: TimeEntry;
    entry2: TimeEntry;
    overlapMinutes: number;
  }> = [];
  
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const entry1 = entries[i];
      const entry2 = entries[j];
      
      const start1 = entry1.timeInterval.startTime.getTime();
      const end1 = entry1.timeInterval.endTime.getTime();
      const start2 = entry2.timeInterval.startTime.getTime();
      const end2 = entry2.timeInterval.endTime.getTime();
      
      // Check for overlap
      const overlapStart = Math.max(start1, start2);
      const overlapEnd = Math.min(end1, end2);
      
      if (overlapStart < overlapEnd) {
        const overlapMinutes = (overlapEnd - overlapStart) / (1000 * 60);
        overlaps.push({
          entry1,
          entry2,
          overlapMinutes
        });
      }
    }
  }
  
  return overlaps;
}

/**
 * Calculate break time between consecutive entries
 */
export function calculateBreakTimes(entries: TimeEntry[]): Array<{
  beforeEntry: TimeEntry;
  afterEntry: TimeEntry;
  breakMinutes: number;
  breakDuration: TimeEntry['duration'];
}> {
  const sortedEntries = [...entries].sort((a, b) => 
    a.timeInterval.startTime.getTime() - b.timeInterval.startTime.getTime()
  );
  
  const breaks: Array<{
    beforeEntry: TimeEntry;
    afterEntry: TimeEntry;
    breakMinutes: number;
    breakDuration: TimeEntry['duration'];
  }> = [];
  
  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const currentEntry = sortedEntries[i];
    const nextEntry = sortedEntries[i + 1];
    
    // Only calculate breaks for same day
    if (currentEntry.date === nextEntry.date) {
      const endTime = currentEntry.timeInterval.endTime.getTime();
      const startTime = nextEntry.timeInterval.startTime.getTime();
      
      if (startTime > endTime) {
        const breakMinutes = (startTime - endTime) / (1000 * 60);
        const breakHours = Math.floor(breakMinutes / 60);
        const remainingMinutes = Math.floor(breakMinutes % 60);
        
        breaks.push({
          beforeEntry: currentEntry,
          afterEntry: nextEntry,
          breakMinutes,
          breakDuration: {
            hours: breakHours,
            minutes: remainingMinutes,
            seconds: 0,
            totalMinutes: Math.floor(breakMinutes),
            totalSeconds: Math.floor(breakMinutes * 60)
          }
        });
      }
    }
  }
  
  return breaks;
}

/**
 * Get working hours pattern for a day
 */
export function getWorkingPattern(entries: TimeEntry[], date: string): {
  firstStartTime: Date | null;
  lastEndTime: Date | null;
  totalWorkingTime: TimeEntry['duration'];
  totalSpanTime: TimeEntry['duration'];
  efficiency: number; // Working time / Span time
} {
  const dayEntries = entries
    .filter(entry => entry.date === date)
    .sort((a, b) => a.timeInterval.startTime.getTime() - b.timeInterval.startTime.getTime());
  
  if (dayEntries.length === 0) {
    return {
      firstStartTime: null,
      lastEndTime: null,
      totalWorkingTime: { hours: 0, minutes: 0, seconds: 0, totalMinutes: 0, totalSeconds: 0 },
      totalSpanTime: { hours: 0, minutes: 0, seconds: 0, totalMinutes: 0, totalSeconds: 0 },
      efficiency: 0
    };
  }
  
  const firstStartTime = dayEntries[0].timeInterval.startTime;
  const lastEndTime = dayEntries[dayEntries.length - 1].timeInterval.endTime;
  
  const totalWorkingMinutes = dayEntries.reduce((sum, entry) => sum + entry.duration.totalMinutes, 0);
  const spanMinutes = (lastEndTime.getTime() - firstStartTime.getTime()) / (1000 * 60);
  
  const workingHours = Math.floor(totalWorkingMinutes / 60);
  const workingMinutesRemainder = totalWorkingMinutes % 60;
  
  const spanHours = Math.floor(spanMinutes / 60);
  const spanMinutesRemainder = Math.floor(spanMinutes % 60);
  
  return {
    firstStartTime,
    lastEndTime,
    totalWorkingTime: {
      hours: workingHours,
      minutes: workingMinutesRemainder,
      seconds: 0,
      totalMinutes: totalWorkingMinutes,
      totalSeconds: totalWorkingMinutes * 60
    },
    totalSpanTime: {
      hours: spanHours,
      minutes: spanMinutesRemainder,
      seconds: 0,
      totalMinutes: Math.floor(spanMinutes),
      totalSeconds: Math.floor(spanMinutes * 60)
    },
    efficiency: spanMinutes > 0 ? totalWorkingMinutes / spanMinutes : 0
  };
}