import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  FileCheck2,
  FileText,
  Fingerprint,
  HelpCircle,
  Landmark,
  Loader2,
  LockKeyhole,
  Mail,
  Menu,
  PencilLine,
  Phone,
  Plus,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CustomSelect, type SelectOption } from "../components/ui/CustomSelect";

type StepId =
  | "personal"
  | "business"
  | "bank"
  | "signature"
  | "documents"
  | "review";
type ApplicationType =
  | "individual"
  | "joint-same"
  | "joint-different-name"
  | "joint-different-address"
  | "sole-trader"
  | "";
type AssessmentNature = "australian" | "foreign" | "";
type YesNo = "yes" | "no" | "";
type JointMethod = "existing" | "new";
type ProofField =
  | "licenceFront"
  | "licenceBack"
  | "photoId"
  | "passport"
  | "utilityBill";

interface StepDefinition {
  id: StepId;
  shortLabel: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface UploadedDocument {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface PersonalState {
  applicationType: ApplicationType;
  referenceNumber: string;
  advisorReferenceNumber: string;
  profilePicture?: UploadedDocument;
  firstName: string;
  middleName: string;
  lastName: string;
  formerNames: string;
  dateOfBirth: string;
  residentialAddress: string;
  investmentCurrency: string;
  expectedInvestment: string;
  applicantCountry: string;
}

interface JointApplicant {
  id: string;
  method: JointMethod;
  clientId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  formerNames: string;
  email: string;
  dateOfBirth: string;
  residentialAddress: string;
  confirmed: boolean;
}

interface JointApplicantDraft {
  method: JointMethod;
  clientId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  formerNames: string;
  email: string;
  dateOfBirth: string;
  residentialAddress: string;
}

interface BusinessState {
  assessmentNature: AssessmentNature;
  foreignBusinessCountry: string;
  businessName: string;
  principalBusinessAddress: string;
  abn: string;
  usCitizen: YesNo;
  socialSecurityNumber: string;
  usTaxResident: YesNo;
  taxIdentificationNumber: string;
  investorClassification: string;
  businessActivity: string;
  businessActivityOther: string;
  sourceOfFunds: string;
  intendedTransactions: string;
  beneficialOwnership: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  swiftCode: string;
  bankAddress: string;
  bsb: string;
  accountNumber: string;
  currency: string;
  verificationDocument?: UploadedDocument;
}

interface SignatureState {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

interface ApplicantDocuments {
  licenceFront?: UploadedDocument;
  licenceBack?: UploadedDocument;
  photoId?: UploadedDocument;
  passport?: UploadedDocument;
  utilityBill?: UploadedDocument;
}

interface FormState {
  personal: PersonalState;
  jointApplicants: JointApplicant[];
  business: BusinessState;
  bankAccounts: BankAccount[];
  signature: SignatureState;
  documents: Record<string, ApplicantDocuments>;
  agreements: {
    accurate: boolean;
    consent: boolean;
  };
}

const allSteps: StepDefinition[] = [
  {
    id: "personal",
    shortLabel: "Personal",
    label: "Personal",
    description: "Applicant and investment details",
    icon: CircleUserRound,
  },
  {
    id: "business",
    shortLabel: "Business",
    label: "Business",
    description: "Assessment, tax and activity",
    icon: BriefcaseBusiness,
  },
  {
    id: "bank",
    shortLabel: "Bank",
    label: "External Bank Account",
    description: "Settlement account verification",
    icon: Landmark,
  },
  {
    id: "signature",
    shortLabel: "E-Signature",
    label: "E-Signature",
    description: "Authorised signatory details",
    icon: Fingerprint,
  },
  {
    id: "documents",
    shortLabel: "Proof",
    label: "Upload Proof",
    description: "Identity and address evidence",
    icon: FileCheck2,
  },
  {
    id: "review",
    shortLabel: "Review",
    label: "Review and Submit",
    description: "Confirm and securely submit",
    icon: BadgeCheck,
  },
];

const APPLICATION_OPTIONS: SelectOption[] = [
  {
    value: "individual",
    label: "Individual",
    description: "An account held by one individual applicant",
  },
  {
    value: "joint-same",
    label: "Husband-and-wife joint account — same address",
    description: "Joint applicants who share a residential address",
  },
  {
    value: "joint-different-name",
    label: "Different-surname joint account — same address",
    description: "Joint applicants with different surnames at one address",
  },
  {
    value: "joint-different-address",
    label: "Joint account — different addresses",
    description: "Joint applicants who have separate residential addresses",
  },
  {
    value: "sole-trader",
    label: "Sole Trader",
    description: "An individual applying in their capacity as a sole trader",
  },
];

const ASSESSMENT_OPTIONS: SelectOption[] = [
  {
    value: "australian",
    label: "Australian",
    description: "Australian customer assessment",
  },
  {
    value: "foreign",
    label: "Foreign",
    description: "International customer assessment",
  },
];

const INVESTMENT_CURRENCY_OPTIONS: SelectOption[] = [
  { value: "AUD", label: "Australian dollar (AUD)" },
  { value: "USD", label: "US dollar (USD)" },
  { value: "GBP", label: "British pound (GBP)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "SGD", label: "Singapore dollar (SGD)" },
  { value: "HKD", label: "Hong Kong dollar (HKD)" },
];

const BANK_CURRENCY_OPTIONS: SelectOption[] = [
  ...INVESTMENT_CURRENCY_OPTIONS,
  { value: "NZD", label: "New Zealand dollar (NZD)" },
  { value: "JPY", label: "Japanese yen (JPY)" },
  { value: "CAD", label: "Canadian dollar (CAD)" },
  { value: "CHF", label: "Swiss franc (CHF)" },
];

const INVESTMENT_AMOUNT_OPTIONS: SelectOption[] = [
  { value: "$500k–$50 million", label: "$500,000 – $50 million" },
  { value: "$50–$100 million", label: "$50 million – $100 million" },
  { value: "$100 million+", label: "$100 million+" },
];

const COUNTRY_OPTIONS: SelectOption[] = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macao",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Republic of the Congo",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "São Tomé and Príncipe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Türkiye",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
  "Other",
].map((country) => ({ value: country, label: country }));

const BUSINESS_NATURE_OPTIONS: SelectOption[] = [
  { value: "Accredited Investor", label: "Accredited Investor" },
  { value: "High Net-worth Individual", label: "High Net-worth Individual" },
  { value: "Sophisticated Investor", label: "Sophisticated Investor" },
  { value: "Wholesale Investor", label: "Wholesale Investor" },
];

const BUSINESS_ACTIVITY_OPTIONS: SelectOption[] = [
  { value: "Capital Markets", label: "Capital Markets" },
  { value: "Commodities", label: "Commodities" },
  { value: "Financial Markets", label: "Financial Markets" },
  { value: "Other", label: "Other" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Stock Market", label: "Stock Market" },
];

const initialFormState: FormState = {
  personal: {
    applicationType: "",
    referenceNumber: "",
    advisorReferenceNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    formerNames: "",
    dateOfBirth: "",
    residentialAddress: "",
    investmentCurrency: "",
    expectedInvestment: "",
    applicantCountry: "",
  },
  jointApplicants: [],
  business: {
    assessmentNature: "",
    foreignBusinessCountry: "",
    businessName: "",
    principalBusinessAddress: "",
    abn: "",
    usCitizen: "",
    socialSecurityNumber: "",
    usTaxResident: "",
    taxIdentificationNumber: "",
    investorClassification: "",
    businessActivity: "",
    businessActivityOther: "",
    sourceOfFunds: "",
    intendedTransactions: "",
    beneficialOwnership: "",
  },
  bankAccounts: [],
  signature: {
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  },
  documents: {},
  agreements: {
    accurate: false,
    consent: false,
  },
};

const emptyJointDraft: JointApplicantDraft = {
  method: "existing",
  clientId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  formerNames: "",
  email: "",
  dateOfBirth: "",
  residentialAddress: "",
};

const createEmptyBank = (): BankAccount => ({
  id: `bank-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  bankName: "",
  swiftCode: "",
  bankAddress: "",
  bsb: "",
  accountNumber: "",
  currency: "",
});

const inputClass = (hasError = false) =>
  `h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/[0.08]"
      : "border-slate-200 hover:border-slate-300 focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/[0.07]"
  }`;

const textareaClass = (hasError = false) =>
  `${inputClass(hasError)} h-auto min-h-24 resize-y py-3 leading-6`;

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

function SubsectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold tracking-[-0.015em] text-slate-950">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      ) : null}
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

function BinaryChoice({
  value,
  onChange,
  ariaLabel,
}: {
  value: YesNo;
  onChange: (value: Exclude<YesNo, "">) => void;
  ariaLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label={ariaLabel}>
      {(["yes", "no"] as const).map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={selected}
            className={`h-12 rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20 ${
              selected
                ? "border-[rgba(0,52,120,0.18)] bg-[#dce7f2] text-slate-950"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            {option === "yes" ? "Yes" : "No"}
          </button>
        );
      })}
    </div>
  );
}

