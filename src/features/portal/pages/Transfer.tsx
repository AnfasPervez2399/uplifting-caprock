import { motion } from "framer-motion";
import { ArrowLeftRight, Check, Package, Plus, Truck } from "lucide-react";
import { useState } from "react";
import { TRANSFERS, type Transfer } from "../data";
import { Modal, Panel, PanelHeader, Reveal, StatusPill, pushToast } from "../components";

const STEPS = ["Lodged", "In transit", "Settled"];

function stepIndex(status: Transfer["status"]): number {
  return status === "Settled" ? 2 : status === "In transit" ? 1 : 0;
}

export default function Transfer() {
  const [items, setItems] = useState<Transfer[]>(TRANSFERS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ asset: "", quantity: "", from: "", to: "My Investment (Securities)" });

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#003478]">Asset movement</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-[28px]">Inspecie Transfer</h1>
            <p className="mt-1 text-[13px] text-slate-500">Move listed securities and bullion between custodians without selling down.</p>
          </div>
          <button
            type="button"
            onClick={() => setModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#003478] px-4 py-2.5 text-[13px] font-extrabold text-white shadow transition hover:bg-[#002b63]"
          >
            <Plus className="h-4 w-4" /> New transfer
          </button>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Package, title: "1 · Lodge", detail: "Tell us the asset, quantity and delivering custodian.", bg: "bg-blue-50 text-blue-700" },
          { icon: Truck, title: "2 · We chase", detail: "Caprock coordinates settlement with both custodians.", bg: "bg-violet-50 text-violet-700" },
          { icon: Check, title: "3 · Settled", detail: "Assets land in your account — usually 2–5 days.", bg: "bg-emerald-50 text-emerald-700" },
        ].map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
          >
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${s.bg}`}>
              <s.icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[13px] font-extrabold text-slate-900">{s.title}</span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">{s.detail}</span>
            </span>
          </motion.div>
        ))}
      </div>

      <Reveal>
        <Panel>
          <PanelHeader icon={<ArrowLeftRight className="h-5 w-5" />} title="Transfer tracking" subtitle={`${items.length} transfers on record`} tint="#7c3aed" />
          <ul className="space-y-3 px-5 py-5 sm:px-6">
            {items.map((t, i) => {
              const idx = stepIndex(t.status);
              return (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                  className="rounded-2xl border border-slate-200/80 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="min-w-0 flex-1 text-[14px] font-extrabold text-slate-900">{t.asset}</p>
                    <StatusPill status={t.status} pulse={t.status === "In transit"} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    <span className="font-bold text-slate-600">{t.id}</span> · {t.quantity} · lodged {t.lodged}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    <span className="font-semibold">{t.from}</span>
                    <span className="mx-1.5 text-slate-300">→</span>
                    <span className="font-semibold">{t.to}</span>
                  </p>
                  <div className="mt-3 flex items-center gap-1.5">
                    {STEPS.map((s, si) => (
                      <div key={s} className="flex flex-1 items-center gap-1.5 last:flex-none">
                        <div className="flex flex-1 flex-col gap-1">
                          <span className={`h-1.5 rounded-full ${si <= idx ? "bg-emerald-500" : "bg-slate-200"}`} />
                          <span className={`text-[10px] font-bold ${si <= idx ? "text-emerald-700" : "text-slate-400"}`}>{s}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {t.status === "Action required" && (
                    <button
                      type="button"
                      onClick={() => pushToast("Vault release confirmed", `${t.id} is moving again.`, "blue")}
                      className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700"
                    >
                      Confirm vault release
                    </button>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </Panel>
      </Reveal>

      <Modal open={modal} onClose={() => setModal(false)} title="New inspecie transfer" subtitle="We handle the custodian paperwork">
        <div className="grid gap-3.5">
          {(
            [
              ["asset", "Asset (e.g. BHP Group Ltd × 4,200)", "BHP Group Ltd (BHP) × 4,200"],
              ["quantity", "Quantity", "4,200 units"],
              ["from", "Delivering custodian / broker", "External broker — AUS"],
            ] as const
          ).map(([key, label, ph]) => (
            <div key={key}>
              <label className="text-xs font-bold text-slate-600" htmlFor={`tr-${key}`}>{label}</label>
              <input
                id={`tr-${key}`}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={ph}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/10"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-slate-600" htmlFor="tr-to">Receiving Caprock account</label>
            <select
              id="tr-to"
              value={form.to}
              onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#003478]"
            >
              <option>My Investment (Securities)</option>
              <option>Private Wealth (Commodities)</option>
              <option>Cash Account 1 new ok</option>
            </select>
          </div>
          <button
            type="button"
            disabled={!form.asset.trim() || !form.from.trim()}
            onClick={() => {
              setItems((list) => [
                { id: `IT-${8800 + list.length}`, asset: form.asset.trim(), quantity: form.quantity.trim() || "—", from: form.from.trim(), to: form.to, lodged: "29 Sep 2026", status: "In transit" },
                ...list,
              ]);
              setModal(false);
              setForm({ asset: "", quantity: "", from: "", to: "My Investment (Securities)" });
              pushToast("Transfer lodged", "Settlement team notified.");
            }}
            className="mt-1 h-11 w-full rounded-xl bg-[#003478] text-sm font-extrabold text-white hover:bg-[#002b63] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Lodge transfer
          </button>
        </div>
      </Modal>
    </div>
  );
}
