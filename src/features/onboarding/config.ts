import {
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CircleUserRound,
  FileCheck2,
  Fingerprint,
  Landmark,
  ScanFace,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import type { SelectOption } from "../../components/ui/CustomSelect";
import type {
  ApplicationOption,
  ApplicationType,
  CompanyStructure,
  EntityDocumentDefinition,
  StepDefinition,
  StepId,
} from "./types";

export const allSteps: StepDefinition[] = [
  { id: "application", shortLabel: "Type", label: "Application Type", description: "Choose who is applying", icon: Sparkles },
  { id: "personal", shortLabel: "Personal", label: "Personal Information", description: "Applicant and investment details", icon: CircleUserRound },
  { id: "entity", shortLabel: "Company", label: "Company Profile", description: "Registration and investment details", icon: Building2 },
  { id: "trust", shortLabel: "Trust", label: "Trust Profile", description: "Trust and trustee details", icon: ShieldCheck },
  { id: "business", shortLabel: "Business", label: "Business", description: "Registration, tax and activity", icon: BriefcaseBusiness },
  { id: "directors", shortLabel: "Directors", label: "M.D. & Owners", description: "Directors and communication recipient", icon: UsersRound },
  { id: "shareholders", shortLabel: "Shareholders", label: "Shareholders", description: "Ownership and shareholder contacts", icon: UsersRound },
  { id: "trustees", shortLabel: "Trustees", label: "Trustees", description: "Trustee contacts and structures", icon: UsersRound },
  { id: "beneficiaries", shortLabel: "Beneficiaries", label: "Beneficiaries", description: "Trust beneficiary details", icon: UsersRound },
  { id: "identity", shortLabel: "Selfie", label: "Prove It’s You", description: "Live identity selfie", icon: ScanFace },
  { id: "bank", shortLabel: "Bank", label: "External Bank Account", description: "Settlement account verification", icon: Landmark },
  { id: "cash", shortLabel: "Cash", label: "Cash Accounts", description: "Select account currencies", icon: Banknote },
  { id: "documents", shortLabel: "Proof", label: "Upload Proof", description: "Required identity or entity evidence", icon: FileCheck2 },
  { id: "signature", shortLabel: "E-Signature", label: "E-Signature", description: "Authorised signatory details", icon: Fingerprint },
  { id: "review", shortLabel: "Review", label: "Review and Submit", description: "Confirm and securely submit", icon: BadgeCheck },
];

const stepsByType: Record<Exclude<ApplicationType, "">, StepId[]> = {
  individual: ["application", "personal", "identity", "bank", "cash", "documents", "signature", "review"],
  "joint-same": ["application", "personal", "identity", "bank", "cash", "documents", "signature", "review"],
  "joint-different-name": ["application", "personal", "identity", "bank", "cash", "documents", "signature", "review"],
  "joint-different-address": ["application", "personal", "identity", "bank", "cash", "documents", "signature", "review"],
  "sole-trader": ["application", "personal", "business", "identity", "bank", "cash", "documents", "signature", "review"],
  "australian-company": ["application", "entity", "business", "directors", "shareholders", "bank", "cash", "documents", "signature", "review"],
  "asic-non-australian-company": ["application", "entity", "business", "directors", "shareholders", "bank", "cash", "documents", "signature", "review"],
  "non-australian-company": ["application", "entity", "business", "directors", "shareholders", "bank", "cash", "documents", "signature", "review"],
  "regulated-trust": ["application", "trust", "business", "bank", "trustees", "beneficiaries", "cash", "documents", "signature", "review"],
  "custodian-trust": ["application", "trust", "business", "bank", "trustees", "beneficiaries", "cash", "documents", "signature", "review"],
  "non-custodian-trust": ["application", "trust", "business", "bank", "trustees", "beneficiaries", "cash", "documents", "signature", "review"],
};

export const getStepsForApplication = (type: ApplicationType): StepDefinition[] => {
  const ids = type ? stepsByType[type] : ["application" as StepId];
  return ids.map((id) => allSteps.find((step) => step.id === id)!).filter(Boolean);
};

export const APPLICATION_OPTIONS: ApplicationOption[] = [
  { value: "individual", label: "Individual", description: "An account held by one individual applicant", headerTitle: "Individual application", category: "individual" },
  { value: "joint-same", label: "Husband-and-wife joint account — same address", description: "Joint applicants who share a residential address", headerTitle: "Joint application", category: "individual" },
  { value: "joint-different-name", label: "Different-surname joint account — same address", description: "Joint applicants with different surnames at one address", headerTitle: "Joint application", category: "individual" },
  { value: "joint-different-address", label: "Joint account — different addresses", description: "Joint applicants who have separate residential addresses", headerTitle: "Joint application", category: "individual" },
  { value: "sole-trader", label: "Sole Trader", description: "An individual applying in their capacity as a sole trader", headerTitle: "Sole trader application", category: "individual" },
  { value: "australian-company", label: "Australian Domestic Company", description: "A company formed, incorporated or registered in Australia", headerTitle: "Australian company application", category: "company" },
  { value: "asic-non-australian-company", label: "ASIC-registered Non-Australian Company", description: "A foreign company registered with ASIC and issued an ARBN", headerTitle: "ASIC-registered foreign company application", category: "company" },
  { value: "non-australian-company", label: "Non-Australian Company", description: "A company formed and registered outside Australia", headerTitle: "Non-Australian company application", category: "company" },
  { value: "regulated-trust", label: "Regulated Trust", description: "A trust regulated by ASIC, APRA or another relevant regulator", headerTitle: "Regulated trust application", category: "trust" },
  { value: "custodian-trust", label: "Trust acting as custodian", description: "A trust acting in a custodian capacity", headerTitle: "Custodian trust application", category: "trust" },
  { value: "non-custodian-trust", label: "Trust not acting as custodian", description: "A trust that is not acting in a custodian capacity", headerTitle: "Non-custodian trust application", category: "trust" },
];

export const AUSTRALIAN_STATE_OPTIONS: SelectOption[] = [
  "Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia",
].map((label) => ({ value: label, label }));

export const DOMESTIC_COMPANY_TYPE_OPTIONS: SelectOption[] = [
  { value: "partnership", label: "Partnership" },
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
];
export const FOREIGN_COMPANY_TYPE_OPTIONS: SelectOption[] = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
];
export const NON_AUSTRALIAN_COMPANY_TYPE_OPTIONS: SelectOption[] = [
  { value: "proprietor", label: "Proprietor" },
  ...FOREIGN_COMPANY_TYPE_OPTIONS,
];
export const AUSTRALIAN_REGISTRATION_OPTIONS: SelectOption[] = [
  { value: "public", label: "Public" },
  { value: "proprietary", label: "Proprietary" },
];
export const PARTY_TYPE_OPTIONS: SelectOption[] = [
  { value: "individual", label: "Individual" },
  { value: "corporate", label: "Corporate" },
];
export const SHAREHOLDER_PARTY_TYPE_OPTIONS: SelectOption[] = [
  ...PARTY_TYPE_OPTIONS,
  { value: "trust", label: "Trust" },
];
export const SHAREHOLDER_TRUST_TYPE_OPTIONS: SelectOption[] = [
  { value: "discretionary", label: "Discretionary trust" },
  { value: "unit", label: "Unit trust" },
  { value: "regulated", label: "Regulated trust" },
  { value: "other", label: "Other trust" },
];
export const CORPORATE_ENTITY_TYPE_OPTIONS: SelectOption[] = [
  { value: "australian-company", label: "Australian Domestic Company" },
  { value: "asic-non-australian-company", label: "ASIC-registered Non-Australian Company" },
  { value: "non-australian-company", label: "Non-Australian Company" },
];

