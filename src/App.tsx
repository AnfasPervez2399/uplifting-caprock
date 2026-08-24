import { Route, Routes, BrowserRouter } from "react-router-dom";
import { AuthLayout } from "./components/layout/AuthLayout";
import { LoaderProvider } from "./components/ui/LoaderProvider";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import SignUp from "./pages/SignUp";
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
