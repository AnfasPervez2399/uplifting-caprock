import { isAtLeastAge } from "../../components/ui/DatePicker";
import type { StepId } from "./types";
import { hasCompletePercentageLayer, isCompleteShareholder, isShareholderApplicationComplete, percentageTotal, requiresShareholderApplication } from "./applicationLogic";
import type { OnboardingController } from "./useOnboardingController";
import {
  hasAddressEvidence,
  hasPersonalDetailsEvidence,
  hasPhotoIdentity,
  isCompleteJointPersonal,
  isValidEmail,
  isValidWebsiteUrl,
} from "./utils";

export const ASSISTANT_STEP_NAMES: Record<StepId, string> = {
  application: "Application Type",
  personal: "Personal Information",
  entity: "Company Profile",
  trust: "Trust Profile",
  business: "Business Information",
  directors: "M.D. & Owners",
  shareholders: "Shareholders",
  trustees: "Trustees",
  beneficiaries: "Beneficiaries",
  identity: "Prove It’s You",
  bank: "External Bank Account",
  cash: "Cash Accounts",
  documents: "Upload Proof",
  signature: "E-Signature",
  review: "Review and Submit",
};

const STEP_ALIASES: Record<StepId, string[]> = {
  application: ["application type", "account type", "legal structure", "application structure"],
  personal: ["personal information", "personal info", "personal details", "main applicant", "applicant information"],
  entity: ["company profile", "company information", "company details", "entity profile"],
  trust: ["trust profile", "trust information", "trust details"],
  business: ["business information", "business details", "business section", "sole trader business"],
  directors: ["m.d. & owners", "md & owners", "directors and owners", "directors", "partners"],
  shareholders: ["shareholders", "shareholder information", "ownership information"],
  trustees: ["trustees", "trustee information"],
  beneficiaries: ["beneficiaries", "beneficiary information"],
  identity: ["prove it’s you", "prove it's you", "identity selfie", "selfie", "identity check"],
  bank: ["external bank account", "bank information", "bank details", "bank account", "settlement account"],
  cash: ["cash accounts", "cash account", "currencies", "currency accounts"],
  documents: ["upload proof", "proof documents", "supporting documents", "document uploads", "documents"],
  signature: ["e-signature", "electronic signature", "signature", "signatory"],
  review: ["review and submit", "final review", "review section", "submit application"],
};

const WHY_GUIDANCE: Record<StepId, string> = {
  application: "The legal owner determines the people, regulatory checks and evidence required for the application.",
  personal: "Personal information supports identity, age, eligibility and customer due-diligence checks for the main applicant.",
  entity: "Registered company details allow the entity to be checked against the appropriate Australian or foreign company records.",
  trust: "Trust profile details identify the legal arrangement and connect it with its trustee and establishment records.",
  business: "Registration, address, tax, activity and funding information supports regulatory due diligence and risk assessment.",
  directors: "Directors, partners and controlling persons must be identified, and one person must receive company communications.",
  shareholders: "Shareholder records establish ownership and help identify the people or entities that control or benefit from the company.",
  trustees: "Trustees administer or control the trust, so their identity, contact details and corporate structure must be recorded.",
  beneficiaries: "Beneficiary records support verification of the people or entities holding a beneficial interest in the trust.",
  identity: "The selfie is compared with identity evidence to help confirm that the applicant is the person applying.",
  bank: "Account details and bank evidence verify the external account intended for approved transfers and settlement.",
  cash: "Currency selections determine which cash accounts are created for the application.",
  documents: "Supporting evidence allows Caprock to independently verify identity, address, registration, ownership or trust status.",
  signature: "The signatory record identifies the authorised person who will receive and validate the electronic signature request.",
  review: "Review and declarations provide a final, auditable confirmation that the application is accurate before submission.",
};

export function findRequestedStep(query: string): StepId | undefined {
  const normalised = query.toLowerCase().replace(/\s+/g, " ").trim();
  const matches = (Object.entries(STEP_ALIASES) as [StepId, string[]][])
    .flatMap(([stepId, aliases]) => aliases.map((alias) => ({ stepId, alias })))
    .sort((first, second) => second.alias.length - first.alias.length);
  return matches.find(({ alias }) => normalised.includes(alias))?.stepId;
}

