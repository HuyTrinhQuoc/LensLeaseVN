export type DateFilter = 'DAY' | 'MONTH' | 'YEAR' | 'CUSTOM';

export interface DashboardMetrics {
  gmv: number;
  commission: number;
  activeRentals: number;
  newUsers: number;
  pendingKyc: number;
  escrowBalance: number;
  escrowCount: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

// Cấu trúc response khớp chính xác với return của AdminDashboardService
export interface DashboardResponse {
  metrics: DashboardMetrics;
  charts: {
    revenueChart: ChartDataPoint[];
    categoryChart: ChartDataPoint[];
  };
}