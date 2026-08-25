import { isAtLeastAge } from "../../components/ui/DatePicker";
import type {
  ApplicationType,
  CompanyDirector,
  CompanyShareholder,
  CompanyState,
  ShareholderOwner,
  ShareholderRelatedParty,
  TrustBeneficiary,
  TrustParty,
  TrustState,
} from "./types";
import { isValidEmail, isValidWebsiteUrl } from "./utils";

export const isCompanyApplication = (type: ApplicationType) =>
  type === "australian-company" ||
  type === "asic-non-australian-company" ||
  type === "non-australian-company";

export const isTrustApplication = (type: ApplicationType) =>
  type === "regulated-trust" ||
  type === "custodian-trust" ||
  type === "non-custodian-trust";

export const isIndividualApplication = (type: ApplicationType) =>
  Boolean(type && !isCompanyApplication(type) && !isTrustApplication(type));

const present = (value: string) => Boolean(value.trim());

export const isCompanyProfileComplete = (
  type: ApplicationType,
  company: CompanyState,
) => {
  if (!isCompanyApplication(type)) return true;
  const common =
    present(company.name) &&
    (!company.website.trim() || isValidWebsiteUrl(company.website)) &&
    Boolean(company.investmentCurrency && company.expectedInvestment);
  if (!common) return false;
  if (type === "australian-company") {
    return (
      present(company.registrationNumber) &&
      Boolean(company.stateOrTerritory && company.companyType) &&
      present(company.incorporationDate)
    );
  }
  if (type === "asic-non-australian-company") return present(company.arbn);
  return present(company.registrationNumber);
};

export const isCompanyBusinessComplete = (
  type: ApplicationType,
  company: CompanyState,
) => {
  if (!isCompanyApplication(type)) return true;
  if (type === "australian-company") {
    return (
      present(company.registeredAddress) &&
      Boolean(company.registrationType) &&
      present(company.acn) &&
      present(company.amlActivity)
    );
  }
  const foreignCommon =
    Boolean(company.companyType && company.country && company.usRegistered) &&
    present(company.incorporationDate) &&
    present(company.registeredAddress) &&
    present(company.principalAddress) &&
    (company.usRegistered !== "yes" || present(company.usTaxId));
  if (!foreignCommon) return false;
  if (type === "asic-non-australian-company")
    return Boolean(company.registeredByRelevantBody);
  return (
    present(company.identificationNumber) && Boolean(company.domicileCountry)
  );
};

export const isTrustProfileComplete = (
  type: ApplicationType,
  trust: TrustState,
) => {
  if (!isTrustApplication(type)) return true;
  return (
    present(trust.name) &&
    present(trust.trusteeBusinessName) &&
    Boolean(trust.establishedCountry)
  );
};

export const isTrustBusinessComplete = (
  type: ApplicationType,
  trust: TrustState,
) => {
  if (!isTrustApplication(type)) return true;
  return Boolean(
    trust.investmentCurrency &&
    trust.expectedInvestment &&
    trust.establishedCountry &&
    present(trust.settlorName) &&
    present(trust.address) &&
    trust.applicantCountry &&
    (type === "regulated-trust" || present(trust.afsLicenseNumber)),
  );
};

export const isCompleteDirector = (director: CompanyDirector) =>
  present(director.name) &&
  isValidEmail(director.email) &&
  present(director.phone);

export type PartyDraftField =
  | "type"
  | "companyType"
  | "trustType"
  | "percentage"
  | "name"
  | "email"
  | "phone";
export type PartyDraftErrors = Partial<Record<PartyDraftField, string>>;

export const getDirectorDraftErrors = (
  director: CompanyDirector,
): PartyDraftErrors => {
  const next: PartyDraftErrors = {};
  if (!present(director.name)) next.name = "Enter the full legal name.";
  if (!present(director.email)) next.email = "Enter an email address.";
  else if (!isValidEmail(director.email))
    next.email = "Enter a valid email address.";
  if (!present(director.phone)) next.phone = "Enter a phone number.";
  return next;
};

