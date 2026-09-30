import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Coins, Percent, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HOLDINGS, MONTHS, fmtMoney } from "../data";
import { AreaChart, CountUp, Donut, Panel, PanelHeader, Reveal, SegmentedControl, Sparkline, pushToast } from "../components";

const CLASS_COLORS: Record<string, string> = {
  Equities: "#2563eb",
  "Fixed income": "#059669",
  Alternatives: "#7c3aed",
  Cash: "#d97706",
};

const PERF_SERIES = [262.1, 265.4, 261.8, 268.2, 272.5, 270.1, 276.4, 280.2, 278.6, 283.1, 281.4, 284.6];

export default function Investments() {
  const navigate = useNavigate();
  const [range, setRange] = useState("1Y");
  const total = HOLDINGS.reduce((s, h) => s + h.value, 0);
  const dayPnl = HOLDINGS.reduce((s, h) => s + (h.value * h.dayPct) / 100, 0);
  const best = [...HOLDINGS].sort((a, b) => b.dayPct - a.dayPct)[0];
  const n = range === "1M" ? 1 : range === "3M" ? 3 : range === "6M" ? 6 : 12;

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#003478]">Portfolio</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-[28px]">My Investments</h1>
            <p className="mt-1 text-[13px] text-slate-500">{HOLDINGS.length} holdings · rebalanced quarterly by your adviser</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/portal/hub")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#003478] px-4 py-2.5 text-[13px] font-extrabold text-white shadow transition hover:bg-[#002b63]"
          >
            Explore opportunities <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total invested", value: <CountUp value={total} format={(v) => fmtMoney(v)} />, sub: "+8.6% since inception", icon: Briefcase, bg: "from-[#003478] to-[#0060a8]" },
          { label: "Today's movement", value: <CountUp value={dayPnl} format={(v) => `${v >= 0 ? "+" : "−"}${fmtMoney(Math.abs(v))}`} />, sub: dayPnl >= 0 ? "Markets are up" : "Markets are soft", icon: dayPnl >= 0 ? TrendingUp : TrendingDown, bg: "from-emerald-600 to-teal-500" },
          { label: "Best performer", value: best.ticker, sub: `${best.name} · +${best.dayPct}%`, icon: Percent, bg: "from-violet-600 to-fuchsia-500" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.45 }}
            className={`rounded-2xl bg-gradient-to-br p-5 text-white shadow ${s.bg}`}
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <s.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-white/70">{s.label}</p>
            <p className="mt-1 truncate text-2xl font-black tabular-nums">{s.value}</p>
            <p className="mt-1 text-xs font-semibold text-white/80">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        <Reveal className="xl:col-span-3">
          <Panel className="h-full overflow-hidden">
            <PanelHeader
              icon={<TrendingUp className="h-5 w-5" />}
              title="Performance"
              subtitle="Invested value · AUD thousands"
              tint="#2563eb"
              action={<SegmentedControl options={["1M", "3M", "6M", "1Y"]} value={range} onChange={setRange} />}
            />
            <div className="px-2 pb-3 pt-2 sm:px-4">
              <AreaChart data={PERF_SERIES.slice(-n)} labels={MONTHS.slice(-n)} color="#2563eb" animKey={range} formatY={(v) => `$${v.toFixed(1)}k`} />
            </div>
          </Panel>
        </Reveal>
        <Reveal delay={0.06} className="xl:col-span-2">
          <Panel className="h-full p-5 sm:p-6">
            <PanelHeader icon={<Coins className="h-5 w-5" />} title="Asset allocation" subtitle="By asset class" tint="#7c3aed" />
            <div className="pt-4">
              <Donut
                segments={["Equities", "Fixed income", "Alternatives", "Cash"].map((c) => ({
                  label: c,
                  value: HOLDINGS.filter((h) => h.assetClass === c).reduce((s, h) => s + h.value, 0),
                  color: CLASS_COLORS[c],
                }))}
                centerLabel="INVESTED"
                centerValue={fmtMoney(total).replace(".00", "")}
              />
            </div>
          </Panel>
        </Reveal>
      </div>

      <Reveal>
        <Panel>
          <PanelHeader icon={<Briefcase className="h-5 w-5" />} title="Holdings" subtitle="Tap a holding for the factsheet" tint="#059669" />
          <ul className="divide-y divide-slate-50 px-2 pb-2 pt-2">
            {HOLDINGS.map((h) => {
              const up = h.dayPct >= 0;
              return (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => pushToast(h.ticker, `${h.name} factsheet opening.`, "blue")}
                    className="flex w-full flex-wrap items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black text-white" style={{ background: CLASS_COLORS[h.assetClass] }}>
                      {h.ticker.slice(0, 2)}
                    </span>
                    <span className="min-w-[180px] flex-1">
                      <span className="block truncate text-[13px] font-extrabold text-slate-800">{h.name}</span>
                      <span className="block text-[11px] font-bold text-slate-400">{h.ticker} · {h.assetClass}</span>
                    </span>
                    <span className="hidden md:block"><Sparkline points={h.spark} color={CLASS_COLORS[h.assetClass]} id={h.id} width={110} height={32} /></span>
                    <span className="text-right">
                      <span className="block text-[14px] font-black tabular-nums text-slate-900">{fmtMoney(h.value)}</span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold tabular-nums ${up ? "text-emerald-600" : "text-rose-600"}`}>
                        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{up ? "+" : ""}{h.dayPct}% today
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </Reveal>
    </div>
  );
}
