import type { LucideIcon } from "lucide-react";
import type { SelectOption } from "../../components/ui/CustomSelect";

export type StepId =
  | "application"
  | "personal"
  | "entity"
  | "trust"
  | "business"
  | "directors"
  | "shareholders"
  | "trustees"
  | "beneficiaries"
  | "identity"
  | "bank"
  | "cash"
  | "documents"
  | "signature"
  | "review";

export type ApplicationType =
  | "individual"
  | "joint-same"
  | "joint-different-name"
  | "joint-different-address"
  | "sole-trader"
  | "australian-company"
  | "asic-non-australian-company"
  | "non-australian-company"
  | "regulated-trust"
  | "custodian-trust"
  | "non-custodian-trust"
  | "";

export type ApplicationCategory = "individual" | "company" | "trust";
export type AssessmentNature = "australian" | "foreign" | "";
export type YesNo = "yes" | "no" | "";
export type JointMethod = "existing" | "new";
export type PartyType = "individual" | "corporate" | "";
export type CompanyStructure = "proprietor" | "partnership" | "private" | "public" | "";
export type AustralianRegistrationType = "public" | "proprietary" | "";
export type CompanyApplicationType = Exclude<Extract<ApplicationType,
  "australian-company" | "asic-non-australian-company" | "non-australian-company"
>, "">;
export type TrustApplicationType = Exclude<Extract<ApplicationType,
  "regulated-trust" | "custodian-trust" | "non-custodian-trust"
>, "">;
export type CorporateEntityType = "australian-company" | "asic-non-australian-company" | "non-australian-company" | "";
export type PhotoIdType = "passport" | "driving-licence" | "photo-id" | "";
export type AddressDocumentType = "utility-bill" | "lease-agreement" | "tax-document" | "";
export type ProofFileField =
  | "photoIdFront"
  | "photoIdBack"
  | "secondaryPhotoIdFront"
  | "secondaryPhotoIdBack"
  | "addressDocument"
  | "cv";

export interface StepDefinition {
  id: StepId;
  shortLabel: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface ApplicationOption extends SelectOption {
  headerTitle: string;
  category: ApplicationCategory;
}

export interface EntityDocumentDefinition {
  key: string;
  title: string;
  description: string;
  sourceField: string;
}

export interface UploadedDocument {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  previewUrl: string;
}

export interface DocumentPreview {
  document: UploadedDocument;
  label: string;
}

export interface PersonalState {
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

export interface JointApplicant {
  id: string;
  method: JointMethod;
  clientId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  formerNames: string;
  email: string;
  dateOfBirth: string;
  applicantCountry: string;
  residentialAddress: string;
  confirmed: boolean;
}

export interface JointApplicantDraft {
  method: JointMethod;
  clientId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  formerNames: string;
  email: string;
  dateOfBirth: string;
  applicantCountry: string;
  residentialAddress: string;
}

export interface BusinessState {
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

export interface CompanyState {
  logo?: UploadedDocument;
  name: string;
  website: string;
  registrationNumber: string;
  arbn: string;
  investmentCurrency: string;
  expectedInvestment: string;
  stateOrTerritory: string;
  companyType: CompanyStructure;
  incorporationDate: string;
  registeredAddress: string;
  registrationType: AustralianRegistrationType;
  acn: string;
  amlActivity: string;
  principalAddress: string;
  country: string;
  registeredByRelevantBody: YesNo;
  usRegistered: YesNo;
  usTaxId: string;
  identificationNumber: string;
  domicileCountry: string;
  directorCount: string;
  shareholderCount: string;
  defaultRecipientId: string;
}

export interface TrustState {
  profilePicture?: UploadedDocument;
  name: string;
  trusteeBusinessName: string;
  establishedCountry: string;
  investmentCurrency: string;
  expectedInvestment: string;
  afsLicenseNumber: string;
  settlorName: string;
  address: string;
  applicantCountry: string;
  trusteeCount: string;
  beneficiaryCount: string;
  defaultRecipientId: string;
}

export interface CompanyDirector {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface CompanyShareholder {
  id: string;
  type: PartyType;
  companyType: CorporateEntityType;
  percentage: string;
  name: string;
  email: string;
  phone: string;
}

export interface TrustParty {
  id: string;
  type: PartyType;
  companyType: CorporateEntityType;
  name: string;
  email: string;
  phone: string;
  directors: CompanyDirector[];
}

export interface BankAccount {
  id: string;
  bankName: string;
  swiftCode: string;
  bankAddress: string;
  bsb: string;
  accountNumber: string;
  currency: string;
  verificationDocument?: UploadedDocument;
}

export interface SignatureState {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

export interface IdentityState {
  selfie?: UploadedDocument;
}

export interface AdviserAccess {
  name: string;
  email: string;
  invitedAt: string;
}

export interface AdviserDraft {
  name: string;
  email: string;
}

export interface ApplicantDocuments {
  photoIdType?: PhotoIdType;
  photoIdFront?: UploadedDocument;
  photoIdBack?: UploadedDocument;
  secondaryPhotoIdType?: PhotoIdType;
  secondaryPhotoIdFront?: UploadedDocument;
  secondaryPhotoIdBack?: UploadedDocument;
  addressDocumentType?: AddressDocumentType;
  addressDocument?: UploadedDocument;
  cv?: UploadedDocument;
  websiteUrl?: string;
}

export interface FormState {
  personal: PersonalState;
  jointApplicants: JointApplicant[];
  business: BusinessState;
  company: CompanyState;
  directors: CompanyDirector[];
  shareholders: CompanyShareholder[];
  trust: TrustState;
  trustees: TrustParty[];
  beneficiaries: TrustParty[];
  identity: IdentityState;
  bankAccounts: BankAccount[];
  cashAccounts: string[];
  adviserAccess?: AdviserAccess;
  signature: SignatureState;
  documents: Record<string, ApplicantDocuments>;
  entityDocuments: Record<string, UploadedDocument | undefined>;
  agreements: {
    accurate: boolean;
    consent: boolean;
  };
}
