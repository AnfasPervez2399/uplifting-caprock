import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  GitBranch,
  Info,
  Network,
  ShieldCheck,
} from "lucide-react";
import {
  hasCompletePercentageLayer,
  isShareholderApplicationComplete,
  percentageTotal,
  requiresShareholderApplication,
} from "../applicationLogic";
import type { CompanyShareholder, PartyType, ShareholderOwner } from "../types";

type GraphSubject = CompanyShareholder | ShareholderOwner;
type OpenGraphNode = (rootId: string, path: string[]) => void;
type ExpansionSignal = { revision: number; expanded: boolean };

const iconFor = (type: PartyType) => {
  if (type === "individual") return CircleUserRound;
  if (type === "trust") return ShieldCheck;
  return Building2;
};

const labelFor = (type: PartyType) =>
  type === "individual"
    ? "Individual"
    : type === "trust"
      ? "Trust"
      : "Corporate";

const toneFor = (type: PartyType) => {
  if (type === "trust")
    return {
      surface: "bg-[#fffcf5]",
      border: "border-[#e4d2aa]",
      icon: "bg-[#f5e8c9] text-[#725111] group-hover:bg-[#87651f] group-hover:text-white",
      accent: "bg-[#b38932]",
      badge: "bg-[#f5e8c9] text-[#65480f]",
      connector: "bg-[#c4a25c]",
    };
  if (type === "individual")
    return {
      surface: "bg-white",
      border: "border-slate-300",
      icon: "bg-slate-100 text-slate-700 group-hover:bg-[#1e293b] group-hover:text-white",
      accent: "bg-slate-600",
      badge: "bg-slate-100 text-slate-600",
      connector: "bg-slate-400",
    };
  return {
    surface: "bg-[#f8fbff]",
    border: "border-[#b9cee4]",
    icon: "bg-[#dce7f2] text-[#003478] group-hover:bg-[#003478] group-hover:text-white",
    accent: "bg-[#003478]",
    badge: "bg-[#dce7f2] text-[#003478]",
    connector: "bg-[#5f86b1]",
  };
};

const formatTotal = (subjects: Array<{ percentage: string }>) =>
  percentageTotal(subjects).toFixed(2).replace(/\.00$/, "");

const countEntities = (subjects: GraphSubject[]): number =>
  subjects.reduce(
    (total, subject) =>
      total + 1 + countEntities(subject.application.ownershipInterests),
    0,
  );

const countLevels = (subjects: GraphSubject[]): number =>
  subjects.length
    ? 1 +
      Math.max(
        ...subjects.map((subject) =>
          countLevels(subject.application.ownershipInterests),
        ),
      )
    : 0;

function LayerBadge({
  subjects,
  label,
}: {
  subjects: Array<{ percentage: string }>;
  label: string;
}) {
  const complete = hasCompletePercentageLayer(subjects);
  return (
    <span
      className={`ownership-layer-badge inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] shadow-sm ${complete ? "border-emerald-200 text-emerald-700" : "border-amber-200 text-amber-700"}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${complete ? "bg-emerald-500" : "bg-amber-500"}`}
      />
      {label} · {formatTotal(subjects)}%
    </span>
  );
}

