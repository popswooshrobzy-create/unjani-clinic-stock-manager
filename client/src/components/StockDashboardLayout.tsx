import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDispensary } from "@/contexts/DispensaryContext";
import { 
  Package, 
  Plus, 
  List, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Users, 
  ArrowLeftRight,
  ChevronDown,
  LogOut,
  Presentation,
  Home
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DispensarySelector } from "./DispensarySelector";
import { UnjaniLogo } from "./UnjaniLogo";
import { UnjaniLogoLarge } from "./UnjaniLogoLarge";

interface NavItem {
  label: string;
  icon: any;
  path: string;
  children?: NavItem[];
}

export function StockDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { selectedDispensary, setShowSelector } = useDispensary();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  const { data: categories = [] } = trpc.category.list.useQuery();

  const navItems: NavItem[] = [
    { label: "Add Stock", icon: Plus, path: "/add-stock" },
    { 
      label: "By Category", 
      icon: List, 
      path: "/by-category",
      children: categories.map(cat => ({
        label: cat.name,
        icon: Package,
        path: `/category/${cat.id}`,
      }))
    },
    { label: "Expiration Dates", icon: Calendar, path: "/expiration-dates" },
    { label: "Low Stock Alerts", icon: AlertTriangle, path: "/low-stock" },
    { label: "Reports", icon: FileText, path: "/reports" },
    { label: "Stock List", icon: Package, path: "/stock-list" },
    { label: "Transactions", icon: ArrowLeftRight, path: "/transactions" },
    { label: "User Management", icon: Users, path: "/users" },
  ];

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const handleLogoClick = () => {
    setShowSelector(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DispensarySelector />
      
      {/* Top Navigation Bar - Blue Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-4 hover:opacity-90 transition-opacity"
          >
            <div className="w-16 h-16">
              <UnjaniLogoLarge />
            </div>
            <div>
              <h1 className="text-2xl font-bold">UNJANI CLINIC</h1>
              <p className="text-sm text-blue-100">Stock Management System - George</p>
            </div>
          </button>

          <div className="flex items-center gap-4">
            {selectedDispensary && (
              <div className="text-right">
                <p className="text-sm font-semibold">{selectedDispensary.name}</p>
                <p className="text-xs text-blue-100">Active Dispensary</p>
              </div>
            )}
            
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-blue-100">{user.role}</p>
                </div>
                
                {/* Presentation Link */}
                <Link href="/presentation">
                  <a
                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                    title="View System Presentation"
                  >
                    <Presentation className="w-4 h-4" />
                  </a>
                </Link>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-80px)] sticky top-[80px]">
          <ScrollArea className="h-[calc(100vh-80px)]">
            <nav className="p-4 space-y-1">
              <Link href="/">
                <a className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg
                  text-sm font-medium transition-colors
                  ${location === "/" 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}>
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </a>
              </Link>
              
              {navItems.map((item) => {
                const isActive = location === item.path;
                const isExpanded = expandedItems.includes(item.label);
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <div key={item.label}>
                    {hasChildren ? (
                      <>
                        <button
                          onClick={() => toggleExpanded(item.label)}
                          className={`
                            w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg
                            text-sm font-medium transition-colors
                            ${isActive 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </div>
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                        
                        {isExpanded && (
                          <div className="ml-4 mt-1 space-y-1">
                            {item.children?.map((child) => {
                              const isChildActive = location === child.path;
                              return (
                                <Link key={child.path} href={child.path}>
                                  <a className={`
                                    flex items-center gap-3 px-4 py-2 rounded-lg
                                    text-sm transition-colors
                                    ${isChildActive 
                                      ? 'bg-blue-50 text-blue-700 font-medium' 
                                      : 'text-gray-600 hover:bg-gray-50'
                                    }
                                  `}>
                                    <child.icon className="w-4 h-4" />
                                    <span>{child.label}</span>
                                  </a>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link href={item.path}>
                        <a className={`
                          flex items-center gap-3 px-4 py-2.5 rounded-lg
                          text-sm font-medium transition-colors
                          ${isActive 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}>
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </a>
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
