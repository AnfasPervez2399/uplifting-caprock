import { motion } from 'framer-motion'
import { Outlet } from 'react-router-dom'
import { AnimatedBackground } from '../ui/AnimatedBackground'
import { BrandShowcase } from '../ui/BrandShowcase'
import { Logo } from '../ui/Logo'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh bg-surface">
      <BrandShowcase />

      {/* Right panel — form */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-surface px-6 py-10 lg:px-12 lg:py-12">
        <div className="absolute inset-0 lg:hidden">
          <AnimatedBackground variant="auth" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Logo size="md" variant="dark" />
          </div>

          <div className="glass rounded-3xl p-8 shadow-premium lg:bg-white lg:shadow-premium lg:border lg:border-border/60">
            <Outlet />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
