import { motion } from "framer-motion";
import { CalendarClock, Download, FileDown, FileText, Plus } from "lucide-react";
import { useState } from "react";
import { REPORT_TYPES } from "../data";
import { Modal, Panel, PanelHeader, Reveal, StatusPill, pushToast } from "../components";

const ACCENT_BG: Record<string, string> = {
  blue: "from-blue-600 to-sky-500",
  violet: "from-violet-600 to-fuchsia-500",
  emerald: "from-emerald-600 to-teal-500",
  amber: "from-amber-500 to-orange-500",
  rose: "from-rose-600 to-pink-500",
};

interface RecentReport {
  id: string;
  name: string;
  format: string;
  created: string;
}

const SCHEDULED = [
  { name: "Monthly valuation pack", cadence: "Monthly", next: "01 Oct 2026" },
  { name: "Quarterly tax estimate", cadence: "Quarterly", next: "15 Oct 2026" },
  { name: "Annual performance review", cadence: "Yearly", next: "05 Jul 2027" },
];

export default function Reports() {
  const [recent, setRecent] = useState<RecentReport[]>([
    { id: "g1", name: "Portfolio Valuation — Aug 2026", format: "PDF", created: "02 Sep 2026" },
    { id: "g2", name: "Transaction Activity — Aug 2026", format: "Excel", created: "01 Sep 2026" },
  ]);
  const [active, setActive] = useState<string | null>(null);
  const [format, setFormat] = useState("PDF");
  const [busy, setBusy] = useState(false);
  const selected = REPORT_TYPES.find((r) => r.id === active);

  const generate = () => {
    if (!selected) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setRecent((r) => [
        { id: `g-${Date.now()}`, name: `${selected.name} — Sep 2026`, format, created: "Just now" },
        ...r,
      ]);
      setActive(null);
      pushToast("Report ready", `${selected.name} (${format}).`);
    }, 1100);
  };

  return (
    <div className="space-y-5">
      <Reveal>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#003478]">Insights</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-[28px]">Reports</h1>
          <p className="mt-1 text-[13px] text-slate-500">Board-grade reporting generated on demand or on schedule.</p>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {REPORT_TYPES.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            whileHover={{ y: -4 }}
          >
            <Panel className="flex h-full flex-col overflow-hidden">
              <div className={`bg-gradient-to-br p-5 text-white ${ACCENT_BG[r.accent]}`}>
                <FileText className="h-6 w-6" />
                <p className="mt-3 text-[15px] font-extrabold leading-6">{r.name}</p>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="min-h-10 text-xs leading-5 text-slate-500">{r.description}</p>
                <p className="mt-2 text-[11px] font-bold text-slate-400">Formats: {r.formats.join(" · ")}</p>
                <button
                  type="button"
                  onClick={() => {
                    setActive(r.id);
                    setFormat(r.formats[0]);
                  }}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-[13px] font-extrabold text-white transition hover:bg-[#003478]"
                >
                  <FileDown className="h-4 w-4" /> Generate
                </button>
              </div>
            </Panel>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Reveal>
          <Panel className="h-full">
            <PanelHeader icon={<FileDown className="h-5 w-5" />} title="Recently generated" subtitle="Ready to download" tint="#059669" />
            <ul className="divide-y divide-slate-50 px-2 py-3">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-[10px] font-black text-emerald-700">
                    {r.format.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-extrabold text-slate-800">{r.name}</span>
                    <span className="block text-[11px] text-slate-400">{r.created}</span>
                  </span>
                  <StatusPill status="Approved" />
                  <button
                    type="button"
                    aria-label={`Download ${r.name}`}
                    onClick={() => pushToast("Download started", r.name)}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white transition hover:bg-[#003478]"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>
        <Reveal delay={0.06}>
          <Panel className="h-full">
            <PanelHeader
              icon={<CalendarClock className="h-5 w-5" />}
              title="Scheduled reports"
              subtitle="Delivered automatically"
              tint="#7c3aed"
              action={
                <button
                  type="button"
                  onClick={() => pushToast("Scheduler", "Pick a report type to schedule it.", "blue")}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600 transition hover:border-[#003478] hover:text-[#003478]"
                >
                  <Plus className="h-3.5 w-3.5" /> New schedule
                </button>
              }
            />
            <ul className="space-y-3 px-5 py-5 sm:px-6">
              {SCHEDULED.map((s) => (
                <li key={s.name} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-extrabold text-slate-800">{s.name}</span>
                    <span className="block text-[11px] font-semibold text-slate-500">{s.cadence} · next run {s.next}</span>
                  </span>
                  <StatusPill status="Active" pulse />
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>
      </div>

      <Modal open={!!selected} onClose={() => setActive(null)} title={`Generate ${selected?.name ?? ""}`} subtitle="Takes about 10 seconds">
        <p className="text-xs font-bold text-slate-600">Choose a format</p>
        <div className="mt-2 flex gap-1.5">
          {selected?.formats.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={`flex-1 rounded-xl border-2 py-2.5 text-[13px] font-extrabold transition ${format === f ? "border-[#003478] bg-[#003478]/5 text-[#003478]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={generate}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#003478] text-sm font-extrabold text-white hover:bg-[#002b63] disabled:opacity-60"
        >
          {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          {busy ? "Generating…" : `Generate ${format}`}
        </button>
      </Modal>
    </div>
  );
}
