import * as db from "./db";

/**
 * Calculate average daily consumption for a stock item
 */
export async function calculateAverageDailyConsumption(stockItemId: number): Promise<number> {
  const transactions = await db.getStockTransactionsByItem(stockItemId);
  
  // Filter only issued transactions (actual consumption)
  const issuedTransactions = transactions.filter(t => t.transactionType === "issued");
  
  if (issuedTransactions.length === 0) {
    return 0;
  }
  
  // Calculate total issued quantity
  const totalIssued = issuedTransactions.reduce((sum, t) => sum + t.quantity, 0);
  
  // Calculate time span in days
  const firstTransaction = issuedTransactions[issuedTransactions.length - 1];
  const lastTransaction = issuedTransactions[0];
  
  const daysDiff = Math.max(
    1,
    Math.floor(
      (new Date(lastTransaction.createdAt).getTime() - new Date(firstTransaction.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
    )
  );
  
  return totalIssued / daysDiff;
}

/**
 * Predict days until stock depletion
 */
export async function predictDaysUntilDepletion(
  stockItemId: number,
  currentQuantity: number
): Promise<number | null> {
  const avgDailyConsumption = await calculateAverageDailyConsumption(stockItemId);
  
  if (avgDailyConsumption === 0) {
    return null; // Cannot predict without consumption data
  }
  
  return Math.floor(currentQuantity / avgDailyConsumption);
}

/**
 * Calculate optimal reorder quantity based on consumption patterns
 */
export async function calculateOptimalReorderQuantity(
  stockItemId: number,
  leadTimeDays: number = 7 // Default lead time for reordering
): Promise<{
  recommendedQuantity: number;
  safetyStock: number;
  reorderPoint: number;
  avgDailyConsumption: number;
}> {
  const avgDailyConsumption = await calculateAverageDailyConsumption(stockItemId);
  
  // Safety stock: 50% buffer for demand variability
  const safetyStock = Math.ceil(avgDailyConsumption * leadTimeDays * 0.5);
  
  // Reorder point: consumption during lead time + safety stock
  const reorderPoint = Math.ceil(avgDailyConsumption * leadTimeDays) + safetyStock;
  
  // Recommended order quantity: 30 days supply
  const recommendedQuantity = Math.ceil(avgDailyConsumption * 30);
  
  return {
    recommendedQuantity,
    safetyStock,
    reorderPoint,
    avgDailyConsumption: Math.round(avgDailyConsumption * 100) / 100,
  };
}

/**
 * Get predictive analytics for all stock items in a dispensary
 */
export async function getStockPredictiveAnalytics(dispensaryId: number) {
  const stockItems = await db.getStockItemsByDispensary(dispensaryId);
  
  const analytics = await Promise.all(
    stockItems.map(async (item) => {
      const daysUntilDepletion = await predictDaysUntilDepletion(item.id, item.quantity);
      const reorderAnalytics = await calculateOptimalReorderQuantity(item.id);
      
      return {
        stockItemId: item.id,
        name: item.name,
        currentQuantity: item.quantity,
        lowStockThreshold: item.lowStockThreshold,
        daysUntilDepletion,
        ...reorderAnalytics,
        needsReorder: item.quantity <= reorderAnalytics.reorderPoint,
      };
    })
  );
  
  // Sort by urgency (items needing reorder first, then by days until depletion)
  return analytics.sort((a, b) => {
    if (a.needsReorder && !b.needsReorder) return -1;
    if (!a.needsReorder && b.needsReorder) return 1;
    
    if (a.daysUntilDepletion === null) return 1;
    if (b.daysUntilDepletion === null) return -1;
    
    return a.daysUntilDepletion - b.daysUntilDepletion;
  });
}
