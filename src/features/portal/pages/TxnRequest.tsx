import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Repeat, Send } from "lucide-react";
import { useState } from "react";
import { CASH_ACCOUNTS, TXN_REQUESTS, fmtMoney, type TxnRequest } from "../data";
import { Panel, PanelHeader, Reveal, StatusPill, pushToast } from "../components";

const TYPES = [
  { id: "Deposit", icon: ArrowDownRight, bg: "bg-emerald-100 text-emerald-700" },
  { id: "Withdrawal", icon: ArrowUpRight, bg: "bg-rose-100 text-rose-700" },
  { id: "Internal transfer", icon: Repeat, bg: "bg-sky-100 text-sky-700" },
] as const;

const FLOW = ["Requested", "In review", "Approved", "Processing"];

export default function TxnRequest() {
  const [items, setItems] = useState<TxnRequest[]>(TXN_REQUESTS);
  const [type, setType] = useState<TxnRequest["type"]>("Deposit");
  const [account, setAccount] = useState(CASH_ACCOUNTS[0].name);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [notes, setNotes] = useState("");

  const submit = () => {
    const id = `REQ-${2042 + items.length}`;
    setItems((list) => [
      { id, type, account, amount: Number(amount), currency, requested: "29 Sep 2026", status: "In review" },
      ...list,
    ]);
    setAmount("");
    setNotes("");
    pushToast("Request lodged", `${id} · ${type} ${fmtMoney(Number(amount), currency)}.`);
  };

  return (
    <div className="space-y-5">
      <Reveal>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#003478]">Move money</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-[28px]">Transaction Request</h1>
          <p className="mt-1 text-[13px] text-slate-500">Deposits, withdrawals and internal transfers — approved within one business day.</p>
        </div>
      </Reveal>

      <div className="grid gap-5 xl:grid-cols-5">
        <Reveal className="xl:col-span-2">
          <Panel className="h-full p-5 sm:p-6">
            <p className="text-[13px] font-extrabold text-slate-900">New request</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {TYPES.map((t) => {
                const selected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-3.5 text-[11px] font-extrabold transition ${
                      selected ? "border-[#003478] bg-[#003478]/5 text-[#003478]" : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span className={`grid h-9 w-9 place-items-center rounded-xl ${t.bg}`}>
                      <t.icon className="h-4 w-4" />
                    </span>
                    {t.id}
                  </button>
                );
              })}
            </div>
            <label className="mt-4 block text-xs font-bold text-slate-600" htmlFor="rq-acct">Account</label>
            <select
              id="rq-acct"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#003478]"
            >
              {CASH_ACCOUNTS.map((a) => (
                <option key={a.id} value={a.name}>{a.name} ({a.currency})</option>
              ))}
            </select>
            <div className="mt-3.5 grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-600" htmlFor="rq-amt">Amount</label>
                <input
                  id="rq-amt"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/10"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600" htmlFor="rq-ccy">Currency</label>
                <select
                  id="rq-ccy"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#003478]"
                >
                  {["AUD", "USD", "EUR", "GBP", "SGD", "INR"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="mt-3.5 block text-xs font-bold text-slate-600" htmlFor="rq-notes">Notes <span className="font-semibold text-slate-400">(optional)</span></label>
            <textarea
              id="rq-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Reference for the operations team…"
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/10"
            />
            <button
              type="button"
              disabled={!Number(amount)}
              onClick={submit}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#003478] text-sm font-extrabold text-white transition hover:bg-[#002b63] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Send className="h-4 w-4" /> Lodge {type.toLowerCase()} request
            </button>
          </Panel>
        </Reveal>

        <Reveal delay={0.06} className="xl:col-span-3">
          <Panel className="h-full">
            <PanelHeader icon={<Send className="h-5 w-5" />} title="Request tracker" subtitle={`${items.length} requests`} tint="#2563eb" />
            <ul className="space-y-3 px-5 py-5 sm:px-6">
              {items.map((r, i) => {
                const flowIdx = r.status === "In review" ? 1 : r.status === "Approved" ? 2 : r.status === "Processing" ? 3 : 1;
                const failed = r.status === "Declined";
                return (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    className="rounded-2xl border border-slate-200/80 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="text-[14px] font-extrabold text-slate-900">
                        {r.type} · <span className="tabular-nums">{fmtMoney(r.amount, r.currency)}</span>
                      </p>
                      <span className="ml-auto"><StatusPill status={r.status} pulse={r.status === "In review" || r.status === "Processing"} /></span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      <span className="font-bold text-slate-600">{r.id}</span> · {r.account} · {r.requested}
                    </p>
                    {!failed ? (
                      <div className="mt-3 flex gap-1">
                        {FLOW.map((_, si) => (
                          <span key={si} className={`h-1.5 flex-1 rounded-full ${si <= flowIdx ? "bg-[#003478]" : "bg-slate-200"}`} />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                        Declined — insufficient cleared funds. Contact your adviser to re-lodge.
                      </p>
                    )}
                    {r.status === "In review" && (
                      <button
                        type="button"
                        onClick={() => {
                          setItems((list) => list.filter((x) => x.id !== r.id));
                          pushToast("Request cancelled", r.id, "rose");
                        }}
                        className="mt-2.5 text-xs font-extrabold text-rose-600 hover:underline"
                      >
                        Cancel request
                      </button>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}
