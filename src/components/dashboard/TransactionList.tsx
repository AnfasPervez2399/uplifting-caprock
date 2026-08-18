import { motion } from 'framer-motion'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  Building2,
  Coffee,
  Zap,
} from 'lucide-react'

const transactions = [
  { id: 1, name: 'Apple Inc.', type: 'investment', amount: -2500, date: 'Today, 2:30 PM', icon: Building2, positive: false },
  { id: 2, name: 'Salary Deposit', type: 'income', amount: 8500, date: 'Today, 9:00 AM', icon: ArrowDownLeft, positive: true },
  { id: 3, name: 'Tesla Motors', type: 'investment', amount: -1200, date: 'Yesterday', icon: Zap, positive: false },
  { id: 4, name: 'Whole Foods', type: 'expense', amount: -84.32, date: 'Yesterday', icon: ShoppingBag, positive: false },
  { id: 5, name: 'Dividend — VTI', type: 'income', amount: 342.18, date: 'Mar 15', icon: ArrowUpRight, positive: true },
  { id: 6, name: 'Blue Bottle Coffee', type: 'expense', amount: -6.50, date: 'Mar 14', icon: Coffee, positive: false },
]

export function TransactionList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-3xl border border-border bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-bold text-ink">Recent Activity</h3>
        <button className="text-sm font-semibold text-caprock hover:text-caprock-light transition-colors">
          View all
        </button>
      </div>

      <div className="space-y-1">
        {transactions.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.05 }}
            whileHover={{ x: 4, backgroundColor: 'rgba(0, 52, 120, 0.03)' }}
            className="flex items-center gap-4 rounded-2xl p-3 transition-colors cursor-pointer"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              tx.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-dim text-ink/60'
            }`}>
              <tx.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink truncate">{tx.name}</p>
              <p className="text-xs text-muted">{tx.date}</p>
            </div>
            <p className={`font-semibold tabular-nums ${
              tx.positive ? 'text-emerald-600' : 'text-ink'
            }`}>
              {tx.positive ? '+' : ''}{tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
