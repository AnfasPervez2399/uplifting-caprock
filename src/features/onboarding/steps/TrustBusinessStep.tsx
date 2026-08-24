import { BriefcaseBusiness } from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import { COUNTRY_OPTIONS, INVESTMENT_AMOUNT_OPTIONS, INVESTMENT_CURRENCY_OPTIONS } from "../config";
import { Field, SectionIntro, SubsectionHeading, inputClass, textareaClass } from "../components/FormPrimitives";
import type { OnboardingController } from "../useOnboardingController";

export function TrustBusinessStep({ controller }: { controller: OnboardingController }) {
  const { form, errors, sectionEyebrow, updateTrust } = controller;
  const requiresLicence = form.personal.applicationType === "custodian-trust" || form.personal.applicationType === "non-custodian-trust";
  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro eyebrow={sectionEyebrow("business")} title="Business" description="Provide the trust’s investment profile, settlor, address and applicant jurisdiction." icon={BriefcaseBusiness} />
      <div className="space-y-8">
        <section>
          <SubsectionHeading title="Investment profile" description="Select the trust’s expected investment currency and range." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Investment currency" htmlFor="trustInvestmentCurrency" error={errors.trustInvestmentCurrency}>
              <CustomSelect id="trustInvestmentCurrency" value={form.trust.investmentCurrency} onChange={(value) => updateTrust("investmentCurrency", value)} options={INVESTMENT_CURRENCY_OPTIONS} placeholder="Select currency" error={Boolean(errors.trustInvestmentCurrency)} />
            </Field>
            <Field label="Expected investment amount" htmlFor="trustExpectedInvestment" error={errors.trustExpectedInvestment}>
              <CustomSelect id="trustExpectedInvestment" value={form.trust.expectedInvestment} onChange={(value) => updateTrust("expectedInvestment", value)} options={INVESTMENT_AMOUNT_OPTIONS} placeholder="Select investment range" error={Boolean(errors.trustExpectedInvestment)} />
            </Field>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
          <SubsectionHeading title="Trust establishment and parties" description="Provide the licence detail when required, along with the trust’s settlor and address." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Country in which the trust was established" htmlFor="trustBusinessCountry" error={errors.trustEstablishedCountry}>
              <CustomSelect id="trustBusinessCountry" value={form.trust.establishedCountry} onChange={(value) => updateTrust("establishedCountry", value)} options={COUNTRY_OPTIONS} placeholder="Select country" searchable searchPlaceholder="Search countries" error={Boolean(errors.trustEstablishedCountry)} />
            </Field>
            {requiresLicence ? (
              <Field label="Australian Financial Services Licence number" htmlFor="trustAfsLicense" error={errors.trustAfsLicense}>
                <input id="trustAfsLicense" value={form.trust.afsLicenseNumber} onChange={(event) => updateTrust("afsLicenseNumber", event.target.value)} placeholder="AFSL number" className={inputClass(Boolean(errors.trustAfsLicense))} />
              </Field>
            ) : null}
            <Field label="Full name of the settlor" htmlFor="trustSettlor" error={errors.trustSettlor}>
              <input id="trustSettlor" value={form.trust.settlorName} onChange={(event) => updateTrust("settlorName", event.target.value)} placeholder="Settlor’s full legal name" className={inputClass(Boolean(errors.trustSettlor))} />
            </Field>
            <Field label="Applicant’s country" htmlFor="trustApplicantCountry" error={errors.trustApplicantCountry}>
              <CustomSelect id="trustApplicantCountry" value={form.trust.applicantCountry} onChange={(value) => updateTrust("applicantCountry", value)} options={COUNTRY_OPTIONS} placeholder="Select applicant country" searchable searchPlaceholder="Search countries" error={Boolean(errors.trustApplicantCountry)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Trust address" htmlFor="trustAddress" error={errors.trustAddress}>
                <textarea id="trustAddress" value={form.trust.address} onChange={(event) => updateTrust("address", event.target.value)} placeholder="Full trust address" className={textareaClass(Boolean(errors.trustAddress))} />
              </Field>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
