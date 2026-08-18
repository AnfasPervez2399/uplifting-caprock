import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from './components/layout/AuthLayout'
import { Login } from './pages/Login'
import { SignUp } from './pages/SignUp'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
