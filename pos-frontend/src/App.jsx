import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Home, Auth, Orders, Tables, Menu, Dashboard, Customers, Settings } from "./pages";
import Header from "./components/shared/Header";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader"
import useAuth from "./hooks/useAuth";
import ShiftManager from "./components/shared/ShiftManager";

function Layout() {
  const isLoading = useLoadData();
  const { isAuth, isAdmin } = useAuth();
  const { activeShift, showShiftModal } = useSelector((state) => state.pos);
  const location = useLocation();
  const hideHeaderRoutes = ["/auth"];

  // 1. Loading Check
  if (isLoading) return <FullScreenLoader />;

  // 2. Auth Guard
  const isOnAuthPage = hideHeaderRoutes.includes(location.pathname);
  if (!isAuth && !isOnAuthPage) return <Navigate to="/auth" />;

  // 3. Shift Guard - Block cashiers if no active shift
  const needsShift = isAuth && !isAdmin && !activeShift && !isOnAuthPage;
  if (needsShift) return <ShiftManager />;

  // If shift IS open and user manually opens the modal (e.g. to close shift), render as overlay on top
  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      {/* Shift close modal overlay — only when shift is open and user requests it */}
      {showShiftModal && activeShift && <ShiftManager />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoutes>
              {/* Admins can view Home but need a terminal to place orders. 
                  We handle that inside Home/Menu components if needed. */}
              <Home />
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
              <Tables />
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

function ProtectedRoutes({ children }) {
  const { isAuth } = useSelector((state) => state.user);
  if (!isAuth) {
    return <Navigate to="/auth" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
