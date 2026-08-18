import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Wallet,
  TrendingUp,
  Shield,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Check,
} from 'lucide-react'
import { Logo } from '../components/ui/Logo'
import { Button } from '../components/ui/Button'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { cn } from '../lib/cn'

const steps = [
  {
    id: 'goal',
    title: "What's your primary goal?",
    subtitle: 'We\'ll tailor your experience around this',
    options: [
      { id: 'grow', label: 'Grow my wealth', icon: TrendingUp, desc: 'Long-term investing & compounding' },
      { id: 'save', label: 'Save smarter', icon: Wallet, desc: 'Automated savings & budgeting' },
      { id: 'protect', label: 'Protect assets', icon: Shield, desc: 'Insurance & risk management' },
      { id: 'retire', label: 'Plan retirement', icon: Target, desc: 'Build your future nest egg' },
    ],
  },
  {
    id: 'experience',
    title: 'Your investing experience',
    subtitle: 'No wrong answers — we adapt to your level',
    options: [
      { id: 'beginner', label: 'Just getting started', icon: Sparkles, desc: 'New to investing' },
      { id: 'intermediate', label: 'Some experience', icon: TrendingUp, desc: 'I know the basics' },
      { id: 'advanced', label: 'Seasoned investor', icon: Target, desc: 'Active portfolio manager' },
    ],
  },
  {
    id: 'amount',
    title: 'Estimated initial investment',
    subtitle: 'Helps us recommend the right portfolio',
    options: [
      { id: '1k', label: 'Under $5,000', icon: Wallet, desc: 'Starting small' },
      { id: '5k', label: '$5,000 – $25,000', icon: Wallet, desc: 'Building momentum' },
      { id: '25k', label: '$25,000 – $100,000', icon: TrendingUp, desc: 'Serious capital' },
      { id: '100k', label: '$100,000+', icon: Shield, desc: 'High-net-worth' },
    ],
  },
]

export function Onboarding() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const selected = selections[step.id]

  const handleSelect = (optionId: string) => {
    setSelections((prev) => ({ ...prev, [step.id]: optionId }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      setLoading(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-surface">
      <AnimatedBackground variant="onboarding" />

      <header className="relative z-10 flex items-center justify-between p-6 lg:px-12">
        <Logo size="md" variant="dark" />
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-muted hover:text-ink transition-colors"
        >
          Skip for now
        </button>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 mx-6 lg:mx-auto lg:w-full lg:max-w-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-xs font-medium text-caprock">{Math.round(progress)}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-caprock to-caprock-light"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-8 lg:px-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="mb-10 text-center lg:text-left">
                <motion.h1
                  className="font-display text-3xl lg:text-4xl font-bold tracking-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {step.title}
                </motion.h1>
                <motion.p
                  className="mt-3 text-muted text-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {step.subtitle}
                </motion.p>
              </div>

              <div className={cn(
                'grid gap-3',
                step.options.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2',
              )}>
                {step.options.map((option, i) => {
                  const isSelected = selected === option.id
                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(option.id)}
                      className={cn(
                        'relative flex flex-col items-start gap-3 rounded-2xl p-5 text-left transition-all duration-300',
                        isSelected
                          ? 'bg-caprock/8 border-2 border-caprock shadow-lg shadow-caprock/10'
                          : 'premium-card border border-border hover:border-caprock/25 hover:shadow-premium-sm',
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-caprock"
                        >
                          <Check className="h-3.5 w-3.5 text-white" />
                        </motion.div>
                      )}
                      <div className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
                        isSelected ? 'bg-caprock text-white' : 'bg-caprock/8 text-caprock',
                      )}>
                        <option.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-ink">{option.label}</p>
                        <p className="mt-0.5 text-sm text-muted">{option.desc}</p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="mt-10 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              icon={<ChevronLeft className="h-4 w-4" />}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!selected}
              loading={loading}
              icon={<ChevronRight className="h-4 w-4" />}
            >
              {currentStep === steps.length - 1 ? 'Launch dashboard' : 'Continue'}
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
