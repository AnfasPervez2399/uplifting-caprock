import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ label, error, icon, type, className, ...props }: InputProps) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink/70">{label}</label>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </div>
        )}
        <motion.div
          animate={{
            boxShadow: focused
              ? '0 0 0 2px rgba(0, 52, 120, 0.25), 0 0 16px rgba(0, 52, 120, 0.08)'
              : '0 0 0 0px transparent',
          }}
          className="rounded-xl"
        >
          <input
            type={inputType}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              'w-full rounded-xl border border-border bg-white px-4 py-3.5 text-ink placeholder:text-muted/60',
              'transition-colors duration-200 focus:border-caprock/40 focus:outline-none',
              icon && 'pl-11',
              isPassword && 'pr-11',
              error && 'border-red-400/60',
              className,
            )}
            {...props}
          />
        </motion.div>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink/70 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
