import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Logo } from "./Logo";

const experiences = [
  {
    id: "growth",
    eyebrow: "GLOBAL INVESTMENTS",
    title: "Access opportunities beyond borders.",
    description:
      "Invest through a diversified global marketplace designed for institutional, wholesale and wealth investors. Explore opportunities across multiple asset classes, industries and international markets from a single ecosystem.",

    icon: TrendingUp,

    accent: "#10b981",
    soft: "rgba(16,185,129,0.12)",

    metric: "20+",
    metricLabel: "years of experience",

    value: "Global Reach",

    image: "/dashboard-preview.png",
  },

  {
    id: "security",
    eyebrow: "GOVERNANCE & COMPLIANCE",
    title: "Built on strength, stability and trust.",
    description:
      "Strong governance, ethical investment practices and institutional-grade oversight are at the core of every decision. Caprock combines compliance-first operations with rigorous risk management to deliver consistent and transparent outcomes.",

    icon: LockKeyhole,

    accent: "#6366f1",
    soft: "rgba(99,102,241,0.12)",

    metric: "100+",
    metricLabel: "years of collective expertise",

    value: "Compliance First",

    image: "/analytics-preview.png",
  },

  {
    id: "payments",
    eyebrow: "INSTITUTIONAL INFRASTRUCTURE",
    title: "Everything connected in one ecosystem.",
    description:
      "From investments and payments to asset management, custody and capital markets, Caprock brings together the essential financial services required to simplify operations and help investors move faster with confidence.",

    icon: Zap,

    accent: "#0ea5e9",
    soft: "rgba(14,165,233,0.12)",

    metric: "3",
    metricLabel: "global regions",

    value: "One Platform",

    image: "/dashboard-preview.png",
  },
];

const transactions = [
  {
    name: "Salary Deposit",
    type: "Income",
    amount: "+$6,420",
    icon: ArrowUpRight,
  },
  {
    name: "Apple Store",
    type: "Card payment",
    amount: "-$249",
    icon: CreditCard,
  },
  {
    name: "Investment",
    type: "Portfolio",
    amount: "+$1,240",
    icon: TrendingUp,
  },
];

function FloatingOrb({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.35, 0.6, 0.35],
      }}
      transition={{
        duration: 7,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function MiniSparkline({ accent }: { accent: string }) {
  return (
    <svg
      viewBox="0 0 220 70"
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      <motion.path
        d="M0 57 C18 51 25 54 40 42 C56 30 62 45 78 35 C94 25 104 32 120 21 C138 10 147 24 160 17 C178 7 190 15 220 4 V70 H0Z"
        fill="url(#sparkFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      <motion.path
        d="M0 57 C18 51 25 54 40 42 C56 30 62 45 78 35 C94 25 104 32 120 21 C138 10 147 24 160 17 C178 7 190 15 220 4"
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 1.5,
          ease: "easeOut",
        }}
      />
    </svg>
  );
}

