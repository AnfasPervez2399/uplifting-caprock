import { motion } from 'framer-motion'

const chartData = [35, 42, 38, 55, 48, 62, 58, 72, 65, 78, 85, 92]
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function PortfolioChart() {
  const max = Math.max(...chartData)
  const width = 100 / (chartData.length - 1)

  const points = chartData
    .map((v, i) => `${i * width},${100 - (v / max) * 80}`)
    .join(' ')

  const areaPoints = `0,100 ${points} 100,100`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-3xl border border-border bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">Portfolio Performance</h3>
          <p className="text-sm text-muted mt-0.5">Last 12 months</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-surface-dim p-1">
          {['1M', '6M', '1Y', 'All'].map((period, i) => (
            <button
              key={period}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                i === 2 ? 'bg-ink text-white shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-48">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#003478" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#003478" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.polygon
            points={areaPoints}
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.polyline
            points={points}
            fill="none"
            stroke="#003478"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          />
          {chartData.map((v, i) => (
            <motion.circle
              key={i}
              cx={i * width}
              cy={100 - (v / max) * 80}
              r="1.5"
              fill="#003478"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
            />
          ))}
        </svg>
      </div>

      <div className="mt-4 flex justify-between text-xs text-muted">
        {months.filter((_, i) => i % 3 === 0).map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </motion.div>
  )
}
