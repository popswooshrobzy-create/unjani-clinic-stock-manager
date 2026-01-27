import { StockDashboardLayout } from "@/components/StockDashboardLayout";
import { useDispensary } from "@/contexts/DispensaryContext";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useRoute } from "wouter";

export default function CategoryView() {
  const { selectedDispensary } = useDispensary();
  const [, params] = useRoute("/category/:id");
  const categoryId = params?.id ? Number(params.id) : 0;
  
  const { data: categories = [] } = trpc.category.list.useQuery();
  const { data: stockItems = [], isLoading } = trpc.stock.byCategory.useQuery(
    { dispensaryId: selectedDispensary?.id || 0, categoryId },
    { enabled: !!selectedDispensary && categoryId > 0 }
  );
  
  const category = categories.find(c => c.id === categoryId);

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { color: "bg-red-100 text-red-800", label: "OUT" };
    if (quantity <= threshold) return { color: "bg-orange-100 text-orange-800", label: "LOW" };
    return { color: "bg-green-100 text-green-800", label: "OK" };
  };

  return (
    <StockDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{category?.name || "Category"}</h1>
          <p className="text-gray-600 mt-1">Items in this category</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : stockItems.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No items in this category</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockItems.map((item) => {
              const status = getStockStatus(item.quantity, item.lowStockThreshold);
              return (
                <Card key={item.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-semibold">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Batch:</span>
                      <span>{item.batchNumber || "-"}</span>
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