const doc = (key: string, title: string, description: string, sourceField: string): EntityDocumentDefinition => ({ key, title, description, sourceField });
const commonCompanyDocuments = [
  doc("org_chart_share", "Organisational chart", "An organisational chart showing ownership by shareholding.", "org_chart_share"),
  doc("association_article", "Articles of Association", "Current Articles of Association for the company.", "association_article"),
];

export const getRequiredEntityDocuments = (
  type: ApplicationType,
  companyType: CompanyStructure,
): EntityDocumentDefinition[] => {
  if (type === "australian-company") return [
    doc("aus_stock_doc", "Australian Stock Exchange search", "A search of the relevant Australian Stock Exchange.", "aus_stock_doc"),
    ...commonCompanyDocuments,
    doc("asic_extract", "ASIC Extract", "A current ASIC company extract.", "asic_extract"),
  ];
  if (type === "asic-non-australian-company") return [
    ...commonCompanyDocuments,
    doc("asic_extract", "ASIC Extract", "A current ASIC company extract.", "asic_extract"),
    ...(companyType === "public" ? [doc("aus_stock_doc", "Australian Stock Exchange search", "Required for a public company.", "aus_stock_doc")] : []),
  ];
  if (type === "non-australian-company") return [
    doc("incorporation_certificate", "Certificate of incorporation", "Certificate issued when the company was formed or incorporated.", "incorporation_certificate"),
    doc("org_chart_share", "Notarised organisational chart", "A notarised organisational chart showing ownership by shareholding.", "org_chart_share"),
    doc("foreign_notarised_search", "Notarised foreign registration search", "A notarised search of the relevant foreign registration body.", "foreign_notarised_search"),
    doc("association_article", "Notarised Articles of Association", "Current notarised Articles of Association.", "association_article"),
    ...(companyType === "public" ? [doc("aus_stock_doc", "Australian Stock Exchange search", "Required for a public company.", "aus_stock_doc")] : []),
  ];
  if (type === "regulated-trust") return [
    doc("trust_deed", "Trust deed or extract", "A trust deed or an extract of the trust deed.", "trust_deed"),
    doc("search_of_database", "Regulator database search", "A search of the relevant ASIC, APRA or other regulator database.", "search_of_database"),
  ];
  if (type === "custodian-trust") return [
    doc("trust_deed", "Trust deed or extract", "A trust deed or an extract of the trust deed.", "trust_deed"),
    doc("search_of_database", "Regulator database search", "A search of the relevant ASIC, APRA or other regulator database.", "search_of_database"),
    doc("trust_writing_confirmation", "Reporting Entities Roll confirmation", "Written confirmation that the name and enrolment details are entered on the Reporting Entities Roll.", "trust_writing_confirmation"),
    doc("trust_reliable_electronic_data", "Reliable electronic trust data", "Reliable and independent electronic data relating to the trust.", "trust_reliable_electronic_data"),
  ];
  if (type === "non-custodian-trust") return [
    doc("trust_deed", "Trust deed or extract", "A trust deed or an extract of the trust deed.", "trust_deed"),
    doc("search_of_database", "Regulator database search", "A search of the relevant ASIC, APRA or other regulator database.", "search_of_database"),
    doc("trust_reliable_documentation", "Reliable trust documentation", "Reliable and independent documentation relating to the trust.", "trust_reliable_documentation"),
    doc("trust_reliable_electronic_data", "Reliable electronic trust data", "Reliable and independent electronic data relating to the trust.", "trust_reliable_electronic_data"),
  ];
  return [];
};

