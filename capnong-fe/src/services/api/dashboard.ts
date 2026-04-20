import api from "../api";

export interface FarmerSummary {
  totalOrders: number;
  pendingOrders: number;
  outOfStockProducts: number;
  grossRevenue: number;
  netRevenue: number;
}

export const apiDashboardService = {
  async getFarmerSummary(): Promise<FarmerSummary> {
    const res = await api.get("/api/dashboards/farmer/summary");
    const data = res.data.data;
    if (!data) return { totalOrders: 0, pendingOrders: 0, outOfStockProducts: 0, grossRevenue: 0, netRevenue: 0 };
    return {
      totalOrders: data.total_orders ?? data.totalOrders ?? 0,
      pendingOrders: data.pending_orders ?? data.pendingOrders ?? 0,
      outOfStockProducts: data.out_of_stock_products ?? data.outOfStockProducts ?? 0,
      grossRevenue: data.gross_revenue ?? data.grossRevenue ?? 0,
      netRevenue: data.net_revenue ?? data.netRevenue ?? 0,
    };
  }
};
