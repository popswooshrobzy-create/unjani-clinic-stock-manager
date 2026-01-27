import { StockDashboardLayout } from "@/components/StockDashboardLayout";
import { useDispensary } from "@/contexts/DispensaryContext";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function Transactions() {
  const { selectedDispensary } = useDispensary();
  
  const { data: transactions = [], isLoading } = trpc.transaction.listByDispensary.useQuery(
    { dispensaryId: selectedDispensary?.id || 0 },
    { enabled: !!selectedDispensary }
  );

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "received": return "bg-green-100 text-green-800";
      case "issued": return "bg-blue-100 text-blue-800";
      case "lost": return "bg-red-100 text-red-800";
      case "adjustment": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <StockDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Transactions</h1>
          <p className="text-gray-600 mt-1">Complete audit trail of stock movements</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : transactions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No transactions recorded yet</p>
          </Card>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Before</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">After</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(txn.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{txn.itemName}</td>
                    <td className="px-6 py-4">
                      <Badge className={getTransactionColor(txn.transactionType)}>
                        {txn.transactionType.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">{txn.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{txn.previousQuantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{txn.newQuantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{txn.userName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </StockDashboardLayout>
  );
}
