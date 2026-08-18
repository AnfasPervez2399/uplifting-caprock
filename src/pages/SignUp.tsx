import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function SignUp() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/onboarding')
    }, 1200)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink">Create your account</h2>
        <p className="mt-2 text-muted">Start your journey to smarter wealth</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full name"
          type="text"
          placeholder="Jane Doe"
          icon={<User className="h-4 w-4" />}
          required
        />
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
          placeholder="Min. 8 characters"
          icon={<Lock className="h-4 w-4" />}
          required
        />

        <p className="text-xs text-muted leading-relaxed">
          By creating an account, you agree to our{' '}
          <span className="text-ink/70 underline cursor-pointer">Terms of Service</span> and{' '}
          <span className="text-ink/70 underline cursor-pointer">Privacy Policy</span>.
        </p>

        <Button type="submit" loading={loading} className="w-full" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
          Get started
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-caprock hover:text-caprock-light transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
