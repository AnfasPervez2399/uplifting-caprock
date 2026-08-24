import type {
  AdviserDraft,
  BankAccount,
  FormState,
  JointApplicantDraft,
} from "./types";

export const initialFormState: FormState = {
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
  identity: {},
  bankAccounts: [],
  cashAccounts: [],
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

export const emptyAdviserDraft: AdviserDraft = {
  name: "",
  email: "",
};

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

export const createEmptyBank = (): BankAccount => ({
  id: `bank-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  bankName: "",
  swiftCode: "",
  bankAddress: "",
  bsb: "",
  accountNumber: "",
  currency: "",
});
