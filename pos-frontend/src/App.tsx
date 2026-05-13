import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Home, Auth, Orders, Tables, Menu, Dashboard, Customers, Settings } from "./pages";
import Header from "./shared/components/Header";
import useLoadData from "./shared/hooks/useLoadData";
import FullScreenLoader from "./shared/components/FullScreenLoader"
import useAuth from "./features/auth/hooks/useAuth";
import useSettingsSync from "./features/pos/hooks/useSettingsSync";
import ShiftManager from "./shared/components/ShiftManager";
import TerminalSelector from "./shared/components/TerminalSelector";
import useUserStore from "./features/auth/store/useUserStore";
import usePOSStore from "./features/pos/store/usePOSStore";
import useCustomerStore from "./features/customers/store/useCustomerStore";
import { ThemeProvider } from "./shared/providers/ThemeProvider";

function Layout() {
  const isLoading = useLoadData();
  useSettingsSync();
  const { isAuth, isAdmin } = useAuth();
  const { activeShift, showShiftModal, selectedPOSPoint, selectedBranch } = usePOSStore();
  const { customerName, setCustomer } = useCustomerStore();
  const location = useLocation();
  const isOnAuthPage = location.pathname.startsWith("/auth");
  
  const enableTables = selectedPOSPoint?.settings?.enableTables !== false;
  const openOnMenu = selectedPOSPoint?.settings?.openOnMenu === true;

  // Auto-set guest customer when openOnMenu is on and no customer set yet
  useEffect(() => {
    if (openOnMenu && !isAdmin && isAuth && !customerName) {
      setCustomer({ name: "Guest", phone: "N/A", guests: 1 });
    }
  }, [openOnMenu, isAdmin, isAuth, customerName, setCustomer]);

  // 0. Theme sync is handled by <ThemeProvider> wrapping the app

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
    <>
      {!isOnAuthPage && <Header />}
      {/* Shift close modal overlay — only when shift is open and user requests it */}
      {showShiftModal && activeShift && <ShiftManager />}
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
              <Orders />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/tables"
          element={
            <ProtectedRoutes>
              {enableTables ? <Tables /> : <Navigate to="/menu" />}
            </ProtectedRoutes>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoutes>
              <Menu />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoutes>
              <Customers />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoutes>
              <Settings />
            </ProtectedRoutes>
          }
        />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </>
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
