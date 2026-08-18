import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 1200)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink">Welcome back</h2>
        <p className="mt-2 text-muted">Sign in to continue to your portfolio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={<Lock className="h-4 w-4" />}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted cursor-pointer">
            <input type="checkbox" className="rounded border-border bg-white accent-caprock" />
            Remember me
          </label>
          <button type="button" className="text-caprock hover:text-caprock-light transition-colors font-medium">
            Forgot password?
          </button>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
          Sign in
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-4 text-muted">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {['Google', 'Apple'].map((provider) => (
          <motion.button
            key={provider}
            whileHover={{ scale: 1.02, borderColor: 'rgba(0, 52, 120, 0.25)' }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white py-3 text-sm font-medium text-ink/70 transition-colors hover:bg-surface-dim hover:border-caprock/20"
          >
            {provider}
          </motion.button>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-caprock hover:text-caprock-light transition-colors">
          Create one
        </Link>
      </p>
    </motion.div>
  )
}
