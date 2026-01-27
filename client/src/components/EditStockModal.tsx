import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface EditStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItem: any;
  categories: any[];
  onSuccess: () => void;
}

export function EditStockModal({ isOpen, onClose, stockItem, categories, onSuccess }: EditStockModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    quantity: 0,
    unitPrice: "",
    batchNumber: "",
    expirationDate: "",
    source: "",
    lowStockThreshold: 10,
    notes: "",
  });

  useEffect(() => {
    if (stockItem) {
      setFormData({
        name: stockItem.name || "",
        categoryId: stockItem.categoryId?.toString() || "",
        quantity: stockItem.quantity || 0,
        unitPrice: stockItem.unitPrice || "",
        batchNumber: stockItem.batchNumber || "",
        expirationDate: stockItem.expirationDate 
          ? new Date(stockItem.expirationDate).toISOString().split('T')[0]
          : "",
        source: stockItem.source || "",
        lowStockThreshold: stockItem.lowStockThreshold || 10,
        notes: stockItem.notes || "",
      });
    }
  }, [stockItem, isOpen]);

  const updateMutation = trpc.stock.update.useMutation({
    onSuccess: () => {
      toast.success("Stock item updated successfully");
      onSuccess();
      onClose();
    },
    onError: () => {
      toast.error("Failed to update stock item");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateMutation.mutate({
      id: stockItem.id,
      name: formData.name || undefined,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
      quantity: formData.quantity || undefined,
      unitPrice: formData.unitPrice || undefined,
      batchNumber: formData.batchNumber || undefined,
      expirationDate: formData.expirationDate ? new Date(formData.expirationDate) : undefined,
      source: formData.source || undefined,
      lowStockThreshold: formData.lowStockThreshold || undefined,
      notes: formData.notes || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Stock Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter item name"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="unitPrice">Unit Price</Label>
            <Input
              id="unitPrice"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="batchNumber">Batch Number</Label>
            <Input
              id="batchNumber"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              placeholder="e.g., LOT-2024-001"
            />
          </div>

          <div>
            <Label htmlFor="expirationDate">Expiration Date</Label>
            <Input
              id="expirationDate"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="e.g., Supplier name"
            />
          </div>

          <div>
            <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 10 })}
              placeholder="10"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
