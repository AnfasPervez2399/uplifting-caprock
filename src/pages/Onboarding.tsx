import { useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  FileText,
  Fingerprint,
  Globe2,
  IdCard,
  Landmark,
  Link2,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Save,
  Send,
  ShieldCheck,
  UploadCloud,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const wait = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

type StepId =
  | "personal"
  | "business"
  | "identity"
  | "bank"
  | "cash"
  | "documents"
  | "review";

type Step = {
  id: StepId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
};

type UploadedDocument = {
  name: string;
  size: number;
};

type FormState = {
  personal: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    citizenship: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  business: {
    legalName: string;
    tradingName: string;
    entityType: string;
    registrationNumber: string;
    taxCountry: string;
    industry: string;
    website: string;
    role: string;
    ownership: string;
    address: string;
    city: string;
    postcode: string;
  };
  identity: {
    documentType: string;
    documentNumber: string;
    issuingCountry: string;
    consent: boolean;
    verified: boolean;
  };
  bank: {
    method: "instant" | "manual";
    institution: string;
    accountName: string;
    last4: string;
    linked: boolean;
  };
  cash: {
    purpose: string;
    currency: string;
    nickname: string;
    expectedBalance: string;
    fundingSource: string;
  };
  documents: {
    proofOfAddress?: UploadedDocument;
    businessRegistration?: UploadedDocument;
    sourceOfFunds?: UploadedDocument;
  };
  agreements: {
    accuracy: boolean;
    terms: boolean;
  };
};

const steps: Step[] = [
  {
    id: "personal",
    label: "Personal information",
    shortLabel: "Personal",
    description: "Your identity and contact details",
    icon: UserRound,
  },
  {
    id: "business",
    label: "Business information",
    shortLabel: "Business",
    description: "Entity, tax and ownership details",
    icon: BriefcaseBusiness,
  },
  {
    id: "identity",
    label: "Prove it’s you",
    shortLabel: "Identity",
    description: "Secure identity verification",
    icon: Fingerprint,
  },
  {
    id: "bank",
    label: "Link bank account",
    shortLabel: "Bank",
    description: "Connect a funding account",
    icon: Link2,
  },
  {
    id: "cash",
    label: "Cash account",
    shortLabel: "Cash account",
    description: "Configure your settlement account",
    icon: WalletCards,
  },
  {
    id: "documents",
    label: "Proof documents",
    shortLabel: "Documents",
    description: "Upload required supporting files",
    icon: FileCheck2,
  },
  {
    id: "review",
    label: "Review and submit",
    shortLabel: "Review",
    description: "Confirm and send your application",
    icon: Send,
  },
];

const initialForm: FormState = {
  personal: {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    citizenship: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
  },
  business: {
    legalName: "",
    tradingName: "",
    entityType: "",
    registrationNumber: "",
    taxCountry: "",
    industry: "",
    website: "",
    role: "",
    ownership: "",
    address: "",
    city: "",
    postcode: "",
  },
  identity: {
    documentType: "",
    documentNumber: "",
    issuingCountry: "",
    consent: false,
    verified: false,
  },
  bank: {
    method: "instant",
    institution: "",
    accountName: "",
    last4: "",
    linked: false,
  },
  cash: {
    purpose: "",
    currency: "",
    nickname: "",
    expectedBalance: "",
    fundingSource: "",
  },
  documents: {},
  agreements: {
    accuracy: false,
    terms: false,
  },
};

const inputClass = (hasError = false) =>
  `h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/[0.08]"
      : "border-slate-200 hover:border-slate-300 focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/[0.07]"
  }`;

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-[13px] font-semibold text-slate-800"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mb-7 flex items-start gap-4 border-b border-slate-100 pb-7 sm:mb-8 sm:gap-5 sm:pb-8">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[rgba(0,52,120,0.075)] text-[#003478] sm:h-14 sm:w-14">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#003478]">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-[30px]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function DocumentUpload({
  id,
  title,
  description,
  value,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  value?: UploadedDocument;
  onChange: (file?: File) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition sm:p-5 ${
        value
          ? "border-[rgba(0,52,120,0.18)] bg-[rgba(0,52,120,0.035)]"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            value ? "bg-[#003478] text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          {value ? (
            <Check className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
          {value ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200/80">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {value.name}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {(value.size / 1024 / 1024).toFixed(2)} MB · Ready
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange(undefined)}
                aria-label={`Remove ${title}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor={id}
              className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-[#003478] focus-within:ring-2 focus-within:ring-[#003478]/20"
            >
              <UploadCloud className="h-4 w-4" />
              Choose file
              <input
                id={id}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleChange}
                className="sr-only"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  icon: Icon,
  complete,
  rows,
  onEdit,
}: {
  title: string;
  icon: LucideIcon;
  complete: boolean;
  rows: Array<{ label: string; value: string }>;
  onEdit: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgba(0,52,120,0.07)] text-[#003478]">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-slate-900">
              {title}
            </h2>
            <p
              className={`mt-0.5 text-[11px] font-medium ${complete ? "text-[#003478]" : "text-slate-400"}`}
            >
              {complete ? "Section complete" : "Information required"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#003478] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
        >
          <PencilLine className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
      <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0">
            <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {row.label}
            </dt>
            <dd className="mt-1 truncate text-xs font-semibold text-slate-700">
              {row.value || "Not provided"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Onboarding() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [form, setForm] = useState<FormState>(initialForm);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [verifying, setVerifying] = useState(false);
  const [linkingBank, setLinkingBank] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const activeStep = steps[currentStep] ?? steps[0];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateSection = <K extends keyof FormState>(
    section: K,
    patch: Partial<FormState[K]>,
  ) => {
    setForm((current) => ({
      ...current,
      [section]: { ...current[section], ...patch },
    }));
    setErrors({});
    setSaveStatus("idle");
  };

  const isStepComplete = (index: number) => {
    switch (index) {
      case 0:
        return Boolean(
          form.personal.firstName &&
          form.personal.lastName &&
          form.personal.dateOfBirth &&
          form.personal.email &&
          form.personal.phone &&
          form.personal.address &&
          form.personal.city &&
          form.personal.postcode &&
          form.personal.country,
        );
      case 1:
        return Boolean(
          form.business.legalName &&
          form.business.entityType &&
          form.business.registrationNumber &&
          form.business.taxCountry &&
          form.business.industry &&
          form.business.role &&
          form.business.ownership,
        );
      case 2:
        return form.identity.verified;
      case 3:
        return form.bank.linked;
      case 4:
        return Boolean(
          form.cash.purpose &&
          form.cash.currency &&
          form.cash.nickname &&
          form.cash.expectedBalance &&
          form.cash.fundingSource,
        );
      case 5:
        return Boolean(
          form.documents.proofOfAddress &&
          form.documents.businessRegistration &&
          form.documents.sourceOfFunds,
        );
      case 6:
        return submitted;
      default:
        return false;
    }
  };

  const completedSections = useMemo(
    () => steps.slice(0, 6).filter((_, index) => isStepComplete(index)).length,
    [form],
  );

  const goToStep = (index: number) => {
    setDirection(index >= currentStep ? 1 : -1);
    setCurrentStep(index);
    setErrors({});
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const validateStep = (index: number) => {
    const nextErrors: Record<string, string> = {};

    if (index === 0) {
      if (!form.personal.firstName)
        nextErrors.firstName = "First name is required.";
      if (!form.personal.lastName)
        nextErrors.lastName = "Last name is required.";
      if (!form.personal.dateOfBirth)
        nextErrors.dateOfBirth = "Date of birth is required.";
      if (!form.personal.email) nextErrors.email = "Email address is required.";
      else if (!/^\S+@\S+\.\S+$/.test(form.personal.email))
        nextErrors.email = "Enter a valid email address.";
      if (!form.personal.phone) nextErrors.phone = "Phone number is required.";
      if (!form.personal.address)
        nextErrors.address = "Residential address is required.";
      if (!form.personal.city) nextErrors.city = "City is required.";
      if (!form.personal.postcode)
        nextErrors.postcode = "Postcode is required.";
      if (!form.personal.country) nextErrors.country = "Country is required.";
    }

    if (index === 1) {
      if (!form.business.legalName)
        nextErrors.legalName = "Legal business name is required.";
      if (!form.business.entityType)
        nextErrors.entityType = "Select an entity type.";
      if (!form.business.registrationNumber)
        nextErrors.registrationNumber = "Registration number is required.";
      if (!form.business.taxCountry)
        nextErrors.taxCountry = "Tax country is required.";
      if (!form.business.industry)
        nextErrors.industry = "Industry is required.";
      if (!form.business.role) nextErrors.role = "Your role is required.";
      if (!form.business.ownership)
        nextErrors.ownership = "Ownership percentage is required.";
    }

    if (index === 2 && !form.identity.verified) {
      nextErrors.identity = "Complete the identity check before continuing.";
    }

    if (index === 3 && !form.bank.linked) {
      nextErrors.bank = "Link and verify a bank account before continuing.";
    }

    if (index === 4) {
      if (!form.cash.purpose) nextErrors.purpose = "Choose an account purpose.";
      if (!form.cash.currency) nextErrors.currency = "Select a base currency.";
      if (!form.cash.nickname)
        nextErrors.nickname = "Account name is required.";
      if (!form.cash.expectedBalance)
        nextErrors.expectedBalance = "Select an expected balance.";
      if (!form.cash.fundingSource)
        nextErrors.fundingSource = "Select a funding source.";
    }

    if (index === 5) {
      if (!form.documents.proofOfAddress)
        nextErrors.proofOfAddress = "Proof of address is required.";
      if (!form.documents.businessRegistration)
        nextErrors.businessRegistration = "Business registration is required.";
      if (!form.documents.sourceOfFunds)
        nextErrors.sourceOfFunds = "Source-of-funds evidence is required.";
    }

    if (index === 6) {
      if (!form.agreements.accuracy)
        nextErrors.accuracy = "Confirm that the information is accurate.";
      if (!form.agreements.terms)
        nextErrors.terms = "Accept the application terms to submit.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < steps.length - 1) goToStep(currentStep + 1);
  };

  const handleIdentityVerification = async () => {
    const nextErrors: Record<string, string> = {};
    if (!form.identity.documentType)
      nextErrors.documentType = "Select an identity document.";
    if (!form.identity.documentNumber)
      nextErrors.documentNumber = "Document number is required.";
    if (!form.identity.issuingCountry)
      nextErrors.issuingCountry = "Issuing country is required.";
    if (!form.identity.consent)
      nextErrors.consent = "Consent is required to run this check.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setVerifying(true);
    await wait(1100);
    updateSection("identity", { verified: true });
    setVerifying(false);
  };

  const handleBankConnection = async () => {
    const nextErrors: Record<string, string> = {};
    if (form.bank.method === "manual") {
      if (!form.bank.institution)
        nextErrors.institution = "Financial institution is required.";
      if (!form.bank.accountName)
        nextErrors.accountName = "Account name is required.";
      if (!/^\d{4}$/.test(form.bank.last4))
        nextErrors.last4 = "Enter the final four account digits.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLinkingBank(true);
    await wait(1000);
    updateSection("bank", {
      linked: true,
      institution: form.bank.institution || "Connected financial institution",
      accountName: form.bank.accountName || "Primary operating account",
      last4: form.bank.last4 || "4821",
    });
    setLinkingBank(false);
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    await wait(650);
    setSaveStatus("saved");
  };

  const handleSubmit = async () => {
    for (let index = 0; index < 6; index += 1) {
      if (!isStepComplete(index)) {
        goToStep(index);
        window.setTimeout(() => validateStep(index), 0);
        return;
      }
    }
    if (!validateStep(6)) return;

    setSubmitting(true);
    await wait(1400);
    setSubmitting(false);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateDocument = (key: keyof FormState["documents"], file?: File) => {
    updateSection("documents", {
      [key]: file ? { name: file.name, size: file.size } : undefined,
    });
  };

  if (submitted) {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-[#f5f7f9] px-5 py-10 selection:bg-[#dce7f2] selection:text-[#0f172a]">
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.58, ease: EASE }}
          className="w-full max-w-[620px] rounded-[28px] border border-black/[0.07] bg-white p-6 text-center shadow-[0_28px_80px_-48px_rgba(15,23,42,0.35)] sm:p-10"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-[#003478] text-white">
            <Check className="h-7 w-7" strokeWidth={2.4} />
          </div>
          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#003478]">
            Application received
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Your application is under review.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
            We have securely received your information and supporting documents.
            A member of the onboarding team will contact you if anything else is
            required.
          </p>
          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            {[
              ["Reference", "CAP-28417"],
              ["Submitted", "Just now"],
              ["Typical review", "1–2 business days"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-[#f7f9fb] p-4"
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {label}
                </p>
                <p className="mt-1.5 text-xs font-semibold text-slate-800">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#003478] px-6 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/25 focus-visible:ring-offset-2"
          >
            Return to sign in
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.section>
      </main>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#f5f7f9] text-slate-950 selection:bg-[#dce7f2] selection:text-[#0f172a]">
      <header className="sticky top-0 z-30 border-b border-black/[0.065] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1380px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Return to sign in"
            className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20 focus-visible:ring-offset-4"
          >
            <img
              src="/company-logo.svg"
              alt="Caprock"
              className="h-8 w-auto sm:h-9"
            />
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex"
              aria-live="polite"
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#003478]" /> Draft saved
                </>
              ) : (
                <>
                  <Clock3 className="h-3.5 w-3.5" /> Changes not saved
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-[#003478] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20 disabled:cursor-wait sm:px-4"
            >
              {saveStatus === "saving" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Save draft</span>
              <span className="sm:hidden">Save</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
              aria-label="Exit onboarding"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1380px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#003478]">
                Step {currentStep + 1} of {steps.length}
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                {activeStep.label}
              </p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-slate-400">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-[#003478]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: reduceMotion ? 0 : 0.4, ease: EASE }}
            />
          </div>
          <div className="mt-3 flex gap-1.5" aria-label="Application steps">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(index)}
                aria-label={`Go to ${step.label}`}
                aria-current={index === currentStep ? "step" : undefined}
                className={`h-1.5 flex-1 rounded-full transition ${
                  index <= currentStep ? "bg-[#003478]" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[292px_minmax(0,820px)] lg:justify-center xl:grid-cols-[320px_minmax(0,840px)] xl:gap-10">
          <aside className="sticky top-[108px] hidden lg:block">
            <div className="overflow-hidden rounded-[26px] border border-black/[0.07] bg-white shadow-[0_24px_60px_-44px_rgba(15,23,42,0.28)]">
              <div className="border-b border-slate-100 bg-[#f3f6f9] p-5 xl:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#003478]">
                      Account application
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-slate-900">
                      {completedSections} of 6 sections complete
                    </p>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-xs font-bold text-[#003478] shadow-sm ring-1 ring-slate-200/70">
                    {Math.round(progress)}%
                  </div>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white">
                  <motion.div
                    className="h-full rounded-full bg-[#003478]"
                    animate={{ width: `${progress}%` }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.4,
                      ease: EASE,
                    }}
                  />
                </div>
              </div>

              <nav className="p-3" aria-label="Onboarding progress">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const active = index === currentStep;
                  const complete = isStepComplete(index);
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => goToStep(index)}
                      aria-current={active ? "step" : undefined}
                      className="group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
                    >
                      {active ? (
                        <motion.span
                          layoutId="active-onboarding-step"
                          className="absolute inset-0 rounded-2xl bg-[rgba(0,52,120,0.065)]"
                          transition={{
                            type: "spring",
                            stiffness: 360,
                            damping: 31,
                          }}
                        />
                      ) : null}
                      <span
                        className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition ${
                          complete
                            ? "border-[#003478] bg-[#003478] text-white"
                            : active
                              ? "border-[rgba(0,52,120,0.16)] bg-white text-[#003478]"
                              : "border-slate-200 bg-white text-slate-400 group-hover:text-slate-600"
                        }`}
                      >
                        {complete ? (
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </span>
                      <span className="relative z-10 min-w-0 flex-1">
                        <span
                          className={`block truncate text-xs font-semibold ${active ? "text-slate-950" : "text-slate-600"}`}
                        >
                          {step.label}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                          {step.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="m-4 mt-1 rounded-2xl border border-slate-200 bg-[#f7f9fb] p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#003478]" />
                  <p className="text-[10px] leading-[1.6] text-slate-500">
                    Your information is encrypted and handled under
                    institutional privacy and compliance controls.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="overflow-hidden rounded-[24px] border border-black/[0.07] bg-white shadow-[0_28px_80px_-50px_rgba(15,23,42,0.28)] sm:rounded-[30px]">
              <div className="min-h-[570px] p-5 sm:p-8 lg:p-9 xl:p-10">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.div
                    key={activeStep.id}
                    custom={direction}
                    initial={
                      reduceMotion ? false : { opacity: 0, x: direction * 22 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    exit={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, x: direction * -16 }
                    }
                    transition={{ duration: 0.34, ease: EASE }}
                  >
                    {currentStep === 0 ? (
                      <>
                        <SectionIntro
                          eyebrow="Step 1 · Personal information"
                          title="Tell us about yourself."
                          description="Enter your legal details exactly as they appear on your identity documents."
                          icon={UserRound}
                        />
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field
                            label="Legal first name"
                            htmlFor="firstName"
                            error={errors.firstName}
                          >
                            <input
                              id="firstName"
                              value={form.personal.firstName}
                              onChange={(e) =>
                                updateSection("personal", {
                                  firstName: e.target.value,
                                })
                              }
                              className={inputClass(Boolean(errors.firstName))}
                              autoComplete="given-name"
                            />
                          </Field>
                          <Field
                            label="Legal last name"
                            htmlFor="lastName"
                            error={errors.lastName}
                          >
                            <input
                              id="lastName"
                              value={form.personal.lastName}
                              onChange={(e) =>
                                updateSection("personal", {
                                  lastName: e.target.value,
                                })
                              }
                              className={inputClass(Boolean(errors.lastName))}
                              autoComplete="family-name"
                            />
                          </Field>
                          <Field
                            label="Date of birth"
                            htmlFor="dateOfBirth"
                            error={errors.dateOfBirth}
                          >
                            <input
                              id="dateOfBirth"
                              type="date"
                              value={form.personal.dateOfBirth}
                              onChange={(e) =>
                                updateSection("personal", {
                                  dateOfBirth: e.target.value,
                                })
                              }
                              className={inputClass(
                                Boolean(errors.dateOfBirth),
                              )}
                            />
                          </Field>
                          <Field label="Citizenship" htmlFor="citizenship">
                            <input
                              id="citizenship"
                              value={form.personal.citizenship}
                              onChange={(e) =>
                                updateSection("personal", {
                                  citizenship: e.target.value,
                                })
                              }
                              placeholder="e.g. Australian"
                              className={inputClass()}
                            />
                          </Field>
                          <Field
                            label="Email address"
                            htmlFor="personalEmail"
                            error={errors.email}
                          >
                            <div className="relative">
                              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <input
                                id="personalEmail"
                                type="email"
                                value={form.personal.email}
                                onChange={(e) =>
                                  updateSection("personal", {
                                    email: e.target.value,
                                  })
                                }
                                className={`${inputClass(Boolean(errors.email))} pl-10`}
                                autoComplete="email"
                                placeholder="you@example.com"
                              />
                            </div>
                          </Field>
                          <Field
                            label="Mobile number"
                            htmlFor="phone"
                            error={errors.phone}
                          >
                            <div className="relative">
                              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <input
                                id="phone"
                                type="tel"
                                value={form.personal.phone}
                                onChange={(e) =>
                                  updateSection("personal", {
                                    phone: e.target.value,
                                  })
                                }
                                className={`${inputClass(Boolean(errors.phone))} pl-10`}
                                autoComplete="tel"
                                placeholder="+61 400 000 000"
                              />
                            </div>
                          </Field>
                          <div className="sm:col-span-2">
                            <Field
                              label="Residential address"
                              htmlFor="address"
                              error={errors.address}
                            >
                              <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                  id="address"
                                  value={form.personal.address}
                                  onChange={(e) =>
                                    updateSection("personal", {
                                      address: e.target.value,
                                    })
                                  }
                                  className={`${inputClass(Boolean(errors.address))} pl-10`}
                                  autoComplete="street-address"
                                  placeholder="Street address"
                                />
                              </div>
                            </Field>
                          </div>
                          <Field
                            label="City"
                            htmlFor="city"
                            error={errors.city}
                          >
                            <input
                              id="city"
                              value={form.personal.city}
                              onChange={(e) =>
                                updateSection("personal", {
                                  city: e.target.value,
                                })
                              }
                              className={inputClass(Boolean(errors.city))}
                              autoComplete="address-level2"
                            />
                          </Field>
                          <Field label="State or region" htmlFor="state">
                            <input
                              id="state"
                              value={form.personal.state}
                              onChange={(e) =>
                                updateSection("personal", {
                                  state: e.target.value,
                                })
                              }
                              className={inputClass()}
                              autoComplete="address-level1"
                            />
                          </Field>
                          <Field
                            label="Postcode"
                            htmlFor="postcode"
                            error={errors.postcode}
                          >
                            <input
                              id="postcode"
                              value={form.personal.postcode}
                              onChange={(e) =>
                                updateSection("personal", {
                                  postcode: e.target.value,
                                })
                              }
                              className={inputClass(Boolean(errors.postcode))}
                              autoComplete="postal-code"
                            />
                          </Field>
                          <Field
                            label="Country of residence"
                            htmlFor="country"
                            error={errors.country}
                          >
                            <select
                              id="country"
                              value={form.personal.country}
                              onChange={(e) =>
                                updateSection("personal", {
                                  country: e.target.value,
                                })
                              }
                              className={inputClass(Boolean(errors.country))}
                              autoComplete="country-name"
                            >
                              <option value="">Select country</option>
                              <option>Australia</option>
                              <option>New Zealand</option>
                              <option>United States</option>
                              <option>United Kingdom</option>
                              <option>Singapore</option>
                              <option>Other</option>
                            </select>
                          </Field>
                        </div>
                      </>
                    ) : null}

                    {currentStep === 1 ? (
                      <>
                        <SectionIntro
                          eyebrow="Step 2 · Business information"
                          title="Tell us about the business."
                          description="We use this information to understand the entity, ownership structure and regulatory obligations."
                          icon={BriefcaseBusiness}
                        />
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <Field
                              label="Legal business name"
                              htmlFor="legalName"
                              error={errors.legalName}
                            >
                              <div className="relative">
                                <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                  id="legalName"
                                  value={form.business.legalName}
                                  onChange={(e) =>
                                    updateSection("business", {
                                      legalName: e.target.value,
                                    })
                                  }
                                  className={`${inputClass(Boolean(errors.legalName))} pl-10`}
                                  placeholder="Registered entity name"
                                />
                              </div>
                            </Field>
                          </div>
                          <Field
                            label="Trading name"
                            htmlFor="tradingName"
                            hint="Optional, if different from the legal name"
                          >
                            <input
                              id="tradingName"
                              value={form.business.tradingName}
                              onChange={(e) =>
                                updateSection("business", {
                                  tradingName: e.target.value,
                                })
                              }
                              className={inputClass()}
                            />
                          </Field>
                          <Field
                            label="Entity type"
                            htmlFor="entityType"
                            error={errors.entityType}
                          >
                            <select
                              id="entityType"
                              value={form.business.entityType}
                              onChange={(e) =>
                                updateSection("business", {
                                  entityType: e.target.value,
                                })
                              }
                              className={inputClass(Boolean(errors.entityType))}
                            >
                              <option value="">Select entity type</option>
                              <option>Private company</option>
                              <option>Public company</option>
                              <option>Partnership</option>
                              <option>Trust</option>
                              <option>Foundation</option>
                              <option>Family office</option>
                            </select>
                          </Field>
                          <Field
                            label="Registration number"
                            htmlFor="registrationNumber"
                            error={errors.registrationNumber}
                          >
                            <input
                              id="registrationNumber"
                              value={form.business.registrationNumber}
                              onChange={(e) =>
                                updateSection("business", {
                                  registrationNumber: e.target.value,
                                })
                              }
                              className={inputClass(
                                Boolean(errors.registrationNumber),
                              )}
                              placeholder="ABN, ACN, EIN or equivalent"
                            />
                          </Field>
                          <Field
                            label="Tax residency"
                            htmlFor="taxCountry"
                            error={errors.taxCountry}
                          >
                            <input
                              id="taxCountry"
                              value={form.business.taxCountry}
                              onChange={(e) =>
                                updateSection("business", {
                                  taxCountry: e.target.value,
                                })
                              }
                              className={inputClass(Boolean(errors.taxCountry))}
                              placeholder="Country"
                            />
                          </Field>
                          <Field
                            label="Industry"
                            htmlFor="industry"
                            error={errors.industry}
                          >
                            <select
                              id="industry"
                              value={form.business.industry}
                              onChange={(e) =>
                                updateSection("business", {
                                  industry: e.target.value,
                                })
                              }
                              className={inputClass(Boolean(errors.industry))}
                            >
                              <option value="">Select industry</option>
                              <option>Financial services</option>
                              <option>Professional services</option>
                              <option>Technology</option>
                              <option>Property and construction</option>
                              <option>Healthcare</option>
                              <option>Manufacturing</option>
                              <option>Other</option>
                            </select>
                          </Field>
                          <Field label="Company website" htmlFor="website">
                            <div className="relative">
                              <Globe2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <input
                                id="website"
                                type="url"
                                value={form.business.website}
                                onChange={(e) =>
                                  updateSection("business", {
                                    website: e.target.value,
                                  })
                                }
                                className={`${inputClass()} pl-10`}
                                placeholder="https://"
                              />
                            </div>
                          </Field>
                          <Field
                            label="Your role"
                            htmlFor="role"
                            error={errors.role}
                          >
                            <input
                              id="role"
                              value={form.business.role}
                              onChange={(e) =>
                                updateSection("business", {
                                  role: e.target.value,
                                })
                              }
                              className={inputClass(Boolean(errors.role))}
                              placeholder="Director, trustee, authorised officer"
                            />
                          </Field>
                          <Field
                            label="Ownership percentage"
                            htmlFor="ownership"
                            error={errors.ownership}
                          >
                            <input
                              id="ownership"
                              inputMode="decimal"
                              value={form.business.ownership}
                              onChange={(e) =>
                                updateSection("business", {
                                  ownership: e.target.value,
                                })
                              }
                              className={inputClass(Boolean(errors.ownership))}
                              placeholder="e.g. 25%"
                            />
                          </Field>
                          <div className="sm:col-span-2">
                            <Field
                              label="Registered address"
                              htmlFor="businessAddress"
                            >
                              <input
                                id="businessAddress"
                                value={form.business.address}
                                onChange={(e) =>
                                  updateSection("business", {
                                    address: e.target.value,
                                  })
                                }
                                className={inputClass()}
                                placeholder="Street address"
                              />
                            </Field>
                          </div>
                          <Field label="City" htmlFor="businessCity">
                            <input
                              id="businessCity"
                              value={form.business.city}
                              onChange={(e) =>
                                updateSection("business", {
                                  city: e.target.value,
                                })
                              }
                              className={inputClass()}
                            />
                          </Field>
                          <Field label="Postcode" htmlFor="businessPostcode">
                            <input
                              id="businessPostcode"
                              value={form.business.postcode}
                              onChange={(e) =>
                                updateSection("business", {
                                  postcode: e.target.value,
                                })
                              }
                              className={inputClass()}
                            />
                          </Field>
                        </div>
                      </>
                    ) : null}

                    {currentStep === 2 ? (
                      <>
                        <SectionIntro
                          eyebrow="Step 3 · Prove it’s you"
                          title="Complete a secure identity check."
                          description="Verify an eligible identity document. Your details are encrypted and used only for identity and compliance checks."
                          icon={Fingerprint}
                        />
                        {form.identity.verified ? (
                          <motion.div
                            initial={
                              reduceMotion ? false : { opacity: 0, y: 10 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-[22px] border border-[rgba(0,52,120,0.16)] bg-[rgba(0,52,120,0.04)] p-5 sm:p-6"
                          >
                            <div className="flex items-start gap-4">
                              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#003478] text-white">
                                <BadgeCheck className="h-6 w-6" />
                              </div>
                              <div>
                                <h2 className="text-base font-semibold text-slate-950">
                                  Identity verified
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                  Your document details and identity check have
                                  been successfully completed.
                                </p>
                              </div>
                            </div>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                              {[
                                "Document details matched",
                                "Identity presence confirmed",
                                "Compliance screening complete",
                              ].map((item) => (
                                <div
                                  key={item}
                                  className="flex items-start gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200/70"
                                >
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#003478]" />
                                  <span className="text-xs font-medium leading-5 text-slate-600">
                                    {item}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                updateSection("identity", { verified: false })
                              }
                              className="mt-5 text-xs font-semibold text-slate-500 hover:text-[#003478]"
                            >
                              Run verification again
                            </button>
                          </motion.div>
                        ) : (
                          <div className="space-y-6">
                            <fieldset>
                              <legend className="mb-3 text-[13px] font-semibold text-slate-800">
                                Choose an identity document
                              </legend>
                              <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                  {
                                    value: "passport",
                                    label: "Passport",
                                    icon: Globe2,
                                  },
                                  {
                                    value: "licence",
                                    label: "Driver licence",
                                    icon: IdCard,
                                  },
                                  {
                                    value: "national-id",
                                    label: "National ID",
                                    icon: BadgeCheck,
                                  },
                                ].map((option) => {
                                  const Icon = option.icon;
                                  const selected =
                                    form.identity.documentType === option.value;
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() =>
                                        updateSection("identity", {
                                          documentType: option.value,
                                          verified: false,
                                        })
                                      }
                                      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20 ${selected ? "border-[#003478] bg-[rgba(0,52,120,0.055)]" : "border-slate-200 hover:border-slate-300"}`}
                                    >
                                      <div
                                        className={`grid h-9 w-9 place-items-center rounded-xl ${selected ? "bg-[#003478] text-white" : "bg-slate-100 text-slate-500"}`}
                                      >
                                        <Icon className="h-4 w-4" />
                                      </div>
                                      <span className="text-xs font-semibold text-slate-800">
                                        {option.label}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                              {errors.documentType ? (
                                <p className="mt-2 text-xs font-medium text-red-600">
                                  {errors.documentType}
                                </p>
                              ) : null}
                            </fieldset>
                            <div className="grid gap-5 sm:grid-cols-2">
                              <Field
                                label="Document number"
                                htmlFor="documentNumber"
                                error={errors.documentNumber}
                              >
                                <input
                                  id="documentNumber"
                                  value={form.identity.documentNumber}
                                  onChange={(e) =>
                                    updateSection("identity", {
                                      documentNumber: e.target.value,
                                      verified: false,
                                    })
                                  }
                                  className={inputClass(
                                    Boolean(errors.documentNumber),
                                  )}
                                />
                              </Field>
                              <Field
                                label="Issuing country"
                                htmlFor="issuingCountry"
                                error={errors.issuingCountry}
                              >
                                <input
                                  id="issuingCountry"
                                  value={form.identity.issuingCountry}
                                  onChange={(e) =>
                                    updateSection("identity", {
                                      issuingCountry: e.target.value,
                                      verified: false,
                                    })
                                  }
                                  className={inputClass(
                                    Boolean(errors.issuingCountry),
                                  )}
                                />
                              </Field>
                            </div>
                            <label
                              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${errors.consent ? "border-red-300" : "border-slate-200"}`}
                            >
                              <input
                                type="checkbox"
                                checked={form.identity.consent}
                                onChange={(e) =>
                                  updateSection("identity", {
                                    consent: e.target.checked,
                                    verified: false,
                                  })
                                }
                                className="mt-0.5 h-4 w-4 rounded accent-[#003478]"
                              />
                              <span className="text-xs leading-5 text-slate-600">
                                I consent to Caprock verifying my identity
                                details with approved identity and compliance
                                providers.
                              </span>
                            </label>
                            {errors.consent ? (
                              <p className="-mt-4 text-xs font-medium text-red-600">
                                {errors.consent}
                              </p>
                            ) : null}
                            <button
                              type="button"
                              onClick={handleIdentityVerification}
                              disabled={verifying}
                              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#003478] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:transform-none disabled:opacity-85 sm:w-auto"
                            >
                              {verifying ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <LockKeyhole className="h-4 w-4" />
                              )}
                              {verifying
                                ? "Verifying securely"
                                : "Start secure identity check"}
                            </button>
                            {errors.identity ? (
                              <p className="text-xs font-medium text-red-600">
                                {errors.identity}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </>
                    ) : null}

                    {currentStep === 3 ? (
                      <>
                        <SectionIntro
                          eyebrow="Step 4 · Link bank account"
                          title="Connect a funding account."
                          description="Link an account held in the same legal name. This will be used for approved deposits and withdrawals."
                          icon={Landmark}
                        />
                        {form.bank.linked ? (
                          <motion.div
                            initial={
                              reduceMotion ? false : { opacity: 0, y: 10 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            className="overflow-hidden rounded-[22px] border border-[rgba(0,52,120,0.16)] bg-white"
                          >
                            <div className="flex items-start justify-between gap-4 bg-[rgba(0,52,120,0.045)] p-5 sm:p-6">
                              <div className="flex items-center gap-4">
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#003478] text-white">
                                  <Landmark className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-950">
                                    {form.bank.institution}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Secure bank connection
                                  </p>
                                </div>
                              </div>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#003478] ring-1 ring-[rgba(0,52,120,0.12)]">
                                <Check className="h-3 w-3" />
                                Linked
                              </span>
                            </div>
                            <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Account name
                                </p>
                                <p className="mt-1.5 text-xs font-semibold text-slate-700">
                                  {form.bank.accountName}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Account
                                </p>
                                <p className="mt-1.5 text-xs font-semibold text-slate-700">
                                  •••• {form.bank.last4}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Verification
                                </p>
                                <p className="mt-1.5 text-xs font-semibold text-[#003478]">
                                  Ownership matched
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                updateSection("bank", { linked: false })
                              }
                              className="mx-5 mb-5 text-xs font-semibold text-slate-500 hover:text-[#003478] sm:mx-6 sm:mb-6"
                            >
                              Change linked account
                            </button>
                          </motion.div>
                        ) : (
                          <div className="space-y-6">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateSection("bank", { method: "instant" })
                                }
                                className={`rounded-2xl border p-4 text-left transition ${form.bank.method === "instant" ? "border-[#003478] bg-[rgba(0,52,120,0.05)]" : "border-slate-200"}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`grid h-10 w-10 place-items-center rounded-xl ${form.bank.method === "instant" ? "bg-[#003478] text-white" : "bg-slate-100 text-slate-500"}`}
                                  >
                                    <Link2 className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      Instant connection
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                      Recommended · About 1 minute
                                    </p>
                                  </div>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateSection("bank", { method: "manual" })
                                }
                                className={`rounded-2xl border p-4 text-left transition ${form.bank.method === "manual" ? "border-[#003478] bg-[rgba(0,52,120,0.05)]" : "border-slate-200"}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`grid h-10 w-10 place-items-center rounded-xl ${form.bank.method === "manual" ? "bg-[#003478] text-white" : "bg-slate-100 text-slate-500"}`}
                                  >
                                    <Banknote className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      Enter manually
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                      Verify account details
                                    </p>
                                  </div>
                                </div>
                              </button>
                            </div>
                            {form.bank.method === "manual" ? (
                              <div className="grid gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                  <Field
                                    label="Financial institution"
                                    htmlFor="institution"
                                    error={errors.institution}
                                  >
                                    <input
                                      id="institution"
                                      value={form.bank.institution}
                                      onChange={(e) =>
                                        updateSection("bank", {
                                          institution: e.target.value,
                                        })
                                      }
                                      className={inputClass(
                                        Boolean(errors.institution),
                                      )}
                                    />
                                  </Field>
                                </div>
                                <Field
                                  label="Account name"
                                  htmlFor="accountName"
                                  error={errors.accountName}
                                >
                                  <input
                                    id="accountName"
                                    value={form.bank.accountName}
                                    onChange={(e) =>
                                      updateSection("bank", {
                                        accountName: e.target.value,
                                      })
                                    }
                                    className={inputClass(
                                      Boolean(errors.accountName),
                                    )}
                                  />
                                </Field>
                                <Field
                                  label="Last four account digits"
                                  htmlFor="last4"
                                  error={errors.last4}
                                >
                                  <input
                                    id="last4"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={form.bank.last4}
                                    onChange={(e) =>
                                      updateSection("bank", {
                                        last4: e.target.value.replace(
                                          /\D/g,
                                          "",
                                        ),
                                      })
                                    }
                                    className={inputClass(
                                      Boolean(errors.last4),
                                    )}
                                    placeholder="0000"
                                  />
                                </Field>
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-slate-200 bg-[#f7f9fb] p-5">
                                <div className="flex items-start gap-3">
                                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      Private and read-only
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                      Caprock receives account ownership and
                                      routing confirmation only. Your banking
                                      credentials are never stored.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={handleBankConnection}
                              disabled={linkingBank}
                              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#003478] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:transform-none disabled:opacity-85 sm:w-auto"
                            >
                              {linkingBank ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Link2 className="h-4 w-4" />
                              )}
                              {linkingBank
                                ? "Connecting securely"
                                : form.bank.method === "instant"
                                  ? "Connect bank securely"
                                  : "Verify bank account"}
                            </button>
                            {errors.bank ? (
                              <p className="text-xs font-medium text-red-600">
                                {errors.bank}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </>
                    ) : null}

                    {currentStep === 4 ? (
                      <>
                        <SectionIntro
                          eyebrow="Step 5 · Cash account"
                          title="Configure your cash account."
                          description="Choose how the account will be used and provide an expected funding profile."
                          icon={CircleDollarSign}
                        />
                        <div className="space-y-6">
                          <fieldset>
                            <legend className="mb-3 text-[13px] font-semibold text-slate-800">
                              Primary account purpose
                            </legend>
                            <div className="grid gap-3 sm:grid-cols-3">
                              {[
                                {
                                  value: "operating",
                                  label: "Operating cash",
                                  description: "Everyday capital movements",
                                  icon: Banknote,
                                },
                                {
                                  value: "reserve",
                                  label: "Reserve & liquidity",
                                  description: "Hold strategic cash",
                                  icon: ShieldCheck,
                                },
                                {
                                  value: "settlement",
                                  label: "Investment settlement",
                                  description: "Fund subscriptions and income",
                                  icon: Landmark,
                                },
                              ].map((option) => {
                                const Icon = option.icon;
                                const selected =
                                  form.cash.purpose === option.value;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() =>
                                      updateSection("cash", {
                                        purpose: option.value,
                                      })
                                    }
                                    className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20 ${selected ? "border-[#003478] bg-[rgba(0,52,120,0.05)]" : "border-slate-200 hover:border-slate-300"}`}
                                  >
                                    <div
                                      className={`grid h-10 w-10 place-items-center rounded-xl ${selected ? "bg-[#003478] text-white" : "bg-slate-100 text-slate-500"}`}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <p className="mt-3 text-xs font-semibold text-slate-900">
                                      {option.label}
                                    </p>
                                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                                      {option.description}
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                            {errors.purpose ? (
                              <p className="mt-2 text-xs font-medium text-red-600">
                                {errors.purpose}
                              </p>
                            ) : null}
                          </fieldset>
                          <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                              label="Base currency"
                              htmlFor="currency"
                              error={errors.currency}
                            >
                              <select
                                id="currency"
                                value={form.cash.currency}
                                onChange={(e) =>
                                  updateSection("cash", {
                                    currency: e.target.value,
                                  })
                                }
                                className={inputClass(Boolean(errors.currency))}
                              >
                                <option value="">Select currency</option>
                                <option value="AUD">
                                  AUD · Australian Dollar
                                </option>
                                <option value="USD">USD · US Dollar</option>
                                <option value="EUR">EUR · Euro</option>
                                <option value="GBP">GBP · British Pound</option>
                                <option value="SGD">
                                  SGD · Singapore Dollar
                                </option>
                              </select>
                            </Field>
                            <Field
                              label="Account nickname"
                              htmlFor="nickname"
                              error={errors.nickname}
                            >
                              <input
                                id="nickname"
                                value={form.cash.nickname}
                                onChange={(e) =>
                                  updateSection("cash", {
                                    nickname: e.target.value,
                                  })
                                }
                                className={inputClass(Boolean(errors.nickname))}
                                placeholder="e.g. Primary settlement"
                              />
                            </Field>
                            <Field
                              label="Expected account balance"
                              htmlFor="expectedBalance"
                              error={errors.expectedBalance}
                            >
                              <select
                                id="expectedBalance"
                                value={form.cash.expectedBalance}
                                onChange={(e) =>
                                  updateSection("cash", {
                                    expectedBalance: e.target.value,
                                  })
                                }
                                className={inputClass(
                                  Boolean(errors.expectedBalance),
                                )}
                              >
                                <option value="">Select range</option>
                                <option>Under $100,000</option>
                                <option>$100,000 – $500,000</option>
                                <option>$500,000 – $2 million</option>
                                <option>$2 million – $10 million</option>
                                <option>Over $10 million</option>
                              </select>
                            </Field>
                            <Field
                              label="Primary funding source"
                              htmlFor="fundingSource"
                              error={errors.fundingSource}
                            >
                              <select
                                id="fundingSource"
                                value={form.cash.fundingSource}
                                onChange={(e) =>
                                  updateSection("cash", {
                                    fundingSource: e.target.value,
                                  })
                                }
                                className={inputClass(
                                  Boolean(errors.fundingSource),
                                )}
                              >
                                <option value="">Select source</option>
                                <option>Business operating income</option>
                                <option>Investment proceeds</option>
                                <option>Asset sale</option>
                                <option>Capital contribution</option>
                                <option>Distribution or dividend</option>
                                <option>Other</option>
                              </select>
                            </Field>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-[#f7f9fb] p-4">
                            <div className="flex items-start gap-3">
                              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#003478]" />
                              <div>
                                <p className="text-xs font-semibold text-slate-800">
                                  Account controls by design
                                </p>
                                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                  Withdrawals are restricted to verified
                                  accounts held in the approved legal name.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : null}

                    {currentStep === 5 ? (
                      <>
                        <SectionIntro
                          eyebrow="Step 6 · Proof documents"
                          title="Upload supporting documents."
                          description="Provide clear, current documents. PDF, PNG and JPG files up to 10 MB are accepted."
                          icon={FileCheck2}
                        />
                        <div className="space-y-3">
                          <DocumentUpload
                            id="proof-address"
                            title="Proof of residential address"
                            description="Utility bill, bank statement or government correspondence issued within the last 90 days."
                            value={form.documents.proofOfAddress}
                            onChange={(file) =>
                              updateDocument("proofOfAddress", file)
                            }
                          />
                          <DocumentUpload
                            id="business-registration"
                            title="Business registration"
                            description="Certificate of incorporation, company extract, trust deed or equivalent formation document."
                            value={form.documents.businessRegistration}
                            onChange={(file) =>
                              updateDocument("businessRegistration", file)
                            }
                          />
                          <DocumentUpload
                            id="source-funds"
                            title="Source of funds"
                            description="Bank statement, audited financial statement, sale agreement or other supporting evidence."
                            value={form.documents.sourceOfFunds}
                            onChange={(file) =>
                              updateDocument("sourceOfFunds", file)
                            }
                          />
                        </div>
                        {Object.keys(errors).length ? (
                          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                            Please upload all three required documents before
                            continuing.
                          </div>
                        ) : null}
                        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#f7f9fb] p-4">
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#003478]" />
                          <p className="text-[11px] leading-5 text-slate-500">
                            Files are encrypted during transfer and at rest.
                            Access is limited to authorised onboarding and
                            compliance personnel.
                          </p>
                        </div>
                      </>
                    ) : null}

                    {currentStep === 6 ? (
                      <>
                        <SectionIntro
                          eyebrow="Final step · Review and submit"
                          title="Review your application."
                          description="Confirm each section before securely submitting your application for review."
                          icon={Send}
                        />
                        <div className="mb-5 rounded-2xl border border-[rgba(0,52,120,0.14)] bg-[rgba(0,52,120,0.04)] p-4 sm:p-5">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Application readiness
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {completedSections} of 6 required sections
                                complete
                              </p>
                            </div>
                            <span className="text-lg font-semibold tracking-[-0.04em] text-[#003478]">
                              {Math.round((completedSections / 6) * 100)}%
                            </span>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                            <motion.div
                              className="h-full rounded-full bg-[#003478]"
                              animate={{
                                width: `${(completedSections / 6) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <ReviewSection
                            title="Personal information"
                            icon={UserRound}
                            complete={isStepComplete(0)}
                            onEdit={() => goToStep(0)}
                            rows={[
                              {
                                label: "Name",
                                value:
                                  `${form.personal.firstName} ${form.personal.lastName}`.trim(),
                              },
                              {
                                label: "Contact",
                                value:
                                  form.personal.email || form.personal.phone,
                              },
                              {
                                label: "Residence",
                                value: [
                                  form.personal.city,
                                  form.personal.country,
                                ]
                                  .filter(Boolean)
                                  .join(", "),
                              },
                              {
                                label: "Date of birth",
                                value: form.personal.dateOfBirth,
                              },
                            ]}
                          />
                          <ReviewSection
                            title="Business information"
                            icon={BriefcaseBusiness}
                            complete={isStepComplete(1)}
                            onEdit={() => goToStep(1)}
                            rows={[
                              {
                                label: "Legal entity",
                                value: form.business.legalName,
                              },
                              {
                                label: "Entity type",
                                value: form.business.entityType,
                              },
                              {
                                label: "Registration",
                                value: form.business.registrationNumber,
                              },
                              { label: "Your role", value: form.business.role },
                            ]}
                          />
                          <ReviewSection
                            title="Identity and bank"
                            icon={BadgeCheck}
                            complete={isStepComplete(2) && isStepComplete(3)}
                            onEdit={() => goToStep(isStepComplete(2) ? 3 : 2)}
                            rows={[
                              {
                                label: "Identity",
                                value: form.identity.verified
                                  ? "Verified"
                                  : "Not verified",
                              },
                              {
                                label: "Identity document",
                                value: form.identity.documentType,
                              },
                              {
                                label: "Linked account",
                                value: form.bank.linked
                                  ? `${form.bank.accountName} •••• ${form.bank.last4}`
                                  : "Not linked",
                              },
                              {
                                label: "Institution",
                                value: form.bank.institution,
                              },
                            ]}
                          />
                          <ReviewSection
                            title="Cash account and documents"
                            icon={WalletCards}
                            complete={isStepComplete(4) && isStepComplete(5)}
                            onEdit={() => goToStep(isStepComplete(4) ? 5 : 4)}
                            rows={[
                              { label: "Account", value: form.cash.nickname },
                              { label: "Currency", value: form.cash.currency },
                              { label: "Purpose", value: form.cash.purpose },
                              {
                                label: "Documents",
                                value: isStepComplete(5)
                                  ? "3 files ready"
                                  : "Files required",
                              },
                            ]}
                          />
                        </div>
                        <div className="mt-6 space-y-3">
                          <label
                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${errors.accuracy ? "border-red-300" : "border-slate-200"}`}
                          >
                            <input
                              type="checkbox"
                              checked={form.agreements.accuracy}
                              onChange={(e) =>
                                updateSection("agreements", {
                                  accuracy: e.target.checked,
                                })
                              }
                              className="mt-0.5 h-4 w-4 rounded accent-[#003478]"
                            />
                            <span className="text-xs leading-5 text-slate-600">
                              I confirm that the information and documents
                              provided are complete, current and accurate.
                            </span>
                          </label>
                          <label
                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${errors.terms ? "border-red-300" : "border-slate-200"}`}
                          >
                            <input
                              type="checkbox"
                              checked={form.agreements.terms}
                              onChange={(e) =>
                                updateSection("agreements", {
                                  terms: e.target.checked,
                                })
                              }
                              className="mt-0.5 h-4 w-4 rounded accent-[#003478]"
                            />
                            <span className="text-xs leading-5 text-slate-600">
                              I agree to the account application terms, privacy
                              notice and electronic communications consent.
                            </span>
                          </label>
                          {errors.accuracy || errors.terms ? (
                            <p className="text-xs font-medium text-red-600">
                              Complete both confirmations before submitting.
                            </p>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-9 xl:px-10">
                <button
                  type="button"
                  onClick={() =>
                    currentStep > 0 ? goToStep(currentStep - 1) : navigate("/")
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {currentStep === 0 ? "Back to sign in" : "Previous"}
                </button>

                {currentStep === steps.length - 1 ? (
                  <motion.button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    whileHover={
                      !reduceMotion && !submitting ? { y: -1 } : undefined
                    }
                    whileTap={
                      !reduceMotion && !submitting
                        ? { scale: 0.985 }
                        : undefined
                    }
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#003478] px-6 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/25 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-85"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {submitting ? "Submitting securely" : "Submit application"}
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleContinue}
                    whileHover={!reduceMotion ? { y: -1 } : undefined}
                    whileTap={!reduceMotion ? { scale: 0.985 } : undefined}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#003478] px-6 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/25 focus-visible:ring-offset-2"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            </div>

            <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
              Need help? Contact your Caprock representative or onboarding
              support.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
