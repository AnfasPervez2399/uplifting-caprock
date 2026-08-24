import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  Eye,
  FileCheck2,
  Fingerprint,
  Landmark,
  ScanFace,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { ADDRESS_DOCUMENT_OPTIONS, PHOTO_ID_OPTIONS } from "../config";
import { CheckRow, RequiredIndicator, ReviewSection, SectionIntro, SummaryItem } from "../components/FormPrimitives";
import { formatApplicantName, hasDrivingLicenceProof, requiresTwoPhotoIds } from "../utils";
import type { OnboardingController } from "../useOnboardingController";

export function ReviewStep({ controller }: { controller: OnboardingController }) {
  const {
    form, setForm, errors, isJoint, isSoleTrader, isCompany, isTrust, isIndividual,
    selectedApplicationType, proofApplicantProfiles, requiredEntityDocuments, documentsComplete,
    allApplicationSectionsComplete, submitted, sectionEyebrow, openDocumentPreview, goToStep, openAdviserInvite,
  } = controller;
  const companyType = form.personal.applicationType;
  const isDomesticCompany = companyType === "australian-company";
  const isAsicForeign = companyType === "asic-non-australian-company";
  const entityProofCount = requiredEntityDocuments.filter((document) => form.entityDocuments[document.key]).length;
  const individualProofCount = proofApplicantProfiles.reduce((total, applicant) => {
    const documents = form.documents[applicant.key] || {};
    return total + [documents.photoIdFront, documents.photoIdBack, documents.secondaryPhotoIdFront, documents.secondaryPhotoIdBack, documents.addressDocument, documents.cv].filter(Boolean).length;
  }, 0);

  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("review")}
        title="Review and Submit"
        description={submitted ? "Your submitted application remains available while the onboarding team completes its review." : "Check every structure-specific section. Use Edit to make changes before secure submission."}
        icon={BadgeCheck}
      />

      {submitted ? (
        <div role="status" className="mb-6 rounded-2xl border border-[rgba(0,52,120,0.18)] bg-[#f3f7fb] p-4 sm:p-5">
          <div className="flex items-start gap-3.5"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]"><Clock3 className="h-5 w-5" /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-semibold text-slate-950">The Caprock onboarding team is reviewing your application</h2><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#003478] ring-1 ring-[rgba(0,52,120,0.12)]">Under review</span></div><p className="mt-1.5 text-xs leading-5 text-slate-600">No further action is needed. We’ll contact you if more information is required.</p></div></div>
        </div>
      ) : !allApplicationSectionsComplete ? (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />Some sections are incomplete. Complete all required information before submitting.</div>
      ) : (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[rgba(0,52,120,0.14)] bg-[rgba(0,52,120,0.035)] p-4 text-sm leading-6 text-slate-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />All application sections are complete and ready for final declarations.</div>
      )}

      <div className="space-y-4">
        <ReviewSection title="Application Structure" icon={ShieldCheck} onEdit={() => goToStep("application")}>
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2"><SummaryItem label="Application type" value={selectedApplicationType} /><SummaryItem label="Application status" value={submitted ? "Under review" : "Draft"} /></dl>
          {form.adviserAccess ? (
            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.09em] text-slate-400">Application adviser</p><p className="mt-1 text-sm font-semibold text-slate-800">{form.adviserAccess.name}</p><p className="mt-0.5 text-xs text-slate-500">{form.adviserAccess.email} · full application access</p></div><button type="button" onClick={openAdviserInvite} className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-[#003478]">Manage access</button></div>
          ) : null}
        </ReviewSection>

        {isIndividual ? (
          <ReviewSection title="Personal" icon={CircleUserRound} onEdit={() => goToStep("personal")}>
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryItem label="Applicant country" value={form.personal.applicantCountry} /><SummaryItem label="First name" value={form.personal.firstName} /><SummaryItem label="Middle name" value={form.personal.middleName || "Not provided"} /><SummaryItem label="Last name" value={form.personal.lastName} /><SummaryItem label="Former names" value={form.personal.formerNames} /><SummaryItem label="Date of birth" value={form.personal.dateOfBirth} /><SummaryItem label="Investment profile" value={`${form.personal.investmentCurrency || "—"} · ${form.personal.expectedInvestment || "—"}`} /><div className="sm:col-span-2"><SummaryItem label="Residential address" value={form.personal.residentialAddress} /></div>
            </dl>
            {isJoint ? <PartyRows title="Joint applicants" rows={form.jointApplicants.map((applicant) => ({ id: applicant.id, name: formatApplicantName(applicant), detail: `${applicant.method === "existing" ? `Client ID ${applicant.clientId}` : applicant.email} · ${applicant.applicantCountry}` }))} /> : null}
          </ReviewSection>
        ) : null}

        {isCompany ? (
          <>
            <ReviewSection title="Company Profile" icon={Building2} onEdit={() => goToStep("entity")}>
              <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3"><SummaryItem label="Registered company name" value={form.company.name} /><SummaryItem label={isAsicForeign ? "ARBN" : "Registration number"} value={isAsicForeign ? form.company.arbn : form.company.registrationNumber} /><SummaryItem label="Website" value={form.company.website || "Not provided"} /><SummaryItem label="Company type" value={form.company.companyType || "Not selected"} /><SummaryItem label="Incorporation date" value={form.company.incorporationDate || "Not provided"} /><SummaryItem label="Investment profile" value={`${form.company.investmentCurrency || "—"} · ${form.company.expectedInvestment || "—"}`} /></dl>
            </ReviewSection>
            <ReviewSection title="Business" icon={BriefcaseBusiness} onEdit={() => goToStep("business")}>
              <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <SummaryItem label="Registered address" value={form.company.registeredAddress} /><SummaryItem label={isDomesticCompany ? "ASIC registration" : "Formation country"} value={isDomesticCompany ? `${form.company.registrationType || "—"} · ACN ${form.company.acn || "—"}` : form.company.country} />{!isDomesticCompany ? <SummaryItem label="Principal business address" value={form.company.principalAddress} /> : null}{isDomesticCompany ? <SummaryItem label="Compliance disclosure" value={form.company.amlActivity} /> : <SummaryItem label="U.S.-registered" value={form.company.usRegistered === "yes" ? "Yes · Tax ID provided securely" : form.company.usRegistered === "no" ? "No" : "Not selected"} />}
              </dl>
            </ReviewSection>
            <ReviewSection title="M.D. & Owners" icon={UsersRound} onEdit={() => goToStep("directors")}><PartyRows title={`${form.directors.length} saved director${form.directors.length === 1 ? "" : "s"}`} rows={form.directors.map((director) => ({ id: director.id, name: director.name, detail: `${director.email} · ${director.phone}${form.company.defaultRecipientId === director.id ? " · Default recipient" : ""}` }))} /></ReviewSection>
            <ReviewSection title="Shareholders" icon={UsersRound} onEdit={() => goToStep("shareholders")}><PartyRows title={`${form.shareholders.length} saved shareholder${form.shareholders.length === 1 ? "" : "s"}`} rows={form.shareholders.map((shareholder) => ({ id: shareholder.id, name: shareholder.name, detail: `${shareholder.type || "—"} · ${shareholder.percentage || "—"}% · ${shareholder.email}` }))} /></ReviewSection>
          </>
        ) : null}

        {isTrust ? (
          <>
            <ReviewSection title="Trust Profile" icon={ShieldCheck} onEdit={() => goToStep("trust")}><dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3"><SummaryItem label="Trust name" value={form.trust.name} /><SummaryItem label="Trustee business name" value={form.trust.trusteeBusinessName} /><SummaryItem label="Establishment country" value={form.trust.establishedCountry} /></dl></ReviewSection>
            <ReviewSection title="Business" icon={BriefcaseBusiness} onEdit={() => goToStep("business")}><dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3"><SummaryItem label="Investment profile" value={`${form.trust.investmentCurrency || "—"} · ${form.trust.expectedInvestment || "—"}`} /><SummaryItem label="Settlor" value={form.trust.settlorName} /><SummaryItem label="Applicant country" value={form.trust.applicantCountry} /><SummaryItem label="AFSL number" value={form.trust.afsLicenseNumber || "Not required"} /><div className="sm:col-span-2"><SummaryItem label="Trust address" value={form.trust.address} /></div></dl></ReviewSection>
            <ReviewSection title="Trustees" icon={UsersRound} onEdit={() => goToStep("trustees")}><PartyRows title={`${form.trustees.length} saved trustee${form.trustees.length === 1 ? "" : "s"}`} rows={form.trustees.map((party) => ({ id: party.id, name: party.name, detail: `${party.type}${party.type === "corporate" ? ` · ${party.directors.length} director${party.directors.length === 1 ? "" : "s"}` : ""} · ${party.email}${form.trust.defaultRecipientId === party.id ? " · Default recipient" : ""}` }))} /></ReviewSection>
            <ReviewSection title="Beneficiaries" icon={UsersRound} onEdit={() => goToStep("beneficiaries")}><PartyRows title={`${form.beneficiaries.length} saved beneficiar${form.beneficiaries.length === 1 ? "y" : "ies"}`} rows={form.beneficiaries.map((party) => ({ id: party.id, name: party.name, detail: `${party.type}${party.type === "corporate" ? ` · ${party.directors.length} director${party.directors.length === 1 ? "" : "s"}` : ""} · ${party.email}` }))} /></ReviewSection>
          </>
        ) : null}

        {isSoleTrader ? (
          <ReviewSection title="Business" icon={BriefcaseBusiness} onEdit={() => goToStep("business")}><dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3"><SummaryItem label="Assessment" value={form.business.assessmentNature || "Not selected"} /><SummaryItem label="Business name" value={form.business.businessName} /><SummaryItem label="Principal business address" value={form.business.principalBusinessAddress} /><SummaryItem label={form.business.assessmentNature === "australian" ? "ABN" : "Business country"} value={form.business.assessmentNature === "australian" ? form.business.abn : form.business.foreignBusinessCountry} /></dl></ReviewSection>
        ) : null}

        {isIndividual ? <ReviewSection title="Prove It’s You" icon={ScanFace} onEdit={() => goToStep("identity")}><dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2"><SummaryItem label="Selfie image" value={form.identity.selfie?.name || "Not provided"} /><SummaryItem label="Status" value={form.identity.selfie ? "Ready for identity review" : "Incomplete"} /></dl></ReviewSection> : null}

        <ReviewSection title="External Bank Account" icon={Landmark} onEdit={() => goToStep("bank")}>
          <div className="space-y-3">{form.bankAccounts.length ? form.bankAccounts.map((account, index) => <div key={account.id} className="grid gap-3 rounded-xl bg-slate-50 p-3.5 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="text-sm font-semibold text-slate-900">{index + 1}. {account.bankName}</p><p className="mt-1 text-xs text-slate-500">{account.currency} · SWIFT {account.swiftCode} · •••• {account.accountNumber.slice(-4)}</p></div>{account.verificationDocument ? <button type="button" onClick={() => openDocumentPreview(account.verificationDocument!, "Bank verification document")} className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#dce7f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-800 hover:text-[#003478]"><Eye className="h-3 w-3" /> Open evidence</button> : null}</div>) : <p className="text-sm text-slate-500">No bank account saved.</p>}</div>
        </ReviewSection>

        <ReviewSection title="Cash Accounts" icon={Banknote} onEdit={() => goToStep("cash")}><div className="flex flex-wrap gap-2">{form.cashAccounts.length ? form.cashAccounts.map((currency) => <span key={currency} className="inline-flex items-center gap-2 rounded-xl bg-[#dce7f2] px-3 py-2 text-xs font-semibold text-slate-800"><Banknote className="h-3.5 w-3.5 text-[#003478]" />{currency} · one cash account</span>) : <p className="text-sm text-slate-500">No cash-account currencies selected.</p>}</div></ReviewSection>

        <ReviewSection title="Upload Proof" icon={FileCheck2} onEdit={() => goToStep("documents")}>
          <div className="mb-4 grid gap-3 sm:grid-cols-2"><CheckRow checked={(isIndividual ? individualProofCount : entityProofCount) > 0} label={`${isIndividual ? individualProofCount : entityProofCount} proof file${(isIndividual ? individualProofCount : entityProofCount) === 1 ? "" : "s"} attached`} /><CheckRow checked={documentsComplete} label="Required proof set complete" /></div>
          {isIndividual ? <IndividualProofSummary controller={controller} /> : <div className="space-y-2">{requiredEntityDocuments.map((requirement) => { const file = form.entityDocuments[requirement.key]; return <button key={requirement.key} type="button" disabled={!file} onClick={() => file && openDocumentPreview(file, requirement.title)} className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3 text-left transition enabled:hover:bg-slate-100 disabled:cursor-default"><FileCheck2 className={`h-4 w-4 shrink-0 ${file ? "text-[#003478]" : "text-slate-300"}`} /><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800">{requirement.title}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{file?.name || "Not uploaded"}</span></span>{file ? <Eye className="h-4 w-4 text-slate-400" /> : null}</button>; })}</div>}
        </ReviewSection>

        <ReviewSection title="E-Signature" icon={Fingerprint} onEdit={() => goToStep("signature")}><dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4"><SummaryItem label="Signatory" value={form.signature.name} /><SummaryItem label="Email" value={form.signature.email} /><SummaryItem label="Phone" value={form.signature.phone} /><SummaryItem label="Date of birth" value={form.signature.dateOfBirth} /></dl></ReviewSection>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-950">{submitted ? "Declarations recorded" : "Final declarations"}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{submitted ? "These confirmations were captured with your secure submission." : "Both confirmations are required before secure submission."}</p>
        <div className="mt-5 space-y-3">
          <Declaration checked={form.agreements.accurate} disabled={submitted} onChange={(checked) => setForm((current) => ({ ...current, agreements: { ...current.agreements, accurate: checked } }))}>I confirm that the information and documents supplied are complete, current and accurate.</Declaration>
          <Declaration checked={form.agreements.consent} disabled={submitted} onChange={(checked) => setForm((current) => ({ ...current, agreements: { ...current.agreements, consent: checked } }))}>I consent to identity, bank and compliance verification and to receiving the electronic signature request.</Declaration>
        </div>
        {errors.agreements ? <p className="mt-3 text-xs font-medium text-red-600">{errors.agreements}</p> : null}
      </section>
    </div>
  );
}

function PartyRows({ title, rows }: { title: string; rows: Array<{ id: string; name: string; detail: string }> }) {
  return <div><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.09em] text-slate-400">{title}</p><div className="space-y-2.5">{rows.length ? rows.map((row, index) => <div key={row.id} className="flex flex-col gap-1 rounded-xl bg-slate-50 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-sm font-semibold text-slate-800">{index + 1}. {row.name}</span><span className="text-xs text-slate-500">{row.detail}</span></div>) : <p className="text-sm text-slate-500">No records saved.</p>}</div></div>;
}

function IndividualProofSummary({ controller }: { controller: OnboardingController }) {
  const { form, proofApplicantProfiles } = controller;
  return <div className="space-y-3">{proofApplicantProfiles.map((applicant) => { const documents = form.documents[applicant.key] || {}; const first = PHOTO_ID_OPTIONS.find((option) => option.value === documents.photoIdType)?.label || "Not selected"; const second = PHOTO_ID_OPTIONS.find((option) => option.value === documents.secondaryPhotoIdType)?.label; const address = hasDrivingLicenceProof(documents) ? "Verified with driving licence" : ADDRESS_DOCUMENT_OPTIONS.find((option) => option.value === documents.addressDocumentType)?.label || "Not selected"; return <div key={applicant.key} className="grid gap-3 rounded-xl bg-slate-50 px-3.5 py-3 sm:grid-cols-3"><SummaryItem label={`${applicant.label} · photo ID${requiresTwoPhotoIds(applicant.country) ? "s" : ""}`} value={second ? `${first} + ${second}` : first} /><SummaryItem label="Address evidence" value={address} /><SummaryItem label="CV or website" value={documents.cv?.name || documents.websiteUrl || "Not provided"} /></div>; })}</div>;
}

function Declaration({ checked, disabled, onChange, children }: { checked: boolean; disabled: boolean; onChange: (checked: boolean) => void; children: string }) {
  return <label className={`flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition ${disabled ? "cursor-default" : "cursor-pointer hover:border-slate-300"}`}><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#003478]" /><span className="text-sm leading-6 text-slate-700">{children}<RequiredIndicator /></span></label>;
}
