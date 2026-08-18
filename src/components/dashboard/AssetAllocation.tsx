import { motion } from 'framer-motion'
import { PieChart } from 'lucide-react'

const allocations = [
  { name: 'US Equities', percent: 42, color: '#003478' },
  { name: 'International', percent: 22, color: '#004a9f' },
  { name: 'Fixed Income', percent: 18, color: '#6b7280' },
  { name: 'Real Estate', percent: 12, color: '#1c1c1f' },
  { name: 'Cash', percent: 6, color: '#d1d5db' },
]

export function AssetAllocation() {
  let cumulative = 0
  const segments = allocations.map((a) => {
    const start = cumulative
    cumulative += a.percent
    return { ...a, start, end: cumulative }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="rounded-3xl border border-border bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="h-5 w-5 text-caprock" />
        <h3 className="font-display text-lg font-bold text-ink">Asset Allocation</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative h-40 w-40 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            {segments.map((seg, i) => {
              const radius = 40
              const circumference = 2 * Math.PI * radius
              const offset = (seg.start / 100) * circumference
              const length = (seg.percent / 100) * circumference
              return (
                <motion.circle
                  key={seg.name}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="12"
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${length} ${circumference - length}` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                  strokeLinecap="round"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-display font-bold text-ink">5</span>
            <span className="text-xs text-muted">assets</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-3">
          {allocations.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: a.color }} />
              <span className="flex-1 text-sm text-ink/70">{a.name}</span>
              <span className="text-sm font-semibold text-ink tabular-nums">{a.percent}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
