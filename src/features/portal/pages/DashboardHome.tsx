import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Box,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Gem,
  Info,
  Lock,
  ListFilter,
  PiggyBank,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  Sun,
  Wallet,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  BALANCE_SERIES,
  CASH_ACCOUNTS,
  CURRENCIES,
  DEPOSIT_SERIES,
  HOLDINGS,
  KPI_CARDS,
  MONTHS,
  PORTAL_USER,
  RANGE_POINTS,
  SECURITIES,
  TIMELINE,
  TO_AUD,
  TRANSACTIONS,
  WEALTH_ACCOUNTS,
  WITHDRAWAL_SERIES,
  fmtMoney,
} from "../data";
import type { CashAccount, Holding } from "../data";
import {
  AreaChart,
  CountUp,
  EmptyState,
  KebabMenu,
  Modal,
  Panel,
  PanelHeader,
  Reveal,
  SegmentedControl,
  Sparkline,
  StatusPill,
  pushToast,
} from "../components";

/* ------------------------- prism flat theme (no gradients) ------------------ */

const PRISM_CSS = `
@keyframes prism-drift-a{0%{transform:translate(0,0) scale(1)}100%{transform:translate(48px,-26px) scale(1.18)}}
@keyframes prism-drift-b{0%{transform:translate(0,0) scale(1.1)}100%{transform:translate(-54px,24px) scale(.94)}}
@keyframes prism-sheen{0%{transform:translateX(-170%)}60%,100%{transform:translateX(300%)}}
@keyframes prism-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.prism-blob-a{animation:prism-drift-a 14s ease-in-out infinite alternate}
.prism-blob-b{animation:prism-drift-b 18s ease-in-out infinite alternate}
.prism-sheen{animation:prism-sheen 3.8s ease-in-out infinite}
`;

const BRAND = "#003478";

type PfId = "cash" | "wealth" | "invest" | "commod" | "secur";

const PF_META: Record<
  PfId,
  {
    tint: string;
    edge: string;
    accent: string;
    soft: string;
    glow: string;
    card: string;
    cardEdge: string;
    whisper: string;
    whisperEdge: string;
    Icon: ComponentType<{ className?: string }>;
  }
> = {
  cash: {
    tint: "#EDF2FB",
    edge: "#CBDAF2",
    accent: "#4E7CC4",
    soft: "#E3ECFA",
    glow: "rgba(78,124,196,.20)",
    card: "#FFFFFF",
    cardEdge: "#D2DFF2",
    whisper: "#EEF3FC",
    whisperEdge: "#DCE6F6",
    Icon: Wallet,
  },
  wealth: {
    tint: "#EFF0FC",
    edge: "#D5D3F1",
    accent: "#8A86D8",
    soft: "#E8E7FA",
    glow: "rgba(138,134,216,.20)",
    card: "#FFFFFF",
    cardEdge: "#D4D2F0",
    whisper: "#F0EFFC",
    whisperEdge: "#E0DEF5",
    Icon: Gem,
  },
  invest: {
    tint: "#EAF5EF",
    edge: "#C7E5D5",
    accent: "#55A180",
    soft: "#E0F2E9",
    glow: "rgba(85,161,128,.20)",
    card: "#FFFFFF",
    cardEdge: "#C7E5D5",
    whisper: "#EBF4EF",
    whisperEdge: "#D5E9DD",
    Icon: TrendingUp,
  },
  commod: {
    tint: "#EFF2F5",
    edge: "#D6DDE7",
    accent: "#8A97AB",
    soft: "#E7EBF0",
    glow: "rgba(138,151,171,.18)",
    card: "#FFFFFF",
    cardEdge: "#D6DDE7",
    whisper: "#F0F3F6",
    whisperEdge: "#DFE5EC",
    Icon: Box,
  },
  secur: {
    tint: "#FAEFF2",
    edge: "#EFCBD5",
    accent: "#D4718A",
    soft: "#F9E5EA",
    glow: "rgba(212,113,138,.20)",
    card: "#FFFFFF",
    cardEdge: "#EFCBD5",
    whisper: "#FAF0F3",
    whisperEdge: "#F2D8E0",
    Icon: Banknote,
  },
};

