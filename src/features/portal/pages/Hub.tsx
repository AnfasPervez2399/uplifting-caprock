import { motion } from "framer-motion";
import { ArrowRight, Globe, MapPin, Search, Sparkles, Target } from "lucide-react";
import { useState } from "react";
import { OPPORTUNITIES } from "../data";
import { Modal, Panel, Reveal, StatusPill, pushToast } from "../components";

const RISK_STYLE: Record<string, string> = {
  Conservative: "bg-emerald-100 text-emerald-700",
  Balanced: "bg-sky-100 text-sky-700",
  Growth: "bg-amber-100 text-amber-700",
  Aggressive: "bg-rose-100 text-rose-700",
};

export default function Hub() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All regions");
  const [active, setActive] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const regions = ["All regions", ...Array.from(new Set(OPPORTUNITIES.map((o) => o.region)))];
  const filtered = OPPORTUNITIES.filter(
    (o) =>
      (region === "All regions" || o.region === region) &&
      `${o.name} ${o.strategy}`.toLowerCase().includes(query.toLowerCase()),
  );
  const selected = OPPORTUNITIES.find((o) => o.id === active);

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-[#003478] to-sky-600 p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full bg-fuchsia-400/25 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <Sparkles className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Global investor network</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Investment Hub</h1>
              <p className="mt-1 text-[13px] text-white/80">Curated mandates across 6 regions · wholesale access from $100,000</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search mandates…"
                className="h-11 w-full rounded-xl border border-white/25 bg-white/10 pl-10 pr-4 text-sm font-medium text-white outline-none backdrop-blur transition placeholder:text-white/60 focus:border-white/60"
              />
            </div>
          </div>
        </div>
      </Reveal>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {regions.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRegion(r)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition ${region === r ? "bg-slate-900 text-white shadow" : "bg-white text-slate-500 shadow-sm hover:bg-slate-100"}`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
            whileHover={{ y: -4 }}
          >
            <Panel className="flex h-full flex-col p-5 transition-shadow hover:shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-600">
                  <MapPin className="h-3 w-3" /> {o.region}
                </span>
                <StatusPill status={o.status} pulse={o.status === "Closing soon"} />
              </div>
              <p className="mt-3 text-[15px] font-extrabold leading-6 text-slate-900">{o.name}</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">{o.strategy}</p>
              <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                <div className="rounded-xl bg-slate-50 py-2.5">
                  <dt className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wide text-slate-400"><Target className="h-3 w-3" /> Target</dt>
                  <dd className="mt-0.5 text-[13px] font-black text-emerald-600">{o.targetReturn}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 py-2.5">
                  <dt className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Min</dt>
                  <dd className="mt-0.5 text-[13px] font-black text-slate-800">{o.minInvestment}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 py-2.5">
                  <dt className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Risk</dt>
                  <dd className={`mx-auto mt-0.5 w-fit rounded-full px-2 py-0.5 text-[10px] font-extrabold ${RISK_STYLE[o.risk]}`}>{o.risk}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => {
                  setActive(o.id);
                  setAmount("");
                }}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#003478] py-2.5 text-[13px] font-extrabold text-white transition hover:bg-[#002b63]"
              >
                Express interest <ArrowRight className="h-4 w-4" />
              </button>
            </Panel>
          </motion.div>
        ))}
      </div>

      {!filtered.length && (
        <Panel>
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Globe className="h-6 w-6" /></span>
            <p className="mt-4 text-sm font-extrabold text-slate-800">No mandates match</p>
            <p className="mt-1 text-xs text-slate-500">Try a different region or search term.</p>
          </div>
        </Panel>
      )}

      <Modal open={!!selected} onClose={() => setActive(null)} title={selected?.name ?? ""} subtitle={`${selected?.region} · ${selected?.strategy}`}>
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-[13px] leading-6 text-slate-600">
          Minimum <span className="font-extrabold text-slate-900">{selected?.minInvestment}</span> · target{" "}
          <span className="font-extrabold text-emerald-600">{selected?.targetReturn}</span>. Your adviser will confirm
          allocation before anything is drawn down.
        </p>
        <label className="mt-4 block text-xs font-bold text-slate-600" htmlFor="hub-amount">Indicative amount (AUD)</label>
        <input
          id="hub-amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="250,000"
          className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/10"
        />
        <button
          type="button"
          disabled={!Number(amount?.replace(/,/g, ""))}
          onClick={() => {
            setActive(null);
            pushToast("Interest registered", `${selected?.name} · adviser notified.`);
          }}
          className="mt-4 h-11 w-full rounded-xl bg-[#003478] text-sm font-extrabold text-white hover:bg-[#002b63] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Confirm interest
        </button>
      </Modal>
    </div>
  );
}
