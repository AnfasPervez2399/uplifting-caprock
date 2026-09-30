import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Info, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ---------------------------------- Reveal --------------------------------- */

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------- CountUp -------------------------------- */

export function CountUp({
  value,
  format,
  duration = 1100,
}: {
  value: number;
  format: (v: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const first = useRef(true);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const from = first.current ? value * 0.35 : display;
    first.current = false;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{format(display)}</>;
}

/* --------------------------------- Sparkline ------------------------------- */

export function Sparkline({
  points,
  color,
  width = 120,
  height = 36,
  id,
}: {
  points: number[];
  color: string;
  width?: number;
  height?: number;
  id: string;
}) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "-");
  const coords = points.map(
    (p, i) =>
      `${(i / (points.length - 1)) * width},${height - 4 - ((p - min) / span) * (height - 8)}`,
  );
  const line = `M${coords.join(" L")}`;
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={`spark-${safeId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#spark-${safeId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
    </svg>
  );
}

/* --------------------------------- AreaChart ------------------------------- */

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export function AreaChart({
  data,
  labels,
  color = "#003478",
  formatY,
  height = 260,
  animKey,
}: {
  data: number[];
  labels: string[];
  color?: string;
  formatY: (v: number) => string;
  height?: number;
  animKey: string;
}) {
  const W = 720;
  const H = 260;
  const PAD = { l: 8, r: 8, t: 14, b: 30 };
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const rawMax = Math.max(...data);
  const rawMin = Math.min(...data);
  const rawSpan = rawMax - rawMin || 1;
  const max = rawMax + rawSpan * 0.12;
  const min = rawMin > 0 ? rawMin - rawSpan * 0.35 : rawMin;
  const span = max - min || 1;
  const x = (i: number) => PAD.l + (i / Math.max(1, data.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - (v - min) / span) * (H - PAD.t - PAD.b);
  const pts = data.map((v, i) => ({ x: x(i), y: y(v) }));
  const line = smoothPath(pts);
  const area = `${line} L${x(data.length - 1)},${H - PAD.b} L${x(0)},${H - PAD.b} Z`;
  const gridYs = [0.25, 0.5, 0.75].map((t) => PAD.t + t * (H - PAD.t - PAD.b));

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const px = ((e.clientX - rect.left) / rect.width) * W;
      let best = 0;
      let bestDist = Infinity;
      data.forEach((_, i) => {
        const d = Math.abs(x(i) - px);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setHover(best);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.length],
  );

  const gid = useMemo(() => Math.random().toString(36).slice(2), []);
  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        style={{ height }}
        className="w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="Portfolio balance chart"
      >
        <defs>
          <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {gridYs.map((gy) => (
          <line key={gy} x1={PAD.l} x2={W - PAD.r} y1={gy} y2={gy} stroke="#e2e8f0" strokeDasharray="3 5" />
        ))}
        <motion.path
          key={`a-${animKey}`}
          d={area}
          fill={`url(#area-${gid})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        />
        <motion.path
          key={`l-${animKey}`}
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} stroke={color} strokeOpacity="0.4" strokeDasharray="4 3" />
            <circle cx={x(hover)} cy={y(data[hover])} r="6" fill="#fff" stroke={color} strokeWidth="3" />
          </g>
        )}
        {labels.map((l, i) =>
          data.length > 6 && i % 2 === 1 ? null : (
            <text key={`${l}-${i}`} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fontWeight="600" fill="#64748b">
              {l}
            </text>
          ),
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%`, top: 0 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{labels[hover]}</p>
          <p className="text-sm font-extrabold text-slate-900">{formatY(data[hover])}</p>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- Donut --------------------------------- */

export function Donut({
  segments,
  size = 190,
  thickness = 22,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel: string;
  centerValue: string;
}) {
  const total = segments.reduce((s, g) => s + g.value, 0) || 1;
  const R = (size - thickness) / 2;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        initial={{ opacity: 0, scale: 0.85, rotate: -30 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        role="img"
        aria-label="Asset allocation chart"
      >
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#eef2f7" strokeWidth={thickness} />
        {segments.map((s) => {
          const frac = s.value / total;
          const dash = `${frac * C} ${C}`;
          const offset = -acc * C;
          acc += frac;
          return (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dasharray .6s ease, stroke-dashoffset .6s ease" }}
            />
          );
        })}
        <text x="50%" y="47%" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">
          {centerLabel}
        </text>
        <text x="50%" y="58%" textAnchor="middle" fontSize="19" fontWeight="800" fill="#0f172a">
          {centerValue}
        </text>
      </motion.svg>
      <ul className="w-full min-w-0 flex-1 space-y-2.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="min-w-0 flex-1 truncate font-medium text-slate-600">{s.label}</span>
            <span className="font-extrabold tabular-nums text-slate-900">{((s.value / total) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------- Panels --------------------------------- */

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </div>
  );
}

export function PanelHeader({
  icon,
  title,
  subtitle,
  action,
  tint = "#003478",
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  tint?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-5 pt-5 sm:px-6">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-sm"
        style={{ background: `linear-gradient(135deg, ${tint}, ${tint}bb)` }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[15px] font-extrabold text-slate-900">{title}</h2>
        {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* --------------------------------- StatusPill ------------------------------ */

const PILL: Record<string, string> = {
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Settled: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Open: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  "In review": "bg-amber-50 text-amber-700 ring-amber-200",
  "In transit": "bg-sky-50 text-sky-700 ring-sky-200",
  Processing: "bg-sky-50 text-sky-700 ring-sky-200",
  Review: "bg-sky-50 text-sky-700 ring-sky-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  Declined: "bg-rose-50 text-rose-700 ring-rose-200",
  Failed: "bg-rose-50 text-rose-700 ring-rose-200",
  "Action required": "bg-rose-50 text-rose-700 ring-rose-200",
  "Closing soon": "bg-violet-50 text-violet-700 ring-violet-200",
  Dormant: "bg-slate-100 text-slate-500 ring-slate-200",
};

export function StatusPill({ status, pulse = false }: { status: string; pulse?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${PILL[status] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}
    >
      {pulse && <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>}
      {status}
    </span>
  );
}

/* ------------------------------ SegmentedControl --------------------------- */

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 p-1">
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`relative rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${active ? "text-white" : "text-slate-500 hover:text-slate-800"}`}
          >
            {active && (
              <motion.span
                layoutId="seg-thumb"
                className="absolute inset-0 rounded-full bg-slate-900"
                transition={{ type: "spring", stiffness: 480, damping: 36 }}
              />
            )}
            <span className="relative">{o}</span>
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------- CurrencySelect -------------------------- */

export function CurrencySelect({
  value,
  onChange,
  options,
  dark = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  dark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-extrabold backdrop-blur transition ${
          dark ? "bg-white/15 text-white hover:bg-white/25" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        {value}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <motion.ul
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 z-30 mt-1.5 max-h-52 w-28 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
            >
              {options.map((o) => (
                <li key={o}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                      o === value ? "bg-[#003478]/10 text-[#003478]" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {o}
                    {o === value && <Check className="h-3.5 w-3.5" />}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------- KebabMenu ------------------------------- */

export function KebabMenu({
  items,
  label = "Row actions",
}: {
  items: { label: string; danger?: boolean; onSelect: () => void }[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <span className="text-lg font-black leading-none tracking-tighter">···</span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <motion.ul
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
            >
              {items.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => {
                      item.onSelect();
                      setOpen(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                      item.danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------ Modal -------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 26, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} overflow-hidden rounded-2xl bg-white shadow-2xl`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
                {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------------- Toaster ------------------------------- */

export interface ToastData {
  id: number;
  title: string;
  detail?: string;
  tone: "emerald" | "blue" | "amber" | "rose" | "violet";
}

let toastId = 0;
const toastListeners = new Set<(t: ToastData[]) => void>();
let toastState: ToastData[] = [];

export function pushToast(title: string, detail?: string, tone: ToastData["tone"] = "emerald") {
  toastId += 1;
  toastState = [...toastState.slice(-2), { id: toastId, title, detail, tone }];
  toastListeners.forEach((l) => l(toastState));
  const id = toastId;
  window.setTimeout(() => {
    toastState = toastState.filter((t) => t.id !== id);
    toastListeners.forEach((l) => l(toastState));
  }, 3600);
}

const TOAST_TONE: Record<ToastData["tone"], string> = {
  emerald: "bg-emerald-500",
  blue: "bg-[#003478]",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  useEffect(() => {
    toastListeners.add(setToasts);
    return () => {
      toastListeners.delete(setToasts);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[320px] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl"
          >
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ${TOAST_TONE[t.tone]}`}>
              {t.tone === "rose" || t.tone === "amber" ? <Info className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-extrabold text-slate-900">{t.title}</p>
              {t.detail && <p className="mt-0.5 truncate text-xs text-slate-500">{t.detail}</p>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------- EmptyState ------------------------------ */

export function EmptyState({
  icon,
  title,
  detail,
  action,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">{icon}</span>
      <p className="mt-4 text-sm font-extrabold text-slate-800">{title}</p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{detail}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
