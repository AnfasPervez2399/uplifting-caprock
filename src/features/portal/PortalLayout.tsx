import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRight,
  ArrowUp,
  Bell,
  Briefcase,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { NOTIFICATIONS, PORTAL_USER } from "./data";
import { Toaster, pushToast } from "./components";

const NAV = [
  { to: "/portal", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/portal/profile", label: "My Profile", icon: UserRound, end: false },
  { to: "/portal/investments", label: "My Investments", icon: Briefcase, end: false },
  { to: "/portal/hub", label: "Investment Hub", icon: Sparkles, end: false },
  { to: "/portal/transactions", label: "Transactions", icon: History, end: false },
  { to: "/portal/transfer", label: "Inspecie Transfer", icon: ArrowLeftRight, end: false },
  { to: "/portal/documents", label: "My Documents", icon: FileText, end: false },
  { to: "/portal/reports", label: "Reports", icon: Receipt, end: false },
  { to: "/portal/request", label: "Transaction Request", icon: Receipt, end: false },
];

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#003478] text-lg font-black text-white shadow-md">
        C
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-black tracking-[0.14em] text-slate-900">CAPROCK</span>
        <span className="block text-[8px] font-bold tracking-[0.18em] text-slate-400">NON-BANK FINANCIAL INSTITUTION</span>
      </span>
    </div>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1" aria-label="Client portal">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition-colors ${
              isActive ? "text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="portal-nav-pill"
                  className="absolute inset-0 rounded-xl bg-[#003478] shadow-md"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <item.icon className="relative h-[18px] w-[18px] shrink-0" />
              <span className="relative">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

const TONE_DOT: Record<string, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-[#003478]",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
};

function Notifications() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-800"
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="absolute right-0 z-40 mt-2 w-[330px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <p className="border-b border-slate-100 px-4 py-3 text-[13px] font-extrabold text-slate-900">
                Notifications <span className="ml-1 rounded-full bg-[#003478]/10 px-2 py-0.5 text-[10px] text-[#003478]">{NOTIFICATIONS.length} new</span>
              </p>
              <ul className="max-h-[340px] divide-y divide-slate-50 overflow-y-auto">
                {NOTIFICATIONS.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        pushToast(n.title, n.detail, n.tone);
                      }}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TONE_DOT[n.tone]}`} />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-bold text-slate-800">{n.title}</span>
                        <span className="block truncate text-xs text-slate-500">{n.detail}</span>
                        <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">{n.time}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center rounded-full bg-slate-900 text-white shadow-xl transition hover:bg-[#003478]"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function PortalShell({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#eef1f6] text-slate-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-slate-200/70 bg-white/90 px-4 py-5 backdrop-blur lg:flex">
        <Wordmark />
        <div className="mt-6 flex-1 overflow-y-auto">
          <NavItems />
        </div>
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#003478] to-[#0060a8] p-4 text-white shadow-lg">
          <p className="text-[13px] font-extrabold">Need a hand?</p>
          <p className="mt-1 text-xs leading-5 text-white/80">
            {PORTAL_USER.adviser} · {PORTAL_USER.adviserRole}
          </p>
          <button
            type="button"
            onClick={() => pushToast("Adviser notified", "Priya will reach out within one business day.", "blue")}
            className="mt-3 w-full rounded-xl bg-white/15 py-2 text-xs font-extrabold backdrop-blur transition hover:bg-white/25"
          >
            Message my adviser
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-3 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <LogOut className="h-[18px] w-[18px]" /> Sign out
        </button>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-white px-4 py-5 lg:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
            >
              <div className="flex items-center justify-between">
                <Wordmark />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setDrawer(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6 flex-1 overflow-y-auto">
                <NavItems onNavigate={() => setDrawer(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-[248px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#eef1f6]/85 backdrop-blur">
          <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawer(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <form
              className="relative hidden min-w-0 flex-1 sm:block"
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/portal/transactions?q=${encodeURIComponent(query)}`);
              }}
            >
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transactions, accounts, documents…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-[13px] font-medium shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/10"
              />
            </form>
            <div className="ml-auto flex shrink-0 items-center gap-2.5">
              <Notifications />
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#003478] text-[11px] font-black text-white">
                  {PORTAL_USER.name.split(" ").map((w) => w[0]).join("")}
                </span>
                <span className="hidden leading-tight sm:block">
                  <span className="block text-xs font-extrabold">{PORTAL_USER.type}</span>
                  <span className="block text-[10px] font-semibold text-slate-500">{PORTAL_USER.name}</span>
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6">{children}</main>
      </div>
      <BackToTop />
      <Toaster />
    </div>
  );
}

export function PortalLayout() {
  return (
    <PortalShell>
      <Outlet />
    </PortalShell>
  );
}
