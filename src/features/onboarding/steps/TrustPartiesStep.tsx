import { useState } from "react";
import { CheckCircle2, Mail, Plus, Trash2, UserRound, UsersRound } from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import { CORPORATE_ENTITY_TYPE_OPTIONS, PARTY_TYPE_OPTIONS } from "../config";
import { createEmptyDirector, createEmptyTrustParty } from "../initialState";
import { isCompleteDirector, isCompleteTrustParty } from "../applicationLogic";
import { Field, SectionIntro, SubsectionHeading, inputClass } from "../components/FormPrimitives";
import type { CompanyDirector, PartyType, StepId, TrustParty } from "../types";
import type { OnboardingController } from "../useOnboardingController";

export function TrustPartiesStep({ controller, kind }: { controller: OnboardingController; kind: "trustees" | "beneficiaries" }) {
  const trusteeMode = kind === "trustees";
  const { form, errors, sectionEyebrow, updateTrust, addTrustParty, removeTrustParty } = controller;
  const parties = trusteeMode ? form.trustees : form.beneficiaries;
  const countKey = trusteeMode ? "trusteeCount" : "beneficiaryCount";
  const countErrorKey = countKey;
  const title = trusteeMode ? "Trustees" : "Beneficiaries";
  const singular = trusteeMode ? "trustee" : "beneficiary";
  const [draft, setDraft] = useState<TrustParty>(() => createEmptyTrustParty(singular));
  const [directorDraft, setDirectorDraft] = useState<CompanyDirector>(createEmptyDirector);
  const [draftError, setDraftError] = useState("");
  const [directorError, setDirectorError] = useState("");

  const addNestedDirector = () => {
    if (!isCompleteDirector(directorDraft)) {
      setDirectorError("Enter the director’s full name, valid email and phone number.");
      return;
    }
    setDraft((current) => ({ ...current, directors: [...current.directors, directorDraft] }));
    setDirectorDraft(createEmptyDirector());
    setDirectorError("");
  };

  const add = () => {
    if (!isCompleteTrustParty(draft)) {
      setDraftError(`Complete the ${singular}’s type, name, valid email and phone.${draft.type === "corporate" ? " Corporate parties also require a company structure and at least one complete director." : ""}`);
      return;
    }
    addTrustParty(kind, draft);
    setDraft(createEmptyTrustParty(singular));
    setDirectorDraft(createEmptyDirector());
    setDraftError("");
  };

  const recipientOptions = form.trustees.map((party) => ({ value: party.id, label: party.name, description: party.email }));

  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow(kind as StepId)}
        title={title}
        description={trusteeMode ? "Record all individual and corporate trustees, including directors for each corporate trustee." : "Record all individual and corporate beneficiaries, including directors for each corporate beneficiary."}
        icon={UsersRound}
      />
      <div className="space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
          <SubsectionHeading title={`Add a ${singular}`} description={`Capture the ${singular} contact and its individual or corporate structure. KYC invitations are sent after the trust application is submitted.`} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label={`${singular.charAt(0).toUpperCase()}${singular.slice(1)} type`} htmlFor={`${kind}Type`}>
              <CustomSelect id={`${kind}Type`} value={draft.type} onChange={(value) => setDraft((current) => ({ ...current, type: value as PartyType, companyType: value === "corporate" ? current.companyType : "", directors: value === "corporate" ? current.directors : [] }))} options={PARTY_TYPE_OPTIONS} placeholder="Select type" />
            </Field>
            {draft.type === "corporate" ? (
              <Field label="Company type" htmlFor={`${kind}CompanyType`}>
                <CustomSelect id={`${kind}CompanyType`} value={draft.companyType} onChange={(value) => setDraft((current) => ({ ...current, companyType: value as typeof current.companyType }))} options={CORPORATE_ENTITY_TYPE_OPTIONS} placeholder="Select company structure" />
              </Field>
            ) : null}
            <Field label="Full name" htmlFor={`${kind}Name`}><input id={`${kind}Name`} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder={draft.type === "corporate" ? "Registered company name" : "Full legal name"} className={inputClass()} /></Field>
            <Field label="Email" htmlFor={`${kind}Email`}><input id={`${kind}Email`} type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} placeholder="name@example.com" className={inputClass()} /></Field>
            <Field label="Phone number" htmlFor={`${kind}Phone`}><input id={`${kind}Phone`} type="tel" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone number" className={inputClass()} /></Field>
          </div>

          {draft.type === "corporate" ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <SubsectionHeading title="Corporate party directors" description="The audit requires each corporate trustee or beneficiary to carry its own director list." />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Director full name" htmlFor={`${kind}DirectorName`}><input id={`${kind}DirectorName`} value={directorDraft.name} onChange={(event) => setDirectorDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Full legal name" className={inputClass()} /></Field>
                <Field label="Director email" htmlFor={`${kind}DirectorEmail`}><input id={`${kind}DirectorEmail`} type="email" value={directorDraft.email} onChange={(event) => setDirectorDraft((current) => ({ ...current, email: event.target.value }))} placeholder="name@example.com" className={inputClass()} /></Field>
                <Field label="Director phone" htmlFor={`${kind}DirectorPhone`}><input id={`${kind}DirectorPhone`} type="tel" value={directorDraft.phone} onChange={(event) => setDirectorDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone number" className={inputClass()} /></Field>
              </div>
              {directorError ? <p className="mt-3 text-xs font-medium text-red-600">{directorError}</p> : null}
              <button type="button" onClick={addNestedDirector} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-[#003478]"><Plus className="h-4 w-4" /> Add director</button>
              {draft.directors.length ? (
                <div className="mt-4 space-y-2">{draft.directors.map((director) => (
                  <div key={director.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"><UserRound className="h-4 w-4 text-slate-400" /><p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">{director.name} · {director.email}</p><button type="button" onClick={() => setDraft((current) => ({ ...current, directors: current.directors.filter((item) => item.id !== director.id) }))} aria-label={`Remove ${director.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div>
                ))}</div>
              ) : null}
            </div>
          ) : null}

          {draftError ? <p className="mt-3 text-xs font-medium text-red-600">{draftError}</p> : null}
          <button type="button" onClick={add} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63]"><Plus className="h-4 w-4" /> Add {singular}</button>
        </section>

        <section>
          <SubsectionHeading title={`Saved ${title.toLowerCase()} (${parties.length})`} description={trusteeMode ? "Select one saved trustee as the communication recipient above." : "Beneficiaries are recorded for KYC review."} />
          <div className="space-y-3">
            {parties.length ? parties.map((party, index) => (
              <div key={party.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><UserRound className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-950">{index + 1}. {party.name}</p><p className="mt-1 text-xs text-slate-500">{party.type === "corporate" ? `Corporate · ${party.directors.length} director${party.directors.length === 1 ? "" : "s"}` : "Individual"} · {party.email} · {party.phone}</p></div>
                {trusteeMode && form.trust.defaultRecipientId === party.id ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003478]"><CheckCircle2 className="h-4 w-4" /> Default recipient</span> : <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dce7f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#0f172a]"><Mail className="h-3 w-3 text-[#003478]" /> Invite queued</span>}
                <button type="button" onClick={() => removeTrustParty(kind, party.id)} aria-label={`Remove ${party.name}`} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No {title.toLowerCase()} added yet.</div>}
          </div>
          {errors[kind] ? <p className="mt-3 text-xs font-medium text-red-600">{errors[kind]}</p> : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <SubsectionHeading title={`${title} declaration`} description={`The ${singular} count is calculated automatically from the saved records above.`} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={`Number of ${title.toLowerCase()}`} htmlFor={`${kind}Count`} error={errors[countErrorKey]} hint={`Calculated automatically from saved ${title.toLowerCase()}.`}>
              <input id={`${kind}Count`} type="number" value={parties.length} readOnly aria-readonly="true" className={`${inputClass(Boolean(errors[countErrorKey]))} cursor-not-allowed bg-slate-100/80 text-slate-700`} />
            </Field>
            {trusteeMode ? (
              <Field label="Default communication recipient" htmlFor="defaultTrustee" error={errors.defaultTrustee}>
                <CustomSelect id="defaultTrustee" value={form.trust.defaultRecipientId} onChange={(value) => updateTrust("defaultRecipientId", value)} options={recipientOptions} placeholder={form.trustees.length ? "Select a trustee" : "Add a trustee first"} disabled={!form.trustees.length} error={Boolean(errors.defaultTrustee)} />
              </Field>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
