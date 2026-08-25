import { Building2, CheckCircle2, ChevronRight, CircleUserRound, GitBranch, Info, ShieldCheck } from "lucide-react";
import { hasCompletePercentageLayer, isShareholderApplicationComplete, percentageTotal, requiresShareholderApplication } from "../applicationLogic";
import type { CompanyShareholder, PartyType, ShareholderOwner } from "../types";

type GraphSubject = CompanyShareholder | ShareholderOwner;

const iconFor = (type: PartyType) => {
  if (type === "individual") return CircleUserRound;
  if (type === "trust") return ShieldCheck;
  return Building2;
};

const labelFor = (type: PartyType) => type === "individual" ? "Individual" : type === "trust" ? "Trust" : "Corporate entity";

function OwnershipNode({
  subject,
  rootId,
  path,
  onOpen,
}: {
  subject: GraphSubject;
  rootId: string;
  path: string[];
  onOpen: (rootId: string, path: string[]) => void;
}) {
  const Icon = iconFor(subject.type);
  const complete = isShareholderApplicationComplete(subject);
  const children = subject.application.ownershipInterests;
  const layerComplete = subject.type === "individual" || hasCompletePercentageLayer(children);

  return (
    <div className="flex min-w-[210px] flex-col items-center">
      <button
        type="button"
        onClick={() => onOpen(rootId, path)}
        className={`group w-[210px] rounded-2xl border bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#003478]/35 hover:shadow-md ${requiresShareholderApplication(subject) && !complete ? "border-amber-200" : "border-slate-200"}`}
        aria-label={`Open ${subject.name} shareholder application`}
      >
        <span className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]"><Icon className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-slate-950">{subject.name || "Unnamed owner"}</span>
            <span className="mt-1 block text-[10px] text-slate-500">{labelFor(subject.type)} · {subject.percentage}%</span>
          </span>
          <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#003478]" />
        </span>
        <span className={`mt-3 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.06em] ${complete ? "text-emerald-700" : requiresShareholderApplication(subject) || subject.type === "individual" ? "text-amber-700" : "text-slate-500"}`}>
          {complete ? <CheckCircle2 className="h-3 w-3" /> : <Info className="h-3 w-3" />}
          {complete ? "Application complete" : requiresShareholderApplication(subject) || subject.type === "individual" ? "Application required" : "Application available"}
        </span>
      </button>

      {children.length ? (
        <>
          <div className="h-5 w-px bg-slate-300" />
          <div className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] ${layerComplete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            Layer {percentageTotal(children).toFixed(2).replace(/\.00$/, "")}%
          </div>
          <div className="h-5 w-px bg-slate-300" />
          <div className="relative flex items-start justify-center gap-5 px-3">
            {children.length > 1 ? <div className="absolute left-[118px] right-[118px] top-0 h-px bg-slate-300" /> : null}
            {children.map((child) => (
              <div key={child.id} className="relative pt-5">
                <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-slate-300" />
                <OwnershipNode subject={child} rootId={rootId} path={[...path, child.id]} onOpen={onOpen} />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function OwnershipHierarchyGraph({
  companyName,
  shareholders,
  onOpen,
}: {
  companyName: string;
  shareholders: CompanyShareholder[];
  onOpen: (rootId: string, path: string[]) => void;
}) {
  const total = percentageTotal(shareholders);
  const complete = hasCompletePercentageLayer(shareholders);

  return (
    <section className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#003478]"><GitBranch className="h-4 w-4" /> Ownership hierarchy</div>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-slate-950">Interconnected shareholder structure</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">Select any card to open its matching application. Scroll horizontally to inspect wide ownership layers.</p>
        </div>
        <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.07em] ${complete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>Direct ownership {total.toFixed(2).replace(/\.00$/, "")}%</span>
      </div>

      {shareholders.length ? (
        <div className="mt-6 overflow-x-auto pb-3">
          <div className="flex min-w-max flex-col items-center px-4">
            <div className="w-[230px] rounded-2xl bg-[#0f172a] px-4 py-3 text-center text-white shadow-sm">
              <p className="truncate text-sm font-semibold">{companyName || "Applicant company"}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-300">Applicant entity</p>
            </div>
            <div className="h-6 w-px bg-slate-400" />
            <div className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.07em] ${complete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>Direct layer · {total.toFixed(2).replace(/\.00$/, "")}%</div>
            <div className="h-6 w-px bg-slate-300" />
            <div className="relative flex items-start justify-center gap-6 px-3">
              {shareholders.length > 1 ? <div className="absolute left-[118px] right-[118px] top-0 h-px bg-slate-300" /> : null}
              {shareholders.map((shareholder) => (
                <div key={shareholder.id} className="relative pt-5">
                  <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-slate-300" />
                  <OwnershipNode subject={shareholder} rootId={shareholder.id} path={[]} onOpen={onOpen} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Add shareholders to build the ownership hierarchy.</div>
      )}
    </section>
  );
}
