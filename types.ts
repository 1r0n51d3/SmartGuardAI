export interface AnalysisResult {
  id: string;
  safetyScore: number;
  hazards: string[];
  progressEstimate: number;
  complianceStatus: 'Compliant' | 'Minor Violations' | 'Critical Risk';
  recommendations: string[];
  timestamp: string;
  imageUrl?: string;
}

export interface SiteMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ANALYZE = 'ANALYZE',
  REPORTS = 'REPORTS'
}