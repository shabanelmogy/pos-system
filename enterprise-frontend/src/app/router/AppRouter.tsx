import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Home, Auth, Orders, Tables, Menu, Dashboard, Customers, Settings, KitchenBoard, MenuManager, PermissionManagement } from "@/pages";
import Header from "@/shared/components/Header";
import useLoadData from "@/shared/hooks/useLoadData";
import FullScreenLoader from "@/shared/components/FullScreenLoader";
import useAuth from "@/features/system/auth/hooks/useAuth";
import useSettingsSync from "@/features/pos/terminal/hooks/useSettingsSync";
import ShiftManager from "@/shared/components/ShiftManager";
import TerminalSelector from "@/shared/components/TerminalSelector";
import useUserStore from "@/features/system/auth/store/useUserStore";
import usePOSStore from "@/features/pos/terminal/store/usePOSStore";
import useCustomerStore from "@/features/crm/customer/store/useCustomerStore";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { useAuthorizationStore } from "@/modules/authorization/store/useAuthorizationStore";
import { RouteGuard } from "@/modules/authorization/guards/RouteGuard";

function Layout() {
  const isLoading = useLoadData();
  useSettingsSync();
  const { isAuth, isAdmin } = useAuth();
  const { activeShift, showShiftModal, selectedPOSPoint, selectedBranch } = usePOSStore();
  const { customerName, setCustomer } = useCustomerStore();
  const location = useLocation();

  const initializeAuth = useAuthorizationStore((state) => state.initialize);
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth, isAuth]);
  const isOnAuthPage = location.pathname.startsWith("/auth");
  const isOnKdsPage = location.pathname.startsWith("/kds");
  
  const enableTables = selectedPOSPoint?.settings?.enableTables !== false;
  const openOnMenu = selectedPOSPoint?.settings?.openOnMenu === true;

  // Auto-set guest customer when openOnMenu is on and no customer set yet
  useEffect(() => {
    if (openOnMenu && !isAdmin && isAuth && !customerName) {
      setCustomer({ name: "Guest", phone: "N/A", guests: 1 });
    }
  }, [openOnMenu, isAdmin, isAuth, customerName, setCustomer]);

  // 0. Terminal Permission Verification - Prevent bypassing selection with stale localStorage data
  const { posPermissions } = useAuth();
  const { clearPOS } = usePOSStore();
  
  useEffect(() => {
    if (isAuth && !isAdmin && selectedPOSPoint) {
      // If user has NO permissions, or if the selected terminal is not in their permissions list
      const hasPermission = posPermissions.some((p: any) => p.posPointId === selectedPOSPoint.id);
      if (!hasPermission) {
        clearPOS();
      }
    }
  }, [isAuth, isAdmin, selectedPOSPoint, posPermissions, clearPOS]);

  // 1. Loading Check
  if (isLoading) return <FullScreenLoader />;

  // 2. Auth Guard
  if (!isAuth && !isOnAuthPage) return <Navigate to="/auth" />;

  // 3. Terminal Selection Guard - Only force for non-admins (Staff/Waiters/Cashiers)
  const needsTerminal = isAuth && !isAdmin && (!selectedBranch || !selectedPOSPoint) && !isOnAuthPage;
  if (needsTerminal) return <TerminalSelector />;

  // 4. Shift Guard - Block cashiers if no active shift
  const needsShift = isAuth && !isAdmin && !activeShift && !isOnAuthPage;
  if (needsShift) return <ShiftManager />;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-main)]">
      {!isOnAuthPage && !isOnKdsPage && <Header />}
      {/* Shift close modal overlay — only when shift is open and user requests it */}
      {showShiftModal && activeShift && <ShiftManager />}
      <main className="flex-1 min-h-0 overflow-hidden relative">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoutes>
                {openOnMenu && !isAdmin ? <Navigate to="/menu" /> : <Home />}
              </ProtectedRoutes>
            }
          />
          <Route path="/auth" element={isAuth ? <Navigate to="/" /> : <Auth />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoutes>
                <RouteGuard permissions={["orders:view"]}>
                  <Orders />
                </RouteGuard>
              </ProtectedRoutes>
            }
          />
          <Route
            path="/tables"
            element={
              <ProtectedRoutes>
                <RouteGuard permissions={["pos:manage_tables"]}>
                  {enableTables ? <Tables /> : <Navigate to="/menu" />}
                </RouteGuard>
              </ProtectedRoutes>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoutes>
                <RouteGuard permissions={["catalog:view"]}>
                  <Menu />
                </RouteGuard>
              </ProtectedRoutes>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoutes>
                <RouteGuard permissions={["reporting:view"]}>
                  <Dashboard />
                </RouteGuard>
              </ProtectedRoutes>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoutes>
                <RouteGuard permissions={["crm:view"]}>
                  <Customers />
                </RouteGuard>
              </ProtectedRoutes>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoutes>
                <RouteGuard permissions={["system:settings"]}>
                  <Settings />
                </RouteGuard>
              </ProtectedRoutes>
            }
          />
          <Route
            path="/menu-manager"
            element={
              <ProtectedRoutes>
                <RouteGuard permissions={["catalog:manage"]}>
                  <MenuManager />
                </RouteGuard>
              </ProtectedRoutes>
            }
          />
          <Route
            path="/permission-management"
            element={
              <ProtectedRoutes>
                <RouteGuard permissions={["roles:view"]}>
                  <PermissionManagement />
                </RouteGuard>
              </ProtectedRoutes>
            }
          />
          <Route path="/kds" element={<KitchenBoard />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}

function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  const { isAuth } = useUserStore();
  if (!isAuth) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout />
      </Router>
    </ThemeProvider>
  );
}

export default App;
