import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  CircleUserRound,
  Eye,
  FileCheck2,
  Fingerprint,
  Landmark,
  Phone,
  ScanFace,
} from "lucide-react";

import { ADDRESS_DOCUMENT_OPTIONS, PHOTO_ID_OPTIONS } from "../config";
import {
  CheckRow,
  ReviewSection,
  SectionIntro,
  SummaryItem,
  RequiredIndicator,
} from "../components/FormPrimitives";

import {
  formatApplicantName,
  hasDrivingLicenceProof,
  requiresTwoPhotoIds,
} from "../utils";
import type { OnboardingController } from "../useOnboardingController";

interface StepProps {
  controller: OnboardingController;
}

export function ReviewStep({ controller }: StepProps) {
  const {
    form,
    setForm,
    errors,
    isJoint,
    isSoleTrader,
    selectedApplicationType,
    applicantProfiles,
    documentsComplete,
    allApplicationSectionsComplete,
    sectionEyebrow,
    openDocumentPreview,
    goToStep,
    openAdviserInvite,
  } = controller;

  const renderReview = () => {
    const uploadedProofCount = Object.values(form.documents).reduce(
      (total, documents) =>
        total +
        [
          documents.photoIdFront,
          documents.photoIdBack,
          documents.secondaryPhotoIdFront,
          documents.secondaryPhotoIdBack,
          documents.addressDocument,
          documents.cv,
        ].filter(Boolean).length,
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
            {form.adviserAccess ? (
              <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.09em] text-slate-400">
                    Application adviser
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {form.adviserAccess.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {form.adviserAccess.email} · full application access
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAdviserInvite}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-[#003478]"
                >
                  Manage access
                </button>
              </div>
            ) : null}
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
                          : applicant.email}{" "}
                        · {applicant.applicantCountry}
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
            title="Prove It’s You"
            icon={ScanFace}
            onEdit={() => goToStep("identity")}
          >
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <SummaryItem
                label="Selfie image"
                value={form.identity.selfie?.name || "Not provided"}
              />
              <SummaryItem
                label="Identity selfie status"
                value={
                  form.identity.selfie
                    ? "Ready for identity review"
                    : "Incomplete"
                }
              />
            </dl>
          </ReviewSection>

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
                    {account.verificationDocument ? (
                      <button
                        type="button"
                        onClick={() =>
                          openDocumentPreview(
                            account.verificationDocument!,
                            "Bank verification document",
                          )
                        }
                        className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#dce7f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-800 transition hover:text-[#003478] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
                      >
                        <Eye className="h-3 w-3" /> Open evidence
                      </button>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No bank account saved.</p>
              )}
            </div>
          </ReviewSection>

          <ReviewSection
            title="Cash Accounts"
            icon={Banknote}
            onEdit={() => goToStep("cash")}
          >
            {form.cashAccounts.length ? (
              <div className="flex flex-wrap gap-2">
                {form.cashAccounts.map((currency) => (
                  <span
                    key={currency}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#dce7f2] px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <Banknote className="h-3.5 w-3.5 text-[#003478]" />
                    {currency} · one cash account
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No cash-account currencies selected.
              </p>
            )}
          </ReviewSection>

          <ReviewSection
            title="Upload Proof"
            icon={FileCheck2}
            onEdit={() => goToStep("documents")}
          >
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <CheckRow
                checked={uploadedProofCount > 0}
                label={`${uploadedProofCount} proof file${uploadedProofCount === 1 ? "" : "s"} attached`}
              />
              <CheckRow
                checked={documentsComplete}
                label={`${applicantProfiles.length} applicant proof set${applicantProfiles.length === 1 ? "" : "s"} complete`}
              />
            </div>
            <div className="space-y-3">
              {applicantProfiles.map((applicant) => {
                const documents = form.documents[applicant.key] || {};
                const firstPhotoIdLabel =
                  PHOTO_ID_OPTIONS.find(
                    (option) => option.value === documents.photoIdType,
                  )?.label || "Not selected";
                const secondPhotoIdLabel = PHOTO_ID_OPTIONS.find(
                  (option) => option.value === documents.secondaryPhotoIdType,
                )?.label;
                const photoIdLabel = secondPhotoIdLabel
                  ? `${firstPhotoIdLabel} + ${secondPhotoIdLabel}`
                  : firstPhotoIdLabel;
                const addressEvidence = hasDrivingLicenceProof(documents)
                  ? "Verified with driving licence"
                  : ADDRESS_DOCUMENT_OPTIONS.find(
                      (option) =>
                        option.value === documents.addressDocumentType,
                    )?.label || "Not selected";
                const personalEvidence =
                  documents.cv?.name || documents.websiteUrl || "Not provided";
                return (
                  <div
                    key={applicant.key}
                    className="grid gap-3 rounded-xl bg-slate-50 px-3.5 py-3 sm:grid-cols-3"
                  >
                    <SummaryItem
                      label={`${applicant.label} · photo ID${requiresTwoPhotoIds(applicant.country) ? "s" : ""}`}
                      value={photoIdLabel}
                    />
                    <SummaryItem
                      label="Address evidence"
                      value={addressEvidence}
                    />
                    <SummaryItem
                      label="CV or website"
                      value={personalEvidence}
                    />
                  </div>
                );
              })}
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
                <RequiredIndicator />
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
                <RequiredIndicator />
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

  return renderReview();
}
