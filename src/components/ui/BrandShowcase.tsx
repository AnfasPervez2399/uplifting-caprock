import { useEffect, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Globe2,
  Landmark,
  LockKeyhole,
  Network,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_DELAY = 7000;

const experiences = [
  {
    id: "growth",
    eyebrow: "GLOBAL INVESTMENTS",
    title: "Access opportunities beyond borders.",
    description:
      "A diversified global marketplace for institutional, wholesale and wealth investors—connecting strategies, asset classes and international markets in one relationship.",
    icon: TrendingUp,
    accent: "#003478",
    accentBright: "#003478",
    soft: "rgba(0, 52, 120, 0.075)",
    panel: "linear-gradient(145deg, #f7f9fb 0%, #eef2f6 52%, #e9eef4 100%)",
    metric: "20+",
    metricLabel: "years of experience",
    value: "Global reach",
    valueLabel: "Investment profile",
  },
  {
    id: "security",
    eyebrow: "GOVERNANCE & COMPLIANCE",
    title: "Built on strength, stability and trust.",
    description:
      "Compliance-first operations, disciplined oversight and rigorous risk management create a clear, accountable structure around every investment decision.",
    icon: LockKeyhole,
    accent: "#003478",
    accentBright: "#003478",
    soft: "rgba(0, 52, 120, 0.075)",
    panel: "linear-gradient(145deg, #f7f9fb 0%, #eef2f6 52%, #e9eef4 100%)",
    metric: "100+",
    metricLabel: "years of collective expertise",
    value: "Protected by design",
    valueLabel: "Governance standard",
  },
  {
    id: "infrastructure",
    eyebrow: "INSTITUTIONAL INFRASTRUCTURE",
    title: "Everything connected in one ecosystem.",
    description:
      "Investments, payments, asset management, custody and capital markets work together to simplify operations and help investors move with confidence.",
    icon: Zap,
    accent: "#003478",
    accentBright: "#003478",
    soft: "rgba(0, 52, 120, 0.075)",
    panel: "linear-gradient(145deg, #f7f9fb 0%, #eef2f6 52%, #e9eef4 100%)",
    metric: "3",
    metricLabel: "connected global regions",
    value: "One ecosystem",
    valueLabel: "Operating model",
  },
] as const;

type Experience = (typeof experiences)[number];

type PreviewProps = {
  reduceMotion: boolean | null;
};

const previewShell =
  "relative min-h-[410px] overflow-hidden rounded-[26px] border border-black/[0.07] bg-white p-4 shadow-[0_28px_70px_-38px_rgba(15,23,42,0.26),0_8px_24px_-18px_rgba(15,23,42,0.10)] xl:rounded-[30px] xl:p-5";

function GlobalInvestmentPreview({ reduceMotion }: PreviewProps) {
  const markets = [
    { region: "Americas", strategy: "Private markets", status: "Open" },
    { region: "EMEA", strategy: "Real assets", status: "Review" },
    { region: "APAC", strategy: "Growth equity", status: "Open" },
  ];

  return (
    <div className={previewShell}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[rgba(0,52,120,0.075)] text-[#003478]">
            <Globe2 className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Global opportunity access
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-950 xl:text-sm">
              Cross-border mandate network
            </p>
          </div>
        </div>
        <div className="shrink-0 rounded-full bg-[rgba(0,52,120,0.07)] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wider text-[#003478]">
          Live
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[20px] border border-slate-200/80 bg-[#f7f9fb] px-3 pb-3 pt-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold text-slate-900">
              Mandate routes
            </p>
            <p className="mt-0.5 text-[8px] text-slate-400">
              Qualified market access
            </p>
          </div>
          <span className="text-[8px] font-semibold text-slate-500">
            6 regions
          </span>
        </div>

        <svg
          viewBox="0 0 320 124"
          role="img"
          aria-label="Animated investment routes across global markets"
          className="mt-1.5 h-[112px] w-full overflow-visible"
        >
          <path
            d="M16 77C44 36 81 27 111 47C127 58 142 58 159 44C183 24 220 30 238 51C254 69 277 74 304 52"
            fill="none"
            stroke="#d9dee5"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.52"
          />
          <motion.path
            d="M33 80C76 66 99 39 151 54C193 66 219 76 285 48"
            fill="none"
            stroke="#003478"
            strokeOpacity="0.42"
            strokeWidth="1.7"
            strokeDasharray="4 6"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: EASE }}
          />
          <motion.path
            d="M33 80C90 93 142 89 182 64C216 43 246 38 285 48"
            fill="none"
            stroke="#003478"
            strokeOpacity="0.24"
            strokeWidth="1.4"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 1.15,
              delay: reduceMotion ? 0 : 0.18,
              ease: EASE,
            }}
          />
          {[
            { cx: 33, cy: 80, label: "NY" },
            { cx: 151, cy: 54, label: "LDN" },
            { cx: 182, cy: 64, label: "DXB" },
            { cx: 285, cy: 48, label: "SG" },
          ].map((point, index) => (
            <motion.g
              key={point.label}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduceMotion ? 0 : 0.35 + index * 0.12 }}
              style={{ transformOrigin: `${point.cx}px ${point.cy}px` }}
            >
              <circle
                cx={point.cx}
                cy={point.cy}
                r="7"
                fill="white"
                stroke="#003478"
                strokeOpacity="0.18"
              />
              <circle cx={point.cx} cy={point.cy} r="3" fill="#003478" />
              <text
                x={point.cx}
                y={point.cy + 18}
                textAnchor="middle"
                fill="#64748b"
                fontSize="7"
                fontWeight="700"
                fontFamily="Arial, sans-serif"
              >
                {point.label}
              </text>
            </motion.g>
          ))}
          {!reduceMotion ? (
            <motion.circle
              r="3.5"
              fill="#003478"
              animate={{ cx: [33, 151, 285], cy: [80, 54, 48] }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ) : null}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {markets.map((market, index) => (
          <motion.div
            key={market.region}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: reduceMotion ? 0 : 0.28 + index * 0.08,
              ease: EASE,
            }}
            className="min-w-0 rounded-[15px] border border-slate-200/80 bg-white p-2.5"
          >
            <div className="mb-2 flex items-center justify-between gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#003478]" />
              <span className="truncate text-[7px] font-bold uppercase tracking-wide text-[#003478]">
                {market.status}
              </span>
            </div>
            <p className="truncate text-[9px] font-bold text-slate-900">
              {market.region}
            </p>
            <p className="mt-1 line-clamp-2 text-[7.5px] leading-[1.35] text-slate-400">
              {market.strategy}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GovernancePreview({ reduceMotion }: PreviewProps) {
  const controls = [
    {
      label: "Investor verification",
      detail: "Identity controls",
      icon: BadgeCheck,
    },
    {
      label: "Mandate suitability",
      detail: "Policy aligned",
      icon: FileCheck2,
    },
    {
      label: "Custody reconciliation",
      detail: "Records matched",
      icon: Landmark,
    },
  ];

  return (
    <div className={previewShell}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[rgba(0,52,120,0.075)] text-[#003478]">
            <ShieldCheck className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Governance control centre
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-950 xl:text-sm">
              Continuous oversight
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[rgba(0,52,120,0.07)] px-2.5 py-1.5 text-[8px] font-bold text-[#003478]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#003478]" />
          Clear
        </span>
      </div>

      <div className="mt-5 grid grid-cols-[88px_minmax(0,1fr)] gap-3 xl:grid-cols-[108px_minmax(0,1fr)] xl:gap-4">
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-slate-200/80 bg-[#f7f9fb] px-2 py-4">
          <div className="relative h-[66px] w-[66px] xl:h-[78px] xl:w-[78px]">
            <svg
              viewBox="0 0 80 80"
              className="h-full w-full -rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="7"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="#003478"
                strokeWidth="7"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="1"
                initial={reduceMotion ? false : { strokeDashoffset: 1 }}
                animate={{ strokeDashoffset: 0.04 }}
                transition={{ duration: 1.2, ease: EASE }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-base font-semibold tracking-[-0.04em] text-slate-950 xl:text-lg">
                  96%
                </p>
                <p className="text-[6px] font-bold uppercase tracking-wider text-slate-400">
                  complete
                </p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-[8px] font-semibold text-slate-700">
            Control readiness
          </p>
        </div>

        <div className="space-y-2">
          {controls.map((control, index) => {
            const Icon = control.icon;
            return (
              <motion.div
                key={control.label}
                initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: reduceMotion ? 0 : 0.18 + index * 0.09,
                  ease: EASE,
                }}
                className="flex items-center gap-2.5 rounded-[14px] border border-slate-200/75 bg-white p-2.5"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-[10px] bg-[rgba(0,52,120,0.065)] text-[#003478]">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[8.5px] font-bold text-slate-900">
                    {control.label}
                  </p>
                  <p className="mt-0.5 truncate text-[7.5px] text-slate-400">
                    {control.detail}
                  </p>
                </div>
                <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#003478] text-white">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-[18px] border border-slate-200/80 bg-[#f7f9fb] p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5 text-[#003478]" />
            <p className="text-[8.5px] font-bold text-slate-900">
              Approval sequence
            </p>
          </div>
          <span className="text-[7.5px] font-semibold text-slate-400">
            Auditable
          </span>
        </div>
        <div className="relative grid grid-cols-3 gap-2">
          <div className="absolute left-[15%] right-[15%] top-3 h-px bg-slate-200" />
          {[
            ["01", "Adviser"],
            ["02", "Compliance"],
            ["03", "Custodian"],
          ].map(([step, label], index) => (
            <motion.div
              key={step}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduceMotion ? 0 : 0.55 + index * 0.1 }}
              className="relative text-center"
            >
              <div className="relative z-10 mx-auto grid h-6 w-6 place-items-center rounded-full border border-[rgba(0,52,120,0.16)] bg-white text-[7px] font-bold text-[#003478]">
                {step}
              </div>
              <p className="mt-1.5 truncate text-[7.5px] font-semibold text-slate-600">
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfrastructurePreview({ reduceMotion }: PreviewProps) {
  const services = [
    { label: "Custody", icon: Landmark },
    { label: "Reconciliation", icon: Building2 },
    { label: "Reporting", icon: FileCheck2 },
  ];

  return (
    <div className={previewShell}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[rgba(0,52,120,0.075)] text-[#003478]">
            <Network className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Institutional infrastructure
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-950 xl:text-sm">
              Connected capital movement
            </p>
          </div>
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-200 text-[#003478]">
          <Zap className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-slate-200/80 bg-[#f7f9fb] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold text-slate-900">
              Allocation rail
            </p>
            <p className="mt-0.5 text-[8px] text-slate-400">
              Cash to investment workflow
            </p>
          </div>
          <span className="rounded-full bg-white px-2 py-1 text-[7.5px] font-bold text-[#003478] shadow-sm ring-1 ring-slate-200/80">
            Processing
          </span>
        </div>

        <div className="relative mt-5">
          <div className="absolute left-[15%] right-[15%] top-[21px] h-px bg-slate-300">
            {!reduceMotion ? (
              <motion.span
                className="absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-[#003478] shadow-[0_0_0_3px_rgba(0,52,120,0.10)]"
                animate={{ left: ["0%", "calc(100% - 7px)"] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : null}
          </div>
          <div className="relative grid grid-cols-3 gap-2">
            {[
              { label: "Cash account", icon: Banknote },
              { label: "Caprock core", icon: CircleDollarSign },
              { label: "Investment fund", icon: TrendingUp },
            ].map((node, index) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={node.label}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: reduceMotion ? 0 : 0.18 + index * 0.11,
                    ease: EASE,
                  }}
                  className="relative flex min-w-0 flex-col items-center"
                >
                  <div
                    className={`relative z-10 grid h-[42px] w-[42px] place-items-center rounded-[14px] border shadow-sm ${
                      index === 1
                        ? "border-[#003478] bg-[#003478] text-white"
                        : "border-slate-200 bg-white text-[#003478]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-2 w-full truncate text-center text-[7.5px] font-bold text-slate-700">
                    {node.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-200/80 pt-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.label}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduceMotion ? 0 : 0.46 + index * 0.08 }}
                className="min-w-0 text-center"
              >
                <Icon className="mx-auto h-3.5 w-3.5 text-slate-400" />
                <p className="mt-1.5 truncate text-[7px] font-semibold text-slate-500">
                  {service.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.5, ease: EASE }}
        className="mt-4 rounded-[18px] border border-[rgba(0,52,120,0.12)] bg-white p-3.5 shadow-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[8px] font-semibold text-slate-400">
              Fund allocation
            </p>
            <p className="mt-1 text-sm font-semibold tracking-[-0.03em] text-slate-950">
              $250,000.00
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
          <div className="shrink-0 text-right">
            <p className="text-[8px] font-semibold text-slate-400">
              Settlement
            </p>
            <div className="mt-1 inline-flex items-center gap-1.5 text-[8px] font-bold text-[#003478]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#003478]" />
              T+1 ready
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FinancePreview({
  active,
  reduceMotion,
}: {
  active: Experience;
  reduceMotion: boolean | null;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[450px] pb-4 pt-3">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.id}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.975, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 0.985, y: -8 }}
          transition={{ duration: 0.46, ease: EASE }}
        >
          {active.id === "growth" ? (
            <GlobalInvestmentPreview reduceMotion={reduceMotion} />
          ) : active.id === "security" ? (
            <GovernancePreview reduceMotion={reduceMotion} />
          ) : (
            <InfrastructurePreview reduceMotion={reduceMotion} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
export function BrandShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [2.25, -2.25]),
    {
      stiffness: 110,
      damping: 24,
    },
  );
  const rotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-2.25, 2.25]),
    {
      stiffness: 110,
      damping: 24,
    },
  );
  const visualX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 110,
    damping: 24,
  });
  const visualY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-4, 4]), {
    stiffness: 110,
    damping: 24,
  });

  const active = experiences[activeIndex] ?? experiences[0];

  useEffect(() => {
    if (reduceMotion || isPaused) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % experiences.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused, reduceMotion]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
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
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className="relative hidden min-h-[100svh] overflow-hidden border-r border-black/[0.065] bg-[#edf1f6] lg:flex lg:w-[52%] xl:w-[55%]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: active.panel }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-px bg-black/[0.065]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-white/80"
      />

      <div className="relative z-10 flex min-h-[100svh] w-full flex-col px-7 py-7 xl:px-9 xl:py-8 2xl:px-12 2xl:py-10">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="flex items-center justify-between"
        >
          <a
            href="/Caprock-Logo.svg"
            aria-label="Caprock home"
            className="rounded-xl  py-2   backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,52,120,0.28)]"
          >
            <img
              src="/Caprock-Logo.svg"
              alt="Caprock"
              className="h-18 w-auto xl:18"
            />
          </a>
        </motion.header>

        <div className="flex flex-1 items-center pb-7 xl:pb-8">
          <div className="grid w-full grid-cols-[minmax(0,0.86fr)_minmax(250px,1.14fr)] items-center gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(300px,1.1fr)] xl:gap-8 2xl:gap-12">
            <div className="min-w-0 max-w-md">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 13 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -9 }}
                  transition={{ duration: 0.42, ease: EASE }}
                >
                  <div
                    className="mb-4 inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[9px] font-bold tracking-[0.14em] xl:mb-5 xl:px-3 xl:text-[10px]"
                    style={{
                      color: active.accent,
                      borderColor: `${active.accentBright}32`,
                      backgroundColor: active.soft,
                    }}
                  >
                    <active.icon className="h-3 w-3 xl:h-3.5 xl:w-3.5" />
                    {active.eyebrow}
                  </div>

                  <h1 className="text-[clamp(2rem,3.1vw,3.75rem)] font-semibold leading-[1.01] tracking-[-0.052em] text-slate-950">
                    {active.title}
                  </h1>

                  <p className="mt-4 text-xs leading-[1.65] text-slate-600 xl:mt-5 xl:text-[13px] 2xl:text-sm">
                    {active.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div
                onPointerEnter={() => setIsPaused(true)}
                onPointerLeave={() => setIsPaused(false)}
                onFocusCapture={() => setIsPaused(true)}
                onBlurCapture={() => setIsPaused(false)}
                className="mt-6 space-y-1.5 xl:mt-7 xl:space-y-2"
                role="tablist"
                aria-label="Caprock capabilities"
              >
                {experiences.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveIndex(index)}
                      className="group relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,52,120,0.24)] xl:gap-3 xl:rounded-2xl xl:p-2.5"
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="active-experience"
                          className="absolute inset-0 rounded-xl border border-white bg-white/80 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.22)] ring-1 ring-slate-200/60 backdrop-blur-xl xl:rounded-2xl"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 31,
                          }}
                        />
                      ) : (
                        <span className="absolute inset-0 rounded-xl bg-white/0 transition-colors group-hover:bg-white/40 xl:rounded-2xl" />
                      )}

                      <span
                        className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-[11px] border border-white bg-white shadow-sm xl:h-9 xl:w-9 xl:rounded-xl"
                        style={{ color: isActive ? item.accent : "#94a3b8" }}
                      >
                        <Icon className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
                      </span>

                      <span className="relative z-10 min-w-0 flex-1">
                        <span
                          className={`block truncate text-[9px] font-bold tracking-[0.025em] xl:text-[10px] ${
                            isActive ? "text-slate-900" : "text-slate-500"
                          }`}
                        >
                          {item.eyebrow}
                        </span>
                        <span className="mt-0.5 block truncate text-[8.5px] text-slate-500 xl:text-[9px]">
                          {item.metric} {item.metricLabel}
                        </span>
                      </span>

                      <ChevronRight
                        className={`relative z-10 h-3.5 w-3.5 transition-all duration-200 ${
                          isActive
                            ? "translate-x-0 text-slate-700"
                            : "-translate-x-1 text-slate-300 group-hover:translate-x-0"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center gap-2.5 xl:mt-6">
                <button
                  type="button"
                  onClick={previous}
                  aria-label="Previous capability"
                  className="grid h-8 w-8 place-items-center rounded-full border border-slate-200/90 bg-white/90 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,52,120,0.24)] xl:h-9 xl:w-9"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next capability"
                  className="grid h-8 w-8 place-items-center rounded-full border border-slate-200/90 bg-white/90 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,52,120,0.24)] xl:h-9 xl:w-9"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                <div
                  className="ml-1 flex items-center gap-1.5"
                  aria-label={`Capability ${activeIndex + 1} of ${experiences.length}`}
                >
                  {experiences.map((item, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        aria-label={`Show ${item.eyebrow.toLowerCase()}`}
                        aria-current={isActive ? "true" : undefined}
                        className="relative h-1.5 overflow-hidden rounded-full bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,52,120,0.24)]"
                        style={{ width: isActive ? 34 : 7 }}
                      >
                        {isActive ? (
                          <motion.span
                            key={`${activeIndex}-${isPaused}`}
                            className="absolute inset-y-0 left-0 block origin-left rounded-full"
                            style={{ backgroundColor: active.accentBright }}
                            initial={{
                              width: isPaused || reduceMotion ? "100%" : 0,
                            }}
                            animate={{ width: "100%" }}
                            transition={{
                              duration:
                                isPaused || reduceMotion
                                  ? 0
                                  : AUTOPLAY_DELAY / 1000,
                              ease: "linear",
                            }}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <motion.div
              onPointerEnter={() => setIsPaused(true)}
              onPointerLeave={() => setIsPaused(false)}
              onFocusCapture={() => setIsPaused(true)}
              onBlurCapture={() => setIsPaused(false)}
              style={
                reduceMotion
                  ? undefined
                  : {
                      rotateX,
                      rotateY,
                      x: visualX,
                      y: visualY,
                      perspective: 1400,
                      transformStyle: "preserve-3d",
                    }
              }
              className="relative min-w-0"
            >
              <FinancePreview active={active} reduceMotion={reduceMotion} />
            </motion.div>
          </div>
        </div>

        <motion.footer
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.65, duration: 0.5 }}
          className="flex items-center justify-between border-t border-slate-200/75 pt-4 xl:pt-5"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-1.5">
              {[Globe2, ShieldCheck, CircleDollarSign].map(
                (TrustIcon, index) => (
                  <div
                    key={index}
                    className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#f7f7f6] bg-white text-slate-500 shadow-sm"
                  >
                    <TrustIcon className="h-3 w-3" />
                  </div>
                ),
              )}
            </div>
            <p className="text-[9px] font-medium text-slate-500 xl:text-[10px]">
              Built for investors
            </p>
          </div>

          <div className="hidden items-center gap-4 text-[9px] font-semibold text-slate-400 xl:flex xl:text-[10px]">
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="h-3 w-3 text-[#003478]" />
              Join caprock today and start investing with 0 commission
            </span>
          </div>
        </motion.footer>
      </div>
    </section>
  );
}
