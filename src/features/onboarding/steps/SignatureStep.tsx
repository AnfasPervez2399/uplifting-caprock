import {
  CircleUserRound,
  Fingerprint,
  LockKeyhole,
  Mail,
  Phone,
} from "lucide-react";

import { DatePicker } from "../../../components/ui/DatePicker";

import {
  Field,
  SectionIntro,
  SubsectionHeading,
  inputClass,
} from "../components/FormPrimitives";

import {
  ADULT_DATE_CONDITIONS,
  DOB_HELPER_TEXT,
  DOB_MAX_YEAR,
  DOB_MIN_YEAR,
  formatApplicantName,
} from "../utils";
import type { OnboardingController } from "../useOnboardingController";

interface StepProps {
  controller: OnboardingController;
}

export function SignatureStep({ controller }: StepProps) {
  const {
    form,
    setForm,
    errors,
    sectionEyebrow,
    updateSignature,
  } = controller;

  const renderSignature = () => (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("signature")}
        title="E-Signature"
        description="Provide the authorised signatory details that will be used to issue and validate the electronic signature request."
        icon={Fingerprint}
      />

      <div className="space-y-7">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <SubsectionHeading
              title="Authorised signatory"
              description="The signatory must be the person authorised to complete this application."
            />
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  signature: {
                    ...current.signature,
                    name: formatApplicantName(current.personal),
                    dateOfBirth: current.personal.dateOfBirth,
                  },
                }))
              }
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-[#003478]"
            >
              <CircleUserRound className="h-4 w-4" />
              Use main applicant details
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="signatureName" error={errors.signatureName}>
              <input
                id="signatureName"
                value={form.signature.name}
                onChange={(event) => updateSignature("name", event.target.value)}
                autoComplete="name"
                placeholder="Authorised signatory’s full name"
                className={inputClass(Boolean(errors.signatureName))}
              />
            </Field>
            <Field label="Email address" htmlFor="signatureEmail" error={errors.signatureEmail}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="signatureEmail"
                  type="email"
                  value={form.signature.email}
                  onChange={(event) => updateSignature("email", event.target.value)}
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={`${inputClass(Boolean(errors.signatureEmail))} pl-10`}
                />
              </div>
            </Field>
            <Field label="Phone number" htmlFor="signaturePhone" error={errors.signaturePhone}>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="signaturePhone"
                  type="tel"
                  value={form.signature.phone}
                  onChange={(event) => updateSignature("phone", event.target.value)}
                  autoComplete="tel"
                  placeholder="+61 400 000 000"
                  className={`${inputClass(Boolean(errors.signaturePhone))} pl-10`}
                />
              </div>
            </Field>
            <Field label="Date of birth" htmlFor="signatureDateOfBirth">
              <DatePicker
                id="signatureDateOfBirth"
                value={form.signature.dateOfBirth}
                onChange={(value) => updateSignature("dateOfBirth", value)}
                errorMessage={errors.signatureDateOfBirth}
                helperText={DOB_HELPER_TEXT}
                conditions={ADULT_DATE_CONDITIONS}
                minYear={DOB_MIN_YEAR}
                maxYear={DOB_MAX_YEAR}
              />
            </Field>
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-[rgba(0,52,120,0.13)] bg-[rgba(0,52,120,0.035)] p-4 text-sm leading-6 text-slate-600">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
          An electronic signature request will be sent to this email and phone number after the application passes its initial review.
        </div>
      </div>
    </div>
  );

  return renderSignature();
}
