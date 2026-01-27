import { StockDashboardLayout } from "@/components/StockDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useDispensary } from "@/contexts/DispensaryContext";
import { useState } from "react";

export default function Reports() {
  const { selectedDispensary } = useDispensary();
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const downloadFile = (data: string, filename: string, mimeType: string) => {
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportCSV = async (reportType: string) => {
    if (!selectedDispensary) {
      toast.error("Please select a dispensary first");
      return;
    }

    setLoadingReport(`${reportType}-csv`);
    try {
      let result;
      switch (reportType) {
        case "inventory":
          result = await trpc.export.stockInventoryCSV.query({ dispensaryId: selectedDispensary.id });
          break;
        case "transactions":
          result = await trpc.export.transactionHistoryCSV.query({ dispensaryId: selectedDispensary.id });
          break;
        case "lowstock":
          result = await trpc.export.lowStockCSV.query({ dispensaryId: selectedDispensary.id });
          break;
        case "expiration":
          result = await trpc.export.expirationReportCSV.query({ dispensaryId: selectedDispensary.id });
          break;
        default:
          throw new Error("Unknown report type");
      }
      
      downloadFile(result.data, result.filename, 'text/csv');
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export CSV");
    } finally {
      setLoadingReport(null);
    }
  };

  const handleExportPDF = async (reportType: string) => {
    if (!selectedDispensary) {
      toast.error("Please select a dispensary first");
      return;
    }

    setLoadingReport(`${reportType}-pdf`);
    try {
      let result;
      switch (reportType) {
        case "inventory":
          result = await trpc.export.stockInventoryHTML.query({ dispensaryId: selectedDispensary.id });
          break;
        case "transactions":
          result = await trpc.export.transactionHistoryHTML.query({ dispensaryId: selectedDispensary.id });
          break;
        case "lowstock":
          result = await trpc.export.lowStockHTML.query({ dispensaryId: selectedDispensary.id });
          break;
        case "expiration":
          result = await trpc.export.expirationReportHTML.query({ dispensaryId: selectedDispensary.id });
          break;
        default:
          throw new Error("Unknown report type");
      }
      
      // Open HTML in new window for printing to PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(result.data);
        printWindow.document.close();
        
        // Wait for content to load then trigger print dialog
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };
        
        toast.success("PDF print dialog opened");
      } else {
        toast.error("Please allow popups to export PDF");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setLoadingReport(null);
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

  const reports = [
    {
      id: "inventory",
      title: "Stock Inventory Report",
      description: "Complete list of all stock items with current quantities",
      icon: FileText,
    },
    {
      id: "transactions",
      title: "Transaction History",
      description: "Audit trail of all stock movements",
      icon: FileText,
    },
    {
      id: "lowstock",
      title: "Low Stock Report",
      description: "Items below threshold requiring restock",
      icon: FileText,
    },
    {
      id: "expiration",
      title: "Expiration Report",
      description: "Items expiring within 3 months",
      icon: FileText,
    },
  ];

  return (
    <StockDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Export stock data and generate reports for {selectedDispensary.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            const isLoadingCSV = loadingReport === `${report.id}-csv`;
            const isLoadingPDF = loadingReport === `${report.id}-pdf`;
            
            return (
              <Card key={report.id} className="p-6">
                <Icon className="w-12 h-12 text-red-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{report.title}</h3>
                <p className="text-gray-600 mb-4">{report.description}</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleExportPDF(report.id)} 
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isLoadingPDF || isLoadingCSV}
                  >
                    {isLoadingPDF ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleExportCSV(report.id)}
                    disabled={isLoadingPDF || isLoadingCSV}
                  >
                    {isLoadingCSV ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export CSV
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Instructions</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-semibold">CSV:</span>
              <span>Download spreadsheet files that can be opened in Excel or Google Sheets for further analysis.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">PDF:</span>
              <span>Opens a print-ready document in a new window. Use your browser's print dialog to save as PDF or print directly.</span>
            </li>
          </ul>
        </Card>
      </div>
    </StockDashboardLayout>
  );
}
