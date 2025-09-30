// Uniform chart color configuration
export const CHART_COLORS = {
  // Primary data colors
  ACTUAL_HOURS: 'var(--chart-1)',          // Light Blue - for actual data (from tokens.json)
  TARGET_EXPECTED: 'var(--chart-8)',       // Deep Purple - for targets/expected (from tokens.json)
  
  // Performance indicators
  GOOD_PERFORMANCE: 'var(--chart-2)',      // Green - 80-120% of target (from tokens.json)
  HIGH_PERFORMANCE: 'var(--chart-3)',      // Orange - 120-150% of target (from tokens.json)  
  LOW_PERFORMANCE: 'var(--chart-4)',       // Purple - below 80% (from tokens.json)
  EXTREME_PERFORMANCE: 'var(--chart-5)',   // Red - above 150% (from tokens.json)
  
  // Special categories
  BREAK_VACATION: 'var(--chart-6)',        // Amber - break time, vacation (from tokens.json)
  CURRENT_PERIOD: 'var(--chart-7)',        // Cyan - current week/period highlights (from tokens.json)
  
  // Light variations for gradients
  ACTUAL_HOURS_LIGHT: 'var(--chart-1-light)',
  TARGET_EXPECTED_LIGHT: 'var(--chart-8-light)',
  GOOD_PERFORMANCE_LIGHT: 'var(--chart-2-light)',
  HIGH_PERFORMANCE_LIGHT: 'var(--chart-3-light)',
  LOW_PERFORMANCE_LIGHT: 'var(--chart-4-light)',
  EXTREME_PERFORMANCE_LIGHT: 'var(--chart-5-light)',
  BREAK_VACATION_LIGHT: 'var(--chart-6-light)',
  CURRENT_PERIOD_LIGHT: 'var(--chart-7-light)',
} as const;

// Gradient definitions for enhanced visuals
export const CHART_GRADIENTS = {
  ACTUAL: {
    id: 'actualGradient',
    colors: [
      { offset: '0%', color: CHART_COLORS.ACTUAL_HOURS, opacity: 0.9 },
      { offset: '50%', color: CHART_COLORS.ACTUAL_HOURS_LIGHT, opacity: 0.6 },
      { offset: '100%', color: CHART_COLORS.ACTUAL_HOURS, opacity: 0.3 }
    ]
  },
  TARGET: {
    id: 'targetGradient',
    colors: [
      { offset: '0%', color: CHART_COLORS.TARGET_EXPECTED, opacity: 0.9 },
      { offset: '50%', color: CHART_COLORS.TARGET_EXPECTED_LIGHT, opacity: 0.6 },
      { offset: '100%', color: CHART_COLORS.TARGET_EXPECTED, opacity: 0.3 }
    ]
  },
  GOOD: {
    id: 'goodGradient',
    colors: [
      { offset: '0%', color: CHART_COLORS.GOOD_PERFORMANCE, opacity: 0.9 },
      { offset: '50%', color: CHART_COLORS.GOOD_PERFORMANCE_LIGHT, opacity: 0.6 },
      { offset: '100%', color: CHART_COLORS.GOOD_PERFORMANCE, opacity: 0.3 }
    ]
  }
} as const;

// Performance color mapping function
export const getPerformanceColor = (actualHours: number, expectedHours: number) => {
  if (expectedHours === 0) return CHART_COLORS.LOW_PERFORMANCE;
  
  const ratio = actualHours / expectedHours;
  
  if (ratio > 1.5) {
    return {
      color: CHART_COLORS.EXTREME_PERFORMANCE,
      light: CHART_COLORS.EXTREME_PERFORMANCE_LIGHT,
      status: 'extreme'
    };
  } else if (ratio > 1.2) {
    return {
      color: CHART_COLORS.HIGH_PERFORMANCE,
      light: CHART_COLORS.HIGH_PERFORMANCE_LIGHT,
      status: 'high'
    };
  } else if (ratio >= 0.8 && ratio <= 1.2) {
    return {
      color: CHART_COLORS.GOOD_PERFORMANCE,
      light: CHART_COLORS.GOOD_PERFORMANCE_LIGHT,
      status: 'good'
    };
  } else if (actualHours > 0) {
    return {
      color: CHART_COLORS.LOW_PERFORMANCE,
      light: CHART_COLORS.LOW_PERFORMANCE_LIGHT,
      status: 'low'
    };
  } else {
    return {
      color: CHART_COLORS.LOW_PERFORMANCE,
      light: CHART_COLORS.LOW_PERFORMANCE_LIGHT,
      status: 'none'
    };
  }
};

// Standard chart configuration
export const STANDARD_CHART_CONFIG = {
  actual: {
    label: "Actual Hours",
    color: CHART_COLORS.ACTUAL_HOURS,
  },
  expected: {
    label: "Expected Hours", 
    color: CHART_COLORS.TARGET_EXPECTED,
  },
  target: {
    label: "Target Hours",
    color: CHART_COLORS.TARGET_EXPECTED,
  },
  good: {
    label: "Good Performance",
    color: CHART_COLORS.GOOD_PERFORMANCE,
  },
  high: {
    label: "High Performance", 
    color: CHART_COLORS.HIGH_PERFORMANCE,
  },
  low: {
    label: "Low Performance",
    color: CHART_COLORS.LOW_PERFORMANCE,
  },
  extreme: {
    label: "Extreme Performance",
    color: CHART_COLORS.EXTREME_PERFORMANCE,
  }
} as const;