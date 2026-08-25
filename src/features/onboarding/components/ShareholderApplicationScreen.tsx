import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  GitBranch,
  Info,
  Plus,
  ShieldCheck,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import { DatePicker, minimumAgeCondition } from "../../../components/ui/DatePicker";
import {
  CORPORATE_ENTITY_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
  SHAREHOLDER_PARTY_TYPE_OPTIONS,
  SHAREHOLDER_TRUST_TYPE_OPTIONS,
} from "../config";
import { createEmptyShareholderOwner } from "../initialState";
import {
  isShareholderApplicationComplete,
  isShareholderApplicationProfileComplete,
  isShareholderOwnershipComplete,
  requiresShareholderApplication,
} from "../applicationLogic";
import { Field, RequiredIndicator, inputClass, textareaClass } from "./FormPrimitives";
import type {
  CompanyShareholder,
  CorporateEntityType,
  PartyType,
  ShareholderApplication,
  ShareholderOwner,
  ShareholderTrustType,
} from "../types";
import { isValidEmail } from "../utils";

type ApplicationSubject = {
  id: string;
  type: PartyType;
  companyType: CorporateEntityType;
  trustType: ShareholderTrustType;
  percentage: string;
  name: string;
  email: string;
  phone: string;
  application: ShareholderApplication;
};

type ApplicationScreen = "profile" | "ownership" | "review";

const getTypeLabel = (subject: ApplicationSubject) => {
  if (subject.type === "individual") return "Individual";
  if (subject.type === "trust") return "Trust";
  return "Corporate entity";
};

const getApplicationLabel = (subject: ApplicationSubject) => {
  if (isShareholderApplicationComplete(subject)) return "Complete";
  const started = Boolean(
    subject.application.country ||
      subject.application.address ||
      subject.application.dateOfBirth ||
      subject.application.registrationNumber ||
      subject.application.ownershipInterests.length ||
      subject.application.declarationAccepted,
  );
  return started ? "In progress" : "Not started";
};

const isOwnerDraftComplete = (owner: ShareholderOwner) => {
  const percentage = Number(owner.percentage);
  return Boolean(
    owner.type &&
      (owner.type !== "corporate" || owner.companyType) &&
      (owner.type !== "trust" || owner.trustType) &&
      percentage > 0 && percentage <= 100 &&
      owner.name.trim() &&
      isValidEmail(owner.email) &&
      owner.phone.trim(),
  );
};