export const ASSESSMENT_OPTIONS: SelectOption[] = [
  { value: "australian", label: "Australian", description: "Australian customer assessment" },
  { value: "foreign", label: "Foreign", description: "International customer assessment" },
];

export const INVESTMENT_CURRENCY_OPTIONS: SelectOption[] = [
  { value: "AUD", label: "Australian dollar (AUD)" },
  { value: "USD", label: "US dollar (USD)" },
  { value: "GBP", label: "British pound (GBP)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "SGD", label: "Singapore dollar (SGD)" },
  { value: "HKD", label: "Hong Kong dollar (HKD)" },
];

export const BANK_CURRENCY_OPTIONS: SelectOption[] = [
  ...INVESTMENT_CURRENCY_OPTIONS,
  { value: "NZD", label: "New Zealand dollar (NZD)" },
  { value: "JPY", label: "Japanese yen (JPY)" },
  { value: "CAD", label: "Canadian dollar (CAD)" },
  { value: "CHF", label: "Swiss franc (CHF)" },
];

export const PHOTO_ID_OPTIONS: SelectOption[] = [
  { value: "passport", label: "Passport", description: "Passport identity page" },
  { value: "driving-licence", label: "Driving licence", description: "Front and back of a current licence" },
  { value: "photo-id", label: "Photo ID", description: "Other current government-issued photo identification" },
];

export const ADDRESS_DOCUMENT_OPTIONS: SelectOption[] = [
  { value: "utility-bill", label: "Utility bill", description: "Recent electricity, gas, water or internet bill" },
  { value: "lease-agreement", label: "Lease agreement", description: "Current residential tenancy or lease agreement" },
  { value: "tax-document", label: "Tax document", description: "Recent government-issued tax assessment or notice" },
];

export const INVESTMENT_AMOUNT_OPTIONS: SelectOption[] = [
  { value: "$500k–$50 million", label: "$500,000 – $50 million" },
  { value: "$50–$100 million", label: "$50 million – $100 million" },
  { value: "$100 million+", label: "$100 million+" },
];

export const COUNTRY_OPTIONS: SelectOption[] = [
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

export const BUSINESS_NATURE_OPTIONS: SelectOption[] = [
  { value: "Accredited Investor", label: "Accredited Investor" },
  { value: "High Net-worth Individual", label: "High Net-worth Individual" },
  { value: "Sophisticated Investor", label: "Sophisticated Investor" },
  { value: "Wholesale Investor", label: "Wholesale Investor" },
];

export const BUSINESS_ACTIVITY_OPTIONS: SelectOption[] = [
  { value: "Capital Markets", label: "Capital Markets" },
  { value: "Commodities", label: "Commodities" },
  { value: "Financial Markets", label: "Financial Markets" },
  { value: "Other", label: "Other" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Stock Market", label: "Stock Market" },
];

