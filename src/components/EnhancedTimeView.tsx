import { TimeEntry } from '../hooks/useClockifyData';
import { 
  formatDuration, 
  formatTimeInterval, 
  getDayTotalTime, 
  getWorkingPattern,
  calculateBreakTimes,
  hasOverlappingIntervals 
} from '../utils/timeUtils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface EnhancedTimeViewProps {
  timeEntries: TimeEntry[];
  selectedDate: string;
}

export function EnhancedTimeView({ timeEntries, selectedDate }: EnhancedTimeViewProps) {
  const dayEntries = timeEntries.filter(entry => entry.date === selectedDate);
  const dayTotal = getDayTotalTime(timeEntries, selectedDate);
  const workingPattern = getWorkingPattern(timeEntries, selectedDate);
  const breaks = calculateBreakTimes(dayEntries);
  const overlaps = hasOverlappingIntervals(dayEntries);

  if (dayEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time Details - {selectedDate}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No time entries for this date.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Time Details - {selectedDate}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Day Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium">Total Work Time</p>
              <p className="text-2xl font-bold">{formatDuration(dayTotal.duration)}</p>
              <p className="text-xs text-muted-foreground">{dayTotal.hours.toFixed(2)} hours</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Time Span</p>
              <p className="text-lg font-semibold">{formatDuration(workingPattern.totalSpanTime)}</p>
              <p className="text-xs text-muted-foreground">
                {workingPattern.firstStartTime && workingPattern.lastEndTime && 
                  formatTimeInterval({
                    start: '',
                    end: '',
                    startTime: workingPattern.firstStartTime,
                    endTime: workingPattern.lastEndTime
                  })
                }
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Efficiency</p>
              <p className="text-lg font-semibold">{(workingPattern.efficiency * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Work / Span ratio</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Entries</p>
              <p className="text-lg font-semibold">{dayEntries.length}</p>
              <p className="text-xs text-muted-foreground">Time segments</p>
            </div>
          </div>

          {/* Warnings */}
          {overlaps.length > 0 && (
            <Alert>
              <AlertDescription>
                ⚠️ Found {overlaps.length} overlapping time interval(s). This may indicate duplicate entries.
              </AlertDescription>
            </Alert>
          )}

          {/* Time Entries */}
          <div className="space-y-2">
            <h4 className="font-semibold">Time Entries</h4>
            {dayEntries
              .sort((a, b) => a.timeInterval.startTime.getTime() - b.timeInterval.startTime.getTime())
              .map((entry) => (
                <div key={entry.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{entry.projectName}</p>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {formatDuration(entry.duration)}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatTimeInterval(entry.timeInterval)}</span>
                    <span>
                      {entry.duration.totalMinutes} min • {entry.hours.toFixed(2)}h
                    </span>
                  </div>
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex gap-1">
                      {entry.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Break Times */}
          {breaks.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Break Times</h4>
              {breaks.map((breakTime, index) => (
                <div key={index} className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  <p>
                    Break between entries: {formatDuration(breakTime.breakDuration)}
                  </p>
                  <p className="text-xs">
                    After "{breakTime.beforeEntry.projectName}" → Before "{breakTime.afterEntry.projectName}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}