import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { Logo } from '../ui/Logo'
import { cn } from '../../lib/cn'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/dashboard', icon: PieChart, label: 'Portfolio' },
  { to: '/dashboard', icon: CreditCard, label: 'Cards' },
  { to: '/dashboard', icon: Settings, label: 'Settings' },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-dvh bg-surface-dim">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-border shadow-sm">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Logo size="sm" variant="dark" />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-caprock text-white shadow-md shadow-caprock/15'
                    : 'text-muted hover:text-ink hover:bg-surface-dim',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <button
            onClick={() => navigate('/login')}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:text-ink hover:bg-surface-dim transition-all"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border lg:hidden"
            >
              <div className="flex h-16 items-center justify-between px-6 border-b border-border">
                <Logo size="sm" variant="dark" />
                <button onClick={() => setSidebarOpen(false)} className="text-muted hover:text-ink">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-1 p-4">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setSidebarOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:text-ink hover:bg-surface-dim"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/90 backdrop-blur-xl px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted hover:bg-surface-dim lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider">Dashboard</p>
              <p className="text-sm font-semibold text-ink">Good afternoon, Alex</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative rounded-xl p-2.5 text-muted hover:bg-surface-dim transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-caprock ring-2 ring-white" />
            </motion.button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-caprock text-sm font-bold text-white">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
