import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Mail,
  Plus,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import { CORPORATE_ENTITY_TYPE_OPTIONS, PARTY_TYPE_OPTIONS } from "../config";
import { createEmptyTrustParty } from "../initialState";
import {
  applyShareholderToTrustee,
  corporateTrusteeDirectors,
  isCompleteTrustPartyContact,
  isCorporateTrusteeApplicationComplete,
  trusteeAsShareholder,
  type PartyDraftErrors,
} from "../applicationLogic";
import { isValidEmail } from "../utils";
import { ShareholderApplicationScreen } from "../components/ShareholderApplicationScreen";
import {
  Field,
  SectionIntro,
  SubsectionHeading,
  inputClass,
} from "../components/FormPrimitives";
import type { PartyType, TrustParty } from "../types";
import type { OnboardingController } from "../useOnboardingController";

export function TrustPartiesStep({
  controller,
}: {
  controller: OnboardingController;
}) {
  const {
    form,
    errors,
    sectionEyebrow,
    updateTrust,
    addTrustParty,
    updateTrustParty,
    removeTrustParty,
    openDocumentPreview,
  } = controller;
  const [draft, setDraft] = useState<TrustParty>(() =>
    createEmptyTrustParty("trustee"),
  );
  const [draftErrors, setDraftErrors] = useState<PartyDraftErrors>({});
  const [activeTrusteeId, setActiveTrusteeId] = useState<string | null>(null);

  const updateDraft = (patch: Partial<TrustParty>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setDraftErrors((current) => {
      const next = { ...current };
      Object.keys(patch).forEach((key) => {
        delete next[key as keyof PartyDraftErrors];
      });
      return next;
    });
  };

  const add = () => {
    const nextErrors: PartyDraftErrors = {};
    if (!draft.type) nextErrors.type = "Select a trustee type.";
    if (draft.type === "corporate" && !draft.companyType)
      nextErrors.companyType = "Select the company structure.";
    if (!draft.name.trim()) nextErrors.name = "Enter the full legal name.";
    if (!draft.email.trim()) nextErrors.email = "Enter an email address.";
    else if (!isValidEmail(draft.email))
      nextErrors.email = "Enter a valid email address.";
    if (!draft.phone.trim()) nextErrors.phone = "Enter a phone number.";
    setDraftErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (!isCompleteTrustPartyContact(draft)) return;
    addTrustParty("trustees", draft);
    setDraft(createEmptyTrustParty("trustee"));
    setDraftErrors({});
  };

  const recipientOptions = form.trustees.map((party) => ({
    value: party.id,
    label: party.name,
    description: party.email,
  }));
  const activeTrustee = form.trustees.find(
    (party) => party.id === activeTrusteeId && party.type === "corporate",
  );

  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      {activeTrustee ? (
        <ShareholderApplicationScreen
          shareholder={trusteeAsShareholder(activeTrustee)}
          onChange={(next) =>
            updateTrustParty(applyShareholderToTrustee(activeTrustee, next))
          }
          onOpenDocument={openDocumentPreview}
          onClose={() => setActiveTrusteeId(null)}
          role="trustee"
        />
      ) : null}

      <SectionIntro
        eyebrow={sectionEyebrow("trustees")}
        title="Trustees"
        description="Invite as many trustees as required — there is no ownership percentage on this list. A corporate trustee then completes a full company application (directors, shareholders and nested owners). Those directors are not added separately here."
        icon={UsersRound}
      />
      <div className="space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
          <SubsectionHeading
            title="Add a trustee"
            description="KYC invitations are sent after the trust application is submitted. Corporate trustees then complete company profile, business, directors, shareholders, documents and signature — not bank or cash accounts."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Trustee type"
              htmlFor="trusteesType"
              error={draftErrors.type}
            >
              <CustomSelect
                id="trusteesType"
                value={draft.type}
                onChange={(value) =>
                  updateDraft({
                    type: value as PartyType,
                    companyType: value === "corporate" ? draft.companyType : "",
                    directors: value === "corporate" ? draft.directors : [],
                  })
                }
                options={PARTY_TYPE_OPTIONS}
                placeholder="Select type"
                error={Boolean(draftErrors.type)}
              />
            </Field>
            {draft.type === "corporate" ? (
              <Field
                label="Company type"
                htmlFor="trusteesCompanyType"
                error={draftErrors.companyType}
              >
                <CustomSelect
                  id="trusteesCompanyType"
                  value={draft.companyType}
                  onChange={(value) =>
                    updateDraft({
                      companyType: value as typeof draft.companyType,
                    })
                  }
                  options={CORPORATE_ENTITY_TYPE_OPTIONS}
                  placeholder="Select company structure"
                  error={Boolean(draftErrors.companyType)}
                />
              </Field>
            ) : null}
            <Field
              label="Full name"
              htmlFor="trusteesName"
              error={draftErrors.name}
            >
              <input
                id="trusteesName"
                value={draft.name}
                onChange={(event) => updateDraft({ name: event.target.value })}
                placeholder={
                  draft.type === "corporate"
                    ? "Registered company name"
                    : "Full legal name"
                }
                className={inputClass(Boolean(draftErrors.name))}
              />
            </Field>
            <Field
              label="Email"
              htmlFor="trusteesEmail"
              error={draftErrors.email}
            >
              <input
                id="trusteesEmail"
                type="email"
                value={draft.email}
                onChange={(event) => updateDraft({ email: event.target.value })}
                placeholder="name@example.com"
                className={inputClass(Boolean(draftErrors.email))}
              />
            </Field>
            <Field
              label="Phone number"
              htmlFor="trusteesPhone"
              error={draftErrors.phone}
            >
              <input
                id="trusteesPhone"
                type="tel"
                value={draft.phone}
                onChange={(event) => updateDraft({ phone: event.target.value })}
                placeholder="Phone number"
                className={inputClass(Boolean(draftErrors.phone))}
              />
            </Field>
          </div>
          {draft.type === "corporate" ? (
            <p className="mt-4 rounded-xl border border-[rgba(0,52,120,0.14)] bg-white px-4 py-3 text-xs leading-5 text-slate-600">
              After you add this corporate trustee, fill its company
              application. Directors listed there become the trustee’s directors
              automatically.
            </p>
          ) : null}
          <button
            type="button"
            onClick={add}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63]"
          >
            <Plus className="h-4 w-4" /> Add trustee
          </button>
        </section>

        <section>
          <SubsectionHeading
            title={`Saved trustees (${form.trustees.length})`}
            description="Select one saved trustee as the communication recipient below. Corporate trustees must complete their nested company application first."
          />
          <div className="space-y-3">
            {form.trustees.length ? (
              form.trustees.map((party, index) => {
                const directors = corporateTrusteeDirectors(party);
                const corporateComplete =
                  party.type !== "corporate" ||
                  isCorporateTrusteeApplicationComplete(party);
                return (
                  <div
                    key={party.id}
                    className={`rounded-2xl border bg-white p-4 ${party.type === "corporate" && !corporateComplete ? "border-amber-200" : "border-slate-200"}`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                        {party.type === "corporate" ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <UserRound className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-950">
                          {index + 1}. {party.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {party.type === "corporate"
                            ? `Corporate · ${directors.length} director${directors.length === 1 ? "" : "s"} from nested application`
                            : "Individual"}{" "}
                          · {party.email} · {party.phone}
                        </p>
                      </div>
                      {form.trust.defaultRecipientId === party.id ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003478]">
                          <CheckCircle2 className="h-4 w-4" /> Default recipient
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dce7f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#0f172a]">
                          <Mail className="h-3 w-3 text-[#003478]" /> Invite
                          queued
                        </span>
                      )}
                      {party.type === "corporate" ? (
                        <button
                          type="button"
                          onClick={() => setActiveTrusteeId(party.id)}
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#003478]/20 bg-white px-3.5 text-xs font-semibold text-[#003478] transition hover:bg-[#f3f7fb]"
                        >
                          {corporateComplete
                            ? "Review company application"
                            : "Fill company application"}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeTrustParty("trustees", party.id)}
                        aria-label={`Remove ${party.name}`}
                        className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {party.type === "corporate" ? (
                      <div className="mt-3 rounded-xl bg-slate-50 px-3 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                          Directors from company application
                        </p>
                        {directors.length ? (
                          <ul className="mt-2 space-y-1.5">
                            {directors.map((director) => (
                              <li
                                key={director.id}
                                className="text-xs text-slate-600"
                              >
                                {director.name} · {director.email} ·{" "}
                                {director.phone}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-xs text-amber-700">
                            No directors yet. Complete the nested directors
                            section.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No trustees added yet.
              </div>
            )}
          </div>
          {errors.trustees ? (
            <p className="mt-3 text-xs font-medium text-red-600">
              {errors.trustees}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <SubsectionHeading
            title="Trustees declaration"
            description="The trustee count is calculated automatically from the saved records above."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Number of trustees"
              htmlFor="trusteesCount"
              error={errors.trusteeCount}
              hint="Calculated automatically from saved trustees."
            >
              <input
                id="trusteesCount"
                type="number"
                value={form.trustees.length}
                readOnly
                aria-readonly="true"
                className={`${inputClass(Boolean(errors.trusteeCount))} cursor-not-allowed bg-slate-100/80 text-slate-700`}
              />
            </Field>
            <Field
              label="Default communication recipient"
              htmlFor="defaultTrustee"
              error={errors.defaultTrustee}
            >
              <CustomSelect
                id="defaultTrustee"
                value={form.trust.defaultRecipientId}
                onChange={(value) => updateTrust("defaultRecipientId", value)}
                options={recipientOptions}
                placeholder={
                  form.trustees.length
                    ? "Select a trustee"
                    : "Add a trustee first"
                }
                disabled={!form.trustees.length}
                error={Boolean(errors.defaultTrustee)}
              />
            </Field>
          </div>
        </section>
      </div>
    </div>
  );
}
