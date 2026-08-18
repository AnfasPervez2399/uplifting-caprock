import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { BalanceCard, QuickActions } from '../components/dashboard/BalanceCard'
import { PortfolioChart } from '../components/dashboard/PortfolioChart'
import { TransactionList } from '../components/dashboard/TransactionList'
import { AssetAllocation } from '../components/dashboard/AssetAllocation'

export function Dashboard() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-caprock to-caprock-light p-5 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Your portfolio is outperforming the market</p>
              <p className="text-sm text-white/70">You're in the top 8% of Caprock investors this quarter</p>
            </div>
          </div>
          <motion.button
            whileHover={{ x: 4 }}
            className="flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white self-start sm:self-center"
          >
            View insights <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <BalanceCard />
            <QuickActions />
            <PortfolioChart />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <AssetAllocation />
            <TransactionList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
