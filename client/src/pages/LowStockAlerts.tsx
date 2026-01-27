import { StockDashboardLayout } from "@/components/StockDashboardLayout";
import { useDispensary } from "@/contexts/DispensaryContext";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";

export default function LowStockAlerts() {
  const { selectedDispensary } = useDispensary();
  
  const { data: lowStockItems = [], isLoading } = trpc.stock.lowStock.useQuery(
    { dispensaryId: selectedDispensary?.id || 0 },
    { enabled: !!selectedDispensary }
  );

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { color: "bg-red-100 text-red-800", label: "OUT OF STOCK", icon: "🔴" };
    return { color: "bg-orange-100 text-orange-800", label: "LOW STOCK", icon: "🟠" };
  };

  return (
    <StockDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Low Stock Alerts</h1>
          <p className="text-gray-600 mt-1">Items requiring attention</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : lowStockItems.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">All stock levels are healthy</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item) => {
              const status = getStockStatus(item.quantity);
              return (
                <Card key={item.id} className="p-6 border-l-4 border-orange-500">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{item.categoryName || "Uncategorized"}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current:</span>
                          <span className="font-semibold">{item.quantity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Threshold:</span>
                          <span>{item.lowStockThreshold}</span>
                        </div>
                      </div>
                      
                      <Badge className={`${status.color} mt-3`}>{status.label}</Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </StockDashboardLayout>
  );
}