function moneyK(v: number): string {
  return v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(2)}m`
    : `$${(v / 1_000).toFixed(1)}k`;
}

/** Deterministic 30-point balance-trend series seeded from the account id. */
function acctSeries(a: CashAccount): number[] {
  let s = 7;
  for (let i = 0; i < a.id.length; i++) s = (s * 31 + a.id.charCodeAt(i)) >>> 0;
  const rnd = () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return s / 4294967296;
  };
  const startF = 0.82 + rnd() * 0.24;
  let v = a.balance * startF;
  const out: number[] = [];
  for (let i = 0; i < 29; i++) {
    out.push(+v.toFixed(2));
    v += (rnd() - 0.4) * a.balance * 0.018;
    if (i > 20) v += (a.balance - v) * 0.45;
  }
  out.push(a.balance);
  return out;
}

function last30Days(): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 29; i >= 0; i--) {
    const t = new Date(d);
    t.setDate(d.getDate() - i);
    out.push(t.toLocaleDateString("en-AU", { day: "numeric", month: "short" }));
  }
  return out;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    pushToast("Copied", `${text} copied to clipboard.`);
  } catch {
    pushToast("Account number", text, "blue");
  }
}

/* -------------------------------- Prism hero ------------------------------- */

function Hero() {
  const sydneyHour =
    Number(
      new Intl.DateTimeFormat("en-AU", {
        timeZone: "Australia/Sydney",
        hour: "numeric",
        hour12: false,
      }).format(new Date()),
    ) % 24;
  const greeting =
    sydneyHour < 12
      ? "Good morning"
      : sydneyHour < 18
        ? "Good afternoon"
        : "Good evening";
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[20px] border border-[#002855] bg-[#003478] px-5 py-4 shadow-[0_16px_40px_-28px_rgba(0,52,120,0.4)] sm:px-6"
    >
      <div className="flex items-center gap-4">
        <motion.span
          initial={{ opacity: 0, scale: 0.7, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.15,
            type: "spring",
            stiffness: 260,
            damping: 16,
          }}
          whileHover={{ rotate: 25, scale: 1.08 }}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10"
        >
          <Sun className="h-6 w-6 text-amber-300" />
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="truncate text-[22px] font-extrabold tracking-tight text-white sm:text-[30px]"
        >
          {greeting}, {PORTAL_USER.firstName}
        </motion.h1>
      </div>
    </motion.section>
  );
}

function PortfolioCarousel({
  active,
  onSelect,
  cashCount,
}: {
  active: PfId;
  onSelect: (pf: PfId) => void;
  cashCount: number;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [unlock, setUnlock] = useState(false);
  const scroll = (dir: number) =>
    track.current?.scrollBy({
      left: dir * track.current.clientWidth,
      behavior: "smooth",
    });
  const [dot, setDot] = useState(0);
  const counts: Record<PfId, string> = {
    cash: `${cashCount} accounts`,
    wealth: `${WEALTH_ACCOUNTS.length} accounts`,
    invest: `${HOLDINGS.length} positions`,
    commod: "Locked",
    secur: `${SECURITIES.length} positions`,
  };
  return (
    <div
      className="group relative z-10 -mb-1 mt-4"
      style={{ overflowX: "visible", overflowY: "clip" }}
    >
      <div
        ref={track}
        className="no-scrollbar -mb-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-[52px] pt-4"
        style={{
          scrollbarColor: "transparent transparent",
          msOverflowStyle: "none",
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const max = el.scrollWidth - el.clientWidth;
          setDot(
            max > 0
              ? Math.round((el.scrollLeft / max) * (KPI_CARDS.length - 1))
              : 0,
          );
        }}
      >
        {KPI_CARDS.map((kpi, i) => {
          const id = kpi.id as PfId;
          const meta = PF_META[id];
          const isActive = id === active;
          const Icon = meta.Icon;
          const trend = kpi.trendPct ?? 0;
          return (
            <motion.button
              key={kpi.id}
              type="button"
              initial={{ opacity: 0, y: 22 }}
              animate={{
                opacity: 1,
                y: isActive ? -6 : 0,
                scale: isActive ? 1.015 : 1,
              }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: "easeOut" }}
              whileHover={{
                y: isActive ? -8 : -7,
                scale: 1.02,
                borderColor: meta.cardEdge,
                boxShadow: `0 28px 48px -20px ${meta.glow}`,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                if (kpi.locked) {
                  setUnlock(true);
                  return;
                }
                e.currentTarget.scrollIntoView({
                  behavior: "smooth",
                  inline: "nearest",
                  block: "nearest",
                });
                onSelect(id);
              }}
              aria-pressed={isActive}
              className="group/card relative min-w-0 shrink-0 snap-start basis-full rounded-[20px] border bg-white p-3.5 pb-2.5 cursor-pointer text-left sm:basis-[calc((100%-16px)/2)] md:basis-[calc((100%-32px)/3)] xl:basis-[calc((100%-48px)/4)]"
              style={
                isActive
                  ? {
                      borderColor: meta.accent,
                      borderWidth: 2,
                      background: meta.soft,
                      zIndex: 2,
                      boxShadow: `0 22px 44px -22px ${meta.glow},0 2px 8px -2px ${meta.glow},inset 0 1px 0 rgba(255,255,255,.7)`,
                    }
                  : {
                      borderColor: meta.whisperEdge,
                      background: meta.whisper,
                      zIndex: 1,
                      boxShadow:
                        "0 10px 24px -20px rgba(15,30,70,.35),inset 0 1px 0 rgba(255,255,255,.8)",
                    }
              }
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
              >
                {isActive && !kpi.locked && (
                  <span className="prism-sheen absolute inset-y-[-20%] left-0 w-[30%] bg-white/50 blur-md" />
                )}
              </span>
              {kpi.locked && (
                <span className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 rounded-[inherit] bg-white/60 p-4 text-center backdrop-blur-[3px]">
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="grid h-[54px] w-[54px] place-items-center rounded-full bg-[#7C3AED] text-white"
                    style={{
                      boxShadow:
                        "0 0 0 7px rgba(139,92,246,.15),0 12px 26px -8px rgba(124,58,237,.6)",
                    }}
                  >
                    <Lock className="h-6 w-6" />
                  </motion.span>
                  <b className="text-[12.5px] font-bold text-slate-600">
                    Contact your adviser to unlock
                  </b>
                </span>
              )}

              {isActive && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
                >
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -top-[3px] left-1/2 h-2 w-[30px] -translate-x-1/2 rounded-full"
                    style={{ background: meta.accent }}
                  />
                  <motion.span
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 0.7 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                    style={{ background: meta.accent, transformOrigin: "top" }}
                    className="absolute left-1/2 top-[5px] h-[38px] w-[3px] -translate-x-1/2 rounded-full"
                  />
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.22,
                      type: "spring",
                      stiffness: 500,
                      damping: 20,
                    }}
                    className="absolute left-1/2 top-[40px] h-[10px] w-[68px] -translate-x-1/2 rounded-full"
                    style={{
                      background: meta.accent,
                      boxShadow: `0 0 0 3px #FFFFFF,0 8px 16px -6px ${meta.glow}`,
                    }}
                  />
                </span>
              )}
              <span className="relative flex items-center justify-between gap-2.5">
                <motion.span
                  whileHover={{ scale: 1.12, rotate: -8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-slate-100 bg-white transition-colors duration-300"
                  style={
                    isActive
                      ? {
                          color: "#FFFFFF",
                          background: meta.accent,
                          borderColor: meta.accent,
                          boxShadow: `0 0 0 3px #FFFFFF,0 0 0 5px ${meta.cardEdge},0 10px 20px -12px ${meta.glow}`,
                        }
                      : {
                          color: "#93A3B8",
                          boxShadow: "0 6px 14px -10px rgba(15,30,70,.4)",
                        }
                  }
                >
                  <Icon className="h-[18px] w-[18px]" />
                </motion.span>
                {kpi.locked && (
                  <span className="shrink-0 rounded-full bg-slate-200/80 px-2.5 py-1 text-[9px] font-black tracking-[0.14em] text-slate-500">
                    LOCKED
                  </span>
                )}
                {!kpi.locked && isActive && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    layout
                    layoutId="pf-viewing"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white"
                    style={{
                      background: meta.accent,
                      boxShadow: `0 6px 14px -6px ${meta.glow}`,
                    }}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </motion.span>
                )}
                {!kpi.locked && !isActive && (
                  <span className="shrink-0 rounded-full border border-slate-200 bg-white/70 px-2 py-1 text-[9px] font-black tracking-[0.1em] text-slate-500">
                    {kpi.currency}
                  </span>
                )}
              </span>
              <span className="mt-2 block text-[9.5px] font-extrabold uppercase leading-5 tracking-[0.08em] text-slate-500">
                {kpi.label}
              </span>
              <span className="relative mt-2 block truncate text-[20px] font-bold tabular-nums tracking-tight text-[#26344D]">
                <CountUp
                  value={kpi.amount}
                  format={(v) => fmtMoney(v, kpi.currency)}
                />
              </span>
              {!kpi.locked && (
                <span className="relative mt-1 flex items-center gap-2 text-[10.5px] font-semibold text-slate-400">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: meta.accent }}
                  />
                  {counts[id]}
                  <span
                    className="ml-auto rounded-full px-2 py-[3px] text-[10px] font-extrabold tabular-nums"
                    style={
                      trend > 0.05
                        ? { background: "#E2F3EA", color: "#3D8B68" }
                        : trend < -0.05
                          ? { background: "#FAE7EB", color: "#C05F78" }
                          : { background: "#EEF1F5", color: "#8A97AB" }
                    }
                  >
                    {trend > 0.05 ? "▲ " : trend < -0.05 ? "▼ " : ""}
                    {trend > 0 ? "+" : ""}
                    {trend.toFixed(1)}%
                  </span>
                </span>
              )}
              <span className="relative mt-2.5 block">
                <MiniBars
                  values={kpi.spark}
                  bar={`${meta.accent}59`}
                  last={meta.accent}
                  dot={meta.accent}
                />
              </span>
            </motion.button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="Scroll portfolios left"
        onClick={() => scroll(-1)}
        className="absolute -left-3.5 top-[46%] z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 opacity-0 shadow-lg transition hover:scale-110 focus-visible:opacity-100 group-hover:opacity-100 md:grid"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Scroll portfolios right"
        onClick={() => scroll(1)}
        className="absolute -right-3.5 top-[46%] z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 opacity-0 shadow-lg transition hover:scale-110 focus-visible:opacity-100 group-hover:opacity-100 md:grid"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <div
        className="absolute bottom-6 left-4 z-10 flex items-center gap-1.5 sm:hidden"
        role="tablist"
        aria-label="Portfolios"
      >
        {KPI_CARDS.map((k, i) => (
          <button
            key={k.id}
            type="button"
            role="tab"
            aria-selected={dot === i}
            aria-label={k.label}
            onClick={() => {
              const el = track.current;
              if (el) {
                const max = el.scrollWidth - el.clientWidth;
                el.scrollTo({
                  left: (max / (KPI_CARDS.length - 1)) * i,
                  behavior: "smooth",
                });
              }
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${dot === i ? "w-5 bg-[#003478]" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`}
          />
        ))}
      </div>
      <Modal
        open={unlock}
        onClose={() => setUnlock(false)}
        title="Private Wealth (Commodities)"
        subtitle="Mandate locked"
      >
        <div className="grid gap-2 rounded-xl bg-slate-50 p-4 text-[13px] text-slate-600">
          <p>
            <b className="text-slate-900">Status:</b> Locked
          </p>
          <p>
            <b className="text-slate-900">Holdings:</b> {fmtMoney(148220)}
          </p>
          <p>
            Commodity mandates are available to wholesale clients on
            application.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setUnlock(false);
            pushToast(
              "Adviser notified",
              "Priya will reach out within one business day.",
              "blue",
            );
          }}
          className="mt-4 h-11 w-full rounded-xl bg-[#003478] text-sm font-extrabold text-white transition hover:bg-[#002855]"
        >
          Message my adviser
        </button>
      </Modal>
    </div>
  );
}

/* -------------------------------- Account cards ---------------------------- */

function AccountCard({
  account,
  selected,
  onSelect,
  onRename,
  onStatement,
  index,
  accent,
}: {
  account: CashAccount;
  selected: boolean;
  accent: string;
  onSelect: () => void;
  onRename: (id: string, name: string) => void;
  onStatement: (a: CashAccount) => void;
  index: number;
}) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState(false);
  const [reportMenu, setReportMenu] = useState(false);
  const [draftName, setDraftName] = useState(account.name);
  const series = useMemo(() => acctSeries(account), [account]);
  const pct = series[0]
    ? ((series[series.length - 1] - series[0]) / Math.abs(series[0])) * 100
    : 0;
  const up = pct >= 0;
  return (
    <>
      <motion.div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.42, delay: (index % 3) * 0.07 }}
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.99 }}
        className="relative cursor-pointer rounded-2xl border-2 bg-white p-3.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/50"
        style={
          selected
            ? {
                borderColor: BRAND,
                background: "#EFF4FD",
                boxShadow: "0 22px 44px -22px rgba(0,52,120,.45)",
              }
            : {
                borderColor: `${accent}55`,
                background: "#FFFFFF",
                boxShadow: "0 6px 16px -12px rgba(15,30,70,.18)",
              }
        }
        onMouseEnter={(e) => {
          if (!selected) {
            e.currentTarget.style.borderColor = `${accent}`;
            e.currentTarget.style.boxShadow = `0 22px 44px -22px ${accent}66`;
          }
        }}
        onMouseLeave={(e) => {
          if (!selected) {
            e.currentTarget.style.borderColor = `${accent}55`;
            e.currentTarget.style.boxShadow =
              "0 6px 16px -12px rgba(15,30,70,.18)";
          }
        }}
      >
        {selected && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-[54px] top-[15px] rounded-full bg-[#003478] px-1.5 py-[2px] text-[8px] font-black tracking-[0.16em] text-white shadow"
          >
            SELECTED
          </motion.span>
        )}
        <div className="relative">
          <div
            className="flex items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="flex items-center gap-1.5 text-[13px] font-extrabold tracking-tight text-slate-900">
              Account {account.id}
              <span
                className="rounded-full px-2 py-[2px] text-[9px] font-black tracking-[0.08em]"
                style={{ background: "#00347814", color: "#003478" }}
              >
                {account.currency}
              </span>
            </p>
            <KebabMenu
              items={[
                {
                  label: "View statement",
                  onSelect: () => onStatement(account),
                },
                {
                  label: "Lodge request",
                  onSelect: () => navigate("/portal/request"),
                },
                {
                  label: "Copy account number",
                  onSelect: () => copyText(account.number || account.id),
                },
              ]}
            />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <p className="text-[17px] font-black tabular-nums tracking-tight text-[#1D2A45]">
              {fmtMoney(account.balance, account.currency)}
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-[3px] text-[9px] font-extrabold tabular-nums ${up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
            >
              {up ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {up ? "+" : ""}
              {pct.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Name
              </p>
              <p className="mt-1 truncate text-[11.5px] font-bold text-slate-700">
                {account.name}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Number
              </p>
              <p className="mt-1 truncate text-[11.5px] font-bold text-slate-700">
                {account.number || "—"}
              </p>
            </div>
          </div>
          <div
            className="mt-2.5 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-none">
              <button
                type="button"
                onClick={() => setReportMenu((o) => !o)}
                className="inline-flex w-auto items-center justify-center gap-1.5 rounded-xl bg-[#E7EEFB] px-3.5 py-[6px] text-[10px] font-extrabold text-[#003478] transition hover:bg-[#003478] hover:text-white hover:shadow-[0_10px_22px_-8px_rgba(0,52,120,.65)] active:scale-[0.98]"
              >
                <Download className="h-3.5 w-3.5" /> Download Report
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${reportMenu ? "rotate-180" : ""}`}
                />
              </button>
              {reportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setReportMenu(false)}
                  />
                  <ul className="absolute inset-x-0 bottom-full z-30 mb-1.5 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1 shadow-[0_20px_44px_-16px_rgba(15,30,70,.35)] ring-1 ring-slate-950/5">
                    {[
                      { label: "PDF statement", Icon: FileText },
                      { label: "Excel transactions", Icon: FileSpreadsheet },
                      { label: "CSV ledger", Icon: FileDown },
                    ].map(({ label, Icon }) => (
                      <li key={label}>
                        <button
                          type="button"
                          onClick={() => {
                            setReportMenu(false);
                            pushToast(
                              "Report preparing",
                              `${label} · Account ${account.id}.`,
                            );
                          }}
                          className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-bold text-slate-600 transition hover:bg-[#EAF1FE] hover:text-[#003478]"
                        >
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-500 transition group-hover:bg-[#003478] group-hover:text-white">
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          {label}
                          <Download className="ml-auto h-3 w-3 opacity-0 transition group-hover:opacity-60" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <button
              type="button"
              aria-label={`About account ${account.id}`}
              onClick={() => {
                setDraftName(account.name);
                setDetail(true);
              }}
              className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-400 transition hover:border-[#003478] hover:text-[#003478] active:scale-95"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-400">
            {account.updatedLabel}
            <StatusPill
              status={account.status === "active" ? "Active" : "Dormant"}
            />
          </p>
        </div>
      </motion.div>

      <Modal
        open={detail}
        onClose={() => setDetail(false)}
        title={`Account ${account.id}`}
        subtitle="Details and display name"
      >
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Currency", account.currency],
            ["Account number", account.number || "—"],
            ["Balance", fmtMoney(account.balance, account.currency)],
            ["Status", account.status],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-slate-50 px-3.5 py-2.5">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {k}
              </dt>
              <dd className="mt-0.5 truncate text-[13px] font-bold text-slate-800">
                {v}
              </dd>
            </div>
          ))}
        </dl>
        <label
          className="mt-4 block text-xs font-bold text-slate-600"
          htmlFor={`rename-${account.id}`}
        >
          Display name
        </label>
        <input
          id={`rename-${account.id}`}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none transition focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/10"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setDetail(false)}
            className="rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-500 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onRename(account.id, draftName.trim() || account.name);
              setDetail(false);
              pushToast("Account renamed", `Account ${account.id} updated.`);
            }}
            className="rounded-xl bg-[#003478] px-5 py-2.5 text-[13px] font-extrabold text-white transition hover:bg-[#002855]"
          >
            Save name
          </button>
        </div>
      </Modal>
    </>
  );
}

/* -------------------------------- Holding cards ---------------------------- */

function HoldingCard({ holding, index }: { holding: Holding; index: number }) {
  const up = holding.dayPct >= 0;
  const color = up ? "#059669" : "#E11D48";
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.42, delay: (index % 3) * 0.07 }}
      whileHover={{ y: -4 }}
      className="relative rounded-[20px] border-2 border-[#E5EAF3] bg-white p-5 transition-shadow duration-200 hover:shadow-[0_22px_44px_-22px_rgba(15,30,70,0.35)]"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}66`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#E5EAF3";
      }}
    >
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-[3px] rounded-b-full"
        style={{ background: color }}
      />
      <div className="flex items-center justify-between gap-2">
        <span
          className="rounded-lg px-2.5 py-1 text-[11px] font-black tracking-[0.08em] text-white"
          style={{ background: color, boxShadow: `0 8px 16px -8px ${color}` }}
        >
          {holding.ticker}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums ${up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
        >
          {up ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {up ? "+" : ""}
          {holding.dayPct}%
        </span>
      </div>
      <p className="mt-3 text-[22px] font-extrabold tabular-nums tracking-tight text-slate-900">
        <CountUp value={holding.value} format={(v) => fmtMoney(v)} />
      </p>
      <p className="mt-1 truncate text-[12.5px] font-bold text-slate-700">
        {holding.name}
      </p>
      <p className="text-[11px] font-semibold text-slate-400">
        {holding.assetClass}
      </p>
      <div className="mt-2 overflow-hidden rounded-xl bg-slate-50/70">
        <div className="[&_svg]:h-[44px] [&_svg]:w-full">
          <Sparkline
            points={holding.spark}
            color={color}
            id={`holding-${holding.id}`}
            width={200}
            height={44}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------- Account detail ---------------------------- */

/* ------------------------------- Account detail ---------------------------- */

function AccountDetail({
  account,
  onStatement,
}: {
  account: CashAccount;
  onStatement: (a: CashAccount) => void;
}) {
  const navigate = useNavigate();
  const txns = TRANSACTIONS.filter((t) => t.account === account.name);
  const inn = txns.reduce((s, t) => s + t.credit, 0);
  const out = txns.reduce((s, t) => s + t.debit, 0);
  const chg = account.balance > 0 ? ((inn - out) / account.balance) * 100 : 0;
  const up = chg >= 0;
  const series = useMemo(() => acctSeries(account), [account]);
  const labels = useMemo(() => last30Days(), []);
  const color = "#003478";
  const recent = txns.slice(-3).reverse();
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Panel className="mt-4 overflow-hidden p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Selected account
            </p>
            <h3 className="mt-2 truncate text-[22px] font-extrabold tracking-tight text-slate-900">
              {account.name}
            </h3>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-[11px] font-bold text-slate-700">
                {account.number || account.id}
              </span>
              <StatusPill status="Active" pulse />
            </div>
            <p className="mt-3 text-[32px] font-extrabold tabular-nums tracking-tight text-slate-900">
              <CountUp
                value={account.balance}
                format={(v) => fmtMoney(v, account.currency)}
              />
            </p>
            <p
              className={`mt-1 inline-flex items-center gap-1 text-[13px] font-extrabold tabular-nums ${up ? "text-emerald-600" : "text-rose-600"}`}
            >
              {up ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {up ? "+" : ""}
              {chg.toFixed(1)}% net flow · 30 days
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Currency", account.currency, ""],
                ["AUD rate", (TO_AUD[account.currency] ?? 1).toFixed(4), ""],
                [
                  "In · 30 days",
                  `+${fmtMoney(inn, account.currency, 0)}`,
                  "text-emerald-600",
                ],
                [
                  "Out · 30 days",
                  `−${fmtMoney(out, account.currency, 0)}`,
                  "text-rose-600",
                ],
              ].map(([k, v, cls]) => (
                <div key={k} className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {k}
                  </p>
                  <p
                    className={`mt-0.5 truncate text-[13px] font-extrabold tabular-nums text-slate-800 ${cls}`}
                  >
                    {v}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onStatement(account)}
                className="rounded-full bg-[#003478] px-5 py-2.5 text-[13px] font-extrabold text-white transition hover:bg-[#002855]"
              >
                View statement
              </button>
              <button
                type="button"
                onClick={() => navigate("/portal/request")}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-extrabold text-slate-700 transition hover:border-[#003478] hover:text-[#003478]"
              >
                Lodge request
              </button>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-extrabold text-slate-900">
                Balance trend
              </p>
              <p className="text-[11px] font-semibold text-slate-400">
                Last 30 days · {account.currency}
              </p>
            </div>
            <div className="mt-2">
              <AreaChart
                data={series}
                labels={labels}
                color={color}
                animKey={account.id}
                formatY={moneyK}
                height={190}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-extrabold text-slate-900">
                Recent activity
              </p>
              <button
                type="button"
                onClick={() => navigate("/portal/transactions")}
                className="inline-flex items-center gap-1 text-[13px] font-extrabold text-[#003478] hover:underline"
              >
                View all <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1 divide-y divide-slate-50">
              {recent.length ? (
                recent.map((t) => {
                  const credit = t.credit > 0;
                  return (
                    <div key={t.id} className="flex items-center gap-3 py-2.5">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${credit ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                      >
                        {credit ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-xs font-bold text-slate-700">
                          {t.id}
                        </span>
                        <span className="block truncate text-[11px] text-slate-400">
                          {t.datetime}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 text-[13px] font-black tabular-nums ${credit ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {credit ? "+" : "−"}
                        {fmtMoney(credit ? t.credit : t.debit, t.currency)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-xl bg-slate-50 py-6 text-center text-xs font-bold text-slate-400">
                  No transactions yet
                </p>
              )}
            </div>
          </div>
        </div>
      </Panel>
    </motion.div>
  );
}

/* ------------------------------- Portfolio panel --------------------------- */

const PF_DESC: Record<PfId, string> = {
  cash: "Operating cash across four Australian banks.",
  wealth: "Wholesale mandates across growth and income strategies.",
  invest: "Direct holdings across equities and managed funds.",
  commod: "Commodity mandates on application.",
  secur: "Listed securities and fixed income positions.",
};

function MiniBars({
  values,
  bar,
  last,
  dot,
}: {
  values: number[];
  bar: string;
  last: string;
  dot: string;
}) {
  const pts =
    values.length >= 12
      ? values
      : values.length < 2
        ? values
        : Array.from({ length: 14 }, (_, i) => {
            const t = (i / 13) * (values.length - 1);
            const lo = Math.floor(t);
            const hi = Math.min(values.length - 1, lo + 1);
            return values[lo] + (values[hi] - values[lo]) * (t - lo);
          });
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  return (
    <span className="flex h-[38px] items-end gap-[3px]" aria-hidden>
      {pts.map((v, i) => {
        const isLast = i === pts.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              delay: 0.15 + i * 0.04,
              duration: 0.35,
              ease: "easeOut",
            }}
            className="relative w-full origin-bottom rounded-full"
            style={{
              height: `${22 + ((v - min) / span) * 78}%`,
              background: isLast ? last : bar,
            }}
          >
            {isLast && (
              <span
                className="absolute -top-[7px] left-1/2 h-[7px] w-[7px] -translate-x-1/2 rounded-full ring-2 ring-white/70"
                style={{ background: dot }}
              />
            )}
          </motion.span>
        );
      })}
    </span>
  );
}

const PAGE_SIZE = 6;

function pageNums(c: number, p: number): (number | "\u2026")[] {
  if (p <= 7) return Array.from({ length: p }, (_, i) => i + 1);
  const set = new Set([1, p, c - 1, c, c + 1].filter((n) => n >= 1 && n <= p));
  const arr = [...set].sort((a, b) => a - b);
  const out: (number | "\u2026")[] = [];
  arr.forEach((n, i) => {
    if (i > 0 && n - arr[i - 1] > 1) out.push("\u2026");
    out.push(n);
  });
  return out;
}

function PortfolioPanel({
  activePf,
  accounts,
  setAccounts,
}: {
  activePf: PfId;
  accounts: CashAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<CashAccount[]>>;
}) {
  const [query, setQuery] = useState("");
  const [currency, setCurrency] = useState("All");
  const [ccyOpen, setCcyOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", currency: "AUD", balance: "" });
  const [statement, setStatement] = useState<CashAccount | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setQuery("");
    setCurrency("All");
    setSelected(null);
    setCcyOpen(false);
  }, [activePf]);

  useEffect(() => {
    setPage(1);
  }, [activePf, query, currency]);

  const kpi = KPI_CARDS.find((k) => k.id === activePf);
  const meta = PF_META[activePf];
  const PfIcon = meta.Icon;
  const source = activePf === "wealth" ? WEALTH_ACCOUNTS : accounts;
  const filtered = source.filter(
    (a) =>
      (currency === "All" || a.currency === currency) &&
      `${a.id} ${a.name} ${a.number}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const accountCurrencies = useMemo(
    () => ["All", ...Array.from(new Set(source.map((a) => a.currency)))],
    [source],
  );
  const ccyCounts = useMemo(() => {
    const m: Record<string, number> = {};
    source.forEach((a) => {
      m[a.currency] = (m[a.currency] ?? 0) + 1;
    });
    return m;
  }, [source]);
  const rename = (id: string, name: string) => {
    if (activePf !== "cash") return;
    setAccounts((list) => list.map((a) => (a.id === id ? { ...a, name } : a)));
  };
  const selAcct =
    filtered.find((a) => a.id === selected) ?? filtered[0] ?? null;
  const holdSource =
    activePf === "invest" ? HOLDINGS : activePf === "secur" ? SECURITIES : null;
  const totalItems = holdSource ? holdSource.length : filtered.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pagedAccts = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const pagedHold = holdSource
    ? holdSource.slice(pageStart, pageStart + PAGE_SIZE)
    : [];
  const noun = holdSource ? "positions" : "accounts";

  const subtitle =
    activePf === "cash"
      ? `${filtered.length} of ${accounts.length} accounts · balances update intraday`
      : activePf === "wealth"
        ? `${WEALTH_ACCOUNTS.length} accounts · ${fmtMoney(
            WEALTH_ACCOUNTS.reduce((s, a) => s + a.balance, 0),
            "AUD",
            0,
          )} combined · tap a card to inspect`
        : activePf === "invest"
          ? `${HOLDINGS.length} positions · ${fmtMoney(HOLDINGS.reduce((s, h) => s + h.value, 0))} combined`
          : `${SECURITIES.length} positions · ${fmtMoney(SECURITIES.reduce((s, h) => s + h.value, 0))} combined`;

  const stmtTxns = statement
    ? TRANSACTIONS.filter((t) => t.account === statement.name)
        .slice(-6)
        .reverse()
    : [];

  return (
    <>
      <Panel
        className="transition-colors duration-300"
        style={{
          background: meta.soft,
          borderColor: `${meta.accent}99`,
          borderTop: `4px solid ${meta.accent}`,
        }}
      >
        <div className="flex flex-wrap items-center gap-2.5 px-4 pt-4 sm:px-5">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors duration-300"
            style={{
              color: "#FFFFFF",
              background: meta.accent,
              borderColor: meta.accent,
              boxShadow: `0 0 0 3px #FFFFFF,0 0 0 5px ${meta.cardEdge},0 10px 20px -12px ${meta.glow}`,
            }}
          >
            <PfIcon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="mb-0.5 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[8.5px] font-black uppercase tracking-[0.16em] text-white transition-colors duration-300"
              style={{ background: meta.accent }}
            >
              <PfIcon className="h-3 w-3" />
              {kpi?.label ?? "Portfolio"}
            </p>
            <h2 className="truncate text-[15px] font-extrabold tracking-tight text-slate-900">
              {kpi ? `${kpi.label} Portfolio` : "Portfolio"}
            </h2>
            <p className="truncate text-[11px] font-semibold text-slate-500">
              {PF_DESC[activePf]}{" "}
              <span className="font-medium text-slate-400">· {subtitle}</span>
            </p>
          </div>
          {activePf === "cash" && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#003478] px-3.5 py-2 text-xs font-extrabold text-white"
              style={{ boxShadow: "0 10px 22px -8px rgba(0,52,120,.55)" }}
            >
              <Plus className="h-3.5 w-3.5" /> Add Account
            </motion.button>
          )}
        </div>
        <div
          aria-hidden
          className="mx-4 mt-3 h-[2px] rounded-full transition-colors duration-500 sm:mx-5"
          style={{ background: meta.accent }}
        />
        {(activePf === "cash" || activePf === "wealth") && (
          <div className="flex flex-col gap-2 px-4 pt-3 sm:flex-row sm:px-5">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, number or ID…"
                className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3.5 text-xs font-medium outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#003478] focus:bg-white focus:ring-4 focus:ring-[#003478]/10"
              />
            </div>
            <div className="relative shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setCcyOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={ccyOpen}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full border bg-white pl-2.5 pr-2 text-[11px] font-bold shadow-sm transition active:scale-[0.98] ${
                  ccyOpen || currency !== "All"
                    ? "border-[#003478] bg-[#EAF1FE] text-[#003478]"
                    : "border-slate-200 text-slate-600 hover:border-[#B9CCF5] hover:text-[#003478]"
                }`}
              >
                <ListFilter className="h-3.5 w-3.5 text-[#003478]" />
                {currency === "All" ? "All currencies" : currency}
                <span className="rounded-full bg-slate-100 px-1.5 py-[2px] text-[10px] font-black tabular-nums text-slate-500">
                  {currency === "All"
                    ? source.length
                    : (ccyCounts[currency] ?? 0)}
                </span>
                <ChevronDown
                  className={`h-3 w-3 text-slate-400 transition-transform ${ccyOpen ? "rotate-180" : ""}`}
                />
              </button>
              {ccyOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20 cursor-default"
                    onClick={() => setCcyOpen(false)}
                  />
                  <ul
                    role="listbox"
                    className="absolute left-0 z-30 mt-1.5 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl sm:left-auto sm:right-0"
                  >
                    {accountCurrencies.map((c) => {
                      const n =
                        c === "All" ? source.length : (ccyCounts[c] ?? 0);
                      const on = currency === c;
                      return (
                        <li key={c}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={on}
                            onClick={() => {
                              setCurrency(c);
                              setCcyOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[11px] font-bold transition ${
                              on
                                ? "bg-[#EAF1FE] text-[#003478]"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex-1">
                              {c === "All" ? "All currencies" : c}
                            </span>
                            <span
                              className={`rounded-full px-1.5 py-[2px] text-[10px] font-black tabular-nums ${on ? "bg-white text-[#003478]" : "bg-slate-100 text-slate-400"}`}
                            >
                              {n}
                            </span>
                            {on && <Check className="h-3.5 w-3.5" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}

        <motion.div
          key={activePf}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="px-4 py-4 sm:px-5"
        >
          <div className="relative">
            {activePf === "invest" || activePf === "secur" ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pagedHold.map((h, i) => (
                  <HoldingCard key={h.id} holding={h} index={i} />
                ))}
              </div>
            ) : activePf === "commod" ? (
              <EmptyState
                icon={<Lock className="h-6 w-6" />}
                title="This portfolio is locked"
                detail="Commodity mandates are available to wholesale clients on application."
                action={
                  <button
                    type="button"
                    onClick={() =>
                      pushToast(
                        "Adviser notified",
                        "Priya will reach out within one business day.",
                        "blue",
                      )
                    }
                    className="rounded-full bg-[#003478] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#002855]"
                  >
                    Message my adviser
                  </button>
                }
              />
            ) : filtered.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {pagedAccts.map((a, i) => (
                  <AccountCard
                    key={a.id}
                    account={a}
                    selected={selAcct?.id === a.id}
                    onSelect={() => setSelected(a.id)}
                    onRename={rename}
                    onStatement={setStatement}
                    index={i}
                    accent={meta.accent}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Search className="h-6 w-6" />}
                title="No accounts match"
                detail="Try a different search term or currency filter."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setCurrency("All");
                    }}
                    className="rounded-full bg-[#003478] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#002855]"
                  >
                    Clear filters
                  </button>
                }
              />
            )}
            {totalItems > PAGE_SIZE && (
              <div
                className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3"
                style={{ borderColor: `${meta.accent}33` }}
              >
                <p className="text-[11px] font-semibold text-slate-500">
                  Showing {pageStart + 1}–
                  {Math.min(pageStart + PAGE_SIZE, totalItems)} of {totalItems}{" "}
                  {noun}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((v) => Math.max(1, v - 1))}
                    disabled={safePage === 1}
                    aria-label="Previous page"
                    className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-[#003478] hover:text-[#003478] disabled:pointer-events-none disabled:opacity-35"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {pageNums(safePage, pageCount).map((n, i) =>
                    n === "\u2026" ? (
                      <span
                        key={`e${i}`}
                        className="px-0.5 text-[11px] font-black text-slate-300"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        aria-current={n === safePage ? "page" : undefined}
                        className={`h-7 min-w-[28px] rounded-full px-1.5 text-[11px] font-extrabold tabular-nums transition ${n === safePage ? "bg-[#003478] text-white shadow" : "text-slate-500 hover:bg-white hover:text-[#003478]"}`}
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => setPage((v) => Math.min(pageCount, v + 1))}
                    disabled={safePage === pageCount}
                    aria-label="Next page"
                    className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-[#003478] hover:text-[#003478] disabled:pointer-events-none disabled:opacity-35"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </Panel>

      {(activePf === "cash" || activePf === "wealth") && selAcct && (
        <AccountDetail
          key={selAcct.id}
          account={selAcct}
          onStatement={setStatement}
        />
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add cash account"
        subtitle="Opens instantly in your chosen currency"
      >
        <div className="grid gap-3.5">
          <div>
            <label
              className="text-xs font-bold text-slate-600"
              htmlFor="acct-name"
            >
              Account name
            </label>
            <input
              id="acct-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Singapore Operating"
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none transition focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label
                className="text-xs font-bold text-slate-600"
                htmlFor="acct-ccy"
              >
                Currency
              </label>
              <select
                id="acct-ccy"
                value={form.currency}
                onChange={(e) =>
                  setForm((f) => ({ ...f, currency: e.target.value }))
                }
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#003478]"
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="text-xs font-bold text-slate-600"
                htmlFor="acct-bal"
              >
                Opening balance
              </label>
              <input
                id="acct-bal"
                inputMode="decimal"
                value={form.balance}
                onChange={(e) =>
                  setForm((f) => ({ ...f, balance: e.target.value }))
                }
                placeholder="0.00"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none transition focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/10"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={!form.name.trim()}
            onClick={() => {
              const id = String(961 + accounts.length);
              setAccounts((list) => [
                {
                  id,
                  name: form.name.trim(),
                  currency: form.currency,
                  number: `${form.currency}-0${id}`,
                  balance: Number(form.balance) || 0,
                  status: "active",
                  updatedLabel: "Just now",
                },
                ...list,
              ]);
              setAddOpen(false);
              setForm({ name: "", currency: "AUD", balance: "" });
              pushToast(
                "Account opened",
                `${form.name.trim()} is ready to fund.`,
              );
            }}
            className="mt-1 h-11 w-full rounded-xl bg-[#003478] text-sm font-extrabold text-white transition hover:bg-[#002855] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Open account
          </button>
        </div>
      </Modal>

      <Modal
        open={statement !== null}
        onClose={() => setStatement(null)}
        title={
          statement
            ? `${statement.name} · ${statement.number || statement.id}`
            : "Statement"
        }
        subtitle={
          statement
            ? `Current balance ${fmtMoney(statement.balance, statement.currency)}`
            : undefined
        }
      >
        <div className="divide-y divide-slate-50">
          {stmtTxns.length ? (
            stmtTxns.map((t) => {
              const credit = t.credit > 0;
              return (
                <div key={t.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${credit ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                  >
                    {credit ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-xs font-bold text-slate-700">
                      {t.id}
                    </span>
                    <span className="block truncate text-[11px] text-slate-400">
                      {t.datetime}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-[13px] font-black tabular-nums ${credit ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {credit ? "+" : "−"}
                    {fmtMoney(credit ? t.credit : t.debit, t.currency)}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="rounded-xl bg-slate-50 py-6 text-center text-xs font-bold text-slate-400">
              No transactions yet
            </p>
          )}
        </div>
        {statement && (
          <button
            type="button"
            onClick={() =>
              pushToast(
                "Statement queued",
                `${statement.number || statement.id} · PDF will download shortly.`,
                "blue",
              )
            }
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#003478] text-sm font-extrabold text-white transition hover:bg-[#002855]"
          >
            <Download className="h-4 w-4" /> Download statement (PDF)
          </button>
        )}
      </Modal>
    </>
  );
}

/* --------------------------------- Flow cards -------------------------------- */

function FlowCard({
  title,
  monthValue,
  series,
  color,
  icon,
  delay,
  goodWhenUp,
}: {
  title: string;
  monthValue: number;
  series: number[];
  color: string;
  icon: React.ReactNode;
  delay: number;
  goodWhenUp?: boolean;
}) {
  const prev = series[series.length - 2];
  const pct = ((monthValue - prev) / prev) * 100;
  const up = pct >= 0;
  const good = goodWhenUp === false ? !up : up;
  return (
    <Reveal delay={delay} className="h-full">
      <Panel className="h-full p-5">
        <div className="flex items-center justify-between">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl text-white shadow"
            style={{ background: color }}
          >
            {icon}
          </span>
          <span className="text-[11px] font-bold text-slate-400">
            Date: <span className="text-slate-700">Sep, 2026</span>
          </span>
        </div>
        <p className="mt-3 text-[15px] font-extrabold text-slate-900">
          {title}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              AUD
            </p>
            <p className="mt-0.5 text-lg font-black tabular-nums">
              <CountUp
                value={monthValue * 1_000_000}
                format={(v) => fmtMoney(v)}
              />
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Sep, 2026
            </p>
            <p
              className={`mt-0.5 inline-flex items-center gap-1 text-[13px] font-extrabold tabular-nums ${good ? "text-emerald-600" : "text-rose-600"}`}
            >
              {up ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {up ? "+" : ""}
              {pct.toFixed(1)}%
            </p>
            <p className="text-[10px] font-semibold text-slate-400">vs Aug</p>
          </div>
        </div>
        <div className="mt-3 border-t border-slate-100 pt-3">
          <Sparkline
            points={series}
            color={color}
            id={title}
            width={260}
            height={44}
          />
        </div>
      </Panel>
    </Reveal>
  );
}

function BalancePanel() {
  const [range, setRange] = useState("All");
  const [generating, setGenerating] = useState(false);
  const [seed, setSeed] = useState(0);
  const n = RANGE_POINTS[range] ?? 12;
  const data = BALANCE_SERIES.slice(-n);
  const labels = MONTHS.slice(-n);
  const activeAccounts = CASH_ACCOUNTS.filter(
    (a) => a.status === "active",
  ).length;
  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        icon={<TrendingUp className="h-5 w-5" />}
        title="Account Balance"
        subtitle="Portfolio value across every account · AUD millions"
        tint="#003478"
        action={
          <SegmentedControl
            options={["1M", "3M", "6M", "1Y", "All"]}
            value={range}
            onChange={setRange}
          />
        }
      />
      <div className="grid gap-4 px-5 pt-4 sm:grid-cols-2 sm:px-6">
        <div className="rounded-2xl border border-[#D3E2FF] bg-[#EAF1FE] p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#5B7BC0]">
            Active Accounts
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-[#003478]">
            {activeAccounts}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-600">
            All settlement rails online
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2D5FF] bg-[#F1EAFE] p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8B76C9]">
            Portfolio
          </p>
          <p className="mt-1 truncate text-2xl font-black tabular-nums text-[#6D28D9]">
            <CountUp value={93041765.87} format={(v) => fmtMoney(v)} />
          </p>
          <p className="mt-1 text-[11px] font-semibold text-[#8B76C9]">
            +4.2% this quarter
          </p>
        </div>
      </div>
      <div className="px-2 pb-2 pt-2 sm:px-4">
        <AreaChart
          data={generating ? data.map((v) => v * 0.995) : data}
          labels={labels}
          animKey={`${range}-${seed}`}
          formatY={(v) => `$${v.toFixed(1)}m`}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 px-5 py-4 sm:px-6">
        <p className="text-xs text-slate-500">
          <span className="font-extrabold text-slate-800">
            {fmtMoney(data[data.length - 1] * 1_000_000)}
          </span>{" "}
          closing · Sep 2026
        </p>
        <button
          type="button"
          disabled={generating}
          onClick={() => {
            setGenerating(true);
            window.setTimeout(() => {
              setGenerating(false);
              setSeed((s) => s + 1);
              pushToast(
                "Graph regenerated",
                `${range} portfolio balance refreshed.`,
                "blue",
              );
            }, 900);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[13px] font-extrabold text-white transition hover:bg-[#003478] disabled:opacity-60"
        >
          {generating ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <TrendingUp className="h-4 w-4" />
          )}
          {generating ? "Generating…" : "Generate Graph"}
        </button>
      </div>
    </Panel>
  );
}

const TONE_BG: Record<string, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-[#003478]",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const [activePf, setActivePf] = useState<PfId>("cash");
  const [accounts, setAccounts] = useState(CASH_ACCOUNTS);
  const recent = TRANSACTIONS.slice(0, 5);
  return (
    <div className="space-y-5">
      <style>{PRISM_CSS}</style>
      <Hero />

      <PortfolioCarousel
        active={activePf}
        onSelect={setActivePf}
        cashCount={accounts.length}
      />

      <Reveal>
        <PortfolioPanel
          activePf={activePf}
          accounts={accounts}
          setAccounts={setAccounts}
        />
      </Reveal>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="grid gap-5 sm:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
          <FlowCard
            title="Total Deposit"
            monthValue={DEPOSIT_SERIES[8]}
            series={DEPOSIT_SERIES}
            color="#059669"
            icon={<ArrowDownRight className="h-5 w-5" />}
            delay={0}
          />
          <FlowCard
            title="Total Withdrawal"
            monthValue={WITHDRAWAL_SERIES[8]}
            series={WITHDRAWAL_SERIES}
            color="#e11d48"
            icon={<ArrowUpRight className="h-4 w-4" />}
            delay={0.08}
            goodWhenUp={false}
          />
        </div>
        <Reveal className="xl:col-span-2">
          <BalancePanel />
        </Reveal>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Reveal className="xl:col-span-2">
          <Panel>
            <PanelHeader
              icon={<Banknote className="h-5 w-5" />}
              title="Recent transactions"
              subtitle="Latest activity across all accounts"
              tint="#059669"
              action={
                <button
                  type="button"
                  onClick={() => navigate("/portal/transactions")}
                  className="inline-flex items-center gap-1 text-[13px] font-extrabold text-[#003478] hover:underline"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </button>
              }
            />
            <ul className="divide-y divide-slate-50 px-2 pb-2 pt-2">
              {recent.map((t) => {
                const credit = t.credit > 0;
                const debit = t.debit > 0;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/portal/transactions?q=${t.id.slice(0, 8)}`)
                      }
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${credit ? "bg-emerald-100 text-emerald-700" : debit ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {credit ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-slate-800">
                          {t.account}
                        </span>
                        <span className="block truncate font-mono text-[11px] text-slate-400">
                          {t.id} · {t.datetime.split("|")[0].trim()}
                        </span>
                      </span>
                      <span className="hidden sm:block">
                        <StatusPill status={t.status} />
                      </span>
                      <span
                        className={`shrink-0 text-[13px] font-black tabular-nums ${credit ? "text-emerald-600" : debit ? "text-rose-600" : "text-slate-400"}`}
                      >
                        {credit ? "+" : debit ? "−" : ""}
                        {fmtMoney(credit ? t.credit : t.debit, t.currency)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </Reveal>
        <Reveal delay={0.08}>
          <Panel className="h-full">
            <PanelHeader
              icon={<PiggyBank className="h-5 w-5" />}
              title="Activity timeline"
              subtitle="Auditable event trail"
              tint="#7c3aed"
            />
            <ol className="relative space-y-5 px-6 py-5 before:absolute before:bottom-6 before:left-[29px] before:top-6 before:w-px before:bg-slate-200">
              {TIMELINE.map((e) => (
                <li key={e.id} className="relative flex gap-3.5">
                  <span
                    className={`relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white ${TONE_BG[e.tone]}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-slate-800">
                      {e.label}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {e.detail}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {e.time}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}
