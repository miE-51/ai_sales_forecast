
export interface SalesData {
  month: string;
  value: number;
}

export interface ForecastPoint {
  month: string;
  actual?: number;
  predicted?: number;
}

export interface AIAnalysis {
  forecast: string;
  advice: string[];
  trend: 'up' | 'down' | 'stable';
  confidence: string;
}
