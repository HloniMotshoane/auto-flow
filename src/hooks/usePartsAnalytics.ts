import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";

export interface SupplierStats {
  supplierId: string;
  supplierName: string;
  totalQuotes: number;
  averageResponseTime: number; // in hours
  averagePrice: number;
  inStockPercentage: number;
  totalOrders: number;
}

export interface PartsAnalytics {
  pendingRequests: number;
  awaitingDelivery: number;
  totalSpendThisMonth: number;
  supplierStats: SupplierStats[];
  topSuppliers: SupplierStats[];
}

export function usePartsAnalytics() {
  const { tenantId } = useUserTenant();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["parts-analytics", tenantId],
    queryFn: async (): Promise<PartsAnalytics> => {
      if (!tenantId) {
        return {
          pendingRequests: 0,
          awaitingDelivery: 0,
          totalSpendThisMonth: 0,
          supplierStats: [],
          topSuppliers: [],
        };
      }

      // Get pending costing requests
      const { data: pendingData } = await supabase
        .from("parts_costing_requests")
        .select("id")
        .eq("tenant_id", tenantId)
        .in("status", ["pending", "sent"]);

      // Get parts awaiting delivery (ordered but not received/fitted)
      const { data: awaitingData } = await supabase
        .from("case_parts_required")
        .select("id")
        .eq("tenant_id", tenantId)
        .in("status", ["ordered", "quoted"]);

      // Get total spend this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: spendData } = await supabase
        .from("case_parts_used")
        .select("cost_paid, quantity")
        .eq("tenant_id", tenantId)
        .gte("fitted_at", startOfMonth.toISOString());

      const totalSpendThisMonth = (spendData || []).reduce(
        (sum, part) => sum + ((part.cost_paid || 0) * (part.quantity || 1)),
        0
      );

      // Get supplier statistics
      const { data: suppliers } = await supabase
        .from("suppliers")
        .select("id, supplier_name")
        .eq("tenant_id", tenantId)
        .eq("is_active", true);

      const { data: responses } = await supabase
        .from("supplier_responses")
        .select(`
          *,
          costing_request:parts_costing_requests!inner(
            tenant_id,
            supplier_id,
            created_at
          )
        `)
        .eq("costing_request.tenant_id", tenantId);

      const { data: partsUsed } = await supabase
        .from("case_parts_used")
        .select("supplier_id, cost_paid, quantity")
        .eq("tenant_id", tenantId);

      // Calculate stats for each supplier
      const supplierStats: SupplierStats[] = (suppliers || []).map(supplier => {
        const supplierResponses = (responses || []).filter(
          r => r.costing_request?.supplier_id === supplier.id
        );
        
        const supplierOrders = (partsUsed || []).filter(
          p => p.supplier_id === supplier.id
        );

        // Calculate average response time in hours
        const responseTimes = supplierResponses.map(r => {
          if (r.responded_at && r.costing_request?.created_at) {
            const diff = new Date(r.responded_at).getTime() - new Date(r.costing_request.created_at).getTime();
            return diff / (1000 * 60 * 60); // Convert to hours
          }
          return 0;
        }).filter(t => t > 0);

        const avgResponseTime = responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0;

        // Calculate average price
        const prices = supplierResponses.map(r => r.quoted_price).filter(p => p > 0);
        const avgPrice = prices.length > 0
          ? prices.reduce((a, b) => a + b, 0) / prices.length
          : 0;

        // Calculate in-stock percentage
        const inStockCount = supplierResponses.filter(r => r.availability === "in_stock").length;
        const inStockPct = supplierResponses.length > 0
          ? (inStockCount / supplierResponses.length) * 100
          : 0;

        return {
          supplierId: supplier.id,
          supplierName: supplier.supplier_name,
          totalQuotes: supplierResponses.length,
          averageResponseTime: Math.round(avgResponseTime * 10) / 10,
          averagePrice: Math.round(avgPrice * 100) / 100,
          inStockPercentage: Math.round(inStockPct),
          totalOrders: supplierOrders.length,
        };
      });

      // Sort by total orders for top suppliers
      const topSuppliers = [...supplierStats]
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .slice(0, 5);

      return {
        pendingRequests: pendingData?.length || 0,
        awaitingDelivery: awaitingData?.length || 0,
        totalSpendThisMonth,
        supplierStats,
        topSuppliers,
      };
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    analytics: analytics || {
      pendingRequests: 0,
      awaitingDelivery: 0,
      totalSpendThisMonth: 0,
      supplierStats: [],
      topSuppliers: [],
    },
    isLoading,
    error,
  };
}
