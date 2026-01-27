import { StockDashboardLayout } from "@/components/StockDashboardLayout";
import { useDispensary } from "@/contexts/DispensaryContext";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function ExpirationDates() {
  const { selectedDispensary } = useDispensary();
  
  const { data: expiringItems = [], isLoading } = trpc.stock.expiring.useQuery(
    { dispensaryId: selectedDispensary?.id || 0 },
    { enabled: !!selectedDispensary }
  );

  const getExpiryStatus = (expiryDate: Date | null) => {
    if (!expiryDate) return { color: "bg-gray-100 text-gray-800", label: "No Date" };
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMonths = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (diffMonths < 0) return { color: "bg-red-100 text-red-800", label: "EXPIRED" };
    if (diffMonths < 3) return { color: "bg-orange-100 text-orange-800", label: "EXPIRING SOON" };
    return { color: "bg-green-100 text-green-800", label: "GOOD" };
  };

  return (
    <StockDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expiration Dates</h1>
          <p className="text-gray-600 mt-1">Monitor medication expiration status</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : expiringItems.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No items expiring within 3 months</p>
          </Card>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expiringItems.map((item) => {
                  const status = getExpiryStatus(item.expirationDate);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.categoryName || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.batchNumber || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={status.color}>{status.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </StockDashboardLayout>
  );
}
