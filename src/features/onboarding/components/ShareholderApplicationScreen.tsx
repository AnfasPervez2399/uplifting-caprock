import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  FileCheck2,
  GitBranch,
  Info,
  PenLine,
  Plus,
  ScanFace,
  ShieldCheck,
  Trash2,
  UserRoundCog,
  UsersRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import { DatePicker, minimumAgeCondition } from "../../../components/ui/DatePicker";
import {
  CORPORATE_ENTITY_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
  PARTY_TYPE_OPTIONS,
  SHAREHOLDER_PARTY_TYPE_OPTIONS,
  SHAREHOLDER_TRUST_TYPE_OPTIONS,
} from "../config";
import { createEmptyShareholderOwner, createEmptyShareholderRelatedParty } from "../initialState";
import {
  hasCompletePercentageLayer,
  isShareholderApplicationComplete,
  isShareholderApplicationProfileComplete,
  isShareholderBusinessComplete,
  isShareholderDocumentsComplete,
  isShareholderOwnershipComplete,
  isShareholderRelatedPartiesComplete,
  isShareholderSignatureComplete,
  percentageTotal,
  requiresShareholderApplication,
} from "../applicationLogic";
import { documentFromFile, isValidEmail } from "../utils";
import { NestedOwnershipGraph } from "./OwnershipHierarchyGraph";
import {
  DocumentUpload,
  Field,
  RequiredIndicator,
  SelfieUpload,
  inputClass,
  textareaClass,
} from "./FormPrimitives";
import type {
  CompanyDirector,
  CompanyShareholder,
  CorporateEntityType,
  PartyType,
  ShareholderApplication,
  ShareholderApplicationDocuments,
  ShareholderOwner,
  ShareholderRelatedParty,
  ShareholderTrustType,
  UploadedDocument,
} from "../types";

type ApplicationSubject = CompanyShareholder | ShareholderOwner;
type ApplicationScreen =
  | "profile"
  | "business"
  | "directors"
  | "trustees"
  | "beneficiaries"
  | "ownership"
  | "identity"
  | "documents"
  | "signature"
  | "review";

type ScreenDefinition = {
  id: ApplicationScreen;
  label: string;
  icon: LucideIcon;
};

