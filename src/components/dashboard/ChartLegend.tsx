import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface LegendItem {
  color: string;
  label: string;
  description: string;
}

interface ChartLegendProps {
  title?: string;
}

export function ChartLegend({ title = "Chart Color Legend" }: ChartLegendProps) {
  const legendItems: LegendItem[] = [
    {
      color: 'var(--chart-1)', // Electric Blue
      label: 'Actual Hours',
      description: 'Hours actually worked'
    },
    {
      color: 'var(--chart-2)', // Vibrant Green
      label: 'On Track / Good Performance',
      description: 'Performance within 80-120% of target'
    },
    {
      color: 'var(--chart-3)', // Bright Orange
      label: 'High Performance / Overtime',
      description: 'Performance above 120% of target'
    },
    {
      color: 'var(--chart-4)', // Electric Purple
      label: 'Low Performance',
      description: 'Performance below 80% of target'
    },
    {
      color: 'var(--chart-5)', // Bright Red
      label: 'Extreme Performance',
      description: 'Performance above 150% of target'
    },
    {
      color: 'var(--chart-6)', // Electric Yellow
      label: 'Break Time / Vacation',
      description: 'Time adjustments for breaks and vacation'
    },
    {
      color: 'var(--chart-7)', // Cyan
      label: 'Current Week',
      description: 'Current week indicators'
    },
    {
      color: 'var(--chart-8)', // Light Purple
      label: 'Target / Expected Hours',
      description: 'Expected or target hours'
    }
  ];

  return (
    <Card className="w-full mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded shadow-sm flex-shrink-0" 
                style={{ 
                  backgroundColor: item.color,
                  boxShadow: `0 0 6px ${item.color}40`
                }} 
              />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{item.label}</p>
                <p className="text-xs text-muted-foreground leading-tight">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}