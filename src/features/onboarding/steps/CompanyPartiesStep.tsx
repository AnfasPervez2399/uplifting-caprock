import { useState } from "react";
import { CheckCircle2, Mail, Plus, Trash2, UserRound, UsersRound } from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import { CORPORATE_ENTITY_TYPE_OPTIONS, PARTY_TYPE_OPTIONS } from "../config";
import { createEmptyDirector, createEmptyShareholder } from "../initialState";
import { isCompleteDirector, isCompleteShareholder } from "../applicationLogic";
import { Field, SectionIntro, SubsectionHeading, inputClass } from "../components/FormPrimitives";
import type { CompanyDirector, CompanyShareholder, PartyType } from "../types";
import type { OnboardingController } from "../useOnboardingController";

const queuedBadge = (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dce7f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#0f172a]">
    <Mail className="h-3 w-3 text-[#003478]" /> Invite queued
  </span>
);

export function CompanyDirectorsStep({ controller }: { controller: OnboardingController }) {
  const { form, errors, sectionEyebrow, updateCompany, addDirector, removeDirector } = controller;
  const [draft, setDraft] = useState<CompanyDirector>(createEmptyDirector);
  const [draftError, setDraftError] = useState("");
  const add = () => {
    if (!isCompleteDirector(draft)) {
      setDraftError("Enter the director’s full name, valid email and phone number.");
      return;
    }
    addDirector(draft);
    setDraft(createEmptyDirector());
    setDraftError("");
  };
  const recipientOptions = form.directors.map((director) => ({ value: director.id, label: director.name, description: director.email }));

  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro eyebrow={sectionEyebrow("directors")} title="M.D. & Owners" description="List every director or partner and select the person who will receive company communications." icon={UsersRound} />
      <div className="space-y-8">
        <section>
          <SubsectionHeading title="Director declaration" description="The declared count must match the complete contacts saved below." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Number of directors or partners" htmlFor="directorCount" error={errors.directorCount}>
              <input id="directorCount" type="number" min="1" step="1" value={form.company.directorCount} onChange={(event) => updateCompany("directorCount", event.target.value)} placeholder="For example, 2" className={inputClass(Boolean(errors.directorCount))} />
            </Field>
            <Field label="Default communication recipient" htmlFor="defaultDirector" error={errors.defaultDirector}>
              <CustomSelect id="defaultDirector" value={form.company.defaultRecipientId} onChange={(value) => updateCompany("defaultRecipientId", value)} options={recipientOptions} placeholder={form.directors.length ? "Select a director" : "Add a director first"} disabled={!form.directors.length} error={Boolean(errors.defaultDirector)} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
          <SubsectionHeading title="Add a director or partner" description="Invitations are queued now and sent when the entity application is submitted." />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Full name" htmlFor="directorName">
              <input id="directorName" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Full legal name" className={inputClass()} />
            </Field>
            <Field label="Email" htmlFor="directorEmail">
              <input id="directorEmail" type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} placeholder="name@example.com" className={inputClass()} />
            </Field>
            <Field label="Phone number" htmlFor="directorPhone">
              <input id="directorPhone" type="tel" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone number" className={inputClass()} />
            </Field>
          </div>
          {draftError ? <p className="mt-3 text-xs font-medium text-red-600">{draftError}</p> : null}
          <button type="button" onClick={add} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63]"><Plus className="h-4 w-4" /> Add director</button>
        </section>

        <section>
          <SubsectionHeading title={`Saved directors (${form.directors.length})`} description="Each director completes their own identity onboarding after the application is submitted." />
          <div className="space-y-3">
            {form.directors.length ? form.directors.map((director, index) => (
              <div key={director.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><UserRound className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-950">{index + 1}. {director.name}</p><p className="mt-1 truncate text-xs text-slate-500">{director.email} · {director.phone}</p></div>
                {form.company.defaultRecipientId === director.id ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003478]"><CheckCircle2 className="h-4 w-4" /> Default recipient</span> : queuedBadge}
                <button type="button" onClick={() => removeDirector(director.id)} aria-label={`Remove ${director.name}`} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No directors added yet.</div>}
          </div>
          {errors.directors ? <p className="mt-3 text-xs font-medium text-red-600">{errors.directors}</p> : null}
        </section>
      </div>
    </div>
  );
}

export function CompanyShareholdersStep({ controller }: { controller: OnboardingController }) {
  const { form, errors, sectionEyebrow, updateCompany, addShareholder, removeShareholder } = controller;
  const [draft, setDraft] = useState<CompanyShareholder>(createEmptyShareholder);
  const [draftError, setDraftError] = useState("");
  const add = () => {
    if (!isCompleteShareholder(draft)) {
      setDraftError("Complete the shareholder type, ownership percentage, full name, valid email and phone number.");
      return;
    }
    addShareholder(draft);
    setDraft(createEmptyShareholder());
    setDraftError("");
  };

  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro eyebrow={sectionEyebrow("shareholders")} title="Shareholders" description="Record every individual or corporate shareholder and their ownership percentage." icon={UsersRound} />
      <div className="space-y-8">
        <section>
          <SubsectionHeading title="Shareholder declaration" description="The declared count must match the complete shareholder records saved below." />
          <div className="max-w-md"><Field label="Number of shareholders or partners" htmlFor="shareholderCount" error={errors.shareholderCount}><input id="shareholderCount" type="number" min="1" step="1" value={form.company.shareholderCount} onChange={(event) => updateCompany("shareholderCount", event.target.value)} placeholder="For example, 2" className={inputClass(Boolean(errors.shareholderCount))} /></Field></div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
          <SubsectionHeading title="Add a shareholder" description="Corporate shareholders are assigned the matching company KYC structure for the cascade after submission." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Shareholder type" htmlFor="shareholderType"><CustomSelect id="shareholderType" value={draft.type} onChange={(value) => setDraft((current) => ({ ...current, type: value as PartyType, companyType: value === "corporate" ? current.companyType : "" }))} options={PARTY_TYPE_OPTIONS} placeholder="Select type" /></Field>
            {draft.type === "corporate" ? <Field label="Company structure" htmlFor="shareholderCompanyType"><CustomSelect id="shareholderCompanyType" value={draft.companyType} onChange={(value) => setDraft((current) => ({ ...current, companyType: value as typeof current.companyType }))} options={CORPORATE_ENTITY_TYPE_OPTIONS} placeholder="Select company structure" /></Field> : null}
            <Field label="Ownership percentage" htmlFor="shareholderPercentage"><input id="shareholderPercentage" type="number" min="0.01" max="100" step="0.01" value={draft.percentage} onChange={(event) => setDraft((current) => ({ ...current, percentage: event.target.value }))} placeholder="For example, 25" className={inputClass()} /></Field>
            <Field label="Full name" htmlFor="shareholderName"><input id="shareholderName" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Person or company name" className={inputClass()} /></Field>
            <Field label="Email" htmlFor="shareholderEmail"><input id="shareholderEmail" type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} placeholder="name@example.com" className={inputClass()} /></Field>
            <Field label="Phone number" htmlFor="shareholderPhone"><input id="shareholderPhone" type="tel" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone number" className={inputClass()} /></Field>
          </div>
          {draftError ? <p className="mt-3 text-xs font-medium text-red-600">{draftError}</p> : null}
          <button type="button" onClick={add} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63]"><Plus className="h-4 w-4" /> Add shareholder</button>
        </section>
        <section>
          <SubsectionHeading title={`Saved shareholders (${form.shareholders.length})`} description="Ownership percentages are recorded individually; the legacy audit does not require the list to total exactly 100%." />
          <div className="space-y-3">
            {form.shareholders.length ? form.shareholders.map((shareholder, index) => (
              <div key={shareholder.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><UserRound className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-950">{index + 1}. {shareholder.name}</p><p className="mt-1 text-xs text-slate-500">{shareholder.type === "corporate" ? "Corporate" : "Individual"} · {shareholder.percentage}% · {shareholder.email}</p></div>
                {queuedBadge}
                <button type="button" onClick={() => removeShareholder(shareholder.id)} aria-label={`Remove ${shareholder.name}`} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No shareholders added yet.</div>}
          </div>
          {errors.shareholders ? <p className="mt-3 text-xs font-medium text-red-600">{errors.shareholders}</p> : null}
        </section>
      </div>
    </div>
  );
}
