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
  Search,
  Send,
  ShieldCheck,
  UploadCloud,
  UserPlus,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CustomSelect } from "../components/ui/CustomSelect";
import type { SelectOption } from "../components/ui/CustomSelect";

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

type ApplicationType =
  | "individual"
  | "joint-spouse"
  | "joint-same-address"
  | "joint-different-address"
  | "sole-trader"
  | "";

type JointApplicant = {
  id: string;
  method: "client-id" | "new-invite";
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  confirmed: boolean;
};

type FormState = {
  personal: {
    applicationType: ApplicationType;
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
  jointApplicants: JointApplicant[];
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

const allSteps: Step[] = [
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
    applicationType: "",
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
  jointApplicants: [],
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

const APPLICATION_TYPE_OPTIONS: SelectOption[] = [
  {
    value: "individual",
    label: "1 · Individual",
    description: "An account held by one person",
  },
  {
    value: "joint-spouse",
    label: "2 · Husband and wife joint account · same address",
    description: "Husband and wife with the same residential address",
  },
  {
    value: "joint-same-address",
    label: "3 · Different surnames · same address",
    description: "Applicants with the same residential address",
  },
  {
    value: "joint-different-address",
    label: "4 · Joint account with different addresses",
    description: "Applicants have separate residential addresses",
  },
  {
    value: "sole-trader",
    label: "5 · Sole trader",
    description: "An individual operating a registered business",
  },
];

const createJointApplicant = (): JointApplicant => ({
  id: `joint-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  method: "client-id",
  clientId: "",
  firstName: "",
  lastName: "",
  email: "",
  address: "",
  city: "",
  state: "",
  postcode: "",
  country: "",
  confirmed: false,
});

const COUNTRY_OPTIONS: SelectOption[] = [
  { value: "Australia", label: "Australia" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Singapore", label: "Singapore" },
  { value: "Hong Kong", label: "Hong Kong" },
  { value: "Canada", label: "Canada" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "Other", label: "Other" },
];

const ENTITY_OPTIONS: SelectOption[] = [
  { value: "Sole trader", label: "Sole trader" },
  { value: "Private company", label: "Private company" },
  { value: "Public company", label: "Public company" },
  { value: "Partnership", label: "Partnership" },
  { value: "Trust", label: "Trust" },
  { value: "Foundation", label: "Foundation" },
  { value: "Family office", label: "Family office" },
];

const INDUSTRY_OPTIONS: SelectOption[] = [
  { value: "Financial services", label: "Financial services" },
  { value: "Professional services", label: "Professional services" },
  { value: "Technology", label: "Technology" },
  { value: "Property and construction", label: "Property and construction" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Other", label: "Other" },
];

const CURRENCY_OPTIONS: SelectOption[] = [
  {
    value: "AUD",
    label: "AUD · Australian Dollar",
    description: "Australian Dollar",
  },
  {
    value: "USD",
    label: "USD · US Dollar",
    description: "United States Dollar",
  },
  { value: "EUR", label: "EUR · Euro", description: "Euro" },
  { value: "GBP", label: "GBP · British Pound", description: "Pound Sterling" },
  {
    value: "SGD",
    label: "SGD · Singapore Dollar",
    description: "Singapore Dollar",
  },
];

const BALANCE_OPTIONS: SelectOption[] = [
  { value: "Under $100,000", label: "Under $100,000" },
  { value: "$100,000 – $500,000", label: "$100,000 – $500,000" },
  { value: "$500,000 – $2 million", label: "$500,000 – $2 million" },
  { value: "$2 million – $10 million", label: "$2 million – $10 million" },
  { value: "Over $10 million", label: "Over $10 million" },
];

const FUNDING_OPTIONS: SelectOption[] = [
  { value: "Business operating income", label: "Business operating income" },
  { value: "Investment proceeds", label: "Investment proceeds" },
  { value: "Asset sale", label: "Asset sale" },
  { value: "Capital contribution", label: "Capital contribution" },
  { value: "Distribution or dividend", label: "Distribution or dividend" },
  { value: "Other", label: "Other" },
];

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
  const [jointDraft, setJointDraft] = useState<JointApplicant | null>(null);
  const [jointLookupStatus, setJointLookupStatus] = useState<
    "idle" | "searching" | "found"
  >("idle");
  const [verifying, setVerifying] = useState(false);
  const [linkingBank, setLinkingBank] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isJointApplication = [
    "joint-spouse",
    "joint-same-address",
    "joint-different-address",
  ].includes(form.personal.applicationType);
  const usesPrimaryAddress = ["joint-spouse", "joint-same-address"].includes(
    form.personal.applicationType,
  );
  const isSoleTrader = form.personal.applicationType === "sole-trader";
  const visibleSteps = useMemo(
    () => allSteps.filter((step) => step.id !== "business" || isSoleTrader),
    [isSoleTrader],
  );
  const requiredSteps = visibleSteps.filter((step) => step.id !== "review");
  const activeStep = visibleSteps[currentStep] ?? visibleSteps[0];
  const progress = ((currentStep + 1) / visibleSteps.length) * 100;
  const stepIndex = (id: StepId) =>
    visibleSteps.findIndex((step) => step.id === id);
  const selectedApplicationType =
    APPLICATION_TYPE_OPTIONS.find(
      (option) => option.value === form.personal.applicationType,
    )?.label ?? "Not selected";

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

  const updateJointDraft = (patch: Partial<JointApplicant>) => {
    setJointDraft((current) =>
      current ? { ...current, ...patch, confirmed: false } : current,
    );
    setJointLookupStatus("idle");
    setErrors({});
    setSaveStatus("idle");
  };

  const isJointApplicantComplete = (applicant: JointApplicant) =>
    applicant.method === "client-id"
      ? Boolean(applicant.clientId.trim()) && applicant.confirmed
      : Boolean(applicant.firstName.trim()) &&
        Boolean(applicant.lastName.trim()) &&
        /^\S+@\S+\.\S+$/.test(applicant.email) &&
        (usesPrimaryAddress ||
          (Boolean(applicant.address.trim()) &&
            Boolean(applicant.city.trim()) &&
            Boolean(applicant.state) &&
            Boolean(applicant.postcode.trim()) &&
            Boolean(applicant.country))) &&
        applicant.confirmed;

  const isStepComplete = (stepId: StepId) => {
    switch (stepId) {
      case "personal":
        return Boolean(
          form.personal.applicationType &&
          form.personal.firstName &&
          form.personal.lastName &&
          form.personal.dateOfBirth &&
          /^\S+@\S+\.\S+$/.test(form.personal.email) &&
          form.personal.phone &&
          form.personal.address &&
          form.personal.city &&
          form.personal.state &&
          form.personal.postcode &&
          form.personal.country &&
          (!isJointApplication ||
            (form.jointApplicants.length > 0 &&
              form.jointApplicants.every(isJointApplicantComplete))),
        );
      case "business":
        return Boolean(
          form.business.legalName &&
          form.business.entityType &&
          form.business.registrationNumber &&
          form.business.taxCountry &&
          form.business.industry &&
          form.business.role &&
          form.business.ownership,
        );
      case "identity":
        return form.identity.verified;
      case "bank":
        return form.bank.linked;
      case "cash":
        return Boolean(
          form.cash.purpose &&
          form.cash.currency &&
          form.cash.nickname &&
          form.cash.expectedBalance &&
          form.cash.fundingSource,
        );
      case "documents":
        return Boolean(
          form.documents.proofOfAddress &&
          (!isSoleTrader || form.documents.businessRegistration) &&
          form.documents.sourceOfFunds,
        );
      case "review":
        return submitted;
      default:
        return false;
    }
  };

  const completedSections = useMemo(
    () => requiredSteps.filter((step) => isStepComplete(step.id)).length,
    [form, requiredSteps, isJointApplication, usesPrimaryAddress, isSoleTrader],
  );

  const goToStep = (index: number) => {
    const safeIndex = Math.max(0, Math.min(index, visibleSteps.length - 1));
    setDirection(safeIndex >= currentStep ? 1 : -1);
    setCurrentStep(safeIndex);
    setErrors({});
    setJointDraft(null);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const validateStep = (stepId: StepId) => {
    const nextErrors: Record<string, string> = {};

    if (stepId === "personal") {
      if (!form.personal.applicationType) {
        nextErrors.applicationType = "Select an application type.";
      }
      if (!form.personal.firstName)
        nextErrors.firstName = "First name is required.";
      if (!form.personal.lastName)
        nextErrors.lastName = "Last name is required.";
      if (!form.personal.dateOfBirth)
        nextErrors.dateOfBirth = "Date of birth is required.";
      if (!form.personal.email) nextErrors.email = "Email address is required.";
      else if (!/^\S+@\S+\.\S+$/.test(form.personal.email)) {
        nextErrors.email = "Enter a valid email address.";
      }
      if (!form.personal.phone) nextErrors.phone = "Phone number is required.";
      if (!form.personal.address)
        nextErrors.address = "Residential address is required.";
      if (!form.personal.city) nextErrors.city = "City is required.";
      if (!form.personal.state)
        nextErrors.state = "State or region is required.";
      if (!form.personal.postcode)
        nextErrors.postcode = "Postcode is required.";
      if (!form.personal.country) nextErrors.country = "Country is required.";
      if (isJointApplication && form.jointApplicants.length === 0) {
        nextErrors.jointApplicant = "Add at least one joint applicant.";
      } else if (
        isJointApplication &&
        !form.jointApplicants.every(isJointApplicantComplete)
      ) {
        nextErrors.jointApplicant =
          "Complete every joint applicant before continuing.";
      }
      if (isJointApplication && jointDraft) {
        nextErrors.jointDraft =
          "Save or cancel the applicant currently being edited.";
      }
    }

    if (stepId === "business") {
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

    if (stepId === "identity" && !form.identity.verified) {
      nextErrors.identity = "Complete the identity check before continuing.";
    }

    if (stepId === "bank" && !form.bank.linked) {
      nextErrors.bank = "Link and verify a bank account before continuing.";
    }

    if (stepId === "cash") {
      if (!form.cash.purpose) nextErrors.purpose = "Choose an account purpose.";
      if (!form.cash.currency) nextErrors.currency = "Select a base currency.";
      if (!form.cash.nickname)
        nextErrors.nickname = "Account name is required.";
      if (!form.cash.expectedBalance)
        nextErrors.expectedBalance = "Select an expected balance.";
      if (!form.cash.fundingSource)
        nextErrors.fundingSource = "Select a funding source.";
    }

    if (stepId === "documents") {
      if (!form.documents.proofOfAddress)
        nextErrors.proofOfAddress = "Proof of address is required.";
      if (isSoleTrader && !form.documents.businessRegistration) {
        nextErrors.businessRegistration = "Business registration is required.";
      }
      if (!form.documents.sourceOfFunds)
        nextErrors.sourceOfFunds = "Source-of-funds evidence is required.";
    }

    if (stepId === "review") {
      if (!form.agreements.accuracy)
        nextErrors.accuracy = "Confirm that the information is accurate.";
      if (!form.agreements.terms)
        nextErrors.terms = "Accept the application terms to submit.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep(activeStep.id)) return;
    if (currentStep < visibleSteps.length - 1) goToStep(currentStep + 1);
  };

  const handleApplicationTypeChange = (value: string) => {
    const applicationType = value as ApplicationType;
    const remainsJoint = [
      "joint-spouse",
      "joint-same-address",
      "joint-different-address",
    ].includes(applicationType);
    setForm((current) => ({
      ...current,
      personal: { ...current.personal, applicationType },
      jointApplicants: remainsJoint ? current.jointApplicants : [],
      business:
        applicationType === "sole-trader"
          ? {
              ...current.business,
              entityType: current.business.entityType || "Sole trader",
            }
          : current.business,
    }));
    setJointDraft(null);
    setJointLookupStatus("idle");
    setErrors({});
    setSaveStatus("idle");
  };

  const beginJointApplicant = () => {
    const applicant = createJointApplicant();
    if (usesPrimaryAddress) {
      Object.assign(applicant, {
        address: form.personal.address,
        city: form.personal.city,
        state: form.personal.state,
        postcode: form.personal.postcode,
        country: form.personal.country,
      });
    }
    setJointDraft(applicant);
    setJointLookupStatus("idle");
    setErrors({});
  };

  const editJointApplicant = (applicant: JointApplicant) => {
    setJointDraft({ ...applicant });
    setJointLookupStatus(applicant.method === "client-id" ? "found" : "idle");
    setErrors({});
  };

  const removeJointApplicant = (id: string) => {
    setForm((current) => ({
      ...current,
      jointApplicants: current.jointApplicants.filter((item) => item.id !== id),
    }));
    if (jointDraft?.id === id) setJointDraft(null);
    setErrors({});
    setSaveStatus("idle");
  };

  const handleFindJointClient = async () => {
    if (!jointDraft?.clientId.trim()) {
      setErrors({ jointClientId: "Enter the existing client ID." });
      return;
    }
    setErrors({});
    setJointLookupStatus("searching");
    await wait(850);
    setJointDraft((current) =>
      current
        ? {
            ...current,
            firstName: current.firstName || "Existing",
            lastName: current.lastName || "Caprock client",
            email: current.email || "Email verified on file",
            confirmed: true,
          }
        : current,
    );
    setJointLookupStatus("found");
  };

  const handleSaveJointApplicant = () => {
    if (!jointDraft) return;
    const nextErrors: Record<string, string> = {};
    if (jointDraft.method === "client-id") {
      if (!jointDraft.clientId.trim()) {
        nextErrors.jointClientId = "Enter the existing client ID.";
      } else if (jointLookupStatus !== "found" || !jointDraft.confirmed) {
        nextErrors.jointDraft =
          "Find and verify this client before adding them.";
      }
    } else {
      if (!jointDraft.firstName)
        nextErrors.jointFirstName = "First name is required.";
      if (!jointDraft.lastName)
        nextErrors.jointLastName = "Last name is required.";
      if (!jointDraft.email)
        nextErrors.jointEmail = "Email address is required.";
      else if (!/^\S+@\S+\.\S+$/.test(jointDraft.email)) {
        nextErrors.jointEmail = "Enter a valid email address.";
      }
      if (!usesPrimaryAddress) {
        if (!jointDraft.address)
          nextErrors.jointAddress = "Residential address is required.";
        if (!jointDraft.city) nextErrors.jointCity = "City is required.";
        if (!jointDraft.state)
          nextErrors.jointState = "State or region is required.";
        if (!jointDraft.postcode)
          nextErrors.jointPostcode = "Postcode is required.";
        if (!jointDraft.country)
          nextErrors.jointCountry = "Country is required.";
      }
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const savedApplicant: JointApplicant = {
      ...jointDraft,
      ...(usesPrimaryAddress && jointDraft.method === "new-invite"
        ? {
            address: form.personal.address,
            city: form.personal.city,
            state: form.personal.state,
            postcode: form.personal.postcode,
            country: form.personal.country,
          }
        : {}),
      confirmed: true,
    };
    setForm((current) => {
      const exists = current.jointApplicants.some(
        (applicant) => applicant.id === savedApplicant.id,
      );
      return {
        ...current,
        jointApplicants: exists
          ? current.jointApplicants.map((applicant) =>
              applicant.id === savedApplicant.id ? savedApplicant : applicant,
            )
          : [...current.jointApplicants, savedApplicant],
      };
    });
    setJointDraft(null);
    setJointLookupStatus("idle");
    setErrors({});
    setSaveStatus("idle");
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
    for (const step of requiredSteps) {
      if (!isStepComplete(step.id)) {
        const index = visibleSteps.findIndex((item) => item.id === step.id);
        goToStep(index);
        window.setTimeout(() => validateStep(step.id), 0);
        return;
      }
    }
    if (!validateStep("review")) return;

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
                Step {currentStep + 1} of {visibleSteps.length}
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
            {visibleSteps.map((step, index) => (
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
                      {completedSections} of {requiredSteps.length} sections
                      complete
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
                {visibleSteps.map((step, index) => {
                  const Icon = step.icon;
                  const active = index === currentStep;
                  const complete = isStepComplete(step.id);
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
                    {activeStep.id === "personal" ? (
                      <>
                        <SectionIntro
                          eyebrow={`Step ${currentStep + 1} · Personal information`}
                          title="Start with your application type."
                          description="Choose how this account will be held, then enter your legal details exactly as they appear on your identity documents."
                          icon={UserRound}
                        />
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <Field
                              label="Application type"
                              htmlFor="applicationType"
                              error={errors.applicationType}
                              hint="Your choice controls which information and application stages are required."
                            >
                              <CustomSelect
                                id="applicationType"
                                value={form.personal.applicationType}
                                options={APPLICATION_TYPE_OPTIONS}
                                onChange={handleApplicationTypeChange}
                                placeholder="Select application type"
                                error={Boolean(errors.applicationType)}
                              />
                            </Field>
                          </div>
                          <Field
                            label="Legal first name"
                            htmlFor="firstName"
                            error={errors.firstName}
                          >
                            <input
                              id="firstName"
                              value={form.personal.firstName}
                              onChange={(event) =>
                                updateSection("personal", {
                                  firstName: event.target.value,
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
                              onChange={(event) =>
                                updateSection("personal", {
                                  lastName: event.target.value,
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
                              onChange={(event) =>
                                updateSection("personal", {
                                  dateOfBirth: event.target.value,
                                })
                              }
                              className={inputClass(
                                Boolean(errors.dateOfBirth),
                              )}
                            />
                          </Field>
                          <Field label="Citizenship" htmlFor="citizenship">
                            <CustomSelect
                              id="citizenship"
                              value={form.personal.citizenship}
                              options={COUNTRY_OPTIONS}
                              onChange={(value) =>
                                updateSection("personal", {
                                  citizenship: value,
                                })
                              }
                              placeholder="Select citizenship"
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
                                onChange={(event) =>
                                  updateSection("personal", {
                                    email: event.target.value,
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
                                onChange={(event) =>
                                  updateSection("personal", {
                                    phone: event.target.value,
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
                                  onChange={(event) =>
                                    updateSection("personal", {
                                      address: event.target.value,
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
                              onChange={(event) =>
                                updateSection("personal", {
                                  city: event.target.value,
                                })
                              }
                              className={inputClass(Boolean(errors.city))}
                              autoComplete="address-level2"
                            />
                          </Field>
                          <Field
                            label="State or region"
                            htmlFor="state"
                            error={errors.state}
                          >
                            <input
                              id="state"
                              value={form.personal.state}
                              onChange={(event) =>
                                updateSection("personal", {
                                  state: event.target.value,
                                })
                              }
                              className={inputClass(Boolean(errors.state))}
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
                              onChange={(event) =>
                                updateSection("personal", {
                                  postcode: event.target.value,
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
                            <CustomSelect
                              id="country"
                              value={form.personal.country}
                              options={COUNTRY_OPTIONS}
                              onChange={(value) =>
                                updateSection("personal", { country: value })
                              }
                              placeholder="Select country"
                              error={Boolean(errors.country)}
                            />
                          </Field>
                        </div>

                        <AnimatePresence initial={false}>
                          {isJointApplication ? (
                            <motion.section
                              initial={
                                reduceMotion ? false : { opacity: 0, y: 10 }
                              }
                              animate={{ opacity: 1, y: 0 }}
                              exit={
                                reduceMotion ? undefined : { opacity: 0, y: -8 }
                              }
                              transition={{ duration: 0.32, ease: EASE }}
                              className="mt-8 border-t border-slate-100 pt-8"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3.5">
                                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[rgba(0,52,120,0.07)] text-[#003478]">
                                    <UsersRound className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h2 className="text-base font-semibold text-slate-950">
                                        Joint applicants
                                      </h2>
                                      <span className="rounded-full bg-[#dce7f2] px-2 py-1 text-[10px] font-bold text-slate-800">
                                        {form.jointApplicants.length} added
                                      </span>
                                    </div>
                                    <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                                      Add every person who will jointly own this
                                      account. Use a Caprock client ID or
                                      prepare a secure invitation for a new
                                      client.
                                    </p>
                                  </div>
                                </div>
                                {!jointDraft ? (
                                  <button
                                    type="button"
                                    onClick={beginJointApplicant}
                                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                  >
                                    <UserPlus className="h-4 w-4" /> Add
                                    applicant
                                  </button>
                                ) : null}
                              </div>

                              {form.jointApplicants.length > 0 ? (
                                <div className="mt-5 grid gap-3">
                                  {form.jointApplicants.map(
                                    (applicant, index) => (
                                      <motion.article
                                        layout
                                        key={applicant.id}
                                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                                      >
                                        <div className="flex min-w-0 items-center gap-3.5">
                                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[rgba(0,52,120,0.075)] text-sm font-bold text-[#003478]">
                                            {index + 2}
                                          </div>
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <p className="truncate text-sm font-semibold text-slate-900">
                                                {applicant.method ===
                                                "client-id"
                                                  ? "Verified Caprock client"
                                                  : `${applicant.firstName} ${applicant.lastName}`}
                                              </p>
                                              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#003478]" />
                                            </div>
                                            <p className="mt-1 truncate text-xs text-slate-500">
                                              {applicant.method === "client-id"
                                                ? `Client ID · ${applicant.clientId}`
                                                : applicant.email}
                                            </p>
                                            {applicant.method ===
                                            "new-invite" ? (
                                              <p className="mt-1 truncate text-[11px] text-slate-400">
                                                {usesPrimaryAddress
                                                  ? "Same address as primary applicant"
                                                  : [
                                                      applicant.address,
                                                      applicant.city,
                                                      applicant.state,
                                                      applicant.postcode,
                                                    ]
                                                      .filter(Boolean)
                                                      .join(", ")}
                                              </p>
                                            ) : null}
                                          </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              editJointApplicant(applicant)
                                            }
                                            disabled={Boolean(jointDraft)}
                                            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-[#003478] disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label={`Edit joint applicant ${index + 1}`}
                                          >
                                            <PencilLine className="h-4 w-4" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeJointApplicant(applicant.id)
                                            }
                                            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                            aria-label={`Remove joint applicant ${index + 1}`}
                                          >
                                            <X className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </motion.article>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-[#f8fafb] px-5 py-6 text-center">
                                  <UsersRound className="mx-auto h-5 w-5 text-slate-400" />
                                  <p className="mt-2 text-xs font-semibold text-slate-700">
                                    No joint applicants added yet
                                  </p>
                                  <p className="mt-1 text-[11px] text-slate-400">
                                    At least one additional applicant is
                                    required.
                                  </p>
                                </div>
                              )}

                              <AnimatePresence initial={false}>
                                {jointDraft ? (
                                  <motion.div
                                    initial={
                                      reduceMotion
                                        ? false
                                        : { opacity: 0, height: 0 }
                                    }
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={
                                      reduceMotion
                                        ? undefined
                                        : { opacity: 0, height: 0 }
                                    }
                                    transition={{ duration: 0.34, ease: EASE }}
                                    className="overflow-visible"
                                  >
                                    <div className="mt-5 rounded-[22px] border border-[rgba(0,52,120,0.16)] bg-[#f7f9fb] p-4 sm:p-5">
                                      <div className="mb-5 flex items-center justify-between gap-4">
                                        <div>
                                          <p className="text-sm font-semibold text-slate-950">
                                            {form.jointApplicants.some(
                                              (item) =>
                                                item.id === jointDraft.id,
                                            )
                                              ? "Edit joint applicant"
                                              : "Add a joint applicant"}
                                          </p>
                                          <p className="mt-1 text-xs text-slate-500">
                                            Choose how to add this person to the
                                            application.
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setJointDraft(null);
                                            setJointLookupStatus("idle");
                                            setErrors({});
                                          }}
                                          className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700"
                                          aria-label="Cancel applicant"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>

                                      <div className="grid gap-3 sm:grid-cols-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            jointDraft.method !== "client-id" &&
                                            updateJointDraft({
                                              method: "client-id",
                                              clientId: "",
                                              firstName: "",
                                              lastName: "",
                                              email: "",
                                            })
                                          }
                                          className={`rounded-2xl border p-4 text-left transition ${jointDraft.method === "client-id" ? "border-[#003478] bg-white ring-2 ring-[#003478]/[0.06]" : "border-slate-200 bg-white/70 hover:border-slate-300"}`}
                                        >
                                          <div className="flex items-center gap-3">
                                            <div
                                              className={`grid h-10 w-10 place-items-center rounded-xl ${jointDraft.method === "client-id" ? "bg-[#003478] text-white" : "bg-slate-100 text-slate-500"}`}
                                            >
                                              <Search className="h-4 w-4" />
                                            </div>
                                            <div>
                                              <p className="text-sm font-semibold text-slate-900">
                                                Existing client
                                              </p>
                                              <p className="mt-0.5 text-xs text-slate-400">
                                                Find by Caprock client ID
                                              </p>
                                            </div>
                                          </div>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            jointDraft.method !==
                                              "new-invite" &&
                                            updateJointDraft({
                                              method: "new-invite",
                                              clientId: "",
                                            })
                                          }
                                          className={`rounded-2xl border p-4 text-left transition ${jointDraft.method === "new-invite" ? "border-[#003478] bg-white ring-2 ring-[#003478]/[0.06]" : "border-slate-200 bg-white/70 hover:border-slate-300"}`}
                                        >
                                          <div className="flex items-center gap-3">
                                            <div
                                              className={`grid h-10 w-10 place-items-center rounded-xl ${jointDraft.method === "new-invite" ? "bg-[#003478] text-white" : "bg-slate-100 text-slate-500"}`}
                                            >
                                              <Mail className="h-4 w-4" />
                                            </div>
                                            <div>
                                              <p className="text-sm font-semibold text-slate-900">
                                                New client
                                              </p>
                                              <p className="mt-0.5 text-xs text-slate-400">
                                                Prepare a secure invitation
                                              </p>
                                            </div>
                                          </div>
                                        </button>
                                      </div>

                                      {jointDraft.method === "client-id" ? (
                                        <div className="mt-5">
                                          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                            <div className="min-w-0 flex-1">
                                              <Field
                                                label="Caprock client ID"
                                                htmlFor="jointClientId"
                                                error={errors.jointClientId}
                                              >
                                                <input
                                                  id="jointClientId"
                                                  value={jointDraft.clientId}
                                                  onChange={(event) =>
                                                    updateJointDraft({
                                                      clientId:
                                                        event.target.value,
                                                    })
                                                  }
                                                  className={inputClass(
                                                    Boolean(
                                                      errors.jointClientId,
                                                    ),
                                                  )}
                                                  placeholder="e.g. CAP-102847"
                                                />
                                              </Field>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={handleFindJointClient}
                                              disabled={
                                                jointLookupStatus ===
                                                "searching"
                                              }
                                              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-[#003478]/30 hover:text-[#003478] disabled:cursor-wait"
                                            >
                                              {jointLookupStatus ===
                                              "searching" ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <Search className="h-4 w-4" />
                                              )}
                                              {jointLookupStatus === "searching"
                                                ? "Searching"
                                                : "Find client"}
                                            </button>
                                          </div>
                                          {jointLookupStatus === "found" ? (
                                            <motion.div
                                              initial={
                                                reduceMotion
                                                  ? false
                                                  : { opacity: 0, y: 6 }
                                              }
                                              animate={{ opacity: 1, y: 0 }}
                                              className="mt-4 flex items-center gap-3 rounded-2xl border border-[rgba(0,52,120,0.13)] bg-white p-4"
                                            >
                                              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[rgba(0,52,120,0.08)] text-[#003478]">
                                                <BadgeCheck className="h-5 w-5" />
                                              </div>
                                              <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                  Eligible client record located
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                  Client ID{" "}
                                                  {jointDraft.clientId} is
                                                  verified and ready to add.
                                                </p>
                                              </div>
                                            </motion.div>
                                          ) : null}
                                        </div>
                                      ) : (
                                        <div className="mt-5">
                                          <div className="mb-5 flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200/70">
                                            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#003478]" />
                                            <p className="text-xs leading-5 text-slate-500">
                                              We’ll email this applicant a
                                              secure invitation after the
                                              application is submitted.
                                            </p>
                                          </div>
                                          <div className="grid gap-5 sm:grid-cols-2">
                                            <Field
                                              label="Legal first name"
                                              htmlFor="jointFirstName"
                                              error={errors.jointFirstName}
                                            >
                                              <input
                                                id="jointFirstName"
                                                value={jointDraft.firstName}
                                                onChange={(event) =>
                                                  updateJointDraft({
                                                    firstName:
                                                      event.target.value,
                                                  })
                                                }
                                                className={inputClass(
                                                  Boolean(
                                                    errors.jointFirstName,
                                                  ),
                                                )}
                                              />
                                            </Field>
                                            <Field
                                              label="Legal last name"
                                              htmlFor="jointLastName"
                                              error={errors.jointLastName}
                                            >
                                              <input
                                                id="jointLastName"
                                                value={jointDraft.lastName}
                                                onChange={(event) =>
                                                  updateJointDraft({
                                                    lastName:
                                                      event.target.value,
                                                  })
                                                }
                                                className={inputClass(
                                                  Boolean(errors.jointLastName),
                                                )}
                                              />
                                            </Field>
                                            <div className="sm:col-span-2">
                                              <Field
                                                label="Email address"
                                                htmlFor="jointEmail"
                                                error={errors.jointEmail}
                                              >
                                                <input
                                                  id="jointEmail"
                                                  type="email"
                                                  value={jointDraft.email}
                                                  onChange={(event) =>
                                                    updateJointDraft({
                                                      email: event.target.value,
                                                    })
                                                  }
                                                  className={inputClass(
                                                    Boolean(errors.jointEmail),
                                                  )}
                                                  placeholder="joint.applicant@example.com"
                                                />
                                              </Field>
                                            </div>
                                            {usesPrimaryAddress ? (
                                              <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="flex items-start gap-3">
                                                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#003478]" />
                                                  <div>
                                                    <p className="text-xs font-semibold text-slate-800">
                                                      Same residential address
                                                      as the primary applicant
                                                    </p>
                                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                                      {[
                                                        form.personal.address,
                                                        form.personal.city,
                                                        form.personal.state,
                                                        form.personal.postcode,
                                                        form.personal.country,
                                                      ]
                                                        .filter(Boolean)
                                                        .join(", ") ||
                                                        "Complete the primary residential address above."}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            ) : (
                                              <>
                                                <div className="sm:col-span-2">
                                                  <Field
                                                    label="Residential address"
                                                    htmlFor="jointAddress"
                                                    error={errors.jointAddress}
                                                  >
                                                    <input
                                                      id="jointAddress"
                                                      value={jointDraft.address}
                                                      onChange={(event) =>
                                                        updateJointDraft({
                                                          address:
                                                            event.target.value,
                                                        })
                                                      }
                                                      className={inputClass(
                                                        Boolean(
                                                          errors.jointAddress,
                                                        ),
                                                      )}
                                                      placeholder="Street address"
                                                    />
                                                  </Field>
                                                </div>
                                                <Field
                                                  label="City"
                                                  htmlFor="jointCity"
                                                  error={errors.jointCity}
                                                >
                                                  <input
                                                    id="jointCity"
                                                    value={jointDraft.city}
                                                    onChange={(event) =>
                                                      updateJointDraft({
                                                        city: event.target
                                                          .value,
                                                      })
                                                    }
                                                    className={inputClass(
                                                      Boolean(errors.jointCity),
                                                    )}
                                                  />
                                                </Field>
                                                <Field
                                                  label="State or region"
                                                  htmlFor="jointState"
                                                  error={errors.jointState}
                                                >
                                                  <input
                                                    id="jointState"
                                                    value={jointDraft.state}
                                                    onChange={(event) =>
                                                      updateJointDraft({
                                                        state:
                                                          event.target.value,
                                                      })
                                                    }
                                                    className={inputClass(
                                                      Boolean(
                                                        errors.jointState,
                                                      ),
                                                    )}
                                                  />
                                                </Field>
                                                <Field
                                                  label="Postcode"
                                                  htmlFor="jointPostcode"
                                                  error={errors.jointPostcode}
                                                >
                                                  <input
                                                    id="jointPostcode"
                                                    value={jointDraft.postcode}
                                                    onChange={(event) =>
                                                      updateJointDraft({
                                                        postcode:
                                                          event.target.value,
                                                      })
                                                    }
                                                    className={inputClass(
                                                      Boolean(
                                                        errors.jointPostcode,
                                                      ),
                                                    )}
                                                  />
                                                </Field>
                                                <Field
                                                  label="Country of residence"
                                                  htmlFor="jointCountry"
                                                  error={errors.jointCountry}
                                                >
                                                  <CustomSelect
                                                    id="jointCountry"
                                                    value={jointDraft.country}
                                                    options={COUNTRY_OPTIONS}
                                                    onChange={(value) =>
                                                      updateJointDraft({
                                                        country: value,
                                                      })
                                                    }
                                                    placeholder="Select country"
                                                    error={Boolean(
                                                      errors.jointCountry,
                                                    )}
                                                  />
                                                </Field>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {errors.jointDraft ? (
                                        <p className="mt-4 text-xs font-medium text-red-600">
                                          {errors.jointDraft}
                                        </p>
                                      ) : null}
                                      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setJointDraft(null);
                                            setJointLookupStatus("idle");
                                            setErrors({});
                                          }}
                                          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={handleSaveJointApplicant}
                                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                        >
                                          <Check className="h-4 w-4" />
                                          {form.jointApplicants.some(
                                            (item) => item.id === jointDraft.id,
                                          )
                                            ? "Save changes"
                                            : "Add applicant"}
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                ) : null}
                              </AnimatePresence>

                              {errors.jointApplicant ? (
                                <p className="mt-4 text-xs font-medium text-red-600">
                                  {errors.jointApplicant}
                                </p>
                              ) : null}
                              {errors.jointDraft && !jointDraft ? (
                                <p className="mt-4 text-xs font-medium text-red-600">
                                  {errors.jointDraft}
                                </p>
                              ) : null}
                            </motion.section>
                          ) : null}
                        </AnimatePresence>
                      </>
                    ) : null}

                    {activeStep.id === "business" ? (
                      <>
                        <SectionIntro
                          eyebrow={`Step ${currentStep + 1} · Business information`}
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
                            <CustomSelect
                              id="entityType"
                              value={form.business.entityType}
                              options={ENTITY_OPTIONS}
                              onChange={(value) =>
                                updateSection("business", { entityType: value })
                              }
                              placeholder="Select entity type"
                              error={Boolean(errors.entityType)}
                            />
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
                            <CustomSelect
                              id="taxCountry"
                              value={form.business.taxCountry}
                              options={COUNTRY_OPTIONS}
                              onChange={(value) =>
                                updateSection("business", { taxCountry: value })
                              }
                              placeholder="Select tax country"
                              error={Boolean(errors.taxCountry)}
                            />
                          </Field>
                          <Field
                            label="Industry"
                            htmlFor="industry"
                            error={errors.industry}
                          >
                            <CustomSelect
                              id="industry"
                              value={form.business.industry}
                              options={INDUSTRY_OPTIONS}
                              onChange={(value) =>
                                updateSection("business", { industry: value })
                              }
                              placeholder="Select industry"
                              error={Boolean(errors.industry)}
                            />
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

                    {activeStep.id === "identity" ? (
                      <>
                        <SectionIntro
                          eyebrow={`Step ${currentStep + 1} · Prove it’s you`}
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

                    {activeStep.id === "bank" ? (
                      <>
                        <SectionIntro
                          eyebrow={`Step ${currentStep + 1} · Link bank account`}
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

                    {activeStep.id === "cash" ? (
                      <>
                        <SectionIntro
                          eyebrow={`Step ${currentStep + 1} · Cash account`}
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
                              <CustomSelect
                                id="currency"
                                value={form.cash.currency}
                                options={CURRENCY_OPTIONS}
                                onChange={(value) =>
                                  updateSection("cash", { currency: value })
                                }
                                placeholder="Select currency"
                                error={Boolean(errors.currency)}
                              />
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
                              <CustomSelect
                                id="expectedBalance"
                                value={form.cash.expectedBalance}
                                options={BALANCE_OPTIONS}
                                onChange={(value) =>
                                  updateSection("cash", {
                                    expectedBalance: value,
                                  })
                                }
                                placeholder="Select range"
                                error={Boolean(errors.expectedBalance)}
                              />
                            </Field>
                            <Field
                              label="Primary funding source"
                              htmlFor="fundingSource"
                              error={errors.fundingSource}
                            >
                              <CustomSelect
                                id="fundingSource"
                                value={form.cash.fundingSource}
                                options={FUNDING_OPTIONS}
                                onChange={(value) =>
                                  updateSection("cash", {
                                    fundingSource: value,
                                  })
                                }
                                placeholder="Select source"
                                error={Boolean(errors.fundingSource)}
                              />
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

                    {activeStep.id === "documents" ? (
                      <>
                        <SectionIntro
                          eyebrow={`Step ${currentStep + 1} · Proof documents`}
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
                          {isSoleTrader ? (
                            <DocumentUpload
                              id="business-registration"
                              title="Business registration"
                              description="Business name registration, ABN record or equivalent sole-trader registration document."
                              value={form.documents.businessRegistration}
                              onChange={(file) =>
                                updateDocument("businessRegistration", file)
                              }
                            />
                          ) : null}
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
                            Please upload all required documents before
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

                    {activeStep.id === "review" ? (
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
                                {completedSections} of {requiredSteps.length}{" "}
                                required sections complete
                              </p>
                            </div>
                            <span className="text-lg font-semibold tracking-[-0.04em] text-[#003478]">
                              {Math.round(
                                (completedSections / requiredSteps.length) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                            <motion.div
                              className="h-full rounded-full bg-[#003478]"
                              animate={{
                                width: `${(completedSections / requiredSteps.length) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <ReviewSection
                            title="Personal information"
                            icon={UserRound}
                            complete={isStepComplete("personal")}
                            onEdit={() => goToStep(stepIndex("personal"))}
                            rows={[
                              {
                                label: "Application type",
                                value: selectedApplicationType,
                              },
                              {
                                label: "Primary applicant",
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
                                  form.personal.state,
                                  form.personal.country,
                                ]
                                  .filter(Boolean)
                                  .join(", "),
                              },
                              {
                                label: "Joint applicants",
                                value: isJointApplication
                                  ? `${form.jointApplicants.length} applicant${form.jointApplicants.length === 1 ? "" : "s"} added`
                                  : "Not applicable",
                              },
                            ]}
                          />
                          {isSoleTrader ? (
                            <ReviewSection
                              title="Business information"
                              icon={BriefcaseBusiness}
                              complete={isStepComplete("business")}
                              onEdit={() => goToStep(stepIndex("business"))}
                              rows={[
                                {
                                  label: "Legal business name",
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
                                {
                                  label: "Your role",
                                  value: form.business.role,
                                },
                              ]}
                            />
                          ) : null}
                          <ReviewSection
                            title="Identity and bank"
                            icon={BadgeCheck}
                            complete={
                              isStepComplete("identity") &&
                              isStepComplete("bank")
                            }
                            onEdit={() =>
                              goToStep(
                                stepIndex(
                                  isStepComplete("identity")
                                    ? "bank"
                                    : "identity",
                                ),
                              )
                            }
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
                            complete={
                              isStepComplete("cash") &&
                              isStepComplete("documents")
                            }
                            onEdit={() =>
                              goToStep(
                                stepIndex(
                                  isStepComplete("cash") ? "documents" : "cash",
                                ),
                              )
                            }
                            rows={[
                              { label: "Account", value: form.cash.nickname },
                              { label: "Currency", value: form.cash.currency },
                              { label: "Purpose", value: form.cash.purpose },
                              {
                                label: "Documents",
                                value: isStepComplete("documents")
                                  ? `${isSoleTrader ? 3 : 2} files ready`
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

                {currentStep === visibleSteps.length - 1 ? (
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
