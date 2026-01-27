import { StockDashboardLayout } from "@/components/StockDashboardLayout";
import { useDispensary } from "@/contexts/DispensaryContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3x3, List, Edit, Trash2, Loader2, Search, TrendingUp, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { EditStockModal } from "@/components/EditStockModal";

export default function StockList() {
  const { selectedDispensary } = useDispensary();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expirationFilter, setExpirationFilter] = useState<string>("all");
  const [formTypeFilter, setFormTypeFilter] = useState<string>("all");
  
  const { data: stockItems = [], isLoading, refetch } = trpc.stock.list.useQuery(
    { dispensaryId: selectedDispensary?.id || 0 },
    { enabled: !!selectedDispensary }
  );

  const { data: categories = [] } = trpc.category.list.useQuery();
  
  const { data: predictiveAnalytics = [] } = trpc.analytics.getPredictiveAnalytics.useQuery(
    { dispensaryId: selectedDispensary?.id || 0 },
    { enabled: !!selectedDispensary }
  );
  
  const deleteMutation = trpc.stock.delete.useMutation({
    onSuccess: () => {
      toast.success("Stock item deleted successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete stock item");
    },
  });

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { color: "bg-red-100 text-red-800 border-red-300", label: "OUT OF STOCK" };
    if (quantity <= threshold) return { color: "bg-orange-100 text-orange-800 border-orange-300", label: "LOW STOCK" };
    return { color: "bg-green-100 text-green-800 border-green-300", label: "IN STOCK" };
  };

  const getFormType = (categoryName: string | null): string => {
    if (!categoryName) return "other";
    const lower = categoryName.toLowerCase();
    if (lower.includes("syrup") || lower.includes("suspension") || lower.includes("liquid")) {
      return "syrup_suspension";
    }
    if (lower.includes("tablet") || lower.includes("capsule") || lower.includes("pill")) {
      return "tablet_capsule";
    }
    return "other";
  };

  const isExpiringSoon = (expirationDate: any): boolean => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expDate <= threeMonthsFromNow;
  };

  const filteredItems = useMemo(() => {
    return stockItems.filter(item => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.batchNumber && item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category filter
      const matchesCategory = categoryFilter === "all" || 
        (item.categoryId && item.categoryId.toString() === categoryFilter);
      
      // Expiration filter
      let matchesExpiration = true;
      if (expirationFilter === "expiring_soon") {
        matchesExpiration = isExpiringSoon(item.expirationDate);
      } else if (expirationFilter === "expired") {
        matchesExpiration = item.expirationDate && new Date(item.expirationDate) < new Date();
      } else if (expirationFilter === "valid") {
        matchesExpiration = !item.expirationDate || new Date(item.expirationDate) >= new Date();
      }
      
      // Form type filter
      const itemFormType = getFormType(item.categoryName);
      const matchesFormType = formTypeFilter === "all" || itemFormType === formTypeFilter;
      
      return matchesSearch && matchesCategory && matchesExpiration && matchesFormType;
    });
  }, [stockItems, searchQuery, categoryFilter, expirationFilter, formTypeFilter]);

  const getAnalyticsForItem = (itemId: number) => {
    return predictiveAnalytics.find(a => a.stockItemId === itemId);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (!selectedDispensary) {
    return (
      <StockDashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Please select a dispensary first</p>
        </div>
      </StockDashboardLayout>
    );
  }

  return (
    <StockDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock List</h1>
            <p className="text-gray-600 mt-1">Complete inventory for {selectedDispensary.name}</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              Grid
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or batch number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={expirationFilter} onValueChange={setExpirationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Expiration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="valid">Valid Items</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon (3 months)</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Form Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Forms</SelectItem>
                <SelectItem value="syrup_suspension">Syrups/Suspensions</SelectItem>
                <SelectItem value="tablet_capsule">Tablets/Capsules</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">
              {stockItems.length === 0 
                ? "No stock items found. Add your first item to get started."
                : "No items match your search criteria."}
            </p>
          </Card>
        ) : viewMode === "list" ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const status = getStockStatus(item.quantity, item.lowStockThreshold);
                  const analytics = getAnalyticsForItem(item.id);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.categoryName || "Uncategorized"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={status.color}>{status.label}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.batchNumber || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {analytics && analytics.daysUntilDepletion !== null ? (
                          <div className="flex items-center gap-1">
                            {analytics.needsReorder && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                            <span className={analytics.needsReorder ? "text-orange-600 font-semibold" : "text-gray-600"}>
                              {analytics.daysUntilDepletion} days
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mr-2"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const status = getStockStatus(item.quantity, item.lowStockThreshold);
              const analytics = getAnalyticsForItem(item.id);
              return (
                <Card key={item.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.categoryName || "Uncategorized"}</p>
                    </div>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-semibold">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Batch:</span>
                      <span>{item.batchNumber || "-"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expiry:</span>
                      <span>{item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : "-"}</span>
                    </div>
                    {analytics && analytics.daysUntilDepletion !== null && (
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="text-gray-600 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Depletion:
                        </span>
                        <span className={analytics.needsReorder ? "text-orange-600 font-semibold" : "font-semibold"}>
                          {analytics.daysUntilDepletion} days
                        </span>
                      </div>
                    )}
                    {analytics && analytics.needsReorder && (
                      <div className="bg-orange-50 border border-orange-200 rounded p-2 mt-2">
                        <p className="text-xs text-orange-800 font-medium">
                          Reorder recommended: {analytics.recommendedQuantity} units
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {editingItem && (
        <EditStockModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingItem(null);
          }}
          stockItem={editingItem}
          categories={categories}
          onSuccess={() => refetch()}
        />
      )}
    </StockDashboardLayout>
  );
}