function ReviewSection({
  title,
  icon: Icon,
  onEdit,
  children,
}: {
  title: string;
  icon: LucideIcon;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[rgba(0,52,120,0.07)] text-[#003478]">
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#003478] transition hover:bg-[#dce7f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
        >
          <PencilLine className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm font-medium leading-6 text-slate-800">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function CheckRow({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-slate-600">
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
          checked ? "bg-[#003478] text-white" : "bg-slate-100 text-slate-400"
        }`}
      >
        {checked ? (
          <Check className="h-3 w-3" strokeWidth={3} />
        ) : (
          <Clock3 className="h-3 w-3" />
        )}
      </span>
      {label}
    </div>
  );
}

const isJointType = (type: ApplicationType) =>
  type === "joint-same" ||
  type === "joint-different-name" ||
  type === "joint-different-address";

const usesSharedAddress = (type: ApplicationType) =>
  type === "joint-same" || type === "joint-different-name";

const formatApplicantName = (applicant: {
  firstName: string;
  middleName: string;
  lastName: string;
}) =>
  [applicant.firstName, applicant.middleName, applicant.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

const documentFromFile = (file?: File): UploadedDocument | undefined =>
  file
    ? {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      }
    : undefined;

const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

const isCompleteJointPersonal = (
  applicant: JointApplicant,
  sharedAddress: boolean,
) => {
  if (applicant.method === "existing")
    return applicant.confirmed && Boolean(applicant.clientId);
  return Boolean(
    applicant.confirmed &&
    applicant.firstName.trim() &&
    applicant.lastName.trim() &&
    applicant.formerNames.trim() &&
    applicant.dateOfBirth &&
    isValidEmail(applicant.email) &&
    (sharedAddress || applicant.residentialAddress.trim()),
  );
};

const hasAustralianProof = (documents?: ApplicantDocuments) =>
  Boolean(documents?.licenceFront && documents?.licenceBack);

const hasForeignProof = (documents?: ApplicantDocuments) =>
  Boolean(documents?.photoId && documents?.passport && documents?.utilityBill);

export function Onboarding() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [activeStepId, setActiveStepId] = useState<StepId>("personal");
  const [jointDraft, setJointDraft] =
    useState<JointApplicantDraft>(emptyJointDraft);
  const [showJointComposer, setShowJointComposer] = useState(false);
  const [lookupState, setLookupState] = useState<
    "idle" | "loading" | "found" | "error"
  >("idle");
  const [bankDraft, setBankDraft] = useState<BankAccount | null>(
    createEmptyBank(),
  );
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isJoint = isJointType(form.personal.applicationType);
  const sharedAddress = usesSharedAddress(form.personal.applicationType);
  const isSoleTrader = form.personal.applicationType === "sole-trader";
  const visibleSteps = useMemo(
    () =>
      isSoleTrader
        ? allSteps
        : allSteps.filter((step) => step.id !== "business"),
    [isSoleTrader],
  );
  const activeStepIndex = visibleSteps.findIndex(
    (step) => step.id === activeStepId,
  );
  const primaryFullName = formatApplicantName(form.personal);
  const selectedApplicationType =
    APPLICATION_OPTIONS.find(
      (option) => option.value === form.personal.applicationType,
    )?.label || "Not selected";
  const countryAssessmentNature: AssessmentNature = !form.personal
    .applicantCountry
    ? ""
    : form.personal.applicantCountry === "Australia"
      ? "australian"
      : "foreign";
  const primaryAssessmentNature = isSoleTrader
    ? form.business.assessmentNature
    : countryAssessmentNature;

  const applicantProfiles = useMemo(
    () => [
      {
        key: "primary",
        label: "Primary applicant",
        name: primaryFullName || "Primary applicant",
        assessmentNature: primaryAssessmentNature,
      },
      ...form.jointApplicants.map((applicant, index) => ({
        key: applicant.id,
        label: `Joint applicant ${index + 1}`,
        name: formatApplicantName(applicant) || `Joint applicant ${index + 1}`,
        assessmentNature: countryAssessmentNature,
      })),
    ],
    [
      countryAssessmentNature,
      form.jointApplicants,
      primaryAssessmentNature,
      primaryFullName,
    ],
  );

  const personalComplete = useMemo(() => {
    const primaryComplete = Boolean(
      form.personal.applicationType &&
      form.personal.applicantCountry &&
      form.personal.firstName.trim() &&
      form.personal.lastName.trim() &&
      form.personal.formerNames.trim() &&
      form.personal.dateOfBirth &&
      form.personal.residentialAddress.trim() &&
      form.personal.investmentCurrency &&
      form.personal.expectedInvestment,
    );
    if (!primaryComplete) return false;
    if (!isJoint) return true;
    return (
      form.jointApplicants.length > 0 &&
      form.jointApplicants.every((applicant) =>
        isCompleteJointPersonal(applicant, sharedAddress),
      )
    );
  }, [form.jointApplicants, form.personal, isJoint, sharedAddress]);

  const foreignSoleTraderComplete = useMemo(() => {
    if (!isSoleTrader || form.business.assessmentNature !== "foreign")
      return true;
    const isUnitedStates =
      form.business.foreignBusinessCountry === "United States";
    return Boolean(
      form.business.foreignBusinessCountry &&
      form.business.investorClassification &&
      form.business.businessActivity &&
      (form.business.businessActivity !== "Other" ||
        form.business.businessActivityOther.trim()) &&
      form.business.sourceOfFunds.trim() &&
      form.business.intendedTransactions.trim() &&
      form.business.beneficialOwnership.trim() &&
      (!isUnitedStates ||
        (form.business.usCitizen &&
          (form.business.usCitizen !== "yes" ||
            form.business.socialSecurityNumber.trim()) &&
          form.business.usTaxResident &&
          (form.business.usTaxResident !== "yes" ||
            form.business.taxIdentificationNumber.trim()))),
    );
  }, [form.business, isSoleTrader]);

  const businessComplete = useMemo(() => {
    if (!isSoleTrader) return true;
    if (!form.business.assessmentNature) return false;
    if (
      !form.business.businessName.trim() ||
      !form.business.principalBusinessAddress.trim() ||
      (form.business.assessmentNature === "australian" &&
        !form.business.abn.trim())
    ) {
      return false;
    }
    return foreignSoleTraderComplete;
  }, [form.business, foreignSoleTraderComplete, isSoleTrader]);

  const bankComplete = useMemo(
    () =>
      form.bankAccounts.length > 0 &&
      form.bankAccounts.every((account) =>
        Boolean(
          account.bankName.trim() &&
          account.swiftCode.trim() &&
          account.bankAddress.trim() &&
          account.accountNumber.trim() &&
          account.currency &&
          account.verificationDocument,
        ),
      ),
    [form.bankAccounts],
  );

  const signatureComplete = useMemo(
    () =>
      Boolean(
        form.signature.name.trim() &&
        isValidEmail(form.signature.email) &&
        form.signature.phone.trim() &&
        form.signature.dateOfBirth,
      ),
    [form.signature],
  );

  const documentsComplete = useMemo(
    () =>
      applicantProfiles.every((applicant) => {
        if (applicant.assessmentNature === "australian") {
          return hasAustralianProof(form.documents[applicant.key]);
        }
        if (applicant.assessmentNature === "foreign") {
          return hasForeignProof(form.documents[applicant.key]);
        }
        return false;
      }),
    [applicantProfiles, form.documents],
  );

  const allApplicationSectionsComplete =
    personalComplete &&
    businessComplete &&
    bankComplete &&
    signatureComplete &&
    documentsComplete;

  const completion: Record<StepId, boolean> = {
    personal: personalComplete,
    business: businessComplete,
    bank: bankComplete,
    signature: signatureComplete,
    documents: documentsComplete,
    review:
      allApplicationSectionsComplete &&
      form.agreements.accurate &&
      form.agreements.consent,
  };

  const applicationSectionCount = visibleSteps.length - 1;
  const completedSectionCount = visibleSteps
    .slice(0, -1)
    .filter((step) => completion[step.id]).length;
  const progressPercent = Math.max(
    6,
    Math.round(((activeStepIndex + 1) / visibleSteps.length) * 100),
  );
  const sectionEyebrow = (stepId: StepId) =>
    `Section ${visibleSteps.findIndex((step) => step.id === stepId) + 1} of ${visibleSteps.length}`;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setErrors({});
    setNotice("");
  }, [activeStepId]);

  const updatePersonal = <K extends keyof PersonalState>(
    key: K,
    value: PersonalState[K],
  ) => {
    setForm((current) => ({
      ...current,
      personal: { ...current.personal, [key]: value },
    }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const updateBusiness = <K extends keyof BusinessState>(
    key: K,
    value: BusinessState[K],
  ) => {
    setForm((current) => ({
      ...current,
      business: { ...current.business, [key]: value },
    }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleAssessmentNatureChange = (value: string) => {
    const assessmentNature = value as AssessmentNature;
    setForm((current) => ({
      ...current,
      business: {
        ...current.business,
        assessmentNature,
        ...(assessmentNature === "australian"
          ? {
              foreignBusinessCountry: "",
              investorClassification: "",
              businessActivity: "",
              businessActivityOther: "",
              sourceOfFunds: "",
              intendedTransactions: "",
              beneficialOwnership: "",
              usCitizen: "" as YesNo,
              socialSecurityNumber: "",
              usTaxResident: "" as YesNo,
              taxIdentificationNumber: "",
            }
          : { abn: "" }),
      },
    }));
    setErrors((current) => ({
      ...current,
      assessmentNature: "",
      abn: "",
      foreignBusinessCountry: "",
      investorClassification: "",
      businessActivity: "",
      businessActivityOther: "",
      sourceOfFunds: "",
      intendedTransactions: "",
      beneficialOwnership: "",
      usCitizen: "",
      socialSecurityNumber: "",
      usTaxResident: "",
      taxIdentificationNumber: "",
    }));
  };

  const handleForeignBusinessCountryChange = (value: string) => {
    setForm((current) => ({
      ...current,
      business: {
        ...current.business,
        foreignBusinessCountry: value,
        ...(value === "United States"
          ? {}
          : {
              usCitizen: "" as YesNo,
              socialSecurityNumber: "",
              usTaxResident: "" as YesNo,
              taxIdentificationNumber: "",
            }),
      },
    }));
    setErrors((current) => ({
      ...current,
      foreignBusinessCountry: "",
      usCitizen: "",
      socialSecurityNumber: "",
      usTaxResident: "",
      taxIdentificationNumber: "",
    }));
  };

  const handleBusinessActivityChange = (value: string) => {
    setForm((current) => ({
      ...current,
      business: {
        ...current.business,
        businessActivity: value,
        businessActivityOther:
          value === "Other" ? current.business.businessActivityOther : "",
      },
    }));
    setErrors((current) => ({
      ...current,
      businessActivity: "",
      businessActivityOther: "",
    }));
  };

  const handleUsCitizenChange = (value: string) => {
    const usCitizen = value as YesNo;
    setForm((current) => ({
      ...current,
      business: {
        ...current.business,
        usCitizen,
        socialSecurityNumber:
          usCitizen === "yes" ? current.business.socialSecurityNumber : "",
      },
    }));
    setErrors((current) => ({
      ...current,
      usCitizen: "",
      socialSecurityNumber: "",
    }));
  };

  const handleUsTaxResidentChange = (value: string) => {
    const usTaxResident = value as YesNo;
    setForm((current) => ({
      ...current,
      business: {
        ...current.business,
        usTaxResident,
        taxIdentificationNumber:
          usTaxResident === "yes"
            ? current.business.taxIdentificationNumber
            : "",
      },
    }));
    setErrors((current) => ({
      ...current,
      usTaxResident: "",
      taxIdentificationNumber: "",
    }));
  };

  const updateSignature = <K extends keyof SignatureState>(
    key: K,
    value: SignatureState[K],
  ) => {
    setForm((current) => ({
      ...current,
      signature: { ...current.signature, [key]: value },
    }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleApplicationTypeChange = (value: string) => {
    const applicationType = value as ApplicationType;
    setForm((current) => ({
      ...current,
      personal: { ...current.personal, applicationType },
      jointApplicants: isJointType(applicationType)
        ? current.jointApplicants
        : [],
      documents: isJointType(applicationType)
        ? current.documents
        : { primary: current.documents.primary || {} },
    }));
    setErrors((current) => ({ ...current, applicationType: "" }));
    if (!isJointType(applicationType)) {
      setShowJointComposer(false);
      setJointDraft(emptyJointDraft);
    }
  };

  const updateJointDraft = (key: keyof JointApplicantDraft, value: string) => {
    setJointDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, jointApplicants: "" }));
    if (key === "clientId") setLookupState("idle");
  };

  const beginJointApplicant = () => {
    setJointDraft(emptyJointDraft);
    setLookupState("idle");
    setShowJointComposer(true);
  };

  const handleLookupClient = () => {
    if (jointDraft.clientId.trim().length < 5) {
      setLookupState("error");
      return;
    }
    setLookupState("loading");
    window.setTimeout(() => setLookupState("found"), 700);
  };

  const saveJointApplicant = () => {
    const isExisting = jointDraft.method === "existing";
    const address = sharedAddress
      ? form.personal.residentialAddress
      : jointDraft.residentialAddress;
    const valid = isExisting
      ? lookupState === "found" && jointDraft.clientId.trim()
      : jointDraft.firstName.trim() &&
        jointDraft.lastName.trim() &&
        jointDraft.formerNames.trim() &&
        jointDraft.dateOfBirth &&
        isValidEmail(jointDraft.email) &&
        address.trim();

    if (!valid) {
      setErrors((current) => ({
        ...current,
        jointApplicants: isExisting
          ? "Verify the Caprock client ID before adding this applicant."
          : "Complete the applicant’s name, former names, date of birth, email and required address.",
      }));
      return;
    }

    const applicant: JointApplicant = {
      id: `joint-${Date.now()}`,
      method: jointDraft.method,
      clientId: isExisting ? jointDraft.clientId.trim() : "",
      firstName: isExisting
        ? `Verified client · ${jointDraft.clientId.trim().toUpperCase()}`
        : jointDraft.firstName.trim(),
      middleName: isExisting ? "" : jointDraft.middleName.trim(),
      lastName: isExisting ? "" : jointDraft.lastName.trim(),
      formerNames: isExisting
        ? "Verified on file"
        : jointDraft.formerNames.trim(),
      email: isExisting ? "" : jointDraft.email.trim(),
      dateOfBirth: isExisting ? "" : jointDraft.dateOfBirth,
      residentialAddress: isExisting ? "Verified on file" : address.trim(),
      confirmed: true,
    };

    setForm((current) => ({
      ...current,
      jointApplicants: [...current.jointApplicants, applicant],
    }));
    setJointDraft(emptyJointDraft);
    setLookupState("idle");
    setShowJointComposer(false);
    setErrors((current) => ({ ...current, jointApplicants: "" }));
  };

  const removeJointApplicant = (id: string) => {
    setForm((current) => {
      const nextDocuments = { ...current.documents };
      delete nextDocuments[id];
      return {
        ...current,
        jointApplicants: current.jointApplicants.filter(
          (applicant) => applicant.id !== id,
        ),
        documents: nextDocuments,
      };
    });
  };

  const updateBankDraft = <K extends keyof BankAccount>(
    key: K,
    value: BankAccount[K],
  ) => {
    setBankDraft((current) =>
      current ? { ...current, [key]: value } : current,
    );
    setErrors((current) => ({ ...current, bankDraft: "" }));
  };

  const saveBankAccount = () => {
    if (!bankDraft) return;
    const complete = Boolean(
      bankDraft.bankName.trim() &&
      bankDraft.swiftCode.trim() &&
      bankDraft.bankAddress.trim() &&
      bankDraft.accountNumber.trim() &&
      bankDraft.currency &&
      bankDraft.verificationDocument,
    );
    if (!complete) {
      setErrors((current) => ({
        ...current,
        bankDraft:
          "Complete every required bank field and attach verification evidence.",
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      bankAccounts: editingBankId
        ? current.bankAccounts.map((account) =>
            account.id === editingBankId ? bankDraft : account,
          )
        : [...current.bankAccounts, bankDraft],
    }));
    setEditingBankId(null);
    setBankDraft(null);
    setErrors((current) => ({ ...current, bank: "", bankDraft: "" }));
  };

  const editBankAccount = (account: BankAccount) => {
    setBankDraft({ ...account });
    setEditingBankId(account.id);
  };

  const removeBankAccount = (id: string) => {
    setForm((current) => ({
      ...current,
      bankAccounts: current.bankAccounts.filter((account) => account.id !== id),
    }));
    if (editingBankId === id) {
      setEditingBankId(null);
      setBankDraft(null);
    }
  };

  const updateApplicantDocument = (
    applicantKey: string,
    field: ProofField,
    file?: File,
  ) => {
    setForm((current) => ({
      ...current,
      documents: {
        ...current.documents,
        [applicantKey]: {
          ...current.documents[applicantKey],
          [field]: documentFromFile(file),
        },
      },
    }));
    setErrors((current) => ({ ...current, documents: "" }));
  };

  const validateStep = (stepId: StepId) => {
    const nextErrors: Record<string, string> = {};

    if (stepId === "personal") {
      if (!form.personal.applicationType)
        nextErrors.applicationType = "Select an application type.";
      if (!form.personal.applicantCountry)
        nextErrors.applicantCountry = "Select the applicant country.";
      if (!form.personal.firstName.trim())
        nextErrors.firstName = "Enter the applicant’s first name.";
      if (!form.personal.lastName.trim())
        nextErrors.lastName = "Enter the applicant’s last name.";
      if (!form.personal.formerNames.trim())
        nextErrors.formerNames =
          "Enter former names, or “None” if not applicable.";
      if (!form.personal.dateOfBirth)
        nextErrors.dateOfBirth = "Enter the applicant’s date of birth.";
      if (!form.personal.residentialAddress.trim())
        nextErrors.residentialAddress = "Enter the residential address.";
      if (!form.personal.investmentCurrency)
        nextErrors.investmentCurrency = "Select an investment currency.";
      if (!form.personal.expectedInvestment)
        nextErrors.expectedInvestment =
          "Select the expected investment amount.";
      if (
        isJoint &&
        (form.jointApplicants.length === 0 ||
          form.jointApplicants.some(
            (applicant) => !isCompleteJointPersonal(applicant, sharedAddress),
          ))
      ) {
        nextErrors.jointApplicants =
          "Add at least one complete joint applicant.";
      }
    }

    if (stepId === "business" && isSoleTrader) {
      if (!form.business.assessmentNature)
        nextErrors.assessmentNature =
          "Select the individual assessment nature.";
      if (!form.business.businessName.trim())
        nextErrors.businessName = "Enter the business name.";
      if (!form.business.principalBusinessAddress.trim()) {
        nextErrors.principalBusinessAddress =
          "Enter the principal place of business.";
      }
      if (
        form.business.assessmentNature === "australian" &&
        !form.business.abn.trim()
      ) {
        nextErrors.abn = "Enter the Australian Business Number.";
      }
      if (form.business.assessmentNature === "foreign") {
        if (!form.business.foreignBusinessCountry) {
          nextErrors.foreignBusinessCountry =
            "Select the country of foreign business.";
        }
        if (!form.business.investorClassification)
          nextErrors.investorClassification =
            "Select the major business nature.";
        if (!form.business.businessActivity)
          nextErrors.businessActivity = "Select the business activity.";
        if (
          form.business.businessActivity === "Other" &&
          !form.business.businessActivityOther.trim()
        ) {
          nextErrors.businessActivityOther = "Describe the business activity.";
        }
        if (!form.business.sourceOfFunds.trim())
          nextErrors.sourceOfFunds = "Describe the source and origin of funds.";
        if (!form.business.intendedTransactions.trim()) {
          nextErrors.intendedTransactions =
            "Describe the intended transaction behaviour.";
        }
        if (!form.business.beneficialOwnership.trim()) {
          nextErrors.beneficialOwnership =
            "Describe the beneficial ownership of the funds.";
        }
        if (form.business.foreignBusinessCountry === "United States") {
          if (!form.business.usCitizen)
            nextErrors.usCitizen = "Confirm U.S. citizenship status.";
          if (
            form.business.usCitizen === "yes" &&
            !form.business.socialSecurityNumber.trim()
          ) {
            nextErrors.socialSecurityNumber =
              "Enter the Social Security Number.";
          }
          if (!form.business.usTaxResident)
            nextErrors.usTaxResident = "Confirm U.S. tax residency status.";
          if (
            form.business.usTaxResident === "yes" &&
            !form.business.taxIdentificationNumber.trim()
          ) {
            nextErrors.taxIdentificationNumber =
              "Enter the tax identification number.";
          }
        }
      }
    }

    if (stepId === "bank" && !bankComplete) {
      nextErrors.bank =
        "Add at least one complete, verified external bank account.";
    }

    if (stepId === "signature") {
      if (!form.signature.name.trim())
        nextErrors.signatureName = "Enter the authorised signatory’s name.";
      if (!isValidEmail(form.signature.email))
        nextErrors.signatureEmail = "Enter a valid email address.";
      if (!form.signature.phone.trim())
        nextErrors.signaturePhone = "Enter a phone number.";
      if (!form.signature.dateOfBirth)
        nextErrors.signatureDateOfBirth =
          "Enter the signatory’s date of birth.";
    }

    if (stepId === "documents" && !documentsComplete) {
      nextErrors.documents =
        "Upload every required document for each applicant.";
    }

    if (stepId === "review") {
      if (!allApplicationSectionsComplete)
        nextErrors.review =
          "Complete every application section before submitting.";
      if (!form.agreements.accurate || !form.agreements.consent) {
        nextErrors.agreements = "Confirm both declarations before submitting.";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setNotice("Please review the highlighted information before continuing.");
      return false;
    }
    setNotice("");
    return true;
  };

  const goToStep = (stepId: StepId) => {
    setActiveStepId(stepId);
    setMobileNavOpen(false);
  };

  const goBack = () => {
    if (activeStepIndex > 0) goToStep(visibleSteps[activeStepIndex - 1].id);
  };

  const goNext = () => {
    if (!validateStep(activeStepId)) return;
    if (activeStepId === "review") {
      submitApplication();
      return;
    }
    goToStep(
      visibleSteps[Math.min(activeStepIndex + 1, visibleSteps.length - 1)].id,
    );
  };

  const saveDraft = () => {
    setIsSaving(true);
    window.setTimeout(() => setIsSaving(false), 900);
  };

  const submitApplication = () => {
    if (!validateStep("review")) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1400);
  };

  const renderPersonal = () => (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("personal")}
        title="Personal"
        description="Tell us who is applying and provide the investment profile details required for this application."
        icon={CircleUserRound}
      />

      <div className="space-y-8">
        <section>
          <SubsectionHeading
            title="Application structure"
            description="Choose the account structure first. The form adapts for joint applicants and sole traders."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Application type"
              htmlFor="applicationType"
              error={errors.applicationType}
            >
              <CustomSelect
                id="applicationType"
                value={form.personal.applicationType}
                onChange={handleApplicationTypeChange}
                options={APPLICATION_OPTIONS}
                placeholder="Select application type"
                error={Boolean(errors.applicationType)}
              />
            </Field>
            <Field
              label="Applicant’s country"
              htmlFor="applicantCountry"
              error={errors.applicantCountry}
            >
              <CustomSelect
                id="applicantCountry"
                value={form.personal.applicantCountry}
                onChange={(value) => updatePersonal("applicantCountry", value)}
                options={COUNTRY_OPTIONS}
                placeholder="Select country"
                searchable
                searchPlaceholder="Search countries"
                error={Boolean(errors.applicantCountry)}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
          <SubsectionHeading
            title="Application references"
            description="These references are supplied by Caprock or your adviser and cannot be changed here."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Caprock reference number (optional)"
              htmlFor="referenceNumber"
              hint="Assigned automatically when available."
            >
              <input
                id="referenceNumber"
                value={form.personal.referenceNumber}
                readOnly
                placeholder="Assigned by Caprock"
                className={`${inputClass()} cursor-not-allowed bg-slate-100/80 text-slate-500`}
              />
            </Field>
            <Field
              label="Adviser reference number (optional)"
              htmlFor="advisorReferenceNumber"
              hint="Supplied by your adviser when applicable."
            >
              <input
                id="advisorReferenceNumber"
                value={form.personal.advisorReferenceNumber}
                readOnly
                placeholder="Provided by adviser"
                className={`${inputClass()} cursor-not-allowed bg-slate-100/80 text-slate-500`}
              />
            </Field>
          </div>
        </section>

        <section>
          <SubsectionHeading
            title="Primary applicant"
            description="Use legal identity details exactly as they appear on official documents."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <DocumentUpload
                id="profilePicture"
                title="Profile image (optional)"
                description="Upload a clear recent image in PDF, JPG or PNG format."
                value={form.personal.profilePicture}
                onChange={(file) =>
                  updatePersonal("profilePicture", documentFromFile(file))
                }
              />
            </div>
            <Field
              label="First name"
              htmlFor="firstName"
              error={errors.firstName}
            >
              <input
                id="firstName"
                value={form.personal.firstName}
                onChange={(event) =>
                  updatePersonal("firstName", event.target.value)
                }
                autoComplete="given-name"
                placeholder="Legal first name"
                className={inputClass(Boolean(errors.firstName))}
              />
            </Field>
            <Field label="Middle name (optional)" htmlFor="middleName">
              <input
                id="middleName"
                value={form.personal.middleName}
                onChange={(event) =>
                  updatePersonal("middleName", event.target.value)
                }
                autoComplete="additional-name"
                placeholder="Legal middle name"
                className={inputClass()}
              />
            </Field>
            <Field label="Last name" htmlFor="lastName" error={errors.lastName}>
              <input
                id="lastName"
                value={form.personal.lastName}
                onChange={(event) =>
                  updatePersonal("lastName", event.target.value)
                }
                autoComplete="family-name"
                placeholder="Legal last name"
                className={inputClass(Boolean(errors.lastName))}
              />
            </Field>
            <Field
              label="Former name(s)"
              htmlFor="formerNames"
              error={errors.formerNames}
              hint="Enter “None” if you have not used another legal name."
            >
              <input
                id="formerNames"
                value={form.personal.formerNames}
                onChange={(event) =>
                  updatePersonal("formerNames", event.target.value)
                }
                placeholder="Former legal names or None"
                className={inputClass(Boolean(errors.formerNames))}
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
                  updatePersonal("dateOfBirth", event.target.value)
                }
                className={inputClass(Boolean(errors.dateOfBirth))}
              />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field
                label="Residential address"
                htmlFor="residentialAddress"
                error={errors.residentialAddress}
              >
                <textarea
                  id="residentialAddress"
                  value={form.personal.residentialAddress}
                  onChange={(event) =>
                    updatePersonal("residentialAddress", event.target.value)
                  }
                  autoComplete="street-address"
                  placeholder="Street, suburb or city, state or region, postcode and country"
                  className={textareaClass(Boolean(errors.residentialAddress))}
                />
              </Field>
            </div>
          </div>
        </section>

        {isJoint ? (
          <section className="rounded-2xl border border-[rgba(0,52,120,0.15)] bg-[rgba(0,52,120,0.025)] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <SubsectionHeading
                title="Joint applicants"
                description="Add each applicant using an existing Caprock client ID or invite them as a new client."
              />
              {!showJointComposer ? (
                <button
                  type="button"
                  onClick={beginJointApplicant}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003478]/15"
                >
                  <Plus className="h-4 w-4" />
                  Add applicant
                </button>
              ) : null}
            </div>

            {form.jointApplicants.length > 0 ? (
              <div className="mb-5 space-y-3">
                {form.jointApplicants.map((applicant, index) => (
                  <div
                    key={applicant.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {formatApplicantName(applicant)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Applicant {index + 1} ·{" "}
                        {applicant.method === "existing"
                          ? "Existing Caprock client"
                          : applicant.email}
                      </p>
                    </div>
                    <span className="hidden rounded-full bg-[#dce7f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-800 sm:inline-flex">
                      Added
                    </span>
                    <button
                      type="button"
                      onClick={() => removeJointApplicant(applicant.id)}
                      aria-label={`Remove ${formatApplicantName(applicant)}`}
                      className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {showJointComposer ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Add a joint applicant
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Choose how this person will join the application.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowJointComposer(false)}
                    aria-label="Close applicant form"
                    className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  {(["existing", "new"] as JointMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        setJointDraft({ ...emptyJointDraft, method });
                        setLookupState("idle");
                      }}
                      className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                        jointDraft.method === method
                          ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {method === "existing"
                        ? "Existing client"
                        : "Invite new client"}
                    </button>
                  ))}
                </div>

                {jointDraft.method === "existing" ? (
                  <div>
                    <Field
                      label="Caprock client ID"
                      htmlFor="jointClientId"
                      hint="Client IDs are verified before the applicant is added."
                    >
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          id="jointClientId"
                          value={jointDraft.clientId}
                          onChange={(event) =>
                            updateJointDraft("clientId", event.target.value)
                          }
                          placeholder="For example, CM-10284"
                          className={inputClass(lookupState === "error")}
                        />
                        <button
                          type="button"
                          onClick={handleLookupClient}
                          disabled={lookupState === "loading"}
                          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-[#003478] disabled:cursor-wait disabled:opacity-60"
                        >
                          {lookupState === "loading" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <BadgeCheck className="h-4 w-4" />
                          )}
                          Verify ID
                        </button>
                      </div>
                    </Field>
                    {lookupState === "found" ? (
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#dce7f2] px-3.5 py-3 text-xs font-medium text-slate-800">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#003478]" />
                        Client record found. Identity details will be securely
                        linked.
                      </div>
                    ) : lookupState === "error" ? (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        Enter a valid client ID with at least five characters.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="First name" htmlFor="jointFirstName">
                      <input
                        id="jointFirstName"
                        value={jointDraft.firstName}
                        onChange={(event) =>
                          updateJointDraft("firstName", event.target.value)
                        }
                        placeholder="Legal first name"
                        className={inputClass()}
                      />
                    </Field>
                    <Field
                      label="Middle name (optional)"
                      htmlFor="jointMiddleName"
                    >
                      <input
                        id="jointMiddleName"
                        value={jointDraft.middleName}
                        onChange={(event) =>
                          updateJointDraft("middleName", event.target.value)
                        }
                        placeholder="Legal middle name"
                        className={inputClass()}
                      />
                    </Field>
                    <Field label="Last name" htmlFor="jointLastName">
                      <input
                        id="jointLastName"
                        value={jointDraft.lastName}
                        onChange={(event) =>
                          updateJointDraft("lastName", event.target.value)
                        }
                        placeholder="Legal last name"
                        className={inputClass()}
                      />
                    </Field>
                    <Field
                      label="Former name(s)"
                      htmlFor="jointFormerNames"
                      hint="Enter “None” if not applicable."
                    >
                      <input
                        id="jointFormerNames"
                        value={jointDraft.formerNames}
                        onChange={(event) =>
                          updateJointDraft("formerNames", event.target.value)
                        }
                        placeholder="Former names or None"
                        className={inputClass()}
                      />
                    </Field>
                    <Field label="Date of birth" htmlFor="jointDateOfBirth">
                      <input
                        id="jointDateOfBirth"
                        type="date"
                        value={jointDraft.dateOfBirth}
                        onChange={(event) =>
                          updateJointDraft("dateOfBirth", event.target.value)
                        }
                        className={inputClass()}
                      />
                    </Field>
                    <Field label="Email address" htmlFor="jointEmail">
                      <input
                        id="jointEmail"
                        type="email"
                        value={jointDraft.email}
                        onChange={(event) =>
                          updateJointDraft("email", event.target.value)
                        }
                        placeholder="name@example.com"
                        className={inputClass()}
                      />
                    </Field>
                    {sharedAddress ? (
                      <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs leading-5 text-slate-600">
                        This account type uses the primary applicant’s
                        residential address for this joint applicant.
                      </div>
                    ) : (
                      <div className="sm:col-span-2 lg:col-span-3">
                        <Field
                          label="Residential address"
                          htmlFor="jointResidentialAddress"
                        >
                          <textarea
                            id="jointResidentialAddress"
                            value={jointDraft.residentialAddress}
                            onChange={(event) =>
                              updateJointDraft(
                                "residentialAddress",
                                event.target.value,
                              )
                            }
                            placeholder="Street, suburb or city, state or region, postcode and country"
                            className={textareaClass()}
                          />
                        </Field>
                      </div>
                    )}
                  </div>
                )}

                {errors.jointApplicants ? (
                  <p className="mt-4 text-xs font-medium text-red-600">
                    {errors.jointApplicants}
                  </p>
                ) : null}
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={saveJointApplicant}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#003478] px-5 text-xs font-semibold text-white transition hover:bg-[#002b63]"
                  >
                    <UserPlus className="h-4 w-4" />
                    {jointDraft.method === "existing"
                      ? "Add verified client"
                      : "Add and invite"}
                  </button>
                </div>
              </div>
            ) : null}

            {errors.jointApplicants && !showJointComposer ? (
              <p className="mt-3 text-xs font-medium text-red-600">
                {errors.jointApplicants}
              </p>
            ) : null}
          </section>
        ) : null}

        <section>
          <SubsectionHeading
            title="Investment profile"
            description="Provide the investment currency and expected investment range."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Investment currency"
              htmlFor="investmentCurrency"
              error={errors.investmentCurrency}
            >
              <CustomSelect
                id="investmentCurrency"
                value={form.personal.investmentCurrency}
                onChange={(value) =>
                  updatePersonal("investmentCurrency", value)
                }
                options={INVESTMENT_CURRENCY_OPTIONS}
                placeholder="Select currency"
                error={Boolean(errors.investmentCurrency)}
              />
            </Field>
            <Field
              label="Expected investment amount"
              htmlFor="expectedInvestment"
              error={errors.expectedInvestment}
            >
              <CustomSelect
                id="expectedInvestment"
                value={form.personal.expectedInvestment}
                onChange={(value) =>
                  updatePersonal("expectedInvestment", value)
                }
                options={INVESTMENT_AMOUNT_OPTIONS}
                placeholder="Select expected amount"
                error={Boolean(errors.expectedInvestment)}
              />
            </Field>
          </div>
        </section>
      </div>
    </div>
  );

  const renderBusiness = () => (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("business")}
        title="Business"
        description="Provide the Sole Trader assessment and business information required for this application."
        icon={BriefcaseBusiness}
      />

      <div className="space-y-8">
        <section>
          <SubsectionHeading
            title="Sole Trader assessment"
            description="Confirm whether the Sole Trader is assessed as Australian or foreign. Additional fields appear where required."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <div
              className={
                form.business.assessmentNature === "foreign"
                  ? ""
                  : "sm:col-span-2"
              }
            >
              <Field
                label="Individual assessment nature"
                htmlFor="assessmentNature"
                error={errors.assessmentNature}
              >
                <CustomSelect
                  id="assessmentNature"
                  value={form.business.assessmentNature}
                  onChange={handleAssessmentNatureChange}
                  options={ASSESSMENT_OPTIONS}
                  placeholder="Select Australian or foreign"
                  error={Boolean(errors.assessmentNature)}
                />
              </Field>
            </div>
            {form.business.assessmentNature === "foreign" ? (
              <Field
                label="Country of foreign business"
                htmlFor="foreignBusinessCountry"
                error={errors.foreignBusinessCountry}
              >
                <CustomSelect
                  id="foreignBusinessCountry"
                  value={form.business.foreignBusinessCountry}
                  onChange={handleForeignBusinessCountryChange}
                  options={COUNTRY_OPTIONS}
                  placeholder="Select a country"
                  searchable
                  searchPlaceholder="Search countries"
                  error={Boolean(errors.foreignBusinessCountry)}
                />
              </Field>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-[rgba(0,52,120,0.14)] bg-[rgba(0,52,120,0.025)] p-5 sm:p-6">
          <SubsectionHeading
            title="Business details"
            description="Enter the legal business details used by the Sole Trader."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Business name"
              htmlFor="businessName"
              error={errors.businessName}
            >
              <input
                id="businessName"
                value={form.business.businessName}
                onChange={(event) =>
                  updateBusiness("businessName", event.target.value)
                }
                placeholder="Name under which the business is carried out"
                className={inputClass(Boolean(errors.businessName))}
              />
            </Field>
            {form.business.assessmentNature === "australian" ? (
              <Field
                label="Australian Business Number (ABN)"
                htmlFor="abn"
                error={errors.abn}
              >
                <input
                  id="abn"
                  value={form.business.abn}
                  onChange={(event) =>
                    updateBusiness("abn", event.target.value)
                  }
                  inputMode="numeric"
                  placeholder="11-digit ABN"
                  className={inputClass(Boolean(errors.abn))}
                />
              </Field>
            ) : null}
            <div className="sm:col-span-2">
              <Field
                label="Address of principal place of business"
                htmlFor="principalBusinessAddress"
                error={errors.principalBusinessAddress}
              >
                <textarea
                  id="principalBusinessAddress"
                  value={form.business.principalBusinessAddress}
                  onChange={(event) =>
                    updateBusiness(
                      "principalBusinessAddress",
                      event.target.value,
                    )
                  }
                  placeholder="Principal place of business"
                  className={textareaClass(
                    Boolean(errors.principalBusinessAddress),
                  )}
                />
              </Field>
            </div>
          </div>
        </section>

        {form.business.assessmentNature === "foreign" ? (
          <>
            <section>
              <SubsectionHeading
                title="Business activity and funds"
                description="Provide the major business nature, activity and intended account use documented for a foreign Sole Trader."
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Business nature (major business)"
                  htmlFor="investorClassification"
                  error={errors.investorClassification}
                >
                  <CustomSelect
                    id="investorClassification"
                    value={form.business.investorClassification}
                    onChange={(value) =>
                      updateBusiness("investorClassification", value)
                    }
                    options={BUSINESS_NATURE_OPTIONS}
                    placeholder="Select business nature"
                    error={Boolean(errors.investorClassification)}
                  />
                </Field>
                <Field
                  label="Describe the business activity"
                  htmlFor="businessActivity"
                  error={errors.businessActivity}
                >
                  <CustomSelect
                    id="businessActivity"
                    value={form.business.businessActivity}
                    onChange={handleBusinessActivityChange}
                    options={BUSINESS_ACTIVITY_OPTIONS}
                    placeholder="Select business activity"
                    error={Boolean(errors.businessActivity)}
                  />
                </Field>
                {form.business.businessActivity === "Other" ? (
                  <div className="sm:col-span-2">
                    <Field
                      label="Please specify the business activity"
                      htmlFor="businessActivityOther"
                      error={errors.businessActivityOther}
                    >
                      <input
                        id="businessActivityOther"
                        value={form.business.businessActivityOther}
                        onChange={(event) =>
                          updateBusiness(
                            "businessActivityOther",
                            event.target.value,
                          )
                        }
                        placeholder="For example, IT services"
                        className={inputClass(
                          Boolean(errors.businessActivityOther),
                        )}
                      />
                    </Field>
                  </div>
                ) : null}
                <div className="sm:col-span-2">
                  <Field
                    label="Source of funds, including origin"
                    htmlFor="sourceOfFunds"
                    error={errors.sourceOfFunds}
                  >
                    <textarea
                      id="sourceOfFunds"
                      value={form.business.sourceOfFunds}
                      onChange={(event) =>
                        updateBusiness("sourceOfFunds", event.target.value)
                      }
                      placeholder="Describe where the funds came from and their origin"
                      className={textareaClass(Boolean(errors.sourceOfFunds))}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Nature and level of intended transaction behaviour"
                    htmlFor="intendedTransactions"
                    error={errors.intendedTransactions}
                  >
                    <textarea
                      id="intendedTransactions"
                      value={form.business.intendedTransactions}
                      onChange={(event) =>
                        updateBusiness(
                          "intendedTransactions",
                          event.target.value,
                        )
                      }
                      placeholder="Describe the expected type, frequency and level of transactions"
                      className={textareaClass(
                        Boolean(errors.intendedTransactions),
                      )}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Beneficial ownership of funds used by this account"
                    htmlFor="beneficialOwnership"
                    error={errors.beneficialOwnership}
                  >
                    <textarea
                      id="beneficialOwnership"
                      value={form.business.beneficialOwnership}
                      onChange={(event) =>
                        updateBusiness(
                          "beneficialOwnership",
                          event.target.value,
                        )
                      }
                      placeholder="Describe who beneficially owns the funds"
                      className={textareaClass(
                        Boolean(errors.beneficialOwnership),
                      )}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {form.business.foreignBusinessCountry === "United States" ? (
              <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
                <SubsectionHeading
                  title="U.S. tax status"
                  description="Complete the Sole Trader’s U.S. citizenship and tax-residency declarations."
                />
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    label="Are you a U.S. citizen?"
                    htmlFor="usCitizen"
                    error={errors.usCitizen}
                  >
                    <BinaryChoice
                      value={form.business.usCitizen}
                      onChange={handleUsCitizenChange}
                      ariaLabel="U.S. citizenship status"
                    />
                  </Field>
                  <Field
                    label="Are you a U.S. tax resident?"
                    htmlFor="usTaxResident"
                    error={errors.usTaxResident}
                  >
                    <BinaryChoice
                      value={form.business.usTaxResident}
                      onChange={handleUsTaxResidentChange}
                      ariaLabel="U.S. tax residency status"
                    />
                  </Field>
                  {form.business.usCitizen === "yes" ? (
                    <Field
                      label="Social Security Number"
                      htmlFor="socialSecurityNumber"
                      error={errors.socialSecurityNumber}
                    >
                      <input
                        id="socialSecurityNumber"
                        value={form.business.socialSecurityNumber}
                        onChange={(event) =>
                          updateBusiness(
                            "socialSecurityNumber",
                            event.target.value,
                          )
                        }
                        placeholder="Enter Social Security Number"
                        className={inputClass(
                          Boolean(errors.socialSecurityNumber),
                        )}
                      />
                    </Field>
                  ) : null}
                  {form.business.usTaxResident === "yes" ? (
                    <Field
                      label="U.S. tax identification number"
                      htmlFor="taxIdentificationNumber"
                      error={errors.taxIdentificationNumber}
                    >
                      <input
                        id="taxIdentificationNumber"
                        value={form.business.taxIdentificationNumber}
                        onChange={(event) =>
                          updateBusiness(
                            "taxIdentificationNumber",
                            event.target.value,
                          )
                        }
                        placeholder="Enter tax identification number"
                        className={inputClass(
                          Boolean(errors.taxIdentificationNumber),
                        )}
                      />
                    </Field>
                  ) : null}
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );

  const renderBank = () => (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("bank")}
        title="External Bank Account"
        description="Add one or more verified accounts that may be used for transfers and settlement."
        icon={Landmark}
      />

      <div className="space-y-6">
        {form.bankAccounts.length > 0 ? (
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <SubsectionHeading
                title="Saved bank accounts"
                description="Each account requires independent verification evidence."
              />
              {!bankDraft ? (
                <button
                  type="button"
                  onClick={() => setBankDraft(createEmptyBank())}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63]"
                >
                  <Plus className="h-4 w-4" />
                  Add account
                </button>
              ) : null}
            </div>
            <div className="space-y-3">
              {form.bankAccounts.map((account, index) => (
                <div
                  key={account.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {account.bankName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {account.currency} · ••••{" "}
                      {account.accountNumber.slice(-4)} · SWIFT{" "}
                      {account.swiftCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="mr-auto inline-flex items-center gap-1.5 rounded-full bg-[#dce7f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-800 sm:mr-2">
                      <Check className="h-3 w-3" /> Verified file
                    </span>
                    <button
                      type="button"
                      onClick={() => editBankAccount(account)}
                      aria-label={`Edit bank account ${index + 1}`}
                      className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-[#003478]"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBankAccount(account.id)}
                      aria-label={`Remove bank account ${index + 1}`}
                      className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {bankDraft ? (
          <section className="rounded-2xl border border-[rgba(0,52,120,0.15)] bg-[rgba(0,52,120,0.025)] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <SubsectionHeading
                title={
                  editingBankId
                    ? "Edit external account"
                    : form.bankAccounts.length
                      ? "Add another external account"
                      : "External account details"
                }
                description="Enter the details exactly as they appear on the bank record."
              />
              {form.bankAccounts.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setBankDraft(null);
                    setEditingBankId(null);
                  }}
                  aria-label="Close bank account form"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Bank name" htmlFor="bankName">
                <input
                  id="bankName"
                  value={bankDraft.bankName}
                  onChange={(event) =>
                    updateBankDraft("bankName", event.target.value)
                  }
                  placeholder="Financial institution name"
                  className={inputClass()}
                />
              </Field>
              <Field label="SWIFT / BIC code" htmlFor="swiftCode">
                <input
                  id="swiftCode"
                  value={bankDraft.swiftCode}
                  onChange={(event) =>
                    updateBankDraft(
                      "swiftCode",
                      event.target.value.toUpperCase(),
                    )
                  }
                  placeholder="8 or 11 characters"
                  className={inputClass()}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Bank address" htmlFor="bankAddress">
                  <textarea
                    id="bankAddress"
                    value={bankDraft.bankAddress}
                    onChange={(event) =>
                      updateBankDraft("bankAddress", event.target.value)
                    }
                    placeholder="Branch or registered bank address"
                    className={textareaClass()}
                  />
                </Field>
              </div>
              <Field
                label="Australian BSB (optional)"
                htmlFor="bsb"
                hint="Complete this field for Australian bank accounts."
              >
                <input
                  id="bsb"
                  value={bankDraft.bsb}
                  onChange={(event) =>
                    updateBankDraft("bsb", event.target.value)
                  }
                  inputMode="numeric"
                  placeholder="000-000"
                  className={inputClass()}
                />
              </Field>
              <Field label="Account number or IBAN" htmlFor="accountNumber">
                <input
                  id="accountNumber"
                  value={bankDraft.accountNumber}
                  onChange={(event) =>
                    updateBankDraft("accountNumber", event.target.value)
                  }
                  placeholder="Account number or IBAN"
                  className={inputClass()}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Account currency" htmlFor="bankCurrency">
                  <CustomSelect
                    id="bankCurrency"
                    value={bankDraft.currency}
                    onChange={(value) => updateBankDraft("currency", value)}
                    options={BANK_CURRENCY_OPTIONS}
                    placeholder="Select account currency"
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <DocumentUpload
                  id={`bankVerification-${bankDraft.id}`}
                  title="Bank verification document"
                  description="Upload a recent bank statement or official bank letter showing the account holder and account details."
                  value={bankDraft.verificationDocument}
                  onChange={(file) =>
                    updateBankDraft(
                      "verificationDocument",
                      documentFromFile(file),
                    )
                  }
                />
              </div>
            </div>

            {errors.bankDraft ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-3 text-xs font-medium text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {errors.bankDraft}
              </div>
            ) : null}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={saveBankAccount}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#003478] px-5 text-xs font-semibold text-white transition hover:bg-[#002b63]"
              >
                <Check className="h-4 w-4" />
                {editingBankId ? "Save changes" : "Save bank account"}
              </button>
            </div>
          </section>
        ) : null}

        {errors.bank ? (
          <p className="text-xs font-medium text-red-600">{errors.bank}</p>
        ) : null}

        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-500">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
          Bank details and supporting evidence are encrypted in transit.
          Accounts are used only for approved application transfers and
          settlement.
        </div>
      </div>
    </div>
  );

  const renderSignature = () => (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("signature")}
        title="E-Signature"
        description="Provide the authorised signatory details that will be used to issue and validate the electronic signature request."
        icon={Fingerprint}
      />

      <div className="space-y-7">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <SubsectionHeading
              title="Authorised signatory"
              description="The signatory must be the person authorised to complete this application."
            />
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  signature: {
                    ...current.signature,
                    name: formatApplicantName(current.personal),
                    dateOfBirth: current.personal.dateOfBirth,
                  },
                }))
              }
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-[#003478]"
            >
              <CircleUserRound className="h-4 w-4" />
              Use primary details
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Full name"
              htmlFor="signatureName"
              error={errors.signatureName}
            >
              <input
                id="signatureName"
                value={form.signature.name}
                onChange={(event) =>
                  updateSignature("name", event.target.value)
                }
                autoComplete="name"
                placeholder="Authorised signatory’s full name"
                className={inputClass(Boolean(errors.signatureName))}
              />
            </Field>
            <Field
              label="Email address"
              htmlFor="signatureEmail"
              error={errors.signatureEmail}
            >
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="signatureEmail"
                  type="email"
                  value={form.signature.email}
                  onChange={(event) =>
                    updateSignature("email", event.target.value)
                  }
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={`${inputClass(Boolean(errors.signatureEmail))} pl-10`}
                />
              </div>
            </Field>
            <Field
              label="Phone number"
              htmlFor="signaturePhone"
              error={errors.signaturePhone}
            >
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="signaturePhone"
                  type="tel"
                  value={form.signature.phone}
                  onChange={(event) =>
                    updateSignature("phone", event.target.value)
                  }
                  autoComplete="tel"
                  placeholder="+61 400 000 000"
                  className={`${inputClass(Boolean(errors.signaturePhone))} pl-10`}
                />
              </div>
            </Field>
            <Field
              label="Date of birth"
              htmlFor="signatureDateOfBirth"
              error={errors.signatureDateOfBirth}
            >
              <input
                id="signatureDateOfBirth"
                type="date"
                value={form.signature.dateOfBirth}
                onChange={(event) =>
                  updateSignature("dateOfBirth", event.target.value)
                }
                className={inputClass(Boolean(errors.signatureDateOfBirth))}
              />
            </Field>
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-[rgba(0,52,120,0.13)] bg-[rgba(0,52,120,0.035)] p-4 text-sm leading-6 text-slate-600">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
          An electronic signature request will be sent to this email and phone
          number after the application passes its initial review.
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("documents")}
        title="Upload Proof"
        description="Upload identity and address evidence for each applicant. Requirements adapt to the applicant country and any Sole Trader assessment."
        icon={FileCheck2}
      />

      <div className="space-y-6">
        {applicantProfiles.map((applicant) => {
          const documents = form.documents[applicant.key] || {};
          const isAustralian = applicant.assessmentNature === "australian";
          const isForeign = applicant.assessmentNature === "foreign";
          const complete = isAustralian
            ? hasAustralianProof(documents)
            : isForeign
              ? hasForeignProof(documents)
              : false;

          return (
            <section
              key={applicant.key}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]">
                    {applicant.key === "primary" ? (
                      <CircleUserRound className="h-4 w-4" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {applicant.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {applicant.label} ·{" "}
                      {isAustralian
                        ? "Australian assessment"
                        : isForeign
                          ? "Foreign assessment"
                          : "Assessment not selected"}
                    </p>
                  </div>
                </div>
                <span
                  className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] sm:inline-flex ${
                    complete
                      ? "bg-[#dce7f2] text-slate-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {complete ? "Complete" : "Required"}
                </span>
              </div>

              {!applicant.assessmentNature ? (
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  {isSoleTrader
                    ? "Select the assessment nature in Business before uploading proof."
                    : "Complete the applicant country in Personal before uploading proof."}
                </div>
              ) : isAustralian ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <DocumentUpload
                    id={`${applicant.key}-licenceFront`}
                    title="Australian driver licence — front"
                    description="Clear colour image showing the full front of the current licence."
                    value={documents.licenceFront}
                    onChange={(file) =>
                      updateApplicantDocument(
                        applicant.key,
                        "licenceFront",
                        file,
                      )
                    }
                  />
                  <DocumentUpload
                    id={`${applicant.key}-licenceBack`}
                    title="Australian driver licence — back"
                    description="Clear colour image showing the full reverse of the current licence."
                    value={documents.licenceBack}
                    onChange={(file) =>
                      updateApplicantDocument(
                        applicant.key,
                        "licenceBack",
                        file,
                      )
                    }
                  />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <DocumentUpload
                    id={`${applicant.key}-photoId`}
                    title="Foreign identity or driver licence"
                    description="Government-issued photo identity or a valid foreign driver licence."
                    value={documents.photoId}
                    onChange={(file) =>
                      updateApplicantDocument(applicant.key, "photoId", file)
                    }
                  />
                  <DocumentUpload
                    id={`${applicant.key}-passport`}
                    title="Passport"
                    description="Clear image of the passport identity page."
                    value={documents.passport}
                    onChange={(file) =>
                      updateApplicantDocument(applicant.key, "passport", file)
                    }
                  />
                  <div className="sm:col-span-2">
                    <DocumentUpload
                      id={`${applicant.key}-utilityBill`}
                      title="Residential address evidence"
                      description="Recent utility bill or equivalent address evidence showing the applicant’s name and residential address."
                      value={documents.utilityBill}
                      onChange={(file) =>
                        updateApplicantDocument(
                          applicant.key,
                          "utilityBill",
                          file,
                        )
                      }
                    />
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {errors.documents ? (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-3 text-xs font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {errors.documents}
          </div>
        ) : null}

        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-500">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
          Accepted formats: PDF, JPG or PNG. Upload complete, readable documents
          without cropping or glare.
        </div>
      </div>
    </div>
  );

  const renderReview = () => {
    const uploadedProofCount = Object.values(form.documents).reduce(
      (total, documents) =>
        total + Object.values(documents).filter(Boolean).length,
      0,
    );

    return (
      <div className="animate-[fadeUp_.35s_ease-out]">
        <SectionIntro
          eyebrow={sectionEyebrow("review")}
          title="Review and Submit"
          description="Check the application carefully. Use Edit to return to any section before secure submission."
          icon={BadgeCheck}
        />

        {!allApplicationSectionsComplete ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            Some sections are incomplete. Review the status navigation and
            complete all required information before submitting.
          </div>
        ) : (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[rgba(0,52,120,0.14)] bg-[rgba(0,52,120,0.035)] p-4 text-sm leading-6 text-slate-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
            All application sections are complete and ready for your final
            declarations.
          </div>
        )}

        <div className="space-y-4">
          <ReviewSection
            title="Personal"
            icon={CircleUserRound}
            onEdit={() => goToStep("personal")}
          >
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryItem
                label="Application type"
                value={selectedApplicationType}
              />
              <SummaryItem
                label="Applicant country"
                value={form.personal.applicantCountry}
              />
              <SummaryItem label="First name" value={form.personal.firstName} />
              <SummaryItem
                label="Middle name"
                value={form.personal.middleName || "Not provided"}
              />
              <SummaryItem label="Last name" value={form.personal.lastName} />
              <SummaryItem
                label="Former names"
                value={form.personal.formerNames}
              />
              <SummaryItem
                label="Date of birth"
                value={form.personal.dateOfBirth}
              />
              <SummaryItem
                label="Investment profile"
                value={`${form.personal.investmentCurrency || "—"} · ${form.personal.expectedInvestment || "—"}`}
              />
              <div className="sm:col-span-2 lg:col-span-3">
                <SummaryItem
                  label="Residential address"
                  value={form.personal.residentialAddress}
                />
              </div>
            </dl>
            {isJoint ? (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.09em] text-slate-400">
                  Joint applicants
                </p>
                <div className="space-y-2.5">
                  {form.jointApplicants.map((applicant, index) => (
                    <div
                      key={applicant.id}
                      className="flex flex-col gap-1 rounded-xl bg-slate-50 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-sm font-semibold text-slate-800">
                        {index + 1}. {formatApplicantName(applicant)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {applicant.method === "existing"
                          ? `Client ID ${applicant.clientId}`
                          : applicant.email}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </ReviewSection>

          {isSoleTrader ? (
            <ReviewSection
              title="Business"
              icon={BriefcaseBusiness}
              onEdit={() => goToStep("business")}
            >
              <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <SummaryItem
                  label="Individual assessment"
                  value={
                    form.business.assessmentNature === "australian"
                      ? "Australian"
                      : form.business.assessmentNature === "foreign"
                        ? "Foreign"
                        : "Not selected"
                  }
                />
                <SummaryItem
                  label="Business name"
                  value={form.business.businessName}
                />
                <SummaryItem
                  label="Principal business address"
                  value={form.business.principalBusinessAddress}
                />
                {form.business.assessmentNature === "australian" ? (
                  <SummaryItem label="ABN" value={form.business.abn} />
                ) : null}
                {form.business.assessmentNature === "foreign" ? (
                  <>
                    <SummaryItem
                      label="Country of foreign business"
                      value={form.business.foreignBusinessCountry}
                    />
                    <SummaryItem
                      label="Business nature"
                      value={form.business.investorClassification}
                    />
                    <SummaryItem
                      label="Business activity"
                      value={
                        form.business.businessActivity === "Other"
                          ? form.business.businessActivityOther
                          : form.business.businessActivity
                      }
                    />
                    <SummaryItem
                      label="Source and origin of funds"
                      value={form.business.sourceOfFunds}
                    />
                    <SummaryItem
                      label="Transaction behaviour"
                      value={form.business.intendedTransactions}
                    />
                    <SummaryItem
                      label="Beneficial ownership"
                      value={form.business.beneficialOwnership}
                    />
                    {form.business.foreignBusinessCountry ===
                    "United States" ? (
                      <>
                        <SummaryItem
                          label="U.S. citizen"
                          value={
                            form.business.usCitizen === "yes" ? "Yes" : "No"
                          }
                        />
                        <SummaryItem
                          label="Social Security Number"
                          value={
                            form.business.socialSecurityNumber
                              ? "Provided securely"
                              : "Not required"
                          }
                        />
                        <SummaryItem
                          label="U.S. tax resident"
                          value={
                            form.business.usTaxResident === "yes" ? "Yes" : "No"
                          }
                        />
                        <SummaryItem
                          label="Tax identification number"
                          value={
                            form.business.taxIdentificationNumber
                              ? "Provided securely"
                              : "Not required"
                          }
                        />
                      </>
                    ) : null}
                  </>
                ) : null}
              </dl>
            </ReviewSection>
          ) : null}

          <ReviewSection
            title="External Bank Account"
            icon={Landmark}
            onEdit={() => goToStep("bank")}
          >
            <div className="space-y-3">
              {form.bankAccounts.length ? (
                form.bankAccounts.map((account, index) => (
                  <div
                    key={account.id}
                    className="grid gap-3 rounded-xl bg-slate-50 p-3.5 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {index + 1}. {account.bankName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {account.currency} · SWIFT {account.swiftCode} · ••••{" "}
                        {account.accountNumber.slice(-4)}
                      </p>
                    </div>
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#dce7f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-800">
                      <FileCheck2 className="h-3 w-3" /> Evidence attached
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No bank account saved.</p>
              )}
            </div>
          </ReviewSection>

          <ReviewSection
            title="E-Signature"
            icon={Fingerprint}
            onEdit={() => goToStep("signature")}
          >
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryItem label="Signatory" value={form.signature.name} />
              <SummaryItem label="Email" value={form.signature.email} />
              <SummaryItem label="Phone" value={form.signature.phone} />
              <SummaryItem
                label="Date of birth"
                value={form.signature.dateOfBirth}
              />
            </dl>
          </ReviewSection>

          <ReviewSection
            title="Upload Proof"
            icon={FileCheck2}
            onEdit={() => goToStep("documents")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <CheckRow
                checked={uploadedProofCount > 0}
                label={`${uploadedProofCount} identity and address file${uploadedProofCount === 1 ? "" : "s"} attached`}
              />
              <CheckRow
                checked={documentsComplete}
                label={`${applicantProfiles.length} applicant proof set${applicantProfiles.length === 1 ? "" : "s"} complete`}
              />
            </div>
          </ReviewSection>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">
            Final declarations
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Both confirmations are required before secure submission.
          </p>
          <div className="mt-5 space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
              <input
                type="checkbox"
                checked={form.agreements.accurate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    agreements: {
                      ...current.agreements,
                      accurate: event.target.checked,
                    },
                  }))
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#003478]"
              />
              <span className="text-sm leading-6 text-slate-700">
                I confirm that the information and documents supplied are
                complete, current and accurate.
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
              <input
                type="checkbox"
                checked={form.agreements.consent}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    agreements: {
                      ...current.agreements,
                      consent: event.target.checked,
                    },
                  }))
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#003478]"
              />
              <span className="text-sm leading-6 text-slate-700">
                I consent to identity, bank and compliance verification and to
                receiving the electronic signature request.
              </span>
            </label>
          </div>
          {errors.agreements ? (
            <p className="mt-3 text-xs font-medium text-red-600">
              {errors.agreements}
            </p>
          ) : null}
        </section>
      </div>
    );
  };

  const renderActiveStep = () => {
    switch (activeStepId) {
      case "personal":
        return renderPersonal();
      case "business":
        return renderBusiness();
      case "bank":
        return renderBank();
      case "signature":
        return renderSignature();
      case "documents":
        return renderDocuments();
      case "review":
        return renderReview();
      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] px-4 py-10 text-slate-950 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="h-1.5 bg-[#003478]" />
          <div className="px-6 py-10 text-center sm:px-12 sm:py-14">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#dce7f2] text-[#003478]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#003478]">
              Application received
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Securely submitted
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500">
              Your Caprock individual application has been submitted for review.
              The authorised signatory will receive the next steps at{" "}
              {form.signature.email}.
            </p>
            <div className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left sm:grid-cols-3">
              <SummaryItem
                label="Reference"
                value={`CR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`}
              />
              <SummaryItem
                label="Application"
                value={selectedApplicationType}
              />
              <SummaryItem label="Status" value="Compliance review" />
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <LockKeyhole className="h-4 w-4" />
              Submission encrypted and time-stamped
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950 selection:bg-[#dce7f2] selection:text-slate-950">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label="Toggle application navigation"
              aria-expanded={mobileNavOpen}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
            >
              {mobileNavOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
            <a
              href="/"
              className="flex shrink-0 items-center"
              aria-label="Caprock home"
            >
              <img
                src="/company-logo.svg"
                alt="Caprock"
                className="h-8 w-auto sm:h-9"
              />
            </a>
            <div className="hidden h-7 w-px bg-slate-200 sm:block" />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-slate-900">
                Individual application
              </p>
              <p className="text-[11px] text-slate-400">Secure onboarding</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 md:flex">
              <ShieldCheck className="h-4 w-4 text-[#003478]" />
              Encrypted session
            </div>
            <button
              type="button"
              onClick={saveDraft}
              disabled={isSaving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-[#003478] disabled:opacity-60 sm:px-4"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isSaving ? "Saved" : "Save draft"}
              </span>
            </button>
            <button
              type="button"
              aria-label="Help with application"
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-[#003478]"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-[#003478] transition-[width] duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {mobileNavOpen ? (
        <div
          className="fixed inset-0 top-[68px] z-30 bg-slate-950/20 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        >
          <nav
            className="h-full w-[min(88vw,360px)] overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            aria-label="Application sections"
          >
            <p className="px-3 pb-3 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Application sections
            </p>
            <div className="space-y-1.5">
              {visibleSteps.map((step, index) => {
                const Icon = step.icon;
                const active = step.id === activeStepId;
                const done = completion[step.id];
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goToStep(step.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? "bg-[#dce7f2] text-slate-950"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-xl ${active ? "bg-white text-[#003478]" : "bg-slate-100 text-slate-500"}`}
                    >
                      {done && !active ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        {step.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                        {step.description}
                      </span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {index + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      ) : null}

      <main className="mx-auto grid max-w-[1440px] lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-76px)] border-r border-slate-200/80 bg-white/65 px-5 py-8 lg:block">
          <div className="sticky top-28">
            <div className="mb-6 px-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Application progress
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    {completedSectionCount}/{applicationSectionCount}
                  </p>
                </div>
                <p className="pb-1 text-xs font-medium text-slate-400">
                  sections complete
                </p>
              </div>
            </div>

            <nav className="space-y-1.5" aria-label="Application sections">
              {visibleSteps.map((step, index) => {
                const Icon = step.icon;
                const active = step.id === activeStepId;
                const done = completion[step.id];
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goToStep(step.id)}
                    aria-current={active ? "step" : undefined}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? "bg-[#dce7f2] text-slate-950"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${
                        active
                          ? "bg-white text-[#003478] shadow-sm ring-1 ring-slate-200/60"
                          : done
                            ? "bg-[rgba(0,52,120,0.08)] text-[#003478]"
                            : "bg-slate-100 text-slate-400 group-hover:bg-slate-50"
                      }`}
                    >
                      {done && !active ? (
                        <Check className="h-4 w-4" strokeWidth={2.5} />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold">
                        {step.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                        {step.description}
                      </span>
                    </span>
                    <span
                      className={`text-[10px] font-bold ${active ? "text-[#003478]" : "text-slate-300"}`}
                    >
                      {index + 1}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgba(0,52,120,0.07)] text-[#003478]">
                  <LockKeyhole className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Secure application
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-400">
                    Your entries are protected throughout this session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 xl:px-14">
          <div className="mx-auto max-w-4xl">
            <div className="mb-5 flex items-center justify-between gap-4 lg:hidden">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Step {activeStepIndex + 1} of {visibleSteps.length}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {visibleSteps[activeStepIndex].label}
                </p>
              </div>
              <span className="rounded-full bg-[#dce7f2] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-800">
                {completedSectionCount}/{applicationSectionCount} complete
              </span>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_45px_rgba(15,23,42,0.045)] sm:p-8 lg:p-10">
              {notice ? (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-800"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  {notice}
                </div>
              ) : null}
              {renderActiveStep()}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <button
                type="button"
                onClick={goBack}
                disabled={activeStepIndex === 0}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={isSaving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-[#003478] disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={isSubmitting}
                  className="group inline-flex h-12 min-w-40 items-center justify-center gap-2 rounded-xl bg-[#003478] px-6 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(0,52,120,0.16)] transition hover:-translate-y-0.5 hover:bg-[#002b63] hover:shadow-[0_12px_28px_rgba(0,52,120,0.2)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003478]/15 disabled:cursor-wait disabled:transform-none disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting
                    </>
                  ) : activeStepId === "review" ? (
                    <>
                      <Send className="h-4 w-4" />
                      Submit securely
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pb-8 text-[10px] font-medium text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Encrypted
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5" /> Bank verification
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Compliance review
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
