import { StockDashboardLayout } from "@/components/StockDashboardLayout";
import { useDispensary } from "@/contexts/DispensaryContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AddStock() {
  const { selectedDispensary } = useDispensary();
  const [, setLocation] = useLocation();
  const { data: categories = [] } = trpc.category.list.useQuery();
  
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    quantity: "0",
    unitPrice: "",
    batchNumber: "",
    expirationDate: "",
    source: "",
    lowStockThreshold: "10",
    notes: "",
  });

  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  
  const classifyMutation = trpc.category.classifyMedication.useMutation({
    onSuccess: (data) => {
      if (data.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: String(data.categoryId) }));
        setAiSuggestion(data.categoryName);
        toast.success(`AI suggests: ${data.categoryName}`);
      } else {
        toast.info(`AI suggestion: ${data.categoryName} (not in category list)`);
      }
    },
    onError: () => {
      toast.error("Failed to classify medication");
    },
  });

  const createMutation = trpc.stock.create.useMutation({
    onSuccess: () => {
      toast.success("Stock item added successfully");
      setLocation("/stock-list");
    },
    onError: () => {
      toast.error("Failed to add stock item");
    },
  });

  const handleAIClassify = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a medication name first");
      return;
    }
    classifyMutation.mutate({ medicationName: formData.name });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDispensary) {
      toast.error("Please select a dispensary");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter a medication name");
      return;
    }

    createMutation.mutate({
      dispensaryId: selectedDispensary.id,
      name: formData.name,
      categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
      quantity: Number(formData.quantity),
      unitPrice: formData.unitPrice || undefined,
      batchNumber: formData.batchNumber || undefined,
      expirationDate: formData.expirationDate ? new Date(formData.expirationDate) : undefined,
      source: formData.source || undefined,
      lowStockThreshold: Number(formData.lowStockThreshold),
      notes: formData.notes || undefined,
    });
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
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Stock Item</h1>
          <p className="text-gray-600 mt-1">Add new medication to {selectedDispensary.name}</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Medication Name *</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter medication name"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAIClassify}
                    disabled={classifyMutation.isPending || !formData.name.trim()}
                  >
                    {classifyMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {aiSuggestion && (
                  <p className="text-sm text-green-600 mt-1">AI suggested: {aiSuggestion}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger id="category" className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Initial Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="unitPrice">Unit Price</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                    placeholder="e.g., BN-2024-001"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">Source/Supplier</Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="e.g., Supplier name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or instructions"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/stock-list")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Stock Item"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </StockDashboardLayout>
  );
}
