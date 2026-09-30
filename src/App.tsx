import { Route, Routes, BrowserRouter } from "react-router-dom";
import { AuthLayout } from "./components/layout/AuthLayout";
import { LoaderProvider } from "./components/ui/LoaderProvider";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import SignUp from "./pages/SignUp";
import { PortalLayout } from "./features/portal/PortalLayout";
import DashboardHome from "./features/portal/pages/DashboardHome";
import Documents from "./features/portal/pages/Documents";
import Hub from "./features/portal/pages/Hub";
import Investments from "./features/portal/pages/Investments";
import Profile from "./features/portal/pages/Profile";
import Reports from "./features/portal/pages/Reports";
import Transactions from "./features/portal/pages/Transactions";
import Transfer from "./features/portal/pages/Transfer";
import TxnRequest from "./features/portal/pages/TxnRequest";
import "./styles.css";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route index element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<Profile />} />
        <Route path="investments" element={<Investments />} />
        <Route path="hub" element={<Hub />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="transfer" element={<Transfer />} />
        <Route path="documents" element={<Documents />} />
        <Route path="reports" element={<Reports />} />
        <Route path="request" element={<TxnRequest />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export function App() {
  return (
    <LoaderProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LoaderProvider>
  );
}

export default App;