export const getWhyGuidance = (stepId: StepId) => WHY_GUIDANCE[stepId];

export function getStepGuidance(controller: OnboardingController, stepId: StepId): string {
  const { form, isJoint, sharedAddress, isSoleTrader, isCompany, isTrust, requiredEntityDocuments, applicationTypeConfirmed, selectedApplicationType } = controller;
  const applicationType = form.personal.applicationType;

  if (stepId === "application") {
    if (applicationType && !applicationTypeConfirmed) {
      return `${selectedApplicationType} is selected. Choose Continue to confirm the structure and reveal only the sections required for this application type. The side navigation remains limited to Application Type until then.`;
    }
    return "Select the legal owner of the account. The 11 available structures are: Individual; three joint-account options based on surname and residential address; Sole Trader; Australian Domestic Company; ASIC-registered Non-Australian Company; Non-Australian Company; Regulated Trust; Trust acting as custodian; and Trust not acting as custodian. If you are unsure who legally owns the account, confirm this with your adviser before continuing.";
  }
  if (stepId === "personal") {
    const jointNote = isJoint
      ? sharedAddress
        ? " Add at least one joint applicant using either a verified Caprock client ID or full name and valid email; their address is inherited from the main applicant."
        : " Add at least one joint applicant using either a verified Caprock client ID or full name, valid email and their separate residential address."
      : "";
    return `Required main-applicant details are applicant country, legal first and last name, former names or “None”, date of birth showing an age of at least 18, residential address, investment currency and expected investment range. Middle name and profile image are optional.${jointNote}`;
  }
  if (stepId === "entity") {
    if (applicationType === "australian-company") return "Enter the ASIC-registered company name, registration number, state or territory, company type, incorporation date, investment currency and expected investment range. The logo and website are optional, but a supplied website must be valid.";
    if (applicationType === "asic-non-australian-company") return "Enter the ASIC-registered company name, ARBN, investment currency and expected investment range. The logo and website are optional, but a supplied website must be valid.";
    return "Enter the foreign company’s registered name, registration number, investment currency and expected investment range. The logo and website are optional, but a supplied website must be valid.";
  }
  if (stepId === "trust") {
    return "Enter the trust’s full legal name, the trustee’s full business name and the country where the trust was established. The trust type is taken from Application Type, and the profile image is optional.";
  }
  if (stepId === "business") {
    if (isSoleTrader) {
      return "Select whether the Sole Trader assessment is Australian or foreign, then enter the business name and principal business address. Australian assessments require an ABN. Foreign assessments also require country, business nature and activity, source and origin of funds, intended transaction behaviour and beneficial ownership. U.S. businesses receive additional citizenship and tax-residency questions.";
    }
    if (isCompany && applicationType === "australian-company") {
      return "Enter the Australian registered-office address, ASIC registration type, ACN and current or recent prosecution/inquiry disclosure. Enter “None” when there are no reportable matters.";
    }
    if (isCompany && applicationType === "asic-non-australian-company") {
      return "Enter company type, incorporation date and country, Australian registered office, Australian principal place of business or local agent, relevant foreign-body registration status and U.S. registration status. A U.S. Tax ID is required only when U.S.-registered.";
    }
    if (isCompany) {
      return "Enter company type, incorporation date, registration-body identification number, formation country, domicile country, registered and principal addresses, and U.S. registration status. A U.S. Tax ID is required only when U.S.-registered.";
    }
    if (isTrust) {
      const licence = applicationType === "regulated-trust" ? "No AFSL field is requested for this trust subtype in this flow." : "An Australian Financial Services Licence number is also required for this trust subtype.";
      return `Enter investment currency and range, establishment country, settlor’s full name, applicant country and trust address. ${licence}`;
    }
  }
  if (stepId === "directors") return "Add every director or partner with their full name, valid email and phone. The required director count is calculated automatically after records are saved. Then select one saved director as the default communication recipient. Invitations are queued and sent after submission.";
  if (stepId === "shareholders") return "Add each individual, corporate entity or trust shareholder with its ownership percentage, full name, valid email and phone. Direct ownership must total exactly 100%, then use Save all shareholders. Saving unlocks the overall interconnection graph and each shareholder’s Fill application action. Individual applications include Personal Information, Identity, Upload Proof, E-Signature and Review. Corporate and Trust applications include their matching profile, business, related-party, ownership, document, signature and Review sections. Each recursively disclosed ownership layer must also total exactly 100% before its graph and application actions appear. Cash Accounts and Link External Account stay in the main application. A corporate entity or trust holding 25% or more must complete its application and disclose ownership recursively until an individual ultimate beneficial owner is identified.";
  if (stepId === "trustees") return "Add every trustee; the trustee count is calculated automatically. Each needs type, name, valid email and phone. A corporate trustee also needs its company structure and at least one complete director. Select one saved trustee as the default communication recipient.";
  if (stepId === "beneficiaries") return "Add every beneficiary; the beneficiary count is calculated automatically. Each needs type, name, valid email and phone. A corporate beneficiary also needs its company structure and at least one complete director.";
  if (stepId === "identity") return "Add a clear, current selfie in an image format. Face the camera directly, use even lighting and a plain background, and ensure only the applicant appears. The file must be 10 MB or smaller.";
  if (stepId === "bank") return "Save at least one external account with bank name, SWIFT/BIC, bank address, account number or IBAN, account currency and a recent bank statement or official bank letter. Australian BSB is optional and applies to Australian accounts.";
  if (stepId === "cash") return "Select at least one currency. One cash account is created for each selected currency, and duplicate currencies are not allowed.";
  if (stepId === "documents") {
    if (controller.isIndividual) return "For each applicant shown, an Australian applicant needs one current photo ID; a non-Australian applicant needs two different photo-ID types and different files. A driving licence satisfies address evidence; otherwise upload a utility bill, lease agreement or tax document. Also upload a current CV or provide a valid website URL.";
    const documentNames = requiredEntityDocuments.map((document) => document.title).join(", ");
    return `This ${controller.selectedApplicationType} application currently requires ${requiredEntityDocuments.length} entity document${requiredEntityDocuments.length === 1 ? "" : "s"}: ${documentNames}. The list changes when the application subtype or company structure changes.`;
  }
  if (stepId === "signature") return "Enter the authorised signatory’s full legal name, valid email, phone and date of birth. The signatory must be at least 18. The signature request is sent after the application passes initial review.";
  if (stepId === "review") return "Check every summary and open uploaded evidence where needed. Before secure submission, every section must be complete and both declarations—accuracy and consent—must be selected. After submission, the application remains on Review with an Under review status.";
  return "Complete every visible field marked Required. Fields marked Optional may be left blank.";
}

