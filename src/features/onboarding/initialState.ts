import type {
  AdviserDraft,
  BankAccount,
  CompanyDirector,
  CompanyShareholder,
  FormState,
  ShareholderApplication,
  ShareholderOwner,
  ShareholderRelatedParty,
  JointApplicantDraft,
  TrustBeneficiary,
  TrustParty,
} from "./types";

export const createEmptyForm = (): FormState => ({
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
  company: {
    name: "",
    website: "",
    registrationNumber: "",
    arbn: "",
    investmentCurrency: "",
    expectedInvestment: "",
    stateOrTerritory: "",
    companyType: "",
    incorporationDate: "",
    registeredAddress: "",
    registrationType: "",
    acn: "",
    amlActivity: "",
    principalAddress: "",
    country: "",
    registeredByRelevantBody: "",
    usRegistered: "",
    usTaxId: "",
    identificationNumber: "",
    domicileCountry: "",
    directorCount: "0",
    shareholderCount: "0",
    shareholdersConfirmed: false,
    defaultRecipientId: "",
  },
  directors: [],
  shareholders: [],
  trust: {
    name: "",
    trusteeBusinessName: "",
    establishedCountry: "",
    investmentCurrency: "",
    expectedInvestment: "",
    afsLicenseNumber: "",
    settlorName: "",
    address: "",
    applicantCountry: "",
    trusteeCount: "0",
    beneficiaryCount: "0",
    beneficiariesConfirmed: false,
    defaultRecipientId: "",
  },
  trustees: [],
  beneficiaries: [],
  identity: {},
  bankAccounts: [],
  cashAccounts: [],
  signature: { name: "", email: "", phone: "", dateOfBirth: "" },
  documents: {},
  entityDocuments: {},
  agreements: { accurate: false, consent: false },
});

export const initialFormState: FormState = createEmptyForm();

export const emptyAdviserDraft: AdviserDraft = { name: "", email: "" };

export const emptyJointDraft: JointApplicantDraft = {
  method: "existing",
  clientId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  formerNames: "",
  email: "",
  dateOfBirth: "",
  applicantCountry: "",
  residentialAddress: "",
};

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const createEmptyBank = (): BankAccount => ({
  id: createId("bank"),
  bankName: "",
  swiftCode: "",
  bankAddress: "",
  bsb: "",
  accountNumber: "",
  currency: "",
});

export const createEmptyDirector = (): CompanyDirector => ({
  id: createId("director"),
  name: "",
  email: "",
  phone: "",
});

export const createEmptyShareholderApplication =
  (): ShareholderApplication => ({
    country: "",
    address: "",
    dateOfBirth: "",
    registrationNumber: "",
    business: {
      principalBusinessAddress: "",
      businessActivity: "",
      sourceOfFunds: "",
      intendedTransactions: "",
    },
    directors: [],
    trustees: [],
    beneficiaries: [],
    ownershipInterests: [],
    documents: {},
    signature: { name: "", email: "", phone: "", dateOfBirth: "" },
    declarationAccepted: false,
  });

export const createEmptyShareholderRelatedParty = (
  prefix = "related-party",
): ShareholderRelatedParty => ({
  id: createId(prefix),
  type: "",
  companyType: "",
  name: "",
  email: "",
  phone: "",
});

export const createEmptyShareholderOwner = (): ShareholderOwner => ({
  id: createId("owner"),
  type: "",
  companyType: "",
  trustType: "",
  percentage: "",
  name: "",
  email: "",
  phone: "",
  application: createEmptyShareholderApplication(),
});

export const createEmptyShareholder = (): CompanyShareholder => ({
  id: createId("shareholder"),
  type: "",
  companyType: "",
  trustType: "",
  percentage: "",
  name: "",
  email: "",
  phone: "",
  application: createEmptyShareholderApplication(),
});

export const createEmptyBeneficiary = (): TrustBeneficiary => ({
  ...createEmptyShareholder(),
  id: createId("beneficiary"),
});

export const createEmptyTrustParty = (prefix = "party"): TrustParty => ({
  id: createId(prefix),
  type: "",
  companyType: "",
  name: "",
  email: "",
  phone: "",
  directors: [],
});
