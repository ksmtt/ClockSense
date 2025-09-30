import { useState, useMemo } from 'react';
import { Calendar, Clock, Filter, Download, Search, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { TimeEntry, Contract } from '../hooks/useClockifyData';

interface TimeEntriesDataViewProps {
  timeEntries: TimeEntry[];
  originalTimeEntries?: TimeEntry[];
  contracts: Contract[];
  currentContract?: Contract;
  timeFrame: string;
  selectedContract: string;
  isBreakAdjusted: boolean;
  breakTimeMinutes: number;
}

export function TimeEntriesDataView({ 
  timeEntries, 
  originalTimeEntries,
  contracts, 
  currentContract,
  timeFrame,
  selectedContract,
  isBreakAdjusted,
  breakTimeMinutes 
}: TimeEntriesDataViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'hours' | 'project'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterProject, setFilterProject] = useState<string>('all');

  // Filter time entries by selected contract and timeframe
  const relevantEntries = useMemo(() => {
    let filtered = timeEntries;
    
    // Filter by contract if not "all"
    if (selectedContract !== 'all') {
      const contract = contracts.find(c => c.id === selectedContract);
      if (contract) {
        filtered = filtered.filter(entry => {
          const entryDate = new Date(entry.date);
          const start = new Date(contract.startDate);
          const end = new Date(contract.endDate);
          return entryDate >= start && entryDate <= end;
        });
      }
    }
    
    return filtered;
  }, [timeEntries, selectedContract, contracts]);

  // Get unique projects from relevant time entries
  const projects = Array.from(new Set(relevantEntries.map(entry => entry.project || 'No Project')));

  // Filter and sort entries
  const filteredEntries = relevantEntries
    .filter(entry => {
      const matchesSearch = !searchTerm || 
        entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.project?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = filterProject === 'all' || entry.project === filterProject;
      return matchesSearch && matchesProject;
    })
    .sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'date':
          return modifier * (new Date(a.date).getTime() - new Date(b.date).getTime());
        case 'hours':
          return modifier * (a.hours - b.hours);
        case 'project':
          return modifier * ((a.project || '').localeCompare(b.project || ''));
        default:
          return 0;
      }
    });

  // Calculate totals
  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalOriginalHours = originalTimeEntries 
    ? originalTimeEntries
        .filter(entry => filteredEntries.some(fe => fe.date === entry.date && fe.description === entry.description))
        .reduce((sum, entry) => sum + entry.hours, 0)
    : totalHours;
  
  const totalBreakTime = isBreakAdjusted && breakTimeMinutes > 0 
    ? (filteredEntries.length * breakTimeMinutes) / 60 
    : 0;

  const exportToCSV = () => {
    const headers = ['Date', 'Project', 'Description', 'Hours', 'Original Hours', 'Break Adjustment'];
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry => {
        const originalEntry = originalTimeEntries?.find(oe => 
          oe.date === entry.date && oe.description === entry.description
        );
        const originalHours = originalEntry?.hours || entry.hours;
        const breakAdjustment = isBreakAdjusted ? -(breakTimeMinutes / 60) : 0;
        
        return [
          entry.date,
          `"${entry.project || 'No Project'}"`,
          `"${entry.description || ''}"`,
          entry.hours.toFixed(2),
          originalHours.toFixed(2),
          breakAdjustment.toFixed(2)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-entries-${timeFrame}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getPerformanceColor = (hours: number) => {
    const expectedDaily = currentContract ? currentContract.weeklyHours / 7 : 2.86; // Default 20h/week
    
    if (hours > expectedDaily * 1.5) return 'var(--chart-5)'; // Extreme
    if (hours > expectedDaily * 1.2) return 'var(--chart-3)'; // High
    if (hours >= expectedDaily * 0.8) return 'var(--chart-2)'; // Good
    if (hours > 0) return 'var(--chart-4)'; // Low
    return 'var(--muted-foreground)'; // None
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="normal-case flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Data Badge
          <Badge variant="secondary" className="ml-1">
            {relevantEntries.length}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Time Entries Data - {timeFrame}
          </DialogTitle>
          <DialogDescription>
            Detailed view of all time entries for the selected timeframe
            {selectedContract !== 'all' && (
              <span className="text-primary"> • {contracts.find(c => c.id === selectedContract)?.name}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{filteredEntries.length}</div>
                <p className="text-xs text-muted-foreground">Total Entries</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">
                  {isBreakAdjusted ? 'Adjusted Hours' : 'Total Hours'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">Projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {(totalHours / Math.max(1, filteredEntries.length)).toFixed(1)}h
                </div>
                <p className="text-xs text-muted-foreground">Avg per Entry</p>
              </CardContent>
            </Card>
          </div>

          {/* Break Time Summary */}
          {isBreakAdjusted && breakTimeMinutes > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Break Time Adjustment Active</span>
                  </div>
                  <div className="text-sm">
                    {breakTimeMinutes} min × {filteredEntries.length} entries = 
                    <span className="font-medium text-primary ml-1">
                      -{totalBreakTime.toFixed(1)}h total
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Original total: {totalOriginalHours.toFixed(1)}h → Adjusted: {totalHours.toFixed(1)}h
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters and Search */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
            </div>
            
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: 'date' | 'hours' | 'project') => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="hours">Sort by Hours</SelectItem>
                <SelectItem value="project">Sort by Project</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="normal-case"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="normal-case flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          {/* Data Table */}
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px] text-right">Hours</TableHead>
                      {isBreakAdjusted && originalTimeEntries && (
                        <TableHead className="w-[100px] text-right">Original</TableHead>
                      )}
                      <TableHead className="w-[60px]">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry, index) => {
                      const originalEntry = originalTimeEntries?.find(oe => 
                        oe.date === entry.date && oe.description === entry.description
                      );
                      const performanceColor = getPerformanceColor(entry.hours);
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">
                            {new Date(entry.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {entry.project || 'No Project'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {entry.description || '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {entry.hours.toFixed(2)}h
                          </TableCell>
                          {isBreakAdjusted && originalTimeEntries && (
                            <TableCell className="text-right font-mono text-muted-foreground">
                              {(originalEntry?.hours || entry.hours).toFixed(2)}h
                            </TableCell>
                          )}
                          <TableCell>
                            <div 
                              className="w-3 h-3 rounded-full shadow-sm"
                              style={{ backgroundColor: performanceColor }}
                              title={`${entry.hours.toFixed(2)}h performance indicator`}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {filteredEntries.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No time entries found matching your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}