import type {
  ApplicationType,
  CompanyDirector,
  CompanyShareholder,
  CompanyState,
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

export const isCompleteShareholder = (shareholder: CompanyShareholder) => {
  const percentage = Number(shareholder.percentage);
  return Boolean(
    shareholder.type &&
      (shareholder.type !== "corporate" || shareholder.companyType) &&
      percentage > 0 && percentage <= 100 &&
      present(shareholder.name) &&
      isValidEmail(shareholder.email) &&
      present(shareholder.phone),
  );
};

export const countMatches = (declared: string, actual: number) => {
  const count = Number(declared);
  return Number.isInteger(count) && count > 0 && count === actual;
};

export const isCompanyDirectorsComplete = (company: CompanyState, directors: CompanyDirector[]) =>
  countMatches(company.directorCount, directors.length) &&
  directors.every(isCompleteDirector) &&
  directors.some((director) => director.id === company.defaultRecipientId);

export const isCompanyShareholdersComplete = (company: CompanyState, shareholders: CompanyShareholder[]) =>
  countMatches(company.shareholderCount, shareholders.length) && shareholders.every(isCompleteShareholder);

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
  countMatches(trust.trusteeCount, trustees.length) &&
  trustees.every(isCompleteTrustParty) &&
  trustees.some((trustee) => trustee.id === trust.defaultRecipientId);

export const isBeneficiariesComplete = (trust: TrustState, beneficiaries: TrustParty[]) =>
  countMatches(trust.beneficiaryCount, beneficiaries.length) && beneficiaries.every(isCompleteTrustParty);
