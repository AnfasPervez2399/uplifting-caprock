import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

interface AnimatedBackgroundProps {
  variant?: 'auth' | 'onboarding'
}

export function AnimatedBackground({ variant = 'auth' }: AnimatedBackgroundProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 mesh-gradient-light" />
      <div className="absolute inset-0 grid-pattern-light opacity-50" />

      <motion.div
        className={cn(
          'absolute rounded-full blur-3xl',
          variant === 'auth'
            ? 'h-[400px] w-[400px] -left-20 top-1/4 bg-caprock/10'
            : 'h-[350px] w-[350px] left-1/2 top-0 -translate-x-1/2 bg-caprock/8',
        )}
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute h-[250px] w-[250px] -right-16 bottom-1/4 rounded-full bg-sky-400/12 blur-3xl"
        animate={{ x: [0, -25, 0], y: [0, 18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {variant === 'auth' && (
        <>
          <motion.div
            className="absolute left-[12%] top-[22%] h-2 w-2 rounded-full bg-caprock/40"
            animate={{ y: [0, -18, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute right-[20%] top-[38%] h-1.5 w-1.5 rounded-full bg-sky-400/50"
            animate={{ y: [0, 12, 0], opacity: [0.25, 0.7, 0.25] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="absolute left-[35%] bottom-[28%] h-1 w-1 rounded-full bg-caprock/60"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          />

          <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots-light" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#003478" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-light)" />
          </svg>
        </>
      )}
    </div>
  )
}