export const getShareholderDraftErrors = (
  shareholder: CompanyShareholder,
  maxPercentage = 100,
): PartyDraftErrors => {
  const next: PartyDraftErrors = {};
  if (!shareholder.type) next.type = "Select a type.";
  if (shareholder.type === "corporate" && !shareholder.companyType) {
    next.companyType = "Select the company structure.";
  }
  if (shareholder.type === "trust" && !shareholder.trustType) {
    next.trustType = "Select the trust structure.";
  }
  const percentage = Number(shareholder.percentage);
  if (!String(shareholder.percentage).trim())
    next.percentage = "Enter a percentage.";
  else if (!(percentage > 0))
    next.percentage = "Enter a percentage greater than 0.";
  else if (percentage > maxPercentage + 0.0001) {
    next.percentage = `You can allocate up to ${maxPercentage.toFixed(2).replace(/\.00$/, "")}%.`;
  }
  if (!present(shareholder.name)) next.name = "Enter the full legal name.";
  if (!present(shareholder.email)) next.email = "Enter an email address.";
  else if (!isValidEmail(shareholder.email))
    next.email = "Enter a valid email address.";
  if (!present(shareholder.phone)) next.phone = "Enter a phone number.";
  return next;
};

type ShareholderApplicationSubject = CompanyShareholder | ShareholderOwner;

export const requiresShareholderApplication = (
  shareholder: ShareholderApplicationSubject,
) =>
  (shareholder.type === "corporate" || shareholder.type === "trust") &&
  Number(shareholder.percentage) >= 25;

export const isCompleteShareholder = (shareholder: CompanyShareholder) => {
  const percentage = Number(shareholder.percentage);
  return Boolean(
    shareholder.type &&
    (shareholder.type !== "corporate" || shareholder.companyType) &&
    (shareholder.type !== "trust" || shareholder.trustType) &&
    percentage > 0 &&
    percentage <= 100 &&
    present(shareholder.name) &&
    isValidEmail(shareholder.email) &&
    present(shareholder.phone),
  );
};

export const percentageTotal = (subjects: Array<{ percentage: string }>) =>
  subjects.reduce(
    (total, subject) => total + (Number(subject.percentage) || 0),
    0,
  );

export const hasCompletePercentageLayer = (
  subjects: Array<{ percentage: string }>,
) => subjects.length > 0 && Math.abs(percentageTotal(subjects) - 100) < 0.0001;

const isCompleteShareholderRelatedParty = (party: ShareholderRelatedParty) =>
  Boolean(
    party.type &&
    (party.type !== "corporate" || party.companyType) &&
    present(party.name) &&
    isValidEmail(party.email) &&
    present(party.phone),
  );

export const isShareholderBusinessComplete = (
  subject: ShareholderApplicationSubject,
) => {
  if (subject.type === "individual") return true;
  const business = subject.application.business;
  return Boolean(
    present(business.principalBusinessAddress) &&
    present(business.businessActivity) &&
    business.sourceOfFunds &&
    present(business.intendedTransactions),
  );
};

export const isShareholderRelatedPartiesComplete = (
  subject: ShareholderApplicationSubject,
) => {
  if (subject.type === "individual") return true;
  if (subject.type === "corporate") {
    return (
      subject.application.directors.length > 0 &&
      subject.application.directors.every(
        (director) =>
          present(director.name) &&
          isValidEmail(director.email) &&
          present(director.phone),
      )
    );
  }
  return (
    subject.application.trustees.length > 0 &&
    subject.application.trustees.every(isCompleteShareholderRelatedParty) &&
    subject.application.beneficiaries.length > 0 &&
    subject.application.beneficiaries.every(isCompleteShareholderRelatedParty)
  );
};

export const isShareholderDocumentsComplete = (
  subject: ShareholderApplicationSubject,
) => {
  const documents = subject.application.documents;
  if (subject.type === "individual") {
    return Boolean(
      documents.photoIdentity && documents.addressEvidence && documents.selfie,
    );
  }
  if (subject.type === "corporate") {
    return Boolean(documents.entityRegistration && documents.ownershipChart);
  }
  return Boolean(documents.trustDeed && documents.ownershipChart);
};

export const isShareholderSignatureComplete = (
  subject: ShareholderApplicationSubject,
) => {
  const signature = subject.application.signature;
  return Boolean(
    present(signature.name) &&
    isValidEmail(signature.email) &&
    present(signature.phone) &&
    isAtLeastAge(signature.dateOfBirth, 18),
  );
};

