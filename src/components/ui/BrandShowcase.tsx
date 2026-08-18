import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { TrendingUp, Shield, Zap, ArrowUpRight } from 'lucide-react'
import { Logo } from './Logo'

const features = [
  { icon: TrendingUp, title: 'Smart Growth', desc: 'AI-powered portfolio insights', accent: 'from-emerald-400/20 to-emerald-600/5' },
  { icon: Shield, title: 'Bank-Grade Security', desc: '256-bit encryption & 2FA', accent: 'from-caprock/20 to-caprock/5' },
  { icon: Zap, title: 'Instant Transfers', desc: 'Move money in seconds', accent: 'from-sky-400/20 to-sky-600/5' },
]

const chartBars = [42, 58, 48, 72, 65, 88, 78, 95, 82, 100]

function FloatingCard({
  children,
  className,
  delay = 0,
  yRange = [-8, 8],
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  yRange?: [number, number]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <motion.div
        animate={{ y: yRange }}
        transition={{ duration: 5 + delay, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function MiniChart() {
  return (
    <svg viewBox="0 0 200 60" className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#003478" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#003478" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,50 L20,42 L40,48 L60,35 L80,40 L100,22 L120,28 L140,15 L160,20 L180,8 L200,12 L200,60 L0,60 Z"
        fill="url(#chartFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      />
      <motion.path
        d="M0,50 L20,42 L40,48 L60,35 L80,40 L100,22 L120,28 L140,15 L160,20 L180,8 L200,12"
        fill="none"
        stroke="#003478"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
      />
    </svg>
  )
}

export function BrandShowcase() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 120, damping: 20 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 120, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <div
      className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Light premium background */}
      <div className="absolute inset-0 mesh-gradient-light" />
      <div className="absolute inset-0 grid-pattern-light opacity-60" />

      {/* Ambient orbs */}
      <motion.div
        className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-caprock/8 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-16 bottom-1/4 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating ring decoration */}
      <motion.div
        className="absolute right-[12%] top-[18%] h-32 w-32 rounded-full border border-caprock/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute right-[14%] top-[20%] h-24 w-24 rounded-full border border-dashed border-caprock/15"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Logo size="lg" variant="dark" />
        </motion.div>

        <div className="relative flex flex-1 flex-col justify-center py-8">
          {/* Hero copy */}
          <div className="relative z-20 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-caprock/15 bg-white/70 px-4 py-1.5 text-xs font-semibold text-caprock shadow-sm backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Trusted by 50,000+ investors
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="font-display text-4xl xl:text-5xl font-bold leading-[1.08] tracking-tight text-ink"
            >
              Wealth reimagined for the{' '}
              <span className="text-gradient-light">modern era</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-5 text-base xl:text-lg text-muted leading-relaxed"
            >
              Grow, protect, and manage your financial future with institutional-grade tools — beautifully simple.
            </motion.p>
          </div>

          {/* 3D floating dashboard preview */}
          <motion.div
            style={{ rotateX, rotateY, perspective: 1200 }}
            className="pointer-events-none absolute right-0 top-1/2 z-10 hidden xl:block -translate-y-1/2 translate-x-4"
          >
            <FloatingCard delay={0.5} className="relative" yRange={[-10, 6]}>
              <div className="premium-card w-[280px] overflow-hidden rounded-2xl p-5 shadow-premium">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted">Portfolio value</p>
                    <p className="font-display text-2xl font-bold text-ink">$284,592</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                    <ArrowUpRight className="h-3 w-3" />
                    +12.4%
                  </div>
                </div>
                <div className="mt-4 h-14">
                  <MiniChart />
                </div>
                <div className="mt-3 flex gap-2">
                  {chartBars.slice(0, 6).map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm bg-caprock/15"
                      initial={{ height: 0 }}
                      animate={{ height: `${h * 0.22}px` }}
                      transition={{ duration: 0.5, delay: 0.9 + i * 0.06 }}
                    />
                  ))}
                </div>
              </div>
            </FloatingCard>

            <FloatingCard delay={0.7} className="absolute -left-16 top-24" yRange={[6, -8]}>
              <div className="premium-card flex items-center gap-3 rounded-xl px-4 py-3 shadow-premium-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-caprock text-white">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">Secured</p>
                  <p className="text-[10px] text-muted">256-bit encrypted</p>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard delay={0.9} className="absolute -right-4 bottom-0" yRange={[-6, 10]}>
              <div className="premium-card rounded-xl px-4 py-3 shadow-premium-sm">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Monthly gain</p>
                <p className="font-display text-lg font-bold text-emerald-600">+$4,218</p>
              </div>
            </FloatingCard>
          </motion.div>

          {/* Mobile/tablet inline preview card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="relative z-10 mt-8 xl:hidden"
          >
            <div className="premium-card overflow-hidden rounded-2xl p-5 shadow-premium">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted">Portfolio value</p>
                  <p className="font-display text-xl font-bold text-ink">$284,592</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  <ArrowUpRight className="h-3 w-3" />
                  +12.4%
                </div>
              </div>
              <div className="mt-3 h-12">
                <MiniChart />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature cards */}
        <div className="relative z-20 grid gap-3 sm:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 + i * 0.12 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group premium-card flex items-start gap-3 rounded-2xl p-4 shadow-premium-sm transition-shadow hover:shadow-premium"
            >
              <motion.div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent} text-caprock ring-1 ring-caprock/10`}
                whileHover={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 0.5 }}
              >
                <feature.icon className="h-5 w-5" />
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-ink">{feature.title}</p>
                <p className="text-xs text-muted leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
