import * as db from "./db";

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], headers: string[]): string {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = ('' + value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Generate stock inventory CSV
 */
export async function generateStockInventoryCSV(dispensaryId: number): Promise<string> {
  const stockItems = await db.getStockItemsByDispensary(dispensaryId);
  
  const data = stockItems.map(item => ({
    name: item.name,
    category: item.categoryName || 'Uncategorized',
    quantity: item.quantity,
    lowStockThreshold: item.lowStockThreshold,
    batchNumber: item.batchNumber || '-',
    expirationDate: item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : '-',
    unitPrice: item.unitPrice || '-',
    source: item.source || '-',
    notes: item.notes || '-',
  }));
  
  const headers = ['name', 'category', 'quantity', 'lowStockThreshold', 'batchNumber', 'expirationDate', 'unitPrice', 'source', 'notes'];
  return convertToCSV(data, headers);
}

/**
 * Generate transaction history CSV
 */
export async function generateTransactionHistoryCSV(dispensaryId: number): Promise<string> {
  const transactions = await db.getStockTransactionsByDispensary(dispensaryId);
  
  const data = transactions.map(tx => ({
    itemName: tx.itemName || 'Unknown',
    transactionType: tx.transactionType,
    quantity: tx.quantity,
    previousQuantity: tx.previousQuantity,
    newQuantity: tx.newQuantity,
    reason: tx.reason || '-',
    userName: tx.userName || 'System',
    createdAt: new Date(tx.createdAt).toLocaleString(),
  }));
  
  const headers = ['itemName', 'transactionType', 'quantity', 'previousQuantity', 'newQuantity', 'reason', 'userName', 'createdAt'];
  return convertToCSV(data, headers);
}

/**
 * Generate low stock report CSV
 */
export async function generateLowStockCSV(dispensaryId: number): Promise<string> {
  const lowStockItems = await db.getLowStockItems(dispensaryId);
  
  const data = lowStockItems.map(item => ({
    name: item.name,
    category: item.categoryName || 'Uncategorized',
    quantity: item.quantity,
    lowStockThreshold: item.lowStockThreshold,
    status: item.quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK',
    batchNumber: item.batchNumber || '-',
  }));
  
  const headers = ['name', 'category', 'quantity', 'lowStockThreshold', 'status', 'batchNumber'];
  return convertToCSV(data, headers);
}

/**
 * Generate expiration report CSV
 */
export async function generateExpirationReportCSV(dispensaryId: number): Promise<string> {
  const expiringItems = await db.getExpiringItems(dispensaryId);
  
  const data = expiringItems.map(item => {
    const expDate = item.expirationDate ? new Date(item.expirationDate) : null;
    const today = new Date();
    const daysUntilExpiry = expDate ? Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    return {
      name: item.name,
      category: item.categoryName || 'Uncategorized',
      quantity: item.quantity,
      batchNumber: item.batchNumber || '-',
      expirationDate: expDate ? expDate.toLocaleDateString() : '-',
      daysUntilExpiry: daysUntilExpiry !== null ? daysUntilExpiry : '-',
      status: daysUntilExpiry !== null && daysUntilExpiry < 0 ? 'EXPIRED' : 'EXPIRING SOON',
    };
  });
  
  const headers = ['name', 'category', 'quantity', 'batchNumber', 'expirationDate', 'daysUntilExpiry', 'status'];
  return convertToCSV(data, headers);
}

/**
 * Generate simple HTML for PDF conversion
 */
export function generateHTMLReport(title: string, data: any[], headers: string[]): string {
  const tableRows = data.map(row => {
    const cells = headers.map(header => `<td>${row[header] || '-'}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  
  const tableHeaders = headers.map(h => `<th>${h.replace(/([A-Z])/g, ' $1').trim()}</th>`).join('');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
    }
    h1 {
      color: #1e3a8a;
      border-bottom: 3px solid #1e3a8a;
      padding-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background-color: #1e3a8a;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>Generated on: ${new Date().toLocaleString()}</p>
  <table>
    <thead>
      <tr>${tableHeaders}</tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
  <div class="footer">
    <p>Unjani Clinic George - Stock Management System</p>
  </div>
</body>
</html>
  `;
}
