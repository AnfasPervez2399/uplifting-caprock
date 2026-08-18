import { motion } from 'framer-motion'
import { Eye, EyeOff, TrendingUp, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'

export function BalanceCard() {
  const [visible, setVisible] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-ink p-6 lg:p-8 shimmer-border"
    >
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-caprock/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-caprock/10 blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/50">Total Balance</p>
          <button
            onClick={() => setVisible(!visible)}
            className="rounded-lg p-1.5 text-white/40 hover:text-white/70 transition-colors"
          >
            {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>

        <motion.div
          key={visible ? 'show' : 'hide'}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-white">
            {visible ? '$284,592.40' : '••••••••'}
          </h2>
        </motion.div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            +12.4%
          </div>
          <span className="text-sm text-white/40">+$31,420 this month</span>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/8 pt-6">
          {[
            { label: 'Invested', value: '$198,400' },
            { label: 'Cash', value: '$42,192' },
            { label: 'Returns', value: '$44,000' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-white/35">{item.label}</p>
              <p className="mt-1 font-semibold text-white/80">{visible ? item.value : '••••'}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function QuickActions() {
  const actions = [
    { label: 'Send', color: 'bg-caprock' },
    { label: 'Receive', color: 'bg-ink' },
    { label: 'Invest', color: 'bg-caprock-dark' },
    { label: 'Exchange', color: 'bg-ink-muted' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-4 gap-3"
    >
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.05 }}
          className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-white p-4 shadow-sm hover:shadow-md hover:border-caprock/20 transition-all"
        >
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.color} text-white shadow-lg group-hover:shadow-caprock/20 transition-shadow`}>
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-ink/70">{action.label}</span>
        </motion.button>
      ))}
    </motion.div>
  )
}
