import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DispensaryProvider } from "./contexts/DispensaryContext";
import Home from "./pages/Home";
import StockList from "./pages/StockList";
import AddStock from "./pages/AddStock";
import CategoryView from "./pages/CategoryView";
import ExpirationDates from "./pages/ExpirationDates";
import LowStockAlerts from "./pages/LowStockAlerts";
import Reports from "./pages/Reports";
import Transactions from "./pages/Transactions";
import UserManagement from "./pages/UserManagement";
import Presentation from "./pages/Presentation";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/stock-list"} component={StockList} />
      <Route path={"/add-stock"} component={AddStock} />
      <Route path={"/category/:id"} component={CategoryView} />
      <Route path={"/expiration-dates"} component={ExpirationDates} />
      <Route path={"/low-stock"} component={LowStockAlerts} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/transactions"} component={Transactions} />
      <Route path={"/users"} component={UserManagement} />
      <Route path={"/presentation"} component={Presentation} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <DispensaryProvider>
            <Toaster />
            <Router />
          </DispensaryProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