export function ShareholderApplicationScreen({
  shareholder,
  onChange,
  onClose,
}: {
  shareholder: CompanyShareholder;
  onChange: (shareholder: CompanyShareholder) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-[#f7f9fb]">
      <ApplicationFlow
        subject={shareholder}
        onChange={onChange}
        onBack={onClose}
        ancestry={["Company application", "Shareholders"]}
        depth={1}
      />
    </div>
  );
}

function ApplicationFlow<T extends ApplicationSubject>({
  subject,
  onChange,
  onBack,
  ancestry,
  depth,
}: {
  subject: T;
  onChange: (subject: T) => void;
  onBack: () => void;
  ancestry: string[];
  depth: number;
}) {
  const requiresOwnership = requiresShareholderApplication(subject);
  const steps = useMemo(
    () => [
      { id: "profile" as const, label: subject.type === "individual" ? "Identity profile" : "Entity profile", icon: subject.type === "individual" ? CircleUserRound : Building2 },
      ...(requiresOwnership ? [{ id: "ownership" as const, label: "Ownership layer", icon: GitBranch }] : []),
      { id: "review" as const, label: "Review & declaration", icon: ShieldCheck },
    ],
    [requiresOwnership, subject.type],
  );
  const [screen, setScreen] = useState<ApplicationScreen>("profile");
  const [activeOwnerId, setActiveOwnerId] = useState<string | null>(null);
  const [screenError, setScreenError] = useState("");

  const activeOwner = subject.application.ownershipInterests.find((owner) => owner.id === activeOwnerId);
  if (activeOwner) {
    return (
      <ApplicationFlow
        subject={activeOwner}
        onChange={(nextOwner) => {
          onChange({
            ...subject,
            application: {
              ...subject.application,
              ownershipInterests: subject.application.ownershipInterests.map((owner) => owner.id === nextOwner.id ? nextOwner : owner),
            },
          });
        }}
        onBack={() => setActiveOwnerId(null)}
        ancestry={[...ancestry, subject.name || `Ownership layer ${depth}`]}
        depth={depth + 1}
      />
    );
  }

  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === screen));
  const updateApplication = (patch: Partial<ShareholderApplication>) => {
    onChange({ ...subject, application: { ...subject.application, ...patch } });
    setScreenError("");
  };
  const updateSubject = (patch: Partial<ApplicationSubject>) => {
    onChange({ ...subject, ...patch });
    setScreenError("");
  };

  const goForward = () => {
    if (screen === "profile" && !isShareholderApplicationProfileComplete(subject)) {
      setScreenError(subject.type === "individual"
        ? "Complete the contact details, country, address and a valid date of birth for an adult applicant."
        : "Complete the entity contact details, country, address and registration number.");
      return;
    }
    if (screen === "ownership" && !isShareholderOwnershipComplete(subject)) {
      setScreenError("Add and complete every owner in this layer. Continue into each required ownership application until an individual owner is identified.");
      return;
    }
    const next = steps[currentIndex + 1];
    if (next) {
      setScreen(next.id);
      setScreenError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBackOneScreen = () => {
    const previous = steps[currentIndex - 1];
    if (previous) {
      setScreen(previous.id);
      setScreenError("");
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <button type="button" onClick={onBack} className="inline-flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#003478]">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{depth === 1 ? "Back to shareholders" : "Previous ownership layer"}</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold text-slate-950">Shareholder application</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#003478]">Ownership layer {depth}</p>
          </div>
          <button type="button" onClick={onBack} aria-label="Close shareholder application" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          {ancestry.map((item) => <span key={item} className="inline-flex items-center gap-1.5"><span>{item}</span><ChevronRight className="h-3 w-3" /></span>)}
          <span className="font-semibold text-slate-700">{subject.name || "New owner"}</span>
        </div>

        <div className="mb-6 rounded-[22px] border border-[rgba(0,52,120,0.13)] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#dce7f2] text-[#003478]">
                {subject.type === "individual" ? <CircleUserRound className="h-5 w-5" /> : subject.type === "trust" ? <ShieldCheck className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#003478]">{getTypeLabel(subject)} · {subject.percentage}% ownership</p>
                <h1 className="mt-1 truncate text-xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl">{subject.name}</h1>
              </div>
            </div>
            <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.07em] ${isShareholderApplicationComplete(subject) ? "bg-emerald-50 text-emerald-700" : "bg-[#f3f6f9] text-slate-600"}`}>
              {isShareholderApplicationComplete(subject) ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
              {getApplicationLabel(subject)}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
            <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">Application screens</p>
            <nav className="space-y-1" aria-label="Shareholder application screens">
              {steps.map((item, index) => {
                const Icon = item.icon;
                const active = item.id === screen;
                const complete = item.id === "profile"
                  ? isShareholderApplicationProfileComplete(subject)
                  : item.id === "ownership"
                    ? isShareholderOwnershipComplete(subject)
                    : isShareholderApplicationComplete(subject);
                return (
                  <button key={item.id} type="button" onClick={() => { setScreen(item.id); setScreenError(""); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${active ? "bg-[#dce7f2] text-[#0f172a]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${active ? "bg-white/75 text-[#003478]" : "bg-slate-100 text-slate-500"}`}>
                      {complete ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Icon className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1"><span className="block truncate">{item.label}</span><span className="mt-0.5 block text-[10px] font-medium text-slate-400">Step {index + 1} of {steps.length}</span></span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            {screen === "profile" ? (
              <ProfileScreen subject={subject} updateSubject={updateSubject} updateApplication={updateApplication} />
            ) : screen === "ownership" ? (
              <OwnershipScreen
                subject={subject}
                updateApplication={updateApplication}
                openOwner={(id) => setActiveOwnerId(id)}
              />
            ) : (
              <ReviewScreen subject={subject} updateApplication={updateApplication} />
            )}

            {screenError ? <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">{screenError}</div> : null}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={goBackOneScreen} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                <ArrowLeft className="h-4 w-4" /> {currentIndex === 0 ? "Back" : "Previous"}
              </button>
              {screen === "review" ? (
                <button type="button" onClick={onBack} disabled={!isShareholderApplicationComplete(subject)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#003478] px-5 text-sm font-semibold text-white transition hover:bg-[#002b63] disabled:cursor-not-allowed disabled:bg-slate-300">
                  <CheckCircle2 className="h-4 w-4" /> Complete and return
                </button>
              ) : (
                <button type="button" onClick={goForward} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#003478] px-5 text-sm font-semibold text-white transition hover:bg-[#002b63]">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({
  subject,
  updateSubject,
  updateApplication,
}: {
  subject: ApplicationSubject;
  updateSubject: (patch: Partial<ApplicationSubject>) => void;
  updateApplication: (patch: Partial<ShareholderApplication>) => void;
}) {
  return (
    <div className="animate-[fadeUp_.25s_ease-out]">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#003478]">Profile</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{subject.type === "individual" ? "Identify the individual shareholder" : "Identify the shareholder entity"}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Provide current details that can be verified against identity or registration records.</p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label={subject.type === "individual" ? "Full legal name" : "Registered legal name"} htmlFor={`owner-name-${subject.id}`}>
          <input id={`owner-name-${subject.id}`} value={subject.name} onChange={(event) => updateSubject({ name: event.target.value })} placeholder="Enter full legal name" className={inputClass()} />
        </Field>
        <Field label="Email" htmlFor={`owner-email-${subject.id}`}>
          <input id={`owner-email-${subject.id}`} type="email" value={subject.email} onChange={(event) => updateSubject({ email: event.target.value })} placeholder="name@example.com" className={inputClass()} />
        </Field>
        <Field label="Phone number" htmlFor={`owner-phone-${subject.id}`}>
          <input id={`owner-phone-${subject.id}`} type="tel" value={subject.phone} onChange={(event) => updateSubject({ phone: event.target.value })} placeholder="Phone number" className={inputClass()} />
        </Field>
        <Field label="Country" htmlFor={`owner-country-${subject.id}`}>
          <CustomSelect id={`owner-country-${subject.id}`} value={subject.application.country} onChange={(country) => updateApplication({ country })} options={COUNTRY_OPTIONS} placeholder="Select country" searchable searchPlaceholder="Search countries" />
        </Field>
        {subject.type === "corporate" ? (
          <Field label="Company structure" htmlFor={`owner-company-type-${subject.id}`}>
            <CustomSelect id={`owner-company-type-${subject.id}`} value={subject.companyType} onChange={(companyType) => updateSubject({ companyType: companyType as CorporateEntityType })} options={CORPORATE_ENTITY_TYPE_OPTIONS} placeholder="Select structure" />
          </Field>
        ) : null}
        {subject.type === "trust" ? (
          <Field label="Trust structure" htmlFor={`owner-trust-type-${subject.id}`}>
            <CustomSelect id={`owner-trust-type-${subject.id}`} value={subject.trustType} onChange={(trustType) => updateSubject({ trustType: trustType as ShareholderTrustType })} options={SHAREHOLDER_TRUST_TYPE_OPTIONS} placeholder="Select trust structure" />
          </Field>
        ) : null}
        {subject.type === "individual" ? (
          <div className="sm:col-span-2">
            <Field label="Date of birth" htmlFor={`owner-dob-${subject.id}`}>
              <DatePicker id={`owner-dob-${subject.id}`} value={subject.application.dateOfBirth} onChange={(dateOfBirth) => updateApplication({ dateOfBirth })} minYear={new Date().getFullYear() - 110} maxYear={new Date().getFullYear()} conditions={[minimumAgeCondition(18)]} helperText="The individual must be at least 18 years old." />
            </Field>
          </div>
        ) : (
          <Field label={subject.type === "trust" ? "Trust registration or reference number" : "Company registration number"} htmlFor={`owner-registration-${subject.id}`}>
            <input id={`owner-registration-${subject.id}`} value={subject.application.registrationNumber} onChange={(event) => updateApplication({ registrationNumber: event.target.value })} placeholder="Registration number" className={inputClass()} />
          </Field>
        )}
        <div className="sm:col-span-2">
          <Field label={subject.type === "individual" ? "Residential address" : "Registered address"} htmlFor={`owner-address-${subject.id}`}>
            <textarea id={`owner-address-${subject.id}`} value={subject.application.address} onChange={(event) => updateApplication({ address: event.target.value })} placeholder="Full address" className={textareaClass()} />
          </Field>
        </div>
      </div>
    </div>
  );
}

function OwnershipScreen({
  subject,
  updateApplication,
  openOwner,
}: {
  subject: ApplicationSubject;
  updateApplication: (patch: Partial<ShareholderApplication>) => void;
  openOwner: (id: string) => void;
}) {
  const [draft, setDraft] = useState<ShareholderOwner>(createEmptyShareholderOwner);
  const [draftError, setDraftError] = useState("");
  const owners = subject.application.ownershipInterests;
  const total = owners.reduce((sum, owner) => sum + (Number(owner.percentage) || 0), 0);

  const addOwner = () => {
    if (!isOwnerDraftComplete(draft)) {
      setDraftError("Complete the owner type, structure where applicable, ownership percentage, legal name, valid email and phone number.");
      return;
    }
    updateApplication({ ownershipInterests: [...owners, draft] });
    setDraft(createEmptyShareholderOwner());
    setDraftError("");
  };

  return (
    <div className="animate-[fadeUp_.25s_ease-out]">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#003478]">Interconnection</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Identify the next ownership layer</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Add the shareholders or beneficial owners of {subject.name}. The ownership chain continues wherever another corporate entity or trust holds 25% or more.</p>

      <div className="mt-6 rounded-2xl border border-[rgba(0,52,120,0.16)] bg-[#f3f7fb] p-4 sm:p-5">
        <div className="flex items-start gap-3"><GitBranch className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" /><div><p className="text-sm font-semibold text-slate-950">Ultimate beneficial owner rule</p><p className="mt-1 text-sm leading-6 text-slate-600">When a corporate entity or trust holds 25% or more, complete its application and add another interconnection layer. Continue recursively until an individual ultimate beneficial owner is identified.</p></div></div>
      </div>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/65 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="text-base font-semibold text-slate-950">Add an owner</h3><p className="mt-1 text-sm text-slate-500">Record ownership at this layer.</p></div><p className="text-xs font-semibold text-slate-500">Recorded ownership: <span className="text-[#003478]">{total.toFixed(2).replace(/\.00$/, "")}%</span></p></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Owner type" htmlFor={`nested-owner-type-${subject.id}`}>
            <CustomSelect id={`nested-owner-type-${subject.id}`} value={draft.type} onChange={(value) => setDraft((current) => ({ ...current, type: value as PartyType, companyType: value === "corporate" ? current.companyType : "", trustType: value === "trust" ? current.trustType : "" }))} options={SHAREHOLDER_PARTY_TYPE_OPTIONS} placeholder="Select type" />
          </Field>
          {draft.type === "corporate" ? <Field label="Company structure" htmlFor={`nested-company-type-${subject.id}`}><CustomSelect id={`nested-company-type-${subject.id}`} value={draft.companyType} onChange={(companyType) => setDraft((current) => ({ ...current, companyType: companyType as CorporateEntityType }))} options={CORPORATE_ENTITY_TYPE_OPTIONS} placeholder="Select structure" /></Field> : null}
          {draft.type === "trust" ? <Field label="Trust structure" htmlFor={`nested-trust-type-${subject.id}`}><CustomSelect id={`nested-trust-type-${subject.id}`} value={draft.trustType} onChange={(trustType) => setDraft((current) => ({ ...current, trustType: trustType as ShareholderTrustType }))} options={SHAREHOLDER_TRUST_TYPE_OPTIONS} placeholder="Select structure" /></Field> : null}
          <Field label="Ownership percentage" htmlFor={`nested-percentage-${subject.id}`}><input id={`nested-percentage-${subject.id}`} type="number" min="0.01" max="100" step="0.01" value={draft.percentage} onChange={(event) => setDraft((current) => ({ ...current, percentage: event.target.value }))} placeholder="For example, 25" className={inputClass()} /></Field>
          <Field label="Full legal name" htmlFor={`nested-name-${subject.id}`}><input id={`nested-name-${subject.id}`} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Person or entity name" className={inputClass()} /></Field>
          <Field label="Email" htmlFor={`nested-email-${subject.id}`}><input id={`nested-email-${subject.id}`} type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} placeholder="name@example.com" className={inputClass()} /></Field>
          <Field label="Phone number" htmlFor={`nested-phone-${subject.id}`}><input id={`nested-phone-${subject.id}`} type="tel" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone number" className={inputClass()} /></Field>
        </div>
        {draftError ? <p className="mt-3 text-xs font-medium text-red-600">{draftError}</p> : null}
        <button type="button" onClick={addOwner} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63]"><Plus className="h-4 w-4" /> Add owner</button>
      </section>

      <section className="mt-7">
        <h3 className="text-base font-semibold text-slate-950">Saved owners ({owners.length})</h3>
        <div className="mt-4 space-y-3">
          {owners.length ? owners.map((owner, index) => {
            const applicationRequired = owner.type === "individual" || requiresShareholderApplication(owner);
            const applicationComplete = isShareholderApplicationComplete(owner);
            return (
              <div key={owner.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">{owner.type === "individual" ? <CircleUserRound className="h-4 w-4" /> : <UsersRound className="h-4 w-4" />}</span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-950">{index + 1}. {owner.name}</p><p className="mt-1 text-xs text-slate-500">{getTypeLabel(owner)} · {owner.percentage}% · {owner.email}</p></div>
                  <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] ${applicationComplete ? "bg-emerald-50 text-emerald-700" : applicationRequired ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{applicationComplete ? <CheckCircle2 className="h-3 w-3" /> : <Info className="h-3 w-3" />}{applicationComplete ? "Application complete" : applicationRequired ? "Application required" : "Below 25% · no cascade"}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => openOwner(owner.id)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#003478]/20 bg-white px-3 text-xs font-semibold text-[#003478] transition hover:bg-[#f3f7fb]">{owner.type === "individual" ? "Identify owner" : "Fill application"}<ChevronRight className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => updateApplication({ ownershipInterests: owners.filter((saved) => saved.id !== owner.id) })} aria-label={`Remove ${owner.name}`} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            );
          }) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No owners have been added at this layer.</div>}
        </div>
      </section>
    </div>
  );
}

function ReviewScreen({
  subject,
  updateApplication,
}: {
  subject: ApplicationSubject;
  updateApplication: (patch: Partial<ShareholderApplication>) => void;
}) {
  const profileComplete = isShareholderApplicationProfileComplete(subject);
  const ownershipComplete = isShareholderOwnershipComplete(subject);
  const completed = isShareholderApplicationComplete(subject);
  return (
    <div className="animate-[fadeUp_.25s_ease-out]">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#003478]">Final check</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Review this shareholder application</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Confirm the profile and every required ownership layer before returning to the company application.</p>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <StatusCard label={subject.type === "individual" ? "Identity profile" : "Entity profile"} complete={profileComplete} detail={profileComplete ? "Required identification details provided" : "Required profile details are incomplete"} />
        {requiresShareholderApplication(subject) ? <StatusCard label="Ownership interconnection" complete={ownershipComplete} detail={ownershipComplete ? "Required ownership layers completed" : "An ownership layer or ultimate owner is incomplete"} /> : null}
      </div>

      <label className={`mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${subject.application.declarationAccepted ? "border-[#003478]/25 bg-[#f3f7fb]" : "border-slate-200 bg-white hover:border-slate-300"}`}>
        <input type="checkbox" checked={subject.application.declarationAccepted} onChange={(event) => updateApplication({ declarationAccepted: event.target.checked })} className="mt-0.5 h-4 w-4 cursor-pointer accent-[#003478]" />
        <span className="text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-950">Shareholder declaration<RequiredIndicator /></span><span className="mt-1 block">I confirm that these details are accurate and that all required ownership connections have been disclosed to the individual ultimate beneficial owner.</span></span>
      </label>

      <div className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 ${completed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
        {completed ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /> : <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />}
        <div><p className={`text-sm font-semibold ${completed ? "text-emerald-900" : "text-amber-900"}`}>{completed ? "Application complete" : "Application not yet complete"}</p><p className={`mt-1 text-xs leading-5 ${completed ? "text-emerald-700" : "text-amber-700"}`}>{completed ? "You can now return to the shareholder list." : "Complete any outstanding profile or ownership items and accept the declaration."}</p></div>
      </div>
    </div>
  );
}

function StatusCard({ label, complete, detail }: { label: string; complete: boolean; detail: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${complete ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70"}`}>
      <div className="flex items-center gap-2">{complete ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : <Info className="h-4 w-4 text-amber-700" />}<p className="text-sm font-semibold text-slate-950">{label}</p></div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{detail}</p>
    </div>
  );
}