export const isCompleteOwnershipInterest = (
  owner: ShareholderOwner,
): boolean => {
  const percentage = Number(owner.percentage);
  const baseComplete = Boolean(
    owner.type &&
    (owner.type !== "corporate" || owner.companyType) &&
    (owner.type !== "trust" || owner.trustType) &&
    percentage > 0 &&
    percentage <= 100 &&
    present(owner.name) &&
    isValidEmail(owner.email) &&
    present(owner.phone),
  );
  if (!baseComplete) return false;
  if (owner.type === "individual")
    return isShareholderApplicationComplete(owner);
  return (
    !requiresShareholderApplication(owner) ||
    isShareholderApplicationComplete(owner)
  );
};

export const isShareholderApplicationProfileComplete = (
  subject: ShareholderApplicationSubject,
) => {
  const application = subject.application;
  const percentage = Number(subject.percentage);
  return Boolean(
    subject.type &&
    (subject.type !== "corporate" || subject.companyType) &&
    (subject.type !== "trust" || subject.trustType) &&
    percentage > 0 &&
    percentage <= 100 &&
    present(subject.name) &&
    isValidEmail(subject.email) &&
    present(subject.phone) &&
    application.country &&
    present(application.address) &&
    (subject.type === "individual"
      ? isAtLeastAge(application.dateOfBirth, 18)
      : present(application.registrationNumber)),
  );
};

const identifiesIndividualUltimateOwner = (
  owner: ShareholderOwner,
): boolean => {
  if (owner.type === "individual")
    return isShareholderApplicationComplete(owner);
  return (
    requiresShareholderApplication(owner) &&
    isShareholderOwnershipComplete(owner)
  );
};

export const isShareholderOwnershipComplete = (
  subject: ShareholderApplicationSubject,
): boolean => {
  if (subject.type === "individual") return true;
  const interests = subject.application.ownershipInterests;
  return (
    hasCompletePercentageLayer(interests) &&
    interests.every(isCompleteOwnershipInterest) &&
    interests.some(identifiesIndividualUltimateOwner)
  );
};

export const isShareholderApplicationComplete = (
  subject: ShareholderApplicationSubject,
): boolean =>
  isShareholderApplicationProfileComplete(subject) &&
  isShareholderBusinessComplete(subject) &&
  isShareholderRelatedPartiesComplete(subject) &&
  isShareholderOwnershipComplete(subject) &&
  isShareholderDocumentsComplete(subject) &&
  isShareholderSignatureComplete(subject) &&
  subject.application.declarationAccepted;

export const isCompanyDirectorsComplete = (
  company: CompanyState,
  directors: CompanyDirector[],
) =>
  directors.length > 0 &&
  directors.every(isCompleteDirector) &&
  directors.some((director) => director.id === company.defaultRecipientId);

export const isCompanyShareholdersComplete = (
  company: CompanyState,
  shareholders: CompanyShareholder[],
) =>
  company.shareholdersConfirmed &&
  hasCompletePercentageLayer(shareholders) &&
  shareholders.every(
    (shareholder) =>
      isCompleteShareholder(shareholder) &&
      (!requiresShareholderApplication(shareholder) ||
        isShareholderApplicationComplete(shareholder)),
  );

export const isCompleteTrustParty = (party: TrustParty) =>
  Boolean(
    party.type &&
    (party.type !== "corporate" ||
      (party.companyType &&
        party.directors.length > 0 &&
        party.directors.every(isCompleteDirector))) &&
    present(party.name) &&
    isValidEmail(party.email) &&
    present(party.phone),
  );

export const isTrusteesComplete = (trust: TrustState, trustees: TrustParty[]) =>
  trustees.length > 0 &&
  trustees.every(isCompleteTrustParty) &&
  trustees.some((trustee) => trustee.id === trust.defaultRecipientId);

export const isCompleteBeneficiary = (beneficiary: TrustBeneficiary) =>
  isCompleteShareholder(beneficiary);

export const isBeneficiariesComplete = (
  trust: TrustState,
  beneficiaries: TrustBeneficiary[],
) =>
  trust.beneficiariesConfirmed &&
  hasCompletePercentageLayer(beneficiaries) &&
  beneficiaries.every(
    (beneficiary) =>
      isCompleteBeneficiary(beneficiary) &&
      (!requiresShareholderApplication(beneficiary) ||
        isShareholderApplicationComplete(beneficiary)),
  );