function FinancePreview({ active }: { active: (typeof experiences)[number] }) {
  const Icon = active.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={active.id}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -15 }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative"
      >
        {/* Main dashboard */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.16)] backdrop-blur-2xl sm:p-6">
          {/* Dashboard top */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: [0, -5, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  background: active.soft,
                  color: active.accent,
                }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Caprock
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  Financial overview
                </p>
              </div>
            </div>

            <div className="flex h-8 items-center gap-1 rounded-full bg-slate-100 px-3">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: active.accent }}
              />
              <span className="text-[10px] font-semibold text-slate-500">
                LIVE
              </span>
            </div>
          </div>

          {/* Main balance */}
          <div className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Total balance
                </p>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={active.value}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
                  >
                    {active.value}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold"
                style={{
                  color: active.accent,
                  backgroundColor: active.soft,
                }}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                {active.metric}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-7 h-32">
            <MiniSparkline accent={active.accent} />
          </div>

          {/* Chart labels */}
          <div className="mt-1 flex justify-between text-[9px] font-medium text-slate-400">
            <span>JAN</span>
            <span>MAR</span>
            <span>MAY</span>
            <span>JUL</span>
            <span>AUG</span>
          </div>

          {/* Transactions */}
          <div className="mt-7 border-t border-slate-100 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900">
                Recent activity
              </p>
              <button className="text-[10px] font-semibold text-slate-400 transition hover:text-slate-900">
                View all
              </button>
            </div>

            <div className="space-y-2">
              {transactions.map((transaction, index) => {
                const TransactionIcon = transaction.icon;

                return (
                  <motion.div
                    key={transaction.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.08,
                    }}
                    className="flex items-center justify-between rounded-2xl px-2 py-2 transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <TransactionIcon className="h-3.5 w-3.5" />
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold text-slate-800">
                          {transaction.name}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {transaction.type}
                        </p>
                      </div>
                    </div>

                    <p
                      className={`text-[11px] font-bold ${
                        transaction.amount.startsWith("+")
                          ? "text-emerald-500"
                          : "text-slate-800"
                      }`}
                    >
                      {transaction.amount}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating status chip */}
        <motion.div
          animate={{
            y: [-5, 5, -5],
            rotate: [-1, 1, -1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-3 top-20 hidden rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-xl sm:block"
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                backgroundColor: active.soft,
                color: active.accent,
              }}
            >
              <Check className="h-4 w-4" />
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-900">Protected</p>
              <p className="text-[9px] text-slate-400">Always monitored</p>
            </div>
          </div>
        </motion.div>

        {/* Floating insight */}
        <motion.div
          animate={{
            y: [5, -5, 5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-xl md:block"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Sparkles className="h-4 w-4" />
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Smart insight
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-slate-900">
                Spending is down 8.2%
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function BrandShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), {
    stiffness: 100,
    damping: 20,
  });

  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), {
    stiffness: 100,
    damping: 20,
  });

  const active = experiences[activeIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % experiences.length);
    }, 6500);

    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);

    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const next = () => {
    setActiveIndex((current) => (current + 1) % experiences.length);
  };

  const previous = () => {
    setActiveIndex(
      (current) => (current - 1 + experiences.length) % experiences.length,
    );
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative hidden min-h-screen overflow-hidden bg-[#f5f8ff] lg:flex lg:w-[52%] xl:w-[55%]"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.13),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(14,165,233,0.12),transparent_30%),linear-gradient(135deg,#f8faff_0%,#eef4ff_52%,#f8fbff_100%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <FloatingOrb className="-left-32 top-1/3 h-80 w-80 bg-indigo-300/20" />

      <FloatingOrb
        className="-right-32 bottom-20 h-96 w-96 bg-sky-300/20"
        delay={2}
      />

      {/* Decorative orbit */}
      <motion.div
        className="absolute right-[8%] top-[10%] h-48 w-48 rounded-full border border-indigo-200/40"
        animate={{ rotate: 360 }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute right-[11%] top-[13%] h-36 w-36 rounded-full border border-dashed border-indigo-200/40"
        animate={{ rotate: -360 }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="relative z-10 flex w-full flex-col px-8 py-8 xl:px-12 xl:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <Logo size="lg" variant="dark" />

          <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/60 px-3 py-2 shadow-sm backdrop-blur-md xl:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>

            <span className="text-[10px] font-bold text-slate-600">
              50,000+ members
            </span>
          </div>
        </motion.div>

        {/* Main */}
        <div className="flex flex-1 items-center py-8">
          <div className="grid w-full items-center gap-10 xl:grid-cols-[0.8fr_1.2fr] xl:gap-14">
            {/* LEFT CONTENT */}
            <div className="max-w-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45 }}
                >
                  <div
                    className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-[0.16em]"
                    style={{
                      color: active.accent,
                      borderColor: `${active.accent}30`,
                      backgroundColor: active.soft,
                    }}
                  >
                    <active.icon className="h-3.5 w-3.5" />
                    {active.eyebrow}
                  </div>

                  <h1 className="font-display text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-slate-950 xl:text-[52px]">
                    {active.title}
                  </h1>

                  <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500 xl:text-base">
                    {active.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Interactive navigation */}
              <div className="mt-8 space-y-2">
                {experiences.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className="group relative flex w-full items-center gap-3 rounded-2xl p-3 text-left transition"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeFeature"
                          className="absolute inset-0 rounded-2xl border border-white bg-white/75 shadow-sm backdrop-blur-md"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}

                      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                        <Icon
                          className="h-4 w-4"
                          style={{
                            color: isActive ? item.accent : "#94a3b8",
                          }}
                        />
                      </div>

                      <div className="relative z-10 flex-1">
                        <p
                          className={`text-xs font-bold ${
                            isActive ? "text-slate-900" : "text-slate-500"
                          }`}
                        >
                          {item.eyebrow}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {item.metricLabel}
                        </p>
                      </div>

                      <ChevronRight
                        className={`relative z-10 h-4 w-4 transition ${
                          isActive
                            ? "translate-x-0 text-slate-700"
                            : "-translate-x-1 text-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Slider controls */}
              <div className="mt-7 flex items-center gap-3">
                <button
                  type="button"
                  onClick={previous}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={next}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-900"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <div className="ml-2 flex gap-1.5">
                  {experiences.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className="h-1.5 overflow-hidden rounded-full bg-slate-200"
                      style={{
                        width: index === activeIndex ? 32 : 8,
                      }}
                    >
                      {index === activeIndex && (
                        <motion.div
                          key={activeIndex}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: active.accent,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{
                            duration: 6.5,
                            ease: "linear",
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT VISUAL */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                perspective: 1400,
              }}
              className="relative mx-auto w-full max-w-[480px]"
            >
              {/* Ambient glow */}
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-10 rounded-full blur-3xl"
                style={{
                  backgroundColor: active.soft,
                }}
              />

              <FinancePreview active={active} />

              {/* Side stat */}
              <motion.div
                key={`${active.id}-stat`}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute -right-2 bottom-20 hidden rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-xl xl:block"
              >
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  {active.metricLabel}
                </p>

                <p
                  className="mt-1 text-lg font-bold"
                  style={{ color: active.accent }}
                >
                  {active.metric}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-between border-t border-slate-200/70 pt-5"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["A", "M", "S", "J"].map((letter, index) => (
                <div
                  key={letter}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#f5f8ff] bg-white text-[9px] font-bold text-slate-500 shadow-sm"
                >
                  {letter}
                </div>
              ))}
            </div>

            <p className="text-[10px] font-medium text-slate-400">
              Trusted by modern investors
            </p>
          </div>

          <div className="hidden items-center gap-2 text-[10px] font-semibold text-slate-400 sm:flex">
            <Wallet className="h-3.5 w-3.5" />
            Built for your financial future
          </div>
        </motion.div>
      </div>
    </section>
  );
}
