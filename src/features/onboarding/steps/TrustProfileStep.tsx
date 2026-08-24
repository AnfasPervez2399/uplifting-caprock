import { ShieldCheck } from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import { COUNTRY_OPTIONS } from "../config";
import { DocumentUpload, Field, SectionIntro, SubsectionHeading, inputClass } from "../components/FormPrimitives";
import { documentFromFile } from "../utils";
import type { OnboardingController } from "../useOnboardingController";

export function TrustProfileStep({ controller }: { controller: OnboardingController }) {
  const { form, errors, sectionEyebrow, selectedApplicationType, updateTrust, openDocumentPreview } = controller;
  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro eyebrow={sectionEyebrow("trust")} title="Trust Profile" description={`Provide the registered details for this ${selectedApplicationType.toLowerCase()}.`} icon={ShieldCheck} />
      <div className="space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
          <SubsectionHeading title="Application structure" description="The trust type is set by your selection and drives the later licence and evidence requirements." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Type of trust" htmlFor="trustType">
              <input id="trustType" value={selectedApplicationType} readOnly className={`${inputClass()} cursor-not-allowed bg-slate-100/80 text-slate-600`} />
            </Field>
            <Field label="Caprock reference number" htmlFor="trustReference" required={false}>
              <input id="trustReference" value={form.personal.referenceNumber} readOnly placeholder="Assigned by Caprock" className={`${inputClass()} cursor-not-allowed bg-slate-100/80 text-slate-500`} />
            </Field>
          </div>
        </section>
        <section>
          <SubsectionHeading title="Registered trust details" description="Use the full names and establishment country from the trust records." />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <DocumentUpload id="trustProfilePicture" title="Trust profile image" description="Optional profile image for the trust account." value={form.trust.profilePicture} onChange={(file) => updateTrust("profilePicture", documentFromFile(file))} onPreview={openDocumentPreview} required={false} accept="image/*" />
            </div>
            <Field label="Full name of the trust" htmlFor="trustName" error={errors.trustName}>
              <input id="trustName" value={form.trust.name} onChange={(event) => updateTrust("name", event.target.value)} placeholder="Full legal name of the trust" className={inputClass(Boolean(errors.trustName))} />
            </Field>
            <Field label="Full business name of the trustee in respect of the trust" htmlFor="trustBusinessName" error={errors.trustBusinessName}>
              <input id="trustBusinessName" value={form.trust.trusteeBusinessName} onChange={(event) => updateTrust("trusteeBusinessName", event.target.value)} placeholder="Trustee business name" className={inputClass(Boolean(errors.trustBusinessName))} />
            </Field>
            <Field label="Country in which the trust was established" htmlFor="trustEstablishedCountry" error={errors.trustEstablishedCountry}>
              <CustomSelect id="trustEstablishedCountry" value={form.trust.establishedCountry} onChange={(value) => updateTrust("establishedCountry", value)} options={COUNTRY_OPTIONS} placeholder="Select country" searchable searchPlaceholder="Search countries" error={Boolean(errors.trustEstablishedCountry)} />
            </Field>
          </div>
        </section>
      </div>
    </div>
  );
}
