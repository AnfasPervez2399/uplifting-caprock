import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Clock, Download, Plus, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState, Fragment } from "react";
import { useSearchParams } from "react-router-dom";
import { CASH_ACCOUNTS, TRANSACTIONS, fmtMoney, type PortalTransaction } from "../data";
import { EmptyState, Modal, Panel, Reveal, StatusPill, pushToast } from "../components";

const PAGE_SIZES = [5, 10, 20];
const STATUS_FILTERS = ["All statuses", "Approved", "Pending", "Rejected"];
const RANGES = ["All time", "Last 7 days", "Last 30 days", "Last 90 days"];

function parseDate(dt: string): Date {
  const [d, t] = dt.split("|").map((s) => s.trim());
  const [dd, mm, yyyy] = d.split("/").map(Number);
  const [hh, mi, ss] = (t || "0:0:0").split(":").map(Number);
  return new Date(yyyy, mm - 1, dd, hh, mi, ss);
}

export default function Transactions() {
  const [params] = useSearchParams();
  const [rows, setRows] = useState<PortalTransaction[]>(TRANSACTIONS);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [status, setStatus] = useState("All statuses");
  const [account, setAccount] = useState("All accounts");
  const [range, setRange] = useState("All time");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [reportMenu, setReportMenu] = useState(false);
  const [form, setForm] = useState({ account: CASH_ACCOUNTS[0].name, kind: "Credit", amount: "", currency: "AUD" });

  useEffect(() => {
    setQuery(params.get("q") ?? "");
    setPage(0);
  }, [params]);

  const filtered = useMemo(() => {
    const now = new Date(2026, 8, 29);
    const days = range === "Last 7 days" ? 7 : range === "Last 30 days" ? 30 : range === "Last 90 days" ? 90 : Infinity;
    return rows
      .filter((t) => (status === "All statuses" || t.status === status))
      .filter((t) => (account === "All accounts" || t.account === account))
      .filter((t) => (now.getTime() - parseDate(t.datetime).getTime()) / 86400000 <= days)
      .filter((t) => `${t.id} ${t.account} ${t.reference} ${t.channel}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (parseDate(a.datetime).getTime() - parseDate(b.datetime).getTime()) * sortDir);
  }, [rows, status, account, range, query, sortDir]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const totals = useMemo(
    () => ({
      debit: filtered.reduce((s, t) => s + t.debit * t.convertRate, 0),
      credit: filtered.reduce((s, t) => s + t.credit * t.convertRate, 0),
    }),
    [filtered],
  );
  const clearAll = () => {
    setQuery("");
    setStatus("All statuses");
    setAccount("All accounts");
    setRange("All time");
    setPage(0);
  };

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#003478]">Money movement</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-[28px]">Transactions History</h1>
            <p className="mt-1 text-[13px] text-slate-500">
              {filtered.length} records · <span className="font-bold text-rose-600">{fmtMoney(totals.debit)} out</span> ·{" "}
              <span className="font-bold text-emerald-600">{fmtMoney(totals.credit)} in</span> (AUD-equiv)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#003478] px-4 py-2.5 text-[13px] font-extrabold text-white shadow transition hover:bg-[#002b63]"
            >
              <Plus className="h-4 w-4" /> Add Transaction
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setReportMenu((o) => !o)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-extrabold text-slate-700 shadow-sm transition hover:border-[#003478] hover:text-[#003478]"
              >
                <Download className="h-4 w-4" /> Download Report
                <ChevronDown className={`h-4 w-4 transition-transform ${reportMenu ? "rotate-180" : ""}`} />
              </button>
              {reportMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setReportMenu(false)} />
                  <ul className="absolute right-0 z-30 mt-1.5 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                    {["PDF report", "Excel workbook", "CSV export"].map((f) => (
                      <li key={f}>
                        <button
                          type="button"
                          onClick={() => {
                            setReportMenu(false);
                            pushToast("Export started", `${f} · ${filtered.length} rows.`);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                          {f}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <Panel className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
              Show Records
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-[13px] font-extrabold text-slate-800 outline-none focus:border-[#003478]"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <div className="relative min-w-[180px] flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder="Search Here"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[13px] font-medium outline-none transition placeholder:text-slate-400 focus:border-[#003478] focus:bg-white focus:ring-4 focus:ring-[#003478]/10"
              />
            </div>
            <select
              value={range}
              onChange={(e) => {
                setRange(e.target.value);
                setPage(0);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-700 outline-none focus:border-[#003478]"
              aria-label="Select date range"
            >
              {RANGES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <select
              value={account}
              onChange={(e) => {
                setAccount(e.target.value);
                setPage(0);
              }}
              className="h-10 max-w-[220px] rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-700 outline-none focus:border-[#003478]"
              aria-label="Select account"
            >
              <option>All accounts</option>
              {CASH_ACCOUNTS.map((a) => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-700 outline-none focus:border-[#003478]"
              aria-label="Filter by status"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={clearAll}
              className="text-[13px] font-extrabold text-rose-600 underline-offset-2 hover:underline"
            >
              Clear All
            </button>
            <button
              type="button"
              aria-label="Refresh transactions"
              onClick={() => pushToast("Refreshed", "Latest ledger entries loaded.", "blue")}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:rotate-90 hover:text-[#003478]"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </Panel>
      </Reveal>

      <Reveal delay={0.1}>
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3.5">
                    <button type="button" onClick={() => setSortDir((d) => (d === 1 ? -1 : 1))} className="inline-flex items-center gap-1 hover:text-slate-900">
                      Date & Time <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sortDir === 1 ? "rotate-180" : ""}`} />
                    </button>
                  </th>
                  <th className="px-4 py-3.5">Transaction ID</th>
                  <th className="px-4 py-3.5">Account Name</th>
                  <th className="px-4 py-3.5 text-right">Convert Rate</th>
                  <th className="px-4 py-3.5">Txn Currency</th>
                  <th className="px-4 py-3.5 text-right">Debit</th>
                  <th className="px-4 py-3.5 text-right">Credit</th>
                  <th className="px-4 py-3.5 text-right">Running Balance</th>
                  <th className="px-4 py-3.5">Txn Status</th>
                  <th className="px-4 py-3.5">Gateway</th>
                  <th className="px-4 py-3.5"><span className="sr-only">Expand</span></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {visible.map((t) => (
                    <Fragment key={t.id}>
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-slate-50 transition-colors last:border-0 hover:bg-[#003478]/[.03]"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-300" />{t.datetime}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] font-bold text-slate-700">{t.id}</td>
                        <td className="max-w-[170px] truncate px-4 py-3 text-xs font-bold text-slate-800">{t.account}</td>
                        <td className="px-4 py-3 text-right text-xs font-bold tabular-nums text-slate-600">{t.convertRate.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs font-extrabold text-slate-700">{t.currency}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-[13px] font-black tabular-nums text-rose-600">
                          {t.debit ? fmtMoney(t.debit, t.currency) : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-[13px] font-black tabular-nums text-emerald-600">
                          {t.credit ? fmtMoney(t.credit, t.currency) : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold tabular-nums text-slate-700">
                          {t.runningBalance.toLocaleString("en-AU", { maximumFractionDigits: 2 })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3"><StatusPill status={t.status} pulse={t.status === "Pending"} /></td>
                        <td className="whitespace-nowrap px-4 py-3"><StatusPill status={t.gateway} /></td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            aria-label={`Details for ${t.id}`}
                            onClick={() => setExpanded((e) => (e === t.id ? null : t.id))}
                            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${expanded === t.id ? "rotate-180" : ""}`} />
                          </button>
                        </td>
                      </motion.tr>
                      {expanded === t.id && (
                        <motion.tr
                          key={`${t.id}-detail`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-slate-100 bg-slate-50/60"
                        >
                          <td colSpan={11} className="px-4 py-3">
                            <div className="grid gap-2 text-xs sm:grid-cols-4">
                              <p><span className="font-bold text-slate-400">REFERENCE · </span><span className="font-bold text-slate-700">{t.reference}</span></p>
                              <p><span className="font-bold text-slate-400">CHANNEL · </span><span className="font-bold text-slate-700">{t.channel}</span></p>
                              <p><span className="font-bold text-slate-400">AUD EQUIVALENT · </span><span className="font-bold text-slate-700">{fmtMoney((t.credit || t.debit) * t.convertRate)}</span></p>
                              <p>
                                <button
                                  type="button"
                                  onClick={() => pushToast("Receipt sent", `${t.reference} emailed to you.`)}
                                  className="font-extrabold text-[#003478] hover:underline"
                                >
                                  Email receipt →
                                </button>
                              </p>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </Fragment>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {!visible.length && (
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="No transactions found"
              detail="Adjust your search or clear the filters to see the full ledger."
              action={
                <button type="button" onClick={clearAll} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white">
                  Clear All
                </button>
              }
            />
          )}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 px-5 py-3.5">
            <p className="text-xs font-semibold text-slate-500">
              Showing {visible.length} of {filtered.length} · Page {safePage + 1} of {pages}
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-600 transition hover:border-[#003478] hover:text-[#003478] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={safePage >= pages - 1}
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-600 transition hover:border-[#003478] hover:text-[#003478] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </Panel>
      </Reveal>

      <Modal open={modal} onClose={() => setModal(false)} title="Add transaction" subtitle="Records instantly against the selected account">
        <div className="grid gap-3.5">
          <div>
            <label className="text-xs font-bold text-slate-600" htmlFor="txn-acct">Account</label>
            <select
              id="txn-acct"
              value={form.account}
              onChange={(e) => setForm((f) => ({ ...f, account: e.target.value }))}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#003478]"
            >
              {CASH_ACCOUNTS.map((a) => (
                <option key={a.id} value={a.name}>{a.name} ({a.currency})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-600" htmlFor="txn-kind">Type</label>
              <select
                id="txn-kind"
                value={form.kind}
                onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-bold outline-none focus:border-[#003478]"
              >
                <option>Credit</option>
                <option>Debit</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600" htmlFor="txn-amt">Amount</label>
              <input
                id="txn-amt"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-medium outline-none focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/10"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600" htmlFor="txn-ccy">Currency</label>
              <select
                id="txn-ccy"
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-bold outline-none focus:border-[#003478]"
              >
                {["AUD", "USD", "EUR", "GBP", "SGD", "INR"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            disabled={!Number(form.amount)}
            onClick={() => {
              const amount = Number(form.amount);
              const hex = Array.from({ length: 14 }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join("");
              const now = new Date();
              const dd = String(now.getDate()).padStart(2, "0");
              const mm = String(now.getMonth() + 1).padStart(2, "0");
              const row: PortalTransaction = {
                id: hex,
                datetime: `${dd}/${mm}/${now.getFullYear()} | ${now.toTimeString().slice(0, 8)}`,
                account: form.account,
                convertRate: 1,
                currency: form.currency,
                debit: form.kind === "Debit" ? amount : 0,
                credit: form.kind === "Credit" ? amount : 0,
                runningBalance: 0,
                status: "Pending",
                gateway: "Pending",
                reference: `WEB-${Math.floor(10000 + Math.random() * 89999)}`,
                channel: "Client portal",
              };
              setRows((r) => [row, ...r]);
              setModal(false);
              setForm({ account: CASH_ACCOUNTS[0].name, kind: "Credit", amount: "", currency: "AUD" });
              setSortDir(-1);
              setPage(0);
              pushToast("Transaction recorded", `${form.kind} of ${fmtMoney(amount, form.currency)}.`);
            }}
            className="mt-1 h-11 w-full rounded-xl bg-[#003478] text-sm font-extrabold text-white transition hover:bg-[#002b63] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Record transaction
          </button>
        </div>
      </Modal>
    </div>
  );
}
