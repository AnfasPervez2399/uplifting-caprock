import { isAtLeastAge } from "../../components/ui/DatePicker";
import type {
  ApplicationType,
  CompanyDirector,
  CompanyShareholder,
  CompanyState,
  ShareholderOwner,
  TrustParty,
  TrustState,
} from "./types";
import { isValidEmail, isValidWebsiteUrl } from "./utils";

export const isCompanyApplication = (type: ApplicationType) =>
  type === "australian-company" || type === "asic-non-australian-company" || type === "non-australian-company";

export const isTrustApplication = (type: ApplicationType) =>
  type === "regulated-trust" || type === "custodian-trust" || type === "non-custodian-trust";

export const isIndividualApplication = (type: ApplicationType) => Boolean(type && !isCompanyApplication(type) && !isTrustApplication(type));

const present = (value: string) => Boolean(value.trim());

export const isCompanyProfileComplete = (type: ApplicationType, company: CompanyState) => {
  if (!isCompanyApplication(type)) return true;
  const common = present(company.name) &&
    (!company.website.trim() || isValidWebsiteUrl(company.website)) &&
    Boolean(company.investmentCurrency && company.expectedInvestment);
  if (!common) return false;
  if (type === "australian-company") {
    return present(company.registrationNumber) && Boolean(company.stateOrTerritory && company.companyType) && present(company.incorporationDate);
  }
  if (type === "asic-non-australian-company") return present(company.arbn);
  return present(company.registrationNumber);
};

export const isCompanyBusinessComplete = (type: ApplicationType, company: CompanyState) => {
  if (!isCompanyApplication(type)) return true;
  if (type === "australian-company") {
    return present(company.registeredAddress) && Boolean(company.registrationType) && present(company.acn) && present(company.amlActivity);
  }
  const foreignCommon = Boolean(company.companyType && company.country && company.usRegistered) &&
    present(company.incorporationDate) && present(company.registeredAddress) && present(company.principalAddress) &&
    (company.usRegistered !== "yes" || present(company.usTaxId));
  if (!foreignCommon) return false;
  if (type === "asic-non-australian-company") return Boolean(company.registeredByRelevantBody);
  return present(company.identificationNumber) && Boolean(company.domicileCountry);
};

export const isTrustProfileComplete = (type: ApplicationType, trust: TrustState) => {
  if (!isTrustApplication(type)) return true;
  return present(trust.name) && present(trust.trusteeBusinessName) && Boolean(trust.establishedCountry);
};

export const isTrustBusinessComplete = (type: ApplicationType, trust: TrustState) => {
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
  present(director.name) && isValidEmail(director.email) && present(director.phone);

type ShareholderApplicationSubject = CompanyShareholder | ShareholderOwner;

export const requiresShareholderApplication = (shareholder: ShareholderApplicationSubject) =>
  (shareholder.type === "corporate" || shareholder.type === "trust") && Number(shareholder.percentage) >= 25;

export const isCompleteShareholder = (shareholder: CompanyShareholder) => {
  const percentage = Number(shareholder.percentage);
  return Boolean(
    shareholder.type &&
      (shareholder.type !== "corporate" || shareholder.companyType) &&
      (shareholder.type !== "trust" || shareholder.trustType) &&
      percentage > 0 && percentage <= 100 &&
      present(shareholder.name) &&
      isValidEmail(shareholder.email) &&
      present(shareholder.phone),
  );
};

export const isCompleteOwnershipInterest = (owner: ShareholderOwner): boolean => {
  const percentage = Number(owner.percentage);
  const baseComplete = Boolean(
    owner.type &&
      (owner.type !== "corporate" || owner.companyType) &&
      (owner.type !== "trust" || owner.trustType) &&
      percentage > 0 && percentage <= 100 &&
      present(owner.name) &&
      isValidEmail(owner.email) &&
      present(owner.phone),
  );
  if (!baseComplete) return false;
  if (owner.type === "individual") return isShareholderApplicationComplete(owner);
  return !requiresShareholderApplication(owner) || isShareholderApplicationComplete(owner);
};

export const isShareholderApplicationProfileComplete = (subject: ShareholderApplicationSubject) => {
  const application = subject.application;
  const percentage = Number(subject.percentage);
  return Boolean(
    subject.type &&
      (subject.type !== "corporate" || subject.companyType) &&
      (subject.type !== "trust" || subject.trustType) &&
      percentage > 0 && percentage <= 100 &&
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

const identifiesIndividualUltimateOwner = (owner: ShareholderOwner): boolean => {
  if (owner.type === "individual") return isShareholderApplicationComplete(owner);
  return requiresShareholderApplication(owner) && isShareholderOwnershipComplete(owner);
};

export const isShareholderOwnershipComplete = (subject: ShareholderApplicationSubject): boolean =>
  !requiresShareholderApplication(subject) || (
    subject.application.ownershipInterests.length > 0 &&
    subject.application.ownershipInterests.every(isCompleteOwnershipInterest) &&
    subject.application.ownershipInterests.some(identifiesIndividualUltimateOwner)
  );

export const isShareholderApplicationComplete = (subject: ShareholderApplicationSubject): boolean =>
  isShareholderApplicationProfileComplete(subject) &&
  isShareholderOwnershipComplete(subject) &&
  subject.application.declarationAccepted;

export const isCompanyDirectorsComplete = (company: CompanyState, directors: CompanyDirector[]) =>
  directors.length > 0 &&
  directors.every(isCompleteDirector) &&
  directors.some((director) => director.id === company.defaultRecipientId);

export const isCompanyShareholdersComplete = (_company: CompanyState, shareholders: CompanyShareholder[]) =>
  shareholders.length > 0 && shareholders.every((shareholder) =>
    isCompleteShareholder(shareholder) &&
    (!requiresShareholderApplication(shareholder) || isShareholderApplicationComplete(shareholder)),
  );

export const isCompleteTrustParty = (party: TrustParty) =>
  Boolean(
    party.type &&
      (party.type !== "corporate" ||
        (party.companyType && party.directors.length > 0 && party.directors.every(isCompleteDirector))) &&
      present(party.name) &&
      isValidEmail(party.email) &&
      present(party.phone),
  );

export const isTrusteesComplete = (trust: TrustState, trustees: TrustParty[]) =>
  trustees.length > 0 &&
  trustees.every(isCompleteTrustParty) &&
  trustees.some((trustee) => trustee.id === trust.defaultRecipientId);

export const isBeneficiariesComplete = (_trust: TrustState, beneficiaries: TrustParty[]) =>
  beneficiaries.length > 0 && beneficiaries.every(isCompleteTrustParty);