function OwnershipNode({
  subject,
  rootId,
  path,
  onOpen,
  depth,
  siblingIndex,
  expansionSignal,
}: {
  subject: GraphSubject;
  rootId: string;
  path: string[];
  onOpen: OpenGraphNode;
  depth: number;
  siblingIndex: number;
  expansionSignal: ExpansionSignal;
}) {
  const Icon = iconFor(subject.type);
  const complete = isShareholderApplicationComplete(subject);
  const children = subject.application.ownershipInterests;
  const required =
    subject.type === "individual" || requiresShareholderApplication(subject);
  const tone = toneFor(subject.type);
  const [expanded, setExpanded] = useState(depth < 3);
  const motionStyle = {
    animationDelay: `${Math.min(70 + depth * 65 + siblingIndex * 40, 520)}ms`,
  } as CSSProperties;

  useEffect(() => {
    if (expansionSignal.revision > 0) setExpanded(expansionSignal.expanded);
  }, [expansionSignal]);

  const statusLabel = complete ? "Ready" : required ? "Required" : "Optional";

  return (
    <div className="flex min-w-[196px] flex-col items-center">
      <button
        type="button"
        onClick={() => onOpen(rootId, path)}
        style={motionStyle}
        className={`ownership-graph-node group relative min-h-[106px] w-[196px] overflow-hidden rounded-[17px] border p-3 text-left opacity-0 shadow-[0_7px_20px_rgba(15,23,42,0.055)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(15,23,42,0.12)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#003478]/15 ${tone.surface} ${tone.border}`}
        aria-label={`Open ${subject.name || labelFor(subject.type)} shareholder application`}
      >
        <span className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`} />
        <span
          className={`absolute right-3 top-3 h-2 w-2 rounded-full ${complete ? "bg-emerald-500" : required ? "bg-amber-400" : "bg-slate-300"}`}
          aria-hidden="true"
        />

        <span className="flex items-start gap-2.5 pl-1 pr-3">
          <span
            className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-xl transition duration-300 group-hover:scale-105 ${tone.icon}`}
          >
            <Icon className="h-4 w-4" />
            {children.length ? (
              <span className="absolute -bottom-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-[#0f172a] px-1 text-[7px] font-black text-white">
                {children.length}
              </span>
            ) : null}
          </span>
          <span className="min-w-0 flex-1 pt-0.5">
            <span className="block truncate text-[12px] font-bold tracking-[-0.01em] text-slate-950">
              {subject.name || "Unnamed owner"}
            </span>
            <span className="mt-1 block text-[10px] font-semibold tabular-nums text-slate-500">
              {subject.percentage || "0"}% ownership
            </span>
          </span>
          <ChevronRight className="absolute right-2.5 top-[46px] h-3.5 w-3.5 text-slate-300 transition duration-300 group-hover:translate-x-0.5 group-hover:text-[#003478]" />
        </span>

        <span className="mt-3 flex items-center justify-between border-t border-black/[0.055] pl-1 pt-2.5">
          <span
            className={`rounded-full px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.08em] ${tone.badge}`}
          >
            {labelFor(subject.type)}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.055em] ${complete ? "text-emerald-700" : required ? "text-amber-700" : "text-slate-500"}`}
          >
            {complete ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Info className="h-3 w-3" />
            )}
            {statusLabel}
          </span>
          <span className="text-[7px] font-black uppercase tracking-[0.08em] text-slate-400">
            L{depth}
          </span>
        </span>
      </button>

      {children.length ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${subject.name || labelFor(subject.type)} ownership branch`}
          className="ownership-branch-toggle mt-1.5 inline-flex h-6 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 text-[7px] font-black uppercase tracking-[0.07em] text-slate-500 shadow-sm transition hover:border-[#003478]/30 hover:bg-[#dce7f2] hover:text-[#0f172a] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#003478]/15"
        >
          <ChevronDown
            className={`h-2.5 w-2.5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Fold" : "Reveal"} {children.length}
        </button>
      ) : null}

      {children.length && expanded ? (
        <div className="ownership-branch-reveal flex flex-col items-center">
          <OwnershipChildren
            subjects={children}
            rootId={rootId}
            parentPath={path}
            onOpen={onOpen}
            depth={depth + 1}
            expansionSignal={expansionSignal}
          />
        </div>
      ) : null}
    </div>
  );
}

function OwnershipChildren({
  subjects,
  rootId,
  parentPath,
  onOpen,
  depth,
  expansionSignal,
}: {
  subjects: ShareholderOwner[];
  rootId: string;
  parentPath: string[];
  onOpen: OpenGraphNode;
  depth: number;
  expansionSignal: ExpansionSignal;
}) {
  return (
    <>
      <div className="ownership-line-y h-4 w-px origin-top bg-slate-300" />
      <LayerBadge subjects={subjects} label={`L${depth}`} />
      <div className="ownership-line-y h-4 w-px origin-top bg-slate-300" />
      <div className="relative flex items-start justify-center gap-4 px-2">
        {subjects.length > 1 ? (
          <div className="ownership-line-x absolute left-[106px] right-[106px] top-0 h-px origin-center bg-slate-300" />
        ) : null}
        {subjects.map((child, index) => {
          const childTone = toneFor(child.type);
          return (
            <div key={child.id} className="relative pt-4">
              <div
                className={`ownership-line-y absolute left-1/2 top-0 h-4 w-px origin-top -translate-x-1/2 ${childTone.connector}`}
              />
              <OwnershipNode
                subject={child}
                rootId={rootId}
                path={[...parentPath, child.id]}
                onOpen={onOpen}
                depth={depth}
                siblingIndex={index}
                expansionSignal={expansionSignal}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

function GraphCanvas({
  parentName,
  parentLabel,
  parentMeta,
  subjects,
  onOpen,
  nestedRootId,
}: {
  parentName: string;
  parentLabel: string;
  parentMeta?: string;
  subjects: Array<CompanyShareholder | ShareholderOwner>;
  onOpen: OpenGraphNode;
  nestedRootId?: string;
}) {
  const [expansionSignal, setExpansionSignal] = useState<ExpansionSignal>({
    revision: 0,
    expanded: false,
  });
  const entityCount = countEntities(subjects);
  const levelCount = countLevels(subjects);
  const setAllBranches = (expanded: boolean) =>
    setExpansionSignal((current) => ({
      revision: current.revision + 1,
      expanded,
    }));

  return (
    <div className="ownership-graph-canvas relative overflow-x-auto overscroll-contain rounded-[20px] border border-slate-200 bg-white pb-4 pt-3 shadow-inner">
      {subjects.length ? (
        <div className="sticky left-3 z-20 mb-2 flex w-fit items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur-sm">
          <span className="px-2 text-[8px] font-black uppercase tracking-[0.07em] text-slate-400">
            {entityCount} entities · {levelCount} levels
          </span>
          <button
            type="button"
            onClick={() => setAllBranches(false)}
            className="h-7 rounded-lg px-2.5 text-[8px] font-black uppercase tracking-[0.06em] text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            Fold all
          </button>
          <button
            type="button"
            onClick={() => setAllBranches(true)}
            className="h-7 rounded-lg bg-[#dce7f2] px-2.5 text-[8px] font-black uppercase tracking-[0.06em] text-[#003478] transition hover:bg-[#cdddea]"
          >
            Reveal all
          </button>
        </div>
      ) : null}

      <div className="flex min-w-max flex-col items-center px-5">
        <div className="ownership-root-node relative w-[214px] overflow-hidden rounded-[18px] border border-[#b9cee4] bg-gradient-to-br from-white to-[#edf4fa] px-4 py-3 text-center shadow-[0_9px_24px_rgba(0,52,120,0.1)]">
          <span className="absolute inset-y-0 left-0 w-1 bg-[#003478]" />
          <span className="mx-auto mb-1.5 grid h-7 w-7 place-items-center rounded-lg bg-[#dce7f2] text-[#003478]">
            <Network className="h-3.5 w-3.5" />
          </span>
          <p className="truncate text-[12px] font-bold tracking-[-0.01em] text-slate-950">
            {parentName}
          </p>
          <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.09em] text-[#003478]">
            {parentLabel}
          </p>
          {parentMeta ? (
            <p className="mt-0.5 text-[8px] text-slate-500">{parentMeta}</p>
          ) : null}
        </div>

        {subjects.length ? (
          <>
            <div className="ownership-line-y h-4 w-px origin-top bg-[#7898ba]" />
            <LayerBadge subjects={subjects} label="Direct" />
            <div className="ownership-line-y h-4 w-px origin-top bg-slate-300" />
            <div className="relative flex items-start justify-center gap-5 px-2">
              {subjects.length > 1 ? (
                <div className="ownership-line-x absolute left-[108px] right-[108px] top-0 h-px origin-center bg-slate-300" />
              ) : null}
              {subjects.map((subject, index) => {
                const rootId = nestedRootId || subject.id;
                const path = nestedRootId ? [subject.id] : [];
                const subjectTone = toneFor(subject.type);
                return (
                  <div key={subject.id} className="relative pt-4">
                    <div
                      className={`ownership-line-y absolute left-1/2 top-0 h-4 w-px origin-top -translate-x-1/2 ${subjectTone.connector}`}
                    />
                    <OwnershipNode
                      subject={subject}
                      rootId={rootId}
                      path={path}
                      onOpen={onOpen}
                      depth={1}
                      siblingIndex={index}
                      expansionSignal={expansionSignal}
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="mt-4 w-[280px] rounded-2xl border border-dashed border-slate-300 bg-white/90 p-6 text-center">
            <GitBranch className="mx-auto h-5 w-5 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-600">
              No ownership connections yet
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Add owners to create this hierarchy.
            </p>
          </div>
        )}
      </div>
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
  onOpen: OpenGraphNode;
}) {
  const total = formatTotal(shareholders);
  const complete = hasCompletePercentageLayer(shareholders);

  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-[#f7f9fb] shadow-[0_9px_28px_rgba(15,23,42,0.045)]">
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]">
              <GitBranch className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#003478]">
                Ownership map
              </p>
              <h3 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-slate-950">
                Interactive shareholder hierarchy
              </h3>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                Open a card to edit its application. Fold branches to navigate
                large or deeply nested structures.
              </p>
            </div>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.06em] ${complete ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${complete ? "bg-emerald-500" : "bg-amber-500"}`}
            />
            Direct ownership {total}%
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 text-[8px] font-black uppercase tracking-[0.06em]">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            Individual
          </span>
          <span className="rounded-full bg-[#dce7f2] px-2.5 py-1 text-[#003478]">
            Corporate
          </span>
          <span className="rounded-full bg-[#f5e8c9] px-2.5 py-1 text-[#65480f]">
            Trust
          </span>
          <span className="mx-1 hidden h-3 w-px bg-slate-200 sm:block" />
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ready
          </span>
          <span className="inline-flex items-center gap-1 text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Required
          </span>
          <span className="ml-auto hidden normal-case tracking-normal text-slate-400 sm:inline">
            Horizontal scroll supports wide layers
          </span>
        </div>
      </div>
      <div className="p-2.5 sm:p-4">
        <GraphCanvas
          parentName={companyName || "Applicant company"}
          parentLabel="Applicant entity"
          subjects={shareholders}
          onOpen={onOpen}
        />
      </div>
    </section>
  );
}

export function NestedOwnershipGraph({
  subject,
  onOpenPath,
}: {
  subject: GraphSubject;
  onOpenPath: (path: string[]) => void;
}) {
  const owners = subject.application.ownershipInterests;
  return (
    <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-[#f7f9fb]">
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#dce7f2] text-[#003478]">
            <Network className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-950">
              Nested ownership map
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Fold or reveal branches as this ownership path grows.
            </p>
          </div>
        </div>
        <LayerBadge subjects={owners} label="This layer" />
      </div>
      <div className="p-2.5 sm:p-3">
        <GraphCanvas
          parentName={subject.name || "Current shareholder"}
          parentLabel={`${labelFor(subject.type)} shareholder`}
          parentMeta={`${subject.percentage}% in its parent layer`}
          subjects={owners}
          nestedRootId={subject.id}
          onOpen={(_rootId, path) => onOpenPath(path)}
        />
      </div>
    </section>
  );
}
