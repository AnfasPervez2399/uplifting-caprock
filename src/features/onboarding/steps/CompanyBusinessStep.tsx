import { BriefcaseBusiness } from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import {
  AUSTRALIAN_REGISTRATION_OPTIONS,
  COUNTRY_OPTIONS,
  FOREIGN_COMPANY_TYPE_OPTIONS,
  NON_AUSTRALIAN_COMPANY_TYPE_OPTIONS,
} from "../config";
import { BinaryChoice, Field, SectionIntro, SubsectionHeading, inputClass, textareaClass } from "../components/FormPrimitives";
import type { OnboardingController } from "../useOnboardingController";

export function CompanyBusinessStep({ controller }: { controller: OnboardingController }) {
  const { form, errors, sectionEyebrow, updateCompany, handleCompanyUsRegisteredChange } = controller;
  const type = form.personal.applicationType;
  const domestic = type === "australian-company";
  const asicForeign = type === "asic-non-australian-company";
  const companyTypeOptions = asicForeign ? FOREIGN_COMPANY_TYPE_OPTIONS : NON_AUSTRALIAN_COMPANY_TYPE_OPTIONS;

  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("business")}
        title="Business"
        description={domestic ? "Provide the company’s Australian registration and compliance information." : "Provide formation, Australian presence and tax-registration details for the company."}
        icon={BriefcaseBusiness}
      />
      <div className="space-y-8">
        {domestic ? (
          <section>
            <SubsectionHeading title="Australian registration" description="Enter the company’s registered-office and ASIC details." />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Full address of the company’s registered office" htmlFor="companyRegisteredAddress" error={errors.companyRegisteredAddress}>
                  <textarea id="companyRegisteredAddress" value={form.company.registeredAddress} onChange={(event) => updateCompany("registeredAddress", event.target.value)} placeholder="Registered office address" className={textareaClass(Boolean(errors.companyRegisteredAddress))} />
                </Field>
              </div>
              <Field label="Company is registered as" htmlFor="companyRegistrationType" error={errors.companyRegistrationType}>
                <CustomSelect id="companyRegistrationType" value={form.company.registrationType} onChange={(value) => updateCompany("registrationType", value as typeof form.company.registrationType)} options={AUSTRALIAN_REGISTRATION_OPTIONS} placeholder="Select registration type" error={Boolean(errors.companyRegistrationType)} />
              </Field>
              <Field label="Australian Company Number (ACN)" htmlFor="companyAcn" error={errors.companyAcn}>
                <input id="companyAcn" value={form.company.acn} onChange={(event) => updateCompany("acn", event.target.value)} placeholder="ACN issued to the company" className={inputClass(Boolean(errors.companyAcn))} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Current or recent prosecutions and inquiries" htmlFor="companyAmlActivity" error={errors.companyAmlActivity} hint="Include matters related to money laundering, terrorist links, tax offences and corruption. Enter “None” if there are no matters to disclose.">
                  <textarea id="companyAmlActivity" value={form.company.amlActivity} onChange={(event) => updateCompany("amlActivity", event.target.value)} placeholder="Provide details or enter None" className={textareaClass(Boolean(errors.companyAmlActivity))} />
                </Field>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section>
              <SubsectionHeading title="Formation and registration" description="Use details from the relevant company registration body." />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Type of company" htmlFor="foreignCompanyType" error={errors.companyType}>
                  <CustomSelect id="foreignCompanyType" value={form.company.companyType} onChange={(value) => updateCompany("companyType", value as typeof form.company.companyType)} options={companyTypeOptions} placeholder="Select company type" error={Boolean(errors.companyType)} />
                </Field>
                <Field label="Date of incorporation" htmlFor="companyIncorporationDate" error={errors.companyIncorporationDate}>
                  <input id="companyIncorporationDate" type="date" value={form.company.incorporationDate} max={new Date().toISOString().slice(0, 10)} onChange={(event) => updateCompany("incorporationDate", event.target.value)} className={inputClass(Boolean(errors.companyIncorporationDate))} />
                </Field>
                {!asicForeign ? (
                  <Field label="Identification number issued by the registration body" htmlFor="companyIdentificationNumber" error={errors.companyIdentificationNumber}>
                    <input id="companyIdentificationNumber" value={form.company.identificationNumber} onChange={(event) => updateCompany("identificationNumber", event.target.value)} placeholder="Identification number" className={inputClass(Boolean(errors.companyIdentificationNumber))} />
                  </Field>
                ) : null}
                <Field label="Country of formation, incorporation or registration" htmlFor="companyCountry" error={errors.companyCountry}>
                  <CustomSelect id="companyCountry" value={form.company.country} onChange={(value) => updateCompany("country", value)} options={COUNTRY_OPTIONS} placeholder="Select country" searchable searchPlaceholder="Search countries" error={Boolean(errors.companyCountry)} />
                </Field>
                {!asicForeign ? (
                  <Field label="Applicant domicile country" htmlFor="companyDomicileCountry" error={errors.companyDomicileCountry}>
                    <CustomSelect id="companyDomicileCountry" value={form.company.domicileCountry} onChange={(value) => updateCompany("domicileCountry", value)} options={COUNTRY_OPTIONS} placeholder="Select domicile country" searchable searchPlaceholder="Search countries" error={Boolean(errors.companyDomicileCountry)} />
                  </Field>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
              <SubsectionHeading title="Business addresses" description={asicForeign ? "Provide the company’s Australian registered and principal business addresses." : "Provide the addresses recorded in the company’s country of formation."} />
              <div className="grid gap-5">
                <Field label={asicForeign ? "Registered office in Australia" : "Registered address in the country of formation"} htmlFor="companyRegisteredAddress" error={errors.companyRegisteredAddress}>
                  <textarea id="companyRegisteredAddress" value={form.company.registeredAddress} onChange={(event) => updateCompany("registeredAddress", event.target.value)} placeholder="Full registered address" className={textareaClass(Boolean(errors.companyRegisteredAddress))} />
                </Field>
                <Field label={asicForeign ? "Principal place of business or local agent in Australia" : "Principal place of business in the country of formation"} htmlFor="companyPrincipalAddress" error={errors.companyPrincipalAddress}>
                  <textarea id="companyPrincipalAddress" value={form.company.principalAddress} onChange={(event) => updateCompany("principalAddress", event.target.value)} placeholder="Full principal business address" className={textareaClass(Boolean(errors.companyPrincipalAddress))} />
                </Field>
              </div>
            </section>

            <section>
              <SubsectionHeading title="Registration and U.S. tax status" description="Confirm registration with the relevant body and whether U.S. tax details are required." />
              <div className="grid gap-6 sm:grid-cols-2">
                {asicForeign ? (
                  <Field label="Registered by the relevant non-Australian registration body?" htmlFor="registeredByRelevantBody" error={errors.companyRegisteredByRelevantBody}>
                    <BinaryChoice value={form.company.registeredByRelevantBody} onChange={(value) => updateCompany("registeredByRelevantBody", value)} ariaLabel="Relevant registration body status" />
                  </Field>
                ) : null}
                <Field label="Is the company U.S.-registered?" htmlFor="companyUsRegistered" error={errors.companyUsRegistered}>
                  <BinaryChoice value={form.company.usRegistered} onChange={handleCompanyUsRegisteredChange} ariaLabel="U.S. company registration status" />
                </Field>
                {form.company.usRegistered === "yes" ? (
                  <Field label="U.S. Tax ID number" htmlFor="companyUsTaxId" error={errors.companyUsTaxId}>
                    <input id="companyUsTaxId" value={form.company.usTaxId} onChange={(event) => updateCompany("usTaxId", event.target.value)} placeholder="Tax ID number" className={inputClass(Boolean(errors.companyUsTaxId))} />
                  </Field>
                ) : null}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