const getTypeLabel = (subject: ApplicationSubject) => {
  if (subject.type === "individual") return "Individual";
  if (subject.type === "trust") return "Trust";
  return "Corporate entity";
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

const isDirectorComplete = (director: CompanyDirector) =>
  Boolean(director.name.trim() && isValidEmail(director.email) && director.phone.trim());

const isRelatedPartyComplete = (party: ShareholderRelatedParty) =>
  Boolean(
    party.type &&
      (party.type !== "corporate" || party.companyType) &&
      party.name.trim() &&
      isValidEmail(party.email) &&
      party.phone.trim(),
  );

const hasIndividualProofDocuments = (subject: ApplicationSubject) => Boolean(
  subject.application.documents.photoIdentity && subject.application.documents.addressEvidence,
);

const getApplicationStarted = (subject: ApplicationSubject) => Boolean(
  subject.application.country ||
    subject.application.address ||
    subject.application.dateOfBirth ||
    subject.application.registrationNumber ||
    subject.application.business.principalBusinessAddress ||
    subject.application.directors.length ||
    subject.application.trustees.length ||
    subject.application.beneficiaries.length ||
    subject.application.ownershipInterests.length ||
    Object.values(subject.application.documents).some(Boolean) ||
    subject.application.signature.name ||
    subject.application.declarationAccepted
);

const getApplicationLabel = (subject: ApplicationSubject) =>
  isShareholderApplicationComplete(subject) ? "Complete" : getApplicationStarted(subject) ? "In progress" : "Not started";

export function ShareholderApplicationScreen({
  shareholder,
  initialOwnerPath = [],
  onChange,
  onOpenDocument,
  onClose,
  role = "shareholder",
}: {
  shareholder: CompanyShareholder;
  initialOwnerPath?: string[];
  onChange: (shareholder: CompanyShareholder) => void;
  onOpenDocument: (document: UploadedDocument, label: string) => void;
  onClose: () => void;
  role?: "shareholder" | "beneficiary";
}) {
  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-[#f7f9fb]">
      <ApplicationFlow
        subject={shareholder}
        initialOwnerPath={initialOwnerPath}
        onChange={onChange}
        onBack={onClose}
        onExit={onClose}
        onOpenDocument={onOpenDocument}
        ancestry={role === "beneficiary" ? ["Trust application", "Beneficiaries"] : ["Company application", "Shareholders"]}
        depth={1}
        role={role}
      />
    </div>
  );
}

function getScreens(subject: ApplicationSubject): ScreenDefinition[] {
  if (subject.type === "individual") {
    return [
      { id: "profile", label: "Personal information", icon: CircleUserRound },
      { id: "identity", label: "Identity check", icon: ScanFace },
      { id: "documents", label: "Upload proof", icon: FileCheck2 },
      { id: "signature", label: "E-Signature", icon: PenLine },
      { id: "review", label: "Review & declaration", icon: ShieldCheck },
    ];
  }
  if (subject.type === "trust") {
    return [
      { id: "profile", label: "Trust information", icon: ShieldCheck },
      { id: "business", label: "Business information", icon: BriefcaseBusiness },
      { id: "trustees", label: "Trustees", icon: UserRoundCog },
      { id: "beneficiaries", label: "Beneficiaries", icon: UsersRound },
      { id: "ownership", label: "Ownership structure", icon: GitBranch },
      { id: "documents", label: "Upload proof", icon: FileCheck2 },
      { id: "signature", label: "E-Signature", icon: PenLine },
      { id: "review", label: "Review & declaration", icon: ShieldCheck },
    ];
  }
  return [
    { id: "profile", label: "Company information", icon: Building2 },
    { id: "business", label: "Business information", icon: BriefcaseBusiness },
    { id: "directors", label: "Directors", icon: UserRoundCog },
    { id: "ownership", label: "Shareholders", icon: GitBranch },
    { id: "documents", label: "Upload proof", icon: FileCheck2 },
    { id: "signature", label: "E-Signature", icon: PenLine },
    { id: "review", label: "Review & declaration", icon: ShieldCheck },
  ];
}

function isScreenComplete(subject: ApplicationSubject, screen: ApplicationScreen) {
  if (screen === "profile") return isShareholderApplicationProfileComplete(subject);
  if (screen === "business") return isShareholderBusinessComplete(subject);
  if (screen === "directors") return isShareholderRelatedPartiesComplete(subject);
  if (screen === "trustees") {
    return subject.application.trustees.length > 0 && subject.application.trustees.every(isRelatedPartyComplete);
  }
  if (screen === "beneficiaries") {
    return subject.application.beneficiaries.length > 0 && subject.application.beneficiaries.every(isRelatedPartyComplete);
  }
  if (screen === "ownership") return isShareholderOwnershipComplete(subject);
  if (screen === "identity") return Boolean(subject.application.documents.selfie);
  if (screen === "documents") {
    return subject.type === "individual" ? hasIndividualProofDocuments(subject) : isShareholderDocumentsComplete(subject);
  }
  if (screen === "signature") return isShareholderSignatureComplete(subject);
  return isShareholderApplicationComplete(subject);
}

function ApplicationFlow<T extends ApplicationSubject>({
  subject,
  initialOwnerPath,
  onChange,
  onBack,
  onExit,
  onOpenDocument,
  ancestry,
  depth,
  role,
}: {
  subject: T;
  initialOwnerPath: string[];
  onChange: (subject: T) => void;
  onBack: () => void;
  onExit: () => void;
  onOpenDocument: (document: UploadedDocument, label: string) => void;
  ancestry: string[];
  depth: number;
  role: "shareholder" | "beneficiary";
}) {
  const steps = useMemo(() => getScreens(subject), [subject.type]);
  const [screen, setScreen] = useState<ApplicationScreen>("profile");
  const [activeOwnerPath, setActiveOwnerPath] = useState<string[]>(initialOwnerPath);
  const [screenError, setScreenError] = useState("");
  const activeOwner = subject.application.ownershipInterests.find((owner) => owner.id === activeOwnerPath[0]);

  if (activeOwner) {
    return (
      <ApplicationFlow
        subject={activeOwner}
        initialOwnerPath={activeOwnerPath.slice(1)}
        onChange={(nextOwner) => {
          onChange({
            ...subject,
            application: {
              ...subject.application,
              ownershipInterests: subject.application.ownershipInterests.map((owner) => owner.id === nextOwner.id ? nextOwner : owner),
            },
          });
        }}
        onBack={() => setActiveOwnerPath([])}
        onExit={onExit}
        onOpenDocument={onOpenDocument}
        ancestry={[...ancestry, subject.name || `Ownership layer ${depth}`]}
        depth={depth + 1}
        role={role}
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
    if (!isScreenComplete(subject, screen)) {
      const messages: Partial<Record<ApplicationScreen, string>> = {
        profile: subject.type === "individual"
          ? "Complete the contact details, country, residential address and valid adult date of birth."
          : "Complete the entity details, country, registered address and registration number.",
        business: "Complete the principal business address, activity, source of funds and intended transaction details.",
        directors: "Add at least one complete director with a valid email address and phone number.",
        trustees: "Add at least one complete trustee.",
        beneficiaries: "Add at least one complete beneficiary.",
        ownership: `This ownership layer totals ${percentageTotal(subject.application.ownershipInterests).toFixed(2).replace(/\.00$/, "")}% and must total exactly 100%. Complete every required application until an individual ultimate beneficial owner is identified.`,
        identity: "Upload a clear current selfie before continuing.",
        documents: "Upload every required proof document before continuing.",
        signature: "Complete the authorised signatory’s name, valid email, phone number and adult date of birth.",
      };
      setScreenError(messages[screen] || "Complete this section before continuing.");
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
            <span className="hidden sm:inline">{depth === 1 ? `Back to ${role === "beneficiary" ? "beneficiaries" : "shareholders"}` : "Previous ownership layer"}</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold text-slate-950">{getTypeLabel(subject)} {depth === 1 ? role : "owner"} application</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#003478]">Ownership layer {depth}</p>
          </div>
          <button type="button" onClick={onExit} aria-label={`Close ${role} application`} className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" /></button>
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

        <div className="mb-6 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#003478]">Left-to-right application flow</p><p className="mt-0.5 text-xs text-slate-500">Select a section or use Previous and Continue below.</p></div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{currentIndex + 1} / {steps.length}</span>
          </div>
          <nav className="overflow-x-auto px-4 py-4 sm:px-5" aria-label={`${role === "beneficiary" ? "Beneficiary" : "Shareholder"} application sections`}>
            <div className="flex min-w-max items-start">
              {steps.map((item, index) => {
                const Icon = item.icon;
                const active = item.id === screen;
                const complete = isScreenComplete(subject, item.id);
                return (
                  <div key={item.id} className="flex items-start">
                    <button type="button" onClick={() => { setScreen(item.id); setScreenError(""); }} className="group flex w-[132px] flex-col items-center text-center sm:w-[154px]">
                      <span className={`relative grid h-11 w-11 place-items-center rounded-2xl border transition-all duration-300 ${active ? "border-[#003478] bg-[#dce7f2] text-[#0f172a] shadow-[0_8px_20px_rgba(0,52,120,0.12)]" : complete ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-400 group-hover:border-[#003478]/25 group-hover:text-[#003478]"}`}>
                        {complete ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Icon className="h-4 w-4" />}
                        {active ? <span className="absolute -bottom-1 h-2 w-2 rotate-45 border-b border-r border-[#003478] bg-[#dce7f2]" /> : null}
                      </span>
                      <span className={`mt-2.5 text-xs font-semibold transition ${active ? "text-[#0f172a]" : "text-slate-500 group-hover:text-slate-800"}`}>{item.label}</span>
                      <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-slate-400">{complete ? "Complete" : `Step ${index + 1}`}</span>
                    </button>
                    {index < steps.length - 1 ? <div className="relative mt-[21px] h-px w-8 bg-slate-200 sm:w-12"><span className={`absolute inset-y-0 left-0 transition-all duration-500 ${index < currentIndex || complete ? "w-full bg-[#003478]" : "w-0 bg-[#003478]"}`} /></div> : null}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>

        <main key={`${subject.id}-${screen}`} className="shareholder-flow-panel min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {screen === "profile" ? <ProfileScreen subject={subject} updateSubject={updateSubject} updateApplication={updateApplication} /> : null}
          {screen === "business" ? <BusinessScreen subject={subject} updateApplication={updateApplication} /> : null}
          {screen === "directors" ? <DirectorsScreen subject={subject} updateApplication={updateApplication} /> : null}
          {screen === "trustees" || screen === "beneficiaries" ? <TrustPartiesScreen kind={screen} subject={subject} updateApplication={updateApplication} /> : null}
          {screen === "ownership" ? <OwnershipScreen subject={subject} updateApplication={updateApplication} openOwnerPath={setActiveOwnerPath} role={role} /> : null}
          {screen === "identity" ? <IdentityScreen subject={subject} updateApplication={updateApplication} onOpenDocument={onOpenDocument} role={role} /> : null}
          {screen === "documents" ? <DocumentsScreen subject={subject} updateApplication={updateApplication} onOpenDocument={onOpenDocument} /> : null}
          {screen === "signature" ? <SignatureScreen subject={subject} updateApplication={updateApplication} /> : null}
          {screen === "review" ? <ReviewScreen subject={subject} steps={steps} updateApplication={updateApplication} role={role} /> : null}

          {screenError ? <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">{screenError}</div> : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={goBackOneScreen} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /> {currentIndex === 0 ? (depth === 1 ? `Back to ${role === "beneficiary" ? "beneficiaries" : "shareholders"}` : "Back to parent owner") : `Previous · ${steps[currentIndex - 1]?.label}`}</button>
            <p className="hidden text-center text-[10px] leading-5 text-slate-400 md:block">Cash Accounts and Link External Account remain in the main application.</p>
            {screen === "review" ? (
              <button type="button" onClick={onBack} disabled={!isShareholderApplicationComplete(subject)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#003478] px-5 text-sm font-semibold text-white transition hover:bg-[#002b63] disabled:cursor-not-allowed disabled:bg-slate-300"><CheckCircle2 className="h-4 w-4" /> Complete and return</button>
            ) : (
              <button type="button" onClick={goForward} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#003478] px-5 text-sm font-semibold text-white transition hover:bg-[#002b63]">Continue · {steps[currentIndex + 1]?.label}<ArrowRight className="h-4 w-4" /></button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function ScreenHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#003478]">{eyebrow}</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p></div>;
}

function ProfileScreen({ subject, updateSubject, updateApplication }: { subject: ApplicationSubject; updateSubject: (patch: Partial<ApplicationSubject>) => void; updateApplication: (patch: Partial<ShareholderApplication>) => void }) {
  return (
    <div className="animate-[fadeUp_.25s_ease-out]">
      <ScreenHeading eyebrow="Profile" title={subject.type === "individual" ? "Personal information" : subject.type === "trust" ? "Trust information" : "Company information"} description="Provide current details that can be verified against identity or registration records." />
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label={subject.type === "individual" ? "Full legal name" : "Registered legal name"} htmlFor={`owner-name-${subject.id}`}><input id={`owner-name-${subject.id}`} value={subject.name} onChange={(event) => updateSubject({ name: event.target.value })} placeholder="Enter full legal name" className={inputClass()} /></Field>
        <Field label={subject.type === "trust" ? "Trust contact email" : "Email"} htmlFor={`owner-email-${subject.id}`}><input id={`owner-email-${subject.id}`} name={`shareholder-email-${subject.id}`} type="email" inputMode="email" autoComplete="email" spellCheck={false} value={subject.email} onChange={(event) => { const email = event.currentTarget.value; updateSubject({ email }); }} placeholder={subject.type === "trust" ? "trust.contact@example.com" : "name@example.com"} className={inputClass()} /></Field>
        <Field label="Phone number" htmlFor={`owner-phone-${subject.id}`}><input id={`owner-phone-${subject.id}`} type="tel" value={subject.phone} onChange={(event) => updateSubject({ phone: event.target.value })} placeholder="Phone number" className={inputClass()} /></Field>
        <Field label="Country" htmlFor={`owner-country-${subject.id}`}><CustomSelect id={`owner-country-${subject.id}`} value={subject.application.country} onChange={(country) => updateApplication({ country })} options={COUNTRY_OPTIONS} placeholder="Select country" searchable searchPlaceholder="Search countries" /></Field>
        {subject.type === "corporate" ? <Field label="Company structure" htmlFor={`owner-company-type-${subject.id}`}><CustomSelect id={`owner-company-type-${subject.id}`} value={subject.companyType} onChange={(companyType) => updateSubject({ companyType: companyType as CorporateEntityType })} options={CORPORATE_ENTITY_TYPE_OPTIONS} placeholder="Select structure" /></Field> : null}
        {subject.type === "trust" ? <Field label="Trust structure" htmlFor={`owner-trust-type-${subject.id}`}><CustomSelect id={`owner-trust-type-${subject.id}`} value={subject.trustType} onChange={(trustType) => updateSubject({ trustType: trustType as ShareholderTrustType })} options={SHAREHOLDER_TRUST_TYPE_OPTIONS} placeholder="Select trust structure" /></Field> : null}
        {subject.type === "individual" ? <div className="sm:col-span-2"><Field label="Date of birth" htmlFor={`owner-dob-${subject.id}`}><DatePicker id={`owner-dob-${subject.id}`} value={subject.application.dateOfBirth} onChange={(dateOfBirth) => updateApplication({ dateOfBirth })} minYear={new Date().getFullYear() - 110} maxYear={new Date().getFullYear()} conditions={[minimumAgeCondition(18)]} helperText="The individual must be at least 18 years old." /></Field></div> : <Field label={subject.type === "trust" ? "Trust registration or reference number" : "Company registration number"} htmlFor={`owner-registration-${subject.id}`}><input id={`owner-registration-${subject.id}`} value={subject.application.registrationNumber} onChange={(event) => updateApplication({ registrationNumber: event.target.value })} placeholder="Registration number" className={inputClass()} /></Field>}
        <div className="sm:col-span-2"><Field label={subject.type === "individual" ? "Residential address" : "Registered address"} htmlFor={`owner-address-${subject.id}`}><textarea id={`owner-address-${subject.id}`} value={subject.application.address} onChange={(event) => updateApplication({ address: event.target.value })} placeholder="Full address" className={textareaClass()} /></Field></div>
      </div>
    </div>
  );
}

function BusinessScreen({ subject, updateApplication }: { subject: ApplicationSubject; updateApplication: (patch: Partial<ShareholderApplication>) => void }) {
  const business = subject.application.business;
  const updateBusiness = (patch: Partial<ShareholderApplication["business"]>) => updateApplication({ business: { ...business, ...patch } });
  return (
    <div className="animate-[fadeUp_.25s_ease-out]">
      <ScreenHeading eyebrow="Business" title="Business and compliance information" description={`Describe how ${subject.name || "this entity"} operates, where it operates and how the investment will be funded.`} />
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><Field label="Principal business address" htmlFor={`business-address-${subject.id}`}><textarea id={`business-address-${subject.id}`} value={business.principalBusinessAddress} onChange={(event) => updateBusiness({ principalBusinessAddress: event.target.value })} placeholder="Full principal place of business" className={textareaClass()} /></Field></div>
        <div className="sm:col-span-2"><Field label="Business activity" htmlFor={`business-activity-${subject.id}`}><textarea id={`business-activity-${subject.id}`} value={business.businessActivity} onChange={(event) => updateBusiness({ businessActivity: event.target.value })} placeholder="Describe the principal business activity" className={textareaClass()} /></Field></div>
        <div className="sm:col-span-2"><Field label="Source and origin of funds" htmlFor={`business-funds-${subject.id}`}><textarea id={`business-funds-${subject.id}`} value={business.sourceOfFunds} onChange={(event) => updateBusiness({ sourceOfFunds: event.target.value })} placeholder="Explain how the investment funds were generated" className={textareaClass()} /></Field></div>
        <div className="sm:col-span-2"><Field label="Intended transaction behaviour" htmlFor={`business-transactions-${subject.id}`}><textarea id={`business-transactions-${subject.id}`} value={business.intendedTransactions} onChange={(event) => updateBusiness({ intendedTransactions: event.target.value })} placeholder="Describe expected transaction types and frequency" className={textareaClass()} /></Field></div>
      </div>
    </div>
  );
}

function DirectorsScreen({ subject, updateApplication }: { subject: ApplicationSubject; updateApplication: (patch: Partial<ShareholderApplication>) => void }) {
  const [draft, setDraft] = useState<CompanyDirector>(() => ({ id: `shareholder-director-${Date.now()}`, name: "", email: "", phone: "" }));
  const [error, setError] = useState("");
  const directors = subject.application.directors;
  const add = () => {
    if (!isDirectorComplete(draft)) {
      setError("Enter the director’s full name, valid email and phone number.");
      return;
    }
    updateApplication({ directors: [...directors, draft] });
    setDraft({ id: `shareholder-director-${Date.now()}`, name: "", email: "", phone: "" });
    setError("");
  };
  return (
    <div className="animate-[fadeUp_.25s_ease-out]">
      <ScreenHeading eyebrow="Related parties" title="Directors" description="Add every director or authorised corporate party associated with this shareholder company." />
      <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Full name" htmlFor={`director-name-${subject.id}`}><input id={`director-name-${subject.id}`} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className={inputClass()} placeholder="Full legal name" /></Field>
          <Field label="Email" htmlFor={`director-email-${subject.id}`}><input id={`director-email-${subject.id}`} type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} className={inputClass()} placeholder="name@example.com" /></Field>
          <Field label="Phone number" htmlFor={`director-phone-${subject.id}`}><input id={`director-phone-${subject.id}`} value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} className={inputClass()} placeholder="Phone number" /></Field>
        </div>
        {error ? <p className="mt-3 text-xs font-medium text-red-600">{error}</p> : null}
        <button type="button" onClick={add} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white hover:bg-[#002b63]"><Plus className="h-4 w-4" /> Add director</button>
      </section>
      <SavedPartyList parties={directors} empty="No directors added yet." onRemove={(id) => updateApplication({ directors: directors.filter((party) => party.id !== id) })} />
    </div>
  );
}

function TrustPartiesScreen({ kind, subject, updateApplication }: { kind: "trustees" | "beneficiaries"; subject: ApplicationSubject; updateApplication: (patch: Partial<ShareholderApplication>) => void }) {
  const parties = subject.application[kind];
  const [draft, setDraft] = useState<ShareholderRelatedParty>(() => createEmptyShareholderRelatedParty(kind.slice(0, -1)));
  const [error, setError] = useState("");
  const title = kind === "trustees" ? "Trustees" : "Beneficiaries";
  const add = () => {
    if (!isRelatedPartyComplete(draft)) {
      setError(`Complete the ${title.toLowerCase().slice(0, -1)} type, structure where applicable, name, valid email and phone number.`);
      return;
    }
    updateApplication({ [kind]: [...parties, draft] });
    setDraft(createEmptyShareholderRelatedParty(kind.slice(0, -1)));
    setError("");
  };
  return (
    <div className="animate-[fadeUp_.25s_ease-out]">
      <ScreenHeading eyebrow="Related parties" title={title} description={`Add every ${title.toLowerCase().slice(0, -1)} associated with this trust application.`} />
      <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={`${title.slice(0, -1)} type`} htmlFor={`${kind}-type-${subject.id}`}><CustomSelect id={`${kind}-type-${subject.id}`} value={draft.type} onChange={(type) => setDraft((current) => ({ ...current, type: type as PartyType, companyType: type === "corporate" ? current.companyType : "" }))} options={PARTY_TYPE_OPTIONS} placeholder="Select type" /></Field>
          {draft.type === "corporate" ? <Field label="Company structure" htmlFor={`${kind}-structure-${subject.id}`}><CustomSelect id={`${kind}-structure-${subject.id}`} value={draft.companyType} onChange={(companyType) => setDraft((current) => ({ ...current, companyType: companyType as CorporateEntityType }))} options={CORPORATE_ENTITY_TYPE_OPTIONS} placeholder="Select structure" /></Field> : null}
          <Field label="Full legal name" htmlFor={`${kind}-name-${subject.id}`}><input id={`${kind}-name-${subject.id}`} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className={inputClass()} placeholder="Full legal name" /></Field>
          <Field label="Email" htmlFor={`${kind}-email-${subject.id}`}><input id={`${kind}-email-${subject.id}`} type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} className={inputClass()} placeholder="name@example.com" /></Field>
          <Field label="Phone number" htmlFor={`${kind}-phone-${subject.id}`}><input id={`${kind}-phone-${subject.id}`} value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} className={inputClass()} placeholder="Phone number" /></Field>
        </div>
        {error ? <p className="mt-3 text-xs font-medium text-red-600">{error}</p> : null}
        <button type="button" onClick={add} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white hover:bg-[#002b63]"><Plus className="h-4 w-4" /> Add {title.toLowerCase().slice(0, -1)}</button>
      </section>
      <SavedPartyList parties={parties} empty={`No ${title.toLowerCase()} added yet.`} onRemove={(id) => updateApplication({ [kind]: parties.filter((party) => party.id !== id) })} />
    </div>
  );
}

function SavedPartyList({ parties, empty, onRemove }: { parties: Array<CompanyDirector | ShareholderRelatedParty>; empty: string; onRemove: (id: string) => void }) {
  return (
    <div className="mt-6 space-y-3">
      {parties.length ? parties.map((party, index) => (
        <div key={party.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><CircleUserRound className="h-4 w-4" /></span>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-950">{index + 1}. {party.name}</p><p className="mt-1 truncate text-xs text-slate-500">{party.email} · {party.phone}</p></div>
          <button type="button" onClick={() => onRemove(party.id)} aria-label={`Remove ${party.name}`} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
        </div>
      )) : <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">{empty}</div>}
    </div>
  );
}

function OwnershipScreen({ subject, updateApplication, openOwnerPath, role }: { subject: ApplicationSubject; updateApplication: (patch: Partial<ShareholderApplication>) => void; openOwnerPath: (path: string[]) => void; role: "shareholder" | "beneficiary" }) {
  const [draft, setDraft] = useState<ShareholderOwner>(createEmptyShareholderOwner);
  const [draftError, setDraftError] = useState("");
  const owners = subject.application.ownershipInterests;
  const total = percentageTotal(owners);
  const layerComplete = hasCompletePercentageLayer(owners);
  const remainingOwnership = Math.max(0, 100 - total);
  const remainingOwnershipLabel = remainingOwnership.toFixed(2).replace(/\.00$/, "");
  const updateDraftPercentage = (value: string) => {
    if (value !== "" && Number(value) > remainingOwnership) {
      setDraftError(`This ownership layer cannot exceed 100%. You can allocate up to ${remainingOwnershipLabel}% more.`);
      return;
    }
    setDraft((current) => ({ ...current, percentage: value }));
    setDraftError("");
  };
  const addOwner = () => {
    if (total + (Number(draft.percentage) || 0) > 100.0001) {
      setDraftError(`This ownership layer cannot exceed 100%. You can allocate up to ${remainingOwnershipLabel}% more.`);
      return;
    }
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
      <ScreenHeading eyebrow="Interconnection" title={subject.type === "trust" || role === "beneficiary" ? "Beneficial ownership structure" : "Shareholder ownership structure"} description={`Add the owners of ${subject.name}. Every disclosed layer must total exactly 100%, with recursive applications wherever a corporate entity or trust holds 25% or more.`} />
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[rgba(0,52,120,0.16)] bg-[#f3f7fb] p-4 sm:p-5"><GitBranch className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" /><div><p className="text-sm font-semibold text-slate-950">Ultimate beneficial owner rule</p><p className="mt-1 text-sm leading-6 text-slate-600">Continue recursively until an individual ultimate beneficial owner is identified. A corporate entity or trust below 25% does not require another ownership cascade.</p></div></div>
      <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/65 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="text-base font-semibold text-slate-950">Add an owner</h3><p className="mt-1 text-sm text-slate-500">This ownership layer must total exactly 100% and cannot exceed it.</p></div><span className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] ${layerComplete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>Allocated {total.toFixed(2).replace(/\.00$/, "")}% · Remaining {remainingOwnershipLabel}%</span></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Owner type" htmlFor={`nested-owner-type-${subject.id}`}><CustomSelect id={`nested-owner-type-${subject.id}`} value={draft.type} onChange={(value) => setDraft((current) => ({ ...current, type: value as PartyType, companyType: value === "corporate" ? current.companyType : "", trustType: value === "trust" ? current.trustType : "" }))} options={SHAREHOLDER_PARTY_TYPE_OPTIONS} placeholder="Select type" /></Field>
          {draft.type === "corporate" ? <Field label="Company structure" htmlFor={`nested-company-type-${subject.id}`}><CustomSelect id={`nested-company-type-${subject.id}`} value={draft.companyType} onChange={(companyType) => setDraft((current) => ({ ...current, companyType: companyType as CorporateEntityType }))} options={CORPORATE_ENTITY_TYPE_OPTIONS} placeholder="Select structure" /></Field> : null}
          {draft.type === "trust" ? <Field label="Trust structure" htmlFor={`nested-trust-type-${subject.id}`}><CustomSelect id={`nested-trust-type-${subject.id}`} value={draft.trustType} onChange={(trustType) => setDraft((current) => ({ ...current, trustType: trustType as ShareholderTrustType }))} options={SHAREHOLDER_TRUST_TYPE_OPTIONS} placeholder="Select structure" /></Field> : null}
          <Field label="Ownership percentage" htmlFor={`nested-percentage-${subject.id}`} hint={`Maximum available: ${remainingOwnershipLabel}%`}><input id={`nested-percentage-${subject.id}`} type="number" min="0.01" max={remainingOwnership} step="0.01" value={draft.percentage} onChange={(event) => updateDraftPercentage(event.target.value)} placeholder={remainingOwnership > 0 ? `Up to ${remainingOwnershipLabel}` : "100% allocated"} disabled={remainingOwnership <= 0} className={inputClass()} /></Field>
          <Field label="Full legal name" htmlFor={`nested-name-${subject.id}`}><input id={`nested-name-${subject.id}`} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Person or entity name" className={inputClass()} /></Field>
          <Field label={draft.type === "trust" ? "Trust contact email" : "Email"} htmlFor={`nested-email-${subject.id}`}><input id={`nested-email-${subject.id}`} name={`nested-owner-email-${subject.id}`} type="email" inputMode="email" autoComplete="email" spellCheck={false} value={draft.email} onChange={(event) => { const email = event.currentTarget.value; setDraft((current) => ({ ...current, email })); }} placeholder={draft.type === "trust" ? "trust.contact@example.com" : "name@example.com"} className={inputClass()} /></Field>
          <Field label="Phone number" htmlFor={`nested-phone-${subject.id}`}><input id={`nested-phone-${subject.id}`} value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone number" className={inputClass()} /></Field>
        </div>
        {draftError ? <p className="mt-3 text-xs font-medium text-red-600">{draftError}</p> : null}
        <button type="button" onClick={addOwner} disabled={remainingOwnership <= 0} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white hover:bg-[#002b63] disabled:cursor-not-allowed disabled:bg-slate-300"><Plus className="h-4 w-4" /> {remainingOwnership <= 0 ? "100% allocated" : "Add owner"}</button>
      </section>
      {layerComplete ? (
        <div className="mt-7">
          <NestedOwnershipGraph subject={subject} onOpenPath={openOwnerPath} context={role === "beneficiary" ? "beneficiaries" : "shareholders"} />
        </div>
      ) : owners.length ? (
        <div className="mt-7 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>Bring this ownership layer to exactly 100% to reveal its interconnection graph and owner application actions.</p></div>
      ) : null}
      <section className="mt-7 space-y-3">
        {owners.length ? owners.map((owner, index) => {
          const applicationRequired = owner.type === "individual" || requiresShareholderApplication(owner);
          const applicationComplete = isShareholderApplicationComplete(owner);
          return (
            <div key={owner.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">{owner.type === "individual" ? <CircleUserRound className="h-4 w-4" /> : <UsersRound className="h-4 w-4" />}</span>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-950">{index + 1}. {owner.name}</p><p className="mt-1 text-xs text-slate-500">{getTypeLabel(owner)} · {owner.percentage}% · {owner.email}</p></div>
                {layerComplete ? <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] ${applicationComplete ? "bg-emerald-50 text-emerald-700" : applicationRequired ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{applicationComplete ? <CheckCircle2 className="h-3 w-3" /> : <Info className="h-3 w-3" />}{applicationComplete ? "Application complete" : applicationRequired ? "Application required" : "Below 25% · no cascade"}</span> : <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-slate-500"><Info className="h-3 w-3" />Awaiting 100% layer</span>}
                <div className="flex items-center gap-2">{layerComplete ? <button type="button" onClick={() => openOwnerPath([owner.id])} className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#003478]/20 bg-white px-3 text-xs font-semibold text-[#003478] hover:bg-[#f3f7fb]">{applicationComplete ? "Review application" : "Fill application"}<ChevronRight className="h-3.5 w-3.5" /></button> : null}<button type="button" onClick={() => updateApplication({ ownershipInterests: owners.filter((saved) => saved.id !== owner.id) })} aria-label={`Remove ${owner.name}`} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
              </div>
            </div>
          );
        }) : <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No owners have been added at this layer.</div>}
      </section>
    </div>
  );
}

function IdentityScreen({ subject, updateApplication, onOpenDocument, role }: { subject: ApplicationSubject; updateApplication: (patch: Partial<ShareholderApplication>) => void; onOpenDocument: (document: UploadedDocument, label: string) => void; role: "shareholder" | "beneficiary" }) {
  const updateSelfie = (file?: File) => updateApplication({ documents: { ...subject.application.documents, selfie: documentFromFile(file) } });
  return <div className="animate-[fadeUp_.25s_ease-out]"><ScreenHeading eyebrow="Identity" title="Identity check" description={`Add a clear current selfie for the individual ${role}’s identity verification.`} /><div className="mt-7"><SelfieUpload value={subject.application.documents.selfie} onChange={updateSelfie} onPreview={onOpenDocument} /></div></div>;
}

function DocumentsScreen({ subject, updateApplication, onOpenDocument }: { subject: ApplicationSubject; updateApplication: (patch: Partial<ShareholderApplication>) => void; onOpenDocument: (document: UploadedDocument, label: string) => void }) {
  const updateDocument = (key: keyof ShareholderApplicationDocuments, file?: File) => updateApplication({ documents: { ...subject.application.documents, [key]: documentFromFile(file) } });
  const documents = subject.application.documents;
  return (
    <div className="animate-[fadeUp_.25s_ease-out]">
      <ScreenHeading eyebrow="Documents" title="Upload proof" description="Upload current, legible evidence. Select any uploaded file to open it in the document viewer." />
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {subject.type === "individual" ? <><DocumentUpload id={`photo-id-${subject.id}`} title="Photo identity" description="Passport, driving licence or government-issued photo identification." value={documents.photoIdentity} onChange={(file) => updateDocument("photoIdentity", file)} onPreview={onOpenDocument} /><DocumentUpload id={`address-evidence-${subject.id}`} title="Residential address evidence" description="Recent utility bill, tax document or other accepted address evidence." value={documents.addressEvidence} onChange={(file) => updateDocument("addressEvidence", file)} onPreview={onOpenDocument} /></> : null}
        {subject.type === "corporate" ? <><DocumentUpload id={`entity-registration-${subject.id}`} title="Registration evidence" description="Certificate of registration or current company extract." value={documents.entityRegistration} onChange={(file) => updateDocument("entityRegistration", file)} onPreview={onOpenDocument} /><DocumentUpload id={`ownership-chart-${subject.id}`} title="Ownership chart" description="Current chart showing all shareholders and ownership percentages." value={documents.ownershipChart} onChange={(file) => updateDocument("ownershipChart", file)} onPreview={onOpenDocument} /></> : null}
        {subject.type === "trust" ? <><DocumentUpload id={`trust-deed-${subject.id}`} title="Trust deed" description="Current executed trust deed, including relevant schedules." value={documents.trustDeed} onChange={(file) => updateDocument("trustDeed", file)} onPreview={onOpenDocument} /><DocumentUpload id={`ownership-chart-${subject.id}`} title="Ownership or control chart" description="Current chart showing trustees, beneficiaries and controlling parties." value={documents.ownershipChart} onChange={(file) => updateDocument("ownershipChart", file)} onPreview={onOpenDocument} /></> : null}
      </div>
    </div>
  );
}

function SignatureScreen({ subject, updateApplication }: { subject: ApplicationSubject; updateApplication: (patch: Partial<ShareholderApplication>) => void }) {
  const signature = subject.application.signature;
  const updateSignature = (patch: Partial<ShareholderApplication["signature"]>) => updateApplication({ signature: { ...signature, ...patch } });
  return (
    <div className="animate-[fadeUp_.25s_ease-out]">
      <ScreenHeading eyebrow="Authorisation" title="E-Signature" description="Provide the authorised signatory’s details. The signatory must be at least 18 years old." />
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Authorised signatory name" htmlFor={`signature-name-${subject.id}`}><input id={`signature-name-${subject.id}`} value={signature.name} onChange={(event) => updateSignature({ name: event.target.value })} className={inputClass()} placeholder="Full legal name" /></Field>
        <Field label="Email" htmlFor={`signature-email-${subject.id}`}><input id={`signature-email-${subject.id}`} type="email" value={signature.email} onChange={(event) => updateSignature({ email: event.target.value })} className={inputClass()} placeholder="name@example.com" /></Field>
        <Field label="Phone number" htmlFor={`signature-phone-${subject.id}`}><input id={`signature-phone-${subject.id}`} value={signature.phone} onChange={(event) => updateSignature({ phone: event.target.value })} className={inputClass()} placeholder="Phone number" /></Field>
        <Field label="Date of birth" htmlFor={`signature-dob-${subject.id}`}><DatePicker id={`signature-dob-${subject.id}`} value={signature.dateOfBirth} onChange={(dateOfBirth) => updateSignature({ dateOfBirth })} minYear={new Date().getFullYear() - 110} maxYear={new Date().getFullYear()} conditions={[minimumAgeCondition(18)]} helperText="The authorised signatory must be at least 18." /></Field>
      </div>
    </div>
  );
}

function ReviewScreen({ subject, steps, updateApplication, role }: { subject: ApplicationSubject; steps: ScreenDefinition[]; updateApplication: (patch: Partial<ShareholderApplication>) => void; role: "shareholder" | "beneficiary" }) {
  const completed = isShareholderApplicationComplete(subject);
  const reviewableSteps = steps.filter((step) => step.id !== "review");
  return (
    <div className="animate-[fadeUp_.25s_ease-out]">
      <ScreenHeading eyebrow="Final check" title={`Review this ${role} application`} description={`Confirm every relevant section before returning to the main ${role === "beneficiary" ? "trust" : "company"} application.`} />
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {reviewableSteps.map((step) => <StatusCard key={step.id} label={step.label} complete={isScreenComplete(subject, step.id)} detail={isScreenComplete(subject, step.id) ? "Required information provided" : "Required information is incomplete"} />)}
      </div>
      <label className={`mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${subject.application.declarationAccepted ? "border-[#003478]/25 bg-[#f3f7fb]" : "border-slate-200 bg-white hover:border-slate-300"}`}>
        <input type="checkbox" checked={subject.application.declarationAccepted} onChange={(event) => updateApplication({ declarationAccepted: event.target.checked })} className="mt-0.5 h-4 w-4 cursor-pointer accent-[#003478]" />
        <span className="text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-950">{role === "beneficiary" ? "Beneficiary" : "Shareholder"} declaration<RequiredIndicator /></span><span className="mt-1 block">I confirm that these details are accurate and that all required ownership connections have been disclosed through complete 100% layers to the individual ultimate beneficial owner.</span></span>
      </label>
      <div className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 ${completed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>{completed ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /> : <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />}<div><p className={`text-sm font-semibold ${completed ? "text-emerald-900" : "text-amber-900"}`}>{completed ? "Application complete" : "Application not yet complete"}</p><p className={`mt-1 text-xs leading-5 ${completed ? "text-emerald-700" : "text-amber-700"}`}>{completed ? `You can now return to the ${role} list.` : "Complete every outstanding section and accept the declaration."}</p></div></div>
    </div>
  );
}

function StatusCard({ label, complete, detail }: { label: string; complete: boolean; detail: string }) {
  return <div className={`rounded-2xl border p-4 ${complete ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70"}`}><div className="flex items-center gap-2">{complete ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : <Info className="h-4 w-4 text-amber-700" />}<p className="text-sm font-semibold text-slate-950">{label}</p></div><p className="mt-2 text-xs leading-5 text-slate-600">{detail}</p></div>;
}
