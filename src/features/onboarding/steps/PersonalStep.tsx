import {
  BadgeCheck,
  CheckCircle2,
  CircleUserRound,
  Loader2,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";

import { DatePicker } from "../../../components/ui/DatePicker";
import {
  APPLICATION_OPTIONS,
  COUNTRY_OPTIONS,
  INVESTMENT_AMOUNT_OPTIONS,
  INVESTMENT_CURRENCY_OPTIONS,
} from "../config";
import {
  DocumentUpload,
  Field,
  SectionIntro,
  SubsectionHeading,
  inputClass,
  textareaClass,
} from "../components/FormPrimitives";
import type { JointMethod } from "../types";
import { emptyJointDraft } from "../initialState";
import {
  ADULT_DATE_CONDITIONS,
  DOB_HELPER_TEXT,
  DOB_MAX_YEAR,
  DOB_MIN_YEAR,
  documentFromFile,
  formatApplicantName,
} from "../utils";
import type { OnboardingController } from "../useOnboardingController";

interface StepProps {
  controller: OnboardingController;
}

export function PersonalStep({ controller }: StepProps) {
  const {
    form,
    jointDraft,
    setJointDraft,
    showJointComposer,
    setShowJointComposer,
    lookupState,
    setLookupState,
    lookupVerifiedAt,
    setLookupVerifiedAt,
    lookupRequestRef,
    errors,
    isJoint,
    sharedAddress,
    sectionEyebrow,
    openDocumentPreview,
    updatePersonal,
    handleApplicationTypeChange,
    updateJointDraft,
    beginJointApplicant,
    handleLookupClient,
    saveJointApplicant,
    removeJointApplicant,
  } = controller;

  const renderPersonal = () => (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("personal")}
        title="Personal"
        description="Tell us who is applying and provide the investment profile details required for this application."
        icon={CircleUserRound}
      />

      <div className="space-y-8">
        <section>
          <SubsectionHeading
            title="Application structure"
            description="Choose the account structure first. The form adapts for joint applicants and sole traders."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Application type"
              htmlFor="applicationType"
              error={errors.applicationType}
            >
              <CustomSelect
                id="applicationType"
                value={form.personal.applicationType}
                onChange={handleApplicationTypeChange}
                options={APPLICATION_OPTIONS}
                placeholder="Select application type"
                error={Boolean(errors.applicationType)}
              />
            </Field>
            <Field
              label="Applicant’s country"
              htmlFor="applicantCountry"
              error={errors.applicantCountry}
            >
              <CustomSelect
                id="applicantCountry"
                value={form.personal.applicantCountry}
                onChange={(value) => updatePersonal("applicantCountry", value)}
                options={COUNTRY_OPTIONS}
                placeholder="Select country"
                searchable
                searchPlaceholder="Search countries"
                error={Boolean(errors.applicantCountry)}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
          <SubsectionHeading
            title="Application references"
            description="These references are supplied by Caprock or your adviser and cannot be changed here."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Caprock reference number"
              htmlFor="referenceNumber"
              required={false}
              hint="Assigned automatically when available."
            >
              <input
                id="referenceNumber"
                value={form.personal.referenceNumber}
                readOnly
                placeholder="Assigned by Caprock"
                className={`${inputClass()} cursor-not-allowed bg-slate-100/80 text-slate-500`}
              />
            </Field>
            <Field
              label="Adviser reference number"
              htmlFor="advisorReferenceNumber"
              required={false}
              hint="Supplied by your adviser when applicable."
            >
              <input
                id="advisorReferenceNumber"
                value={form.personal.advisorReferenceNumber}
                readOnly
                placeholder="Provided by adviser"
                className={`${inputClass()} cursor-not-allowed bg-slate-100/80 text-slate-500`}
              />
            </Field>
          </div>
        </section>

        <section>
          <SubsectionHeading
            title="Main applicant"
            description="Use legal identity details exactly as they appear on official documents."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <DocumentUpload
                id="profilePicture"
                title="Account profile image"
                description="Optional for your account profile. This does not replace the required identity selfie in Prove It’s You."
                value={form.personal.profilePicture}
                onChange={(file) =>
                  updatePersonal("profilePicture", documentFromFile(file))
                }
                onPreview={openDocumentPreview}
                required={false}
              />
            </div>
            <Field
              label="First name"
              htmlFor="firstName"
              error={errors.firstName}
            >
              <input
                id="firstName"
                value={form.personal.firstName}
                onChange={(event) =>
                  updatePersonal("firstName", event.target.value)
                }
                autoComplete="given-name"
                placeholder="Legal first name"
                className={inputClass(Boolean(errors.firstName))}
              />
            </Field>
            <Field label="Middle name" htmlFor="middleName" required={false}>
              <input
                id="middleName"
                value={form.personal.middleName}
                onChange={(event) =>
                  updatePersonal("middleName", event.target.value)
                }
                autoComplete="additional-name"
                placeholder="Legal middle name"
                className={inputClass()}
              />
            </Field>
            <Field label="Last name" htmlFor="lastName" error={errors.lastName}>
              <input
                id="lastName"
                value={form.personal.lastName}
                onChange={(event) =>
                  updatePersonal("lastName", event.target.value)
                }
                autoComplete="family-name"
                placeholder="Legal last name"
                className={inputClass(Boolean(errors.lastName))}
              />
            </Field>
            <Field
              label="Former name(s)"
              htmlFor="formerNames"
              error={errors.formerNames}
              hint="Enter “None” if you have not used another legal name."
            >
              <input
                id="formerNames"
                value={form.personal.formerNames}
                onChange={(event) =>
                  updatePersonal("formerNames", event.target.value)
                }
                placeholder="Former legal names or None"
                className={inputClass(Boolean(errors.formerNames))}
              />
            </Field>
            <Field label="Date of birth" htmlFor="dateOfBirth">
              <DatePicker
                id="dateOfBirth"
                value={form.personal.dateOfBirth}
                onChange={(value) => updatePersonal("dateOfBirth", value)}
                errorMessage={errors.dateOfBirth}
                helperText={DOB_HELPER_TEXT}
                conditions={ADULT_DATE_CONDITIONS}
                minYear={DOB_MIN_YEAR}
                maxYear={DOB_MAX_YEAR}
              />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field
                label="Residential address"
                htmlFor="residentialAddress"
                error={errors.residentialAddress}
              >
                <textarea
                  id="residentialAddress"
                  value={form.personal.residentialAddress}
                  onChange={(event) =>
                    updatePersonal("residentialAddress", event.target.value)
                  }
                  autoComplete="street-address"
                  placeholder="Street, suburb or city, state or region, postcode and country"
                  className={textareaClass(Boolean(errors.residentialAddress))}
                />
              </Field>
            </div>
          </div>
        </section>

        {isJoint ? (
          <section className="rounded-2xl border border-[rgba(0,52,120,0.15)] bg-[rgba(0,52,120,0.025)] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <SubsectionHeading
                title="Joint applicants"
                description="Add an existing client or send a simple invitation with their name and email. An address is only needed when applicants live separately."
              />
              {!showJointComposer ? (
                <button
                  type="button"
                  onClick={beginJointApplicant}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003478]/15"
                >
                  <Plus className="h-4 w-4" />
                  Add applicant
                </button>
              ) : null}
            </div>

            {form.jointApplicants.length > 0 ? (
              <div className="mb-5 space-y-3">
                {form.jointApplicants.map((applicant, index) => (
                  <div
                    key={applicant.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {formatApplicantName(applicant)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Applicant {index + 1} ·{" "}
                        {applicant.method === "existing"
                          ? `Existing Caprock client · ${applicant.applicantCountry}`
                          : applicant.email}
                      </p>
                    </div>
                    <span className="hidden rounded-full bg-[#dce7f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-800 sm:inline-flex">
                      Added
                    </span>
                    <button
                      type="button"
                      onClick={() => removeJointApplicant(applicant.id)}
                      aria-label={`Remove ${formatApplicantName(applicant)}`}
                      className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {showJointComposer ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Add a joint applicant
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Choose how this person will join the application.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      lookupRequestRef.current += 1;
                      setShowJointComposer(false);
                    }}
                    aria-label="Close applicant form"
                    className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  {(["existing", "new"] as JointMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        lookupRequestRef.current += 1;
                        setJointDraft({ ...emptyJointDraft, method });
                        setLookupState("idle");
                        setLookupVerifiedAt("");
                      }}
                      className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                        jointDraft.method === method
                          ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {method === "existing"
                        ? "Existing client"
                        : "Invite new client"}
                    </button>
                  ))}
                </div>

                {jointDraft.method === "existing" ? (
                  <div>
                    <Field
                      label="Caprock client ID"
                      htmlFor="jointClientId"
                      hint="Client IDs are verified before the applicant is added."
                    >
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          id="jointClientId"
                          value={jointDraft.clientId}
                          onChange={(event) =>
                            updateJointDraft("clientId", event.target.value)
                          }
                          placeholder="For example, CM-10284"
                          className={inputClass(lookupState === "error")}
                        />
                        <button
                          type="button"
                          onClick={handleLookupClient}
                          disabled={
                            lookupState === "loading" || lookupState === "found"
                          }
                          className={`inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold transition ${
                            lookupState === "found"
                              ? "cursor-default border-[rgba(0,52,120,0.16)] bg-[#dce7f2] text-[#003478]"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-[#003478] disabled:cursor-wait disabled:opacity-60"
                          }`}
                        >
                          {lookupState === "loading" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : lookupState === "found" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <BadgeCheck className="h-4 w-4" />
                          )}
                          {lookupState === "loading"
                            ? "Checking…"
                            : lookupState === "found"
                              ? "Verified"
                              : "Verify ID"}
                        </button>
                      </div>
                    </Field>
                    {lookupState === "found" ? (
                      <div
                        role="status"
                        className="mt-4 overflow-hidden rounded-2xl border border-[rgba(0,52,120,0.16)] bg-[rgba(0,52,120,0.035)]"
                      >
                        <div className="flex items-start gap-3 p-4 sm:p-5">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#003478] text-white shadow-sm">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-950">
                                Client ID verified
                              </p>
                              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#003478] ring-1 ring-[rgba(0,52,120,0.12)]">
                                Verified{" "}
                                {lookupVerifiedAt
                                  ? `at ${lookupVerifiedAt}`
                                  : "just now"}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs leading-5 text-slate-600">
                              A matching Caprock client record was found.
                              Identity and contact details will be securely
                              linked when this applicant is added.
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600">
                              <span className="rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-slate-200">
                                {jointDraft.clientId.trim().toUpperCase()}
                              </span>
                              <span className="rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-slate-200">
                                {jointDraft.applicantCountry ||
                                  form.personal.applicantCountry ||
                                  "Australia"}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-[#003478]" />
                                Ready to add securely
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : lookupState === "error" ? (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        Enter a valid client ID with at least five characters.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" htmlFor="jointFullName">
                      <input
                        id="jointFullName"
                        value={jointDraft.firstName}
                        onChange={(event) =>
                          updateJointDraft("firstName", event.target.value)
                        }
                        autoComplete="name"
                        placeholder="Applicant’s full legal name"
                        className={inputClass()}
                      />
                    </Field>
                    <Field label="Email address" htmlFor="jointEmail">
                      <input
                        id="jointEmail"
                        type="email"
                        value={jointDraft.email}
                        onChange={(event) =>
                          updateJointDraft("email", event.target.value)
                        }
                        autoComplete="email"
                        placeholder="name@example.com"
                        className={inputClass()}
                      />
                    </Field>
                    {sharedAddress ? (
                      <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs leading-5 text-slate-600">
                        This applicant will use the main applicant’s residential
                        address.
                      </div>
                    ) : (
                      <div className="sm:col-span-2">
                        <Field
                          label="Residential address"
                          htmlFor="jointResidentialAddress"
                        >
                          <textarea
                            id="jointResidentialAddress"
                            value={jointDraft.residentialAddress}
                            onChange={(event) =>
                              updateJointDraft(
                                "residentialAddress",
                                event.target.value,
                              )
                            }
                            autoComplete="street-address"
                            placeholder="Street, suburb or city, state or region, postcode and country"
                            className={textareaClass()}
                          />
                        </Field>
                      </div>
                    )}
                  </div>
                )}

                {errors.jointApplicants ? (
                  <p className="mt-4 text-xs font-medium text-red-600">
                    {errors.jointApplicants}
                  </p>
                ) : null}
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={saveJointApplicant}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#003478] px-5 text-xs font-semibold text-white transition hover:bg-[#002b63]"
                  >
                    <UserPlus className="h-4 w-4" />
                    {jointDraft.method === "existing"
                      ? "Add verified client"
                      : "Send invitation"}
                  </button>
                </div>
              </div>
            ) : null}

            {errors.jointApplicants && !showJointComposer ? (
              <p className="mt-3 text-xs font-medium text-red-600">
                {errors.jointApplicants}
              </p>
            ) : null}
          </section>
        ) : null}

        <section>
          <SubsectionHeading
            title="Investment profile"
            description="Provide the investment currency and expected investment range."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Investment currency"
              htmlFor="investmentCurrency"
              error={errors.investmentCurrency}
            >
              <CustomSelect
                id="investmentCurrency"
                value={form.personal.investmentCurrency}
                onChange={(value) =>
                  updatePersonal("investmentCurrency", value)
                }
                options={INVESTMENT_CURRENCY_OPTIONS}
                placeholder="Select currency"
                error={Boolean(errors.investmentCurrency)}
              />
            </Field>
            <Field
              label="Expected investment amount"
              htmlFor="expectedInvestment"
              error={errors.expectedInvestment}
            >
              <CustomSelect
                id="expectedInvestment"
                value={form.personal.expectedInvestment}
                onChange={(value) =>
                  updatePersonal("expectedInvestment", value)
                }
                options={INVESTMENT_AMOUNT_OPTIONS}
                placeholder="Select expected amount"
                error={Boolean(errors.expectedInvestment)}
              />
            </Field>
          </div>
        </section>
      </div>
    </div>
  );

  return renderPersonal();
}
