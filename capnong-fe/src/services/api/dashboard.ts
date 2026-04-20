import api from "../api";

export interface FarmerSummary {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  outOfStockProducts: number;
  grossRevenue: number;
  netRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export interface MonthlyRevenue {
  month: number;
  label: string;
  revenue: number;
}

export const apiDashboardService = {
  async getFarmerSummary(): Promise<FarmerSummary> {
    const res = await api.get("/api/dashboards/farmer/summary");
    const data = res.data.data;
    if (!data) return { totalOrders: 0, pendingOrders: 0, totalProducts: 0, outOfStockProducts: 0, grossRevenue: 0, netRevenue: 0, averageRating: 0, totalReviews: 0 };
    return {
      totalOrders: data.total_orders ?? data.totalOrders ?? 0,
      pendingOrders: data.pending_orders ?? data.pendingOrders ?? 0,
      totalProducts: data.total_products ?? data.totalProducts ?? 0,
      outOfStockProducts: data.out_of_stock_products ?? data.outOfStockProducts ?? 0,
      grossRevenue: data.gross_revenue ?? data.grossRevenue ?? 0,
      netRevenue: data.net_revenue ?? data.netRevenue ?? 0,
      averageRating: data.average_rating ?? data.averageRating ?? 0,
      totalReviews: data.total_reviews ?? data.totalReviews ?? 0,
    };
  },

  async getMonthlyRevenue(year?: number): Promise<MonthlyRevenue[]> {
    const params: Record<string, string> = {};
    if (year) params.year = String(year);
    const res = await api.get("/api/dashboards/farmer/monthly-revenue", { params });
    const data = res.data.data;
    if (!Array.isArray(data)) return [];
    return data.map((item: Record<string, unknown>) => ({
      month: (item.month as number) || 0,
      label: (item.label as string) || "",
      revenue: Number(item.revenue) || 0,
    }));
  },
};