export function getMissingItems(controller: OnboardingController, stepId: StepId): string[] {
  const {
    form,
    isJoint,
    sharedAddress,
    isSoleTrader,
    isCompany,
    isTrust,
    isIndividual,
    proofApplicantProfiles,
    requiredEntityDocuments,
    visibleSteps,
    completion,
  } = controller;
  const missing: string[] = [];
  const type = form.personal.applicationType;

  if (stepId === "application") {
    if (!type) missing.push("Select an application type");
    return missing;
  }

  if (stepId === "personal") {
    if (!form.personal.applicantCountry) missing.push("Applicant country");
    if (!form.personal.firstName.trim()) missing.push("First name");
    if (!form.personal.lastName.trim()) missing.push("Last name");
    if (!form.personal.formerNames.trim()) missing.push("Former names, or “None”");
    if (!form.personal.dateOfBirth) missing.push("Date of birth");
    else if (!isAtLeastAge(form.personal.dateOfBirth, 18)) missing.push("Date of birth must show the applicant is at least 18");
    if (!form.personal.residentialAddress.trim()) missing.push("Residential address");
    if (!form.personal.investmentCurrency) missing.push("Investment currency");
    if (!form.personal.expectedInvestment) missing.push("Expected investment amount");
    if (isJoint) {
      if (!form.jointApplicants.length) missing.push("At least one joint applicant");
      form.jointApplicants.forEach((applicant, index) => {
        if (!isCompleteJointPersonal(applicant, sharedAddress)) missing.push(`Complete joint applicant ${index + 1}`);
      });
    }
    return missing;
  }

  if (stepId === "entity") {
    if (!form.company.name.trim()) missing.push("Registered company name");
    if (form.company.website.trim() && !isValidWebsiteUrl(form.company.website)) missing.push("Valid company website, or leave it blank");
    if (!form.company.investmentCurrency) missing.push("Investment currency");
    if (!form.company.expectedInvestment) missing.push("Expected investment amount");
    if (type === "australian-company") {
      if (!form.company.registrationNumber.trim()) missing.push("Company registration number");
      if (!form.company.stateOrTerritory) missing.push("State or territory");
      if (!form.company.companyType) missing.push("Company type");
      if (!form.company.incorporationDate) missing.push("Date of incorporation");
    } else if (type === "asic-non-australian-company") {
      if (!form.company.arbn.trim()) missing.push("Australian Registered Body Number (ARBN)");
    } else if (type === "non-australian-company" && !form.company.registrationNumber.trim()) {
      missing.push("Company registration number");
    }
    return missing;
  }

  if (stepId === "trust") {
    if (!form.trust.name.trim()) missing.push("Full name of the trust");
    if (!form.trust.trusteeBusinessName.trim()) missing.push("Trustee business name");
    if (!form.trust.establishedCountry) missing.push("Country where the trust was established");
    return missing;
  }

  if (stepId === "business" && isSoleTrader) {
    if (!form.business.assessmentNature) missing.push("Australian or foreign assessment nature");
    if (!form.business.businessName.trim()) missing.push("Business name");
    if (!form.business.principalBusinessAddress.trim()) missing.push("Principal place of business");
    if (form.business.assessmentNature === "australian" && !form.business.abn.trim()) missing.push("Australian Business Number (ABN)");
    if (form.business.assessmentNature === "foreign") {
      if (!form.business.foreignBusinessCountry) missing.push("Country of foreign business");
      if (!form.business.investorClassification) missing.push("Business nature");
      if (!form.business.businessActivity) missing.push("Business activity");
      if (form.business.businessActivity === "Other" && !form.business.businessActivityOther.trim()) missing.push("Description of other business activity");
      if (!form.business.sourceOfFunds.trim()) missing.push("Source and origin of funds");
      if (!form.business.intendedTransactions.trim()) missing.push("Intended transaction behaviour");
      if (!form.business.beneficialOwnership.trim()) missing.push("Beneficial ownership of funds");
      if (form.business.foreignBusinessCountry === "United States") {
        if (!form.business.usCitizen) missing.push("U.S. citizenship status");
        if (form.business.usCitizen === "yes" && !form.business.socialSecurityNumber.trim()) missing.push("Social Security Number");
        if (!form.business.usTaxResident) missing.push("U.S. tax-residency status");
        if (form.business.usTaxResident === "yes" && !form.business.taxIdentificationNumber.trim()) missing.push("U.S. tax identification number");
      }
    }
    return missing;
  }

  if (stepId === "business" && isCompany) {
    if (!form.company.registeredAddress.trim()) missing.push("Registered address");
    if (type === "australian-company") {
      if (!form.company.registrationType) missing.push("ASIC registration type");
      if (!form.company.acn.trim()) missing.push("Australian Company Number (ACN)");
      if (!form.company.amlActivity.trim()) missing.push("Prosecution and inquiry disclosure, or “None”");
    } else {
      if (!form.company.companyType) missing.push("Company type");
      if (!form.company.incorporationDate) missing.push("Date of incorporation");
      if (!form.company.country) missing.push("Country of formation");
      if (!form.company.principalAddress.trim()) missing.push("Principal business address");
      if (!form.company.usRegistered) missing.push("U.S. registration status");
      if (form.company.usRegistered === "yes" && !form.company.usTaxId.trim()) missing.push("U.S. Tax ID");
      if (type === "asic-non-australian-company" && !form.company.registeredByRelevantBody) missing.push("Relevant foreign-body registration status");
      if (type === "non-australian-company") {
        if (!form.company.identificationNumber.trim()) missing.push("Registration-body identification number");
        if (!form.company.domicileCountry) missing.push("Domicile country");
      }
    }
    return missing;
  }

  if (stepId === "business" && isTrust) {
    if (!form.trust.investmentCurrency) missing.push("Investment currency");
    if (!form.trust.expectedInvestment) missing.push("Expected investment amount");
    if (!form.trust.establishedCountry) missing.push("Trust establishment country");
    if (!form.trust.settlorName.trim()) missing.push("Settlor’s full name");
    if (!form.trust.address.trim()) missing.push("Trust address");
    if (!form.trust.applicantCountry) missing.push("Applicant country");
    if (type !== "regulated-trust" && !form.trust.afsLicenseNumber.trim()) missing.push("Australian Financial Services Licence number");
    return missing;
  }

  if (stepId === "directors") {
    if (!form.directors.length) missing.push("At least one saved director or partner");
    if (!form.company.defaultRecipientId) missing.push("Default communication recipient");
    return missing;
  }
  if (stepId === "shareholders") {
    if (!form.shareholders.length) missing.push("At least one saved shareholder");
    if (!hasCompletePercentageLayer(form.shareholders)) {
      missing.push(`Direct ownership currently totals ${percentageTotal(form.shareholders).toFixed(2).replace(/\.00$/, "")}% and must equal exactly 100%`);
    }
    form.shareholders.forEach((shareholder) => {
      if (!isCompleteShareholder(shareholder)) {
        missing.push(`Complete the shareholder record for ${shareholder.name || "an unnamed shareholder"}`);
      }
      if (form.company.shareholdersConfirmed && requiresShareholderApplication(shareholder) && !isShareholderApplicationComplete(shareholder)) {
        missing.push(`Complete the required type-specific application and 100% ownership layers for ${shareholder.name || "a 25%-or-more entity shareholder"}`);
      }
    });
    if (hasCompletePercentageLayer(form.shareholders) && !form.company.shareholdersConfirmed) {
      missing.push("Select Save all shareholders to confirm the complete ownership structure");
    }
    return missing;
  }
  if (stepId === "trustees") {
    if (!form.trustees.length) missing.push("At least one saved trustee");
    if (!form.trust.defaultRecipientId) missing.push("Default communication recipient");
    return missing;
  }
  if (stepId === "beneficiaries") {
    if (!form.beneficiaries.length) missing.push("At least one saved beneficiary");
    return missing;
  }
  if (stepId === "identity") {
    if (!form.identity.selfie) missing.push("Clear selfie image, 10 MB or smaller");
    return missing;
  }
  if (stepId === "bank") {
    if (!form.bankAccounts.length) missing.push("At least one saved external bank account with verification evidence");
    form.bankAccounts.forEach((account, index) => {
      if (!account.bankName.trim() || !account.swiftCode.trim() || !account.bankAddress.trim() || !account.accountNumber.trim() || !account.currency || !account.verificationDocument) missing.push(`Complete saved bank account ${index + 1}`);
    });
    return missing;
  }
  if (stepId === "cash") {
    if (!form.cashAccounts.length) missing.push("At least one cash-account currency");
    return missing;
  }
  if (stepId === "documents") {
    if (!isIndividual) {
      requiredEntityDocuments.forEach((document) => {
        if (!form.entityDocuments[document.key]) missing.push(document.title);
      });
      return missing;
    }
    proofApplicantProfiles.forEach((applicant) => {
      const documents = form.documents[applicant.key];
      if (!hasPhotoIdentity(documents, applicant.country)) missing.push(`${applicant.label}: required photo identification`);
      if (!hasAddressEvidence(documents)) missing.push(`${applicant.label}: residential address evidence`);
      if (!hasPersonalDetailsEvidence(documents)) missing.push(`${applicant.label}: current CV or valid website URL`);
    });
    return missing;
  }
  if (stepId === "signature") {
    if (!form.signature.name.trim()) missing.push("Authorised signatory’s full name");
    if (!isValidEmail(form.signature.email)) missing.push("Valid signatory email address");
    if (!form.signature.phone.trim()) missing.push("Signatory phone number");
    if (!form.signature.dateOfBirth) missing.push("Signatory date of birth");
    else if (!isAtLeastAge(form.signature.dateOfBirth, 18)) missing.push("Signatory must be at least 18");
    return missing;
  }
  if (stepId === "review") {
    visibleSteps.filter((step) => step.id !== "review" && !completion[step.id]).forEach((step) => missing.push(`${ASSISTANT_STEP_NAMES[step.id]} section`));
    if (!form.agreements.accurate) missing.push("Accuracy declaration");
    if (!form.agreements.consent) missing.push("Consent declaration");
  }
  return missing;
}
