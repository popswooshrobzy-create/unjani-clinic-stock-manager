import { StockDashboardLayout } from "@/components/StockDashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  BarChart3,
  Shield,
  Zap
} from "lucide-react";

export default function Presentation() {
  return (
    <StockDashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Unjani Clinic George Stock Management System
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive Inventory Management for Healthcare Excellence
          </p>
        </div>

        {/* System Overview */}
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Overview</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Unjani Clinic George Stock Management System is a comprehensive digital solution designed 
            to streamline medication and supply inventory management across multiple dispensary locations. 
            The system provides real-time tracking, predictive analytics, and intelligent alerts to ensure 
            optimal stock levels and prevent shortages.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">2 Dispensaries</p>
                <p className="text-sm text-gray-600">Main & Mobile Clinic</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">17 Categories</p>
                <p className="text-sm text-gray-600">Medication Types</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Role-Based Access</p>
                <p className="text-sm text-gray-600">Secure Permissions</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Features */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Predictive Analytics</h3>
                  <p className="text-gray-600 text-sm">
                    Advanced forecasting algorithms predict stock depletion dates and recommend optimal 
                    reorder quantities based on historical consumption patterns and lead times.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Intelligent Alerts</h3>
                  <p className="text-gray-600 text-sm">
                    Automated notifications for low stock levels, expiring medications, and critical 
                    inventory thresholds ensure proactive management and prevent stockouts.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Expiration Tracking</h3>
                  <p className="text-gray-600 text-sm">
                    Comprehensive expiration date monitoring with early warnings for medications 
                    approaching expiry, helping reduce waste and ensure patient safety.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Reports</h3>
                  <p className="text-gray-600 text-sm">
                    Generate detailed inventory reports, transaction histories, and analytics exports 
                    in CSV and PDF formats for auditing and compliance purposes.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Role-Based Security</h3>
                  <p className="text-gray-600 text-sm">
                    Multi-level user access control with roles including Admin, Clinic Founder, 
                    Manager, and Stock Controllers for both main and mobile clinics.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Search & Filters</h3>
                  <p className="text-gray-600 text-sm">
                    Powerful search functionality with multi-criteria filtering by category, expiration 
                    date, and medication form type (tablets, capsules, syrups, suspensions).
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* User Roles */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">User Roles & Permissions</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg">
              <Badge className="bg-red-100 text-red-800 mt-1">ADMIN</Badge>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">System Administrator</p>
                <p className="text-sm text-gray-600">
                  Full system access including user management, configuration, and all operational features.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <Badge className="bg-purple-100 text-purple-800 mt-1">FOUNDER</Badge>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Clinic Founder</p>
                <p className="text-sm text-gray-600">
                  Strategic oversight with access to reports, analytics, and user management capabilities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <Badge className="bg-blue-100 text-blue-800 mt-1">MANAGER</Badge>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Clinic Manager</p>
                <p className="text-sm text-gray-600">
                  Operational management including stock oversight, user management, and reporting functions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
              <Badge className="bg-green-100 text-green-800 mt-1">STOCK CONTROLLER</Badge>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Stock Controller</p>
                <p className="text-sm text-gray-600">
                  Day-to-day inventory management including adding stock, processing transactions, and monitoring levels.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Technical Specifications */}
        <Card className="p-8 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Frontend Technologies</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• React with TypeScript</li>
                <li>• Tailwind CSS for styling</li>
                <li>• tRPC for type-safe API calls</li>
                <li>• Wouter for routing</li>
                <li>• Shadcn/ui component library</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Backend Technologies</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Node.js runtime</li>
                <li>• tRPC API framework</li>
                <li>• Drizzle ORM</li>
                <li>• MySQL database</li>
                <li>• OAuth authentication</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 text-gray-600">
          <p className="text-sm">
            © 2026 Unjani Clinic George - Stock Management System
          </p>
          <p className="text-xs mt-2">
            Designed for healthcare excellence and operational efficiency
          </p>
        </div>
      </div>
    </StockDashboardLayout>
  );
}
