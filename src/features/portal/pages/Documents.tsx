import { motion } from "framer-motion";
import { Download, Eye, FileText, FileUp, Landmark, ScrollText, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { DOCUMENTS, type PortalDocument } from "../data";
import { EmptyState, Panel, Reveal, pushToast } from "../components";

const CATS = ["All", "Statements", "Tax", "Identity", "Contracts", "Reports"] as const;

const CAT_ICON: Record<PortalDocument["category"], { icon: typeof FileText; bg: string }> = {
  Statements: { icon: Landmark, bg: "bg-blue-100 text-blue-700" },
  Tax: { icon: ScrollText, bg: "bg-emerald-100 text-emerald-700" },
  Identity: { icon: ShieldCheck, bg: "bg-violet-100 text-violet-700" },
  Contracts: { icon: FileText, bg: "bg-amber-100 text-amber-700" },
  Reports: { icon: ScrollText, bg: "bg-rose-100 text-rose-700" },
};

export default function Documents() {
  const [docs, setDocs] = useState<PortalDocument[]>(DOCUMENTS);
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [query, setQuery] = useState("");
  const [drag, setDrag] = useState(false);
  const filtered = docs.filter(
    (d) => (cat === "All" || d.category === cat) && d.name.toLowerCase().includes(query.toLowerCase()),
  );
  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const incoming: PortalDocument[] = Array.from(files).map((f, i) => ({
      id: `up-${Date.now()}-${i}`,
      name: f.name,
      category: "Statements",
      size: f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`,
      updated: "Just now",
    }));
    setDocs((d) => [...incoming, ...d]);
    pushToast(`${incoming.length} file${incoming.length > 1 ? "s" : ""} uploaded`, "Available under Statements.");
  };

  return (
    <div className="space-y-5">
      <Reveal>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#003478]">Vault</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-[28px]">My Documents</h1>
          <p className="mt-1 text-[13px] text-slate-500">{docs.length} documents · encrypted at rest · retained 7 years</p>
        </div>
      </Reveal>

      <Reveal delay={0.04}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`relative flex flex-col items-center rounded-3xl border-2 border-dashed px-6 py-8 text-center transition ${
            drag ? "border-[#003478] bg-[#003478]/5" : "border-slate-300 bg-white"
          }`}
        >
          <motion.span animate={drag ? { scale: 1.12 } : { scale: 1 }} className="grid h-14 w-14 place-items-center rounded-2xl bg-[#003478] text-white shadow-lg">
            <FileUp className="h-6 w-6" />
          </motion.span>
          <p className="mt-3 text-sm font-extrabold text-slate-800">Drop files here or <span className="text-[#003478] underline underline-offset-2">browse</span></p>
          <p className="mt-1 text-xs text-slate-500">PDF, CSV, PNG or JPG · up to 25 MB each</p>
          <input
            type="file"
            multiple
            aria-label="Upload documents"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <Panel>
          <div className="flex flex-col gap-2.5 px-5 pt-5 sm:flex-row sm:px-6">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[13px] font-medium outline-none focus:border-[#003478] focus:bg-white focus:ring-4 focus:ring-[#003478]/10"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {CATS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold transition ${cat === c ? "bg-slate-900 text-white shadow" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <ul className="divide-y divide-slate-50 px-2 py-3">
            {filtered.map((d) => {
              const meta = CAT_ICON[d.category];
              return (
                <li key={d.id}>
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${meta.bg}`}>
                      <meta.icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-extrabold text-slate-800">{d.name}</span>
                      <span className="block text-[11px] font-semibold text-slate-400">{d.category} · {d.size} · {d.updated}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => pushToast("Preview opening", d.name, "blue")}
                      aria-label={`Preview ${d.name}`}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#003478] hover:text-[#003478]"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => pushToast("Download started", d.name)}
                      aria-label={`Download ${d.name}`}
                      className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white transition hover:bg-[#003478]"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {!filtered.length && (
            <EmptyState icon={<Search className="h-6 w-6" />} title="No documents found" detail="Try another keyword or category." />
          )}
          <p className="border-t border-slate-100 px-5 py-3.5 text-xs font-semibold text-slate-500 sm:px-6">
            Showing {filtered.length} of {docs.length} documents
          </p>
        </Panel>
      </Reveal>
    </div>
  );
}
