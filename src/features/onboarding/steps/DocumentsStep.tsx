import {
  AlertCircle,
  CheckCircle2,
  CircleUserRound,
  FileCheck2,
} from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";

import { ADDRESS_DOCUMENT_OPTIONS, PHOTO_ID_OPTIONS } from "../config";
import {
  CheckRow,
  DocumentUpload,
  Field,
  SectionIntro,
  inputClass,
  RequiredIndicator,
} from "../components/FormPrimitives";
import type {
  AddressDocumentType,
  PhotoIdType,
  ProofFileField,
  UploadedDocument,
} from "../types";

import {
  hasCompleteApplicantProof,
  hasAddressEvidence,
  hasDistinctPhotoIdFiles,
  hasDrivingLicenceProof,
  hasPersonalDetailsEvidence,
  hasPhotoIdentity,
  isValidWebsiteUrl,
  requiresTwoPhotoIds,
} from "../utils";
import type { OnboardingController } from "../useOnboardingController";

interface StepProps {
  controller: OnboardingController;
}

export function DocumentsStep({ controller }: StepProps) {
  const {
    form,
    errors,
    proofApplicantProfiles,
    sectionEyebrow,
    openDocumentPreview,
    updateApplicantDocument,
    updatePhotoIdType,
    updateSecondaryPhotoIdType,
    updateAddressDocumentType,
    updateApplicantWebsite,
  } = controller;

  const renderDocuments = () => (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("documents")}
        title="Upload Proof"
        description="Upload proof for the main applicant only. An Australian main applicant provides one photo ID; a non-Australian main applicant provides two different photo IDs, plus the applicable address and personal-details evidence."
        icon={FileCheck2}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          ["1", "Photo ID", "One for Australian applicants; two different IDs for all others"],
          ["2", "Address evidence", "Not needed when either photo ID is a driving licence"],
          ["3", "Personal details", "Upload a CV or provide a website URL"],
        ].map(([number, title, description]) => (
          <div key={number} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#dce7f2] text-[11px] font-bold text-[#003478]">{number}</span>
              <div>
                <p className="text-xs font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {proofApplicantProfiles.map((applicant) => {
          const documents = form.documents[applicant.key] || {};
          const needsTwoPhotoIds = requiresTwoPhotoIds(applicant.country);
          const hasDrivingLicence = hasDrivingLicenceProof(documents);
          const photoIdentityComplete = hasPhotoIdentity(documents, applicant.country);
          const addressEvidenceComplete = hasAddressEvidence(documents);
          const personalDetailsComplete = hasPersonalDetailsEvidence(documents);
          const complete = hasCompleteApplicantProof(documents, applicant.country);
          const hasDuplicatePhotoFile =
            needsTwoPhotoIds &&
            Boolean(documents.photoIdFront && documents.secondaryPhotoIdFront) &&
            !hasDistinctPhotoIdFiles(documents);
          const websiteError =
            documents.websiteUrl?.trim() && !isValidWebsiteUrl(documents.websiteUrl)
              ? "Enter a valid website URL, such as example.com."
              : undefined;
          const selectedAddressLabel =
            ADDRESS_DOCUMENT_OPTIONS.find((option) => option.value === documents.addressDocumentType)?.label || "Address document";
          const secondaryPhotoIdOptions = PHOTO_ID_OPTIONS.filter(
            (option) => option.value !== documents.photoIdType,
          );

          const renderPhotoIdFiles = (
            type: PhotoIdType | undefined,
            front: UploadedDocument | undefined,
            back: UploadedDocument | undefined,
            idPrefix: string,
            frontField: ProofFileField,
            backField: ProofFileField,
          ) => {
            if (!type) return null;
            const selectedLabel = PHOTO_ID_OPTIONS.find((option) => option.value === type)?.label || "Photo ID";
            return (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <DocumentUpload
                  id={`${applicant.key}-${idPrefix}Front`}
                  title={
                    type === "driving-licence"
                      ? "Driving licence — front"
                      : type === "passport"
                        ? "Passport identity page"
                        : "Photo ID document"
                  }
                  description={
                    type === "driving-licence"
                      ? "Clear colour image showing the full front of the current licence."
                      : `Clear colour image showing the full ${selectedLabel.toLowerCase()}.`
                  }
                  value={front}
                  onChange={(file) => updateApplicantDocument(applicant.key, frontField, file)}
                  onPreview={openDocumentPreview}
                />
                {type === "driving-licence" ? (
                  <DocumentUpload
                    id={`${applicant.key}-${idPrefix}Back`}
                    title="Driving licence — back"
                    description="Clear colour image showing the full reverse of the current licence."
                    value={back}
                    onChange={(file) => updateApplicantDocument(applicant.key, backField, file)}
                    onPreview={openDocumentPreview}
                  />
                ) : null}
              </div>
            );
          };

          return (
            <section key={applicant.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/60 p-5 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]">
                    <CircleUserRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">{applicant.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {applicant.label} · {applicant.country || "Country not selected"} · {needsTwoPhotoIds ? "2 photo IDs required" : "1 photo ID required"}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
                    complete ? "bg-[#dce7f2] text-slate-800" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {complete ? "Complete" : "Required"}
                </span>
              </div>

              <div className="space-y-7 p-5 sm:p-6">
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-950">1. Photo identification<RequiredIndicator /></h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {needsTwoPhotoIds
                        ? "Because this applicant is outside Australia, select two different photo ID types and upload a different document for each."
                        : "Select and upload one current, government-issued photo ID."}
                    </p>
                  </div>
                  <Field
                    label={needsTwoPhotoIds ? "First photo ID type" : "Photo ID type"}
                    htmlFor={`${applicant.key}-photoIdType`}
                  >
                    <CustomSelect
                      id={`${applicant.key}-photoIdType`}
                      value={documents.photoIdType || ""}
                      onChange={(value) => updatePhotoIdType(applicant.key, value as PhotoIdType)}
                      options={PHOTO_ID_OPTIONS}
                      placeholder="Select photo ID type"
                    />
                  </Field>
                  {renderPhotoIdFiles(
                    documents.photoIdType,
                    documents.photoIdFront,
                    documents.photoIdBack,
                    "photoId",
                    "photoIdFront",
                    "photoIdBack",
                  )}

                  {needsTwoPhotoIds ? (
                    <div className="mt-5 rounded-2xl border border-[rgba(0,52,120,0.14)] bg-[rgba(0,52,120,0.025)] p-4 sm:p-5">
                      <div className="mb-4 flex items-start gap-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#dce7f2] text-xs font-bold text-[#003478]">2</div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Second, different photo ID</p>
                          <p className="mt-1 text-[11px] leading-5 text-slate-500">The same ID type and the same uploaded file cannot be used twice.</p>
                        </div>
                      </div>
                      <Field label="Second photo ID type" htmlFor={`${applicant.key}-secondaryPhotoIdType`}>
                        <CustomSelect
                          id={`${applicant.key}-secondaryPhotoIdType`}
                          value={documents.secondaryPhotoIdType || ""}
                          onChange={(value) => updateSecondaryPhotoIdType(applicant.key, value as PhotoIdType)}
                          options={secondaryPhotoIdOptions}
                          placeholder="Select a different photo ID"
                          disabled={!documents.photoIdType}
                        />
                      </Field>
                      {!documents.photoIdType ? (
                        <p className="mt-2 text-[11px] text-slate-500">Select the first photo ID before choosing the second.</p>
                      ) : null}
                      {renderPhotoIdFiles(
                        documents.secondaryPhotoIdType,
                        documents.secondaryPhotoIdFront,
                        documents.secondaryPhotoIdBack,
                        "secondaryPhotoId",
                        "secondaryPhotoIdFront",
                        "secondaryPhotoIdBack",
                      )}
                      {hasDuplicatePhotoFile ? (
                        <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-xs font-medium text-red-700">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          Upload a different file for the second photo ID. The same document cannot be used twice.
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="border-t border-slate-100 pt-7">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-950">2. Residential address evidence<RequiredIndicator /></h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      A driving licence satisfies this requirement. If neither photo ID is a driving licence, upload one non-photo address document.
                    </p>
                  </div>

                  {hasDrivingLicence ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-[rgba(0,52,120,0.14)] bg-[rgba(0,52,120,0.035)] p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">No additional address document required</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">The uploaded driving licence will be used for residential address verification.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Field label="Non-photo address document" htmlFor={`${applicant.key}-addressDocumentType`}>
                        <CustomSelect
                          id={`${applicant.key}-addressDocumentType`}
                          value={documents.addressDocumentType || ""}
                          onChange={(value) => updateAddressDocumentType(applicant.key, value as AddressDocumentType)}
                          options={ADDRESS_DOCUMENT_OPTIONS}
                          placeholder="Select address document"
                        />
                      </Field>
                      {documents.addressDocumentType ? (
                        <DocumentUpload
                          id={`${applicant.key}-addressDocument`}
                          title={selectedAddressLabel}
                          description="Upload a clear, recent document showing the applicant’s name and residential address."
                          value={documents.addressDocument}
                          onChange={(file) => updateApplicantDocument(applicant.key, "addressDocument", file)}
                          onPreview={openDocumentPreview}
                        />
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-7">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-950">3. Personal details evidence<RequiredIndicator /></h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Complete either option: upload a current CV or provide a valid website URL.</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <DocumentUpload
                      id={`${applicant.key}-cv`}
                      title="Curriculum vitae (CV)"
                      description="Upload a current CV in PDF or Word format."
                      value={documents.cv}
                      onChange={(file) => updateApplicantDocument(applicant.key, "cv", file)}
                      onPreview={openDocumentPreview}
                      required={false}
                      accept=".pdf,.doc,.docx"
                    />
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                      <Field
                        label="Website URL"
                        htmlFor={`${applicant.key}-websiteUrl`}
                        required={false}
                        error={websiteError}
                        hint="A professional, business or personal website can be provided instead of a CV."
                      >
                        <input
                          id={`${applicant.key}-websiteUrl`}
                          type="url"
                          inputMode="url"
                          value={documents.websiteUrl || ""}
                          onChange={(event) => updateApplicantWebsite(applicant.key, event.target.value)}
                          placeholder="https://example.com"
                          autoCapitalize="none"
                          spellCheck={false}
                          className={inputClass(Boolean(websiteError))}
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                  <CheckRow checked={photoIdentityComplete} label={`${needsTwoPhotoIds ? "Two photo IDs" : "Photo ID"} complete`} />
                  <CheckRow checked={addressEvidenceComplete} label="Address evidence complete" />
                  <CheckRow checked={personalDetailsComplete} label="CV or website complete" />
                </div>
              </div>
            </section>
          );
        })}

        {errors.documents ? (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-3 text-xs font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {errors.documents}
          </div>
        ) : null}
      </div>
    </div>
  );

  return renderDocuments();
}
