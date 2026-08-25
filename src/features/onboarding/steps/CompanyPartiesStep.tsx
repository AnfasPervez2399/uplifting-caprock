import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  GitBranch,
  Info,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import {
  CORPORATE_ENTITY_TYPE_OPTIONS,
  SHAREHOLDER_PARTY_TYPE_OPTIONS,
  SHAREHOLDER_TRUST_TYPE_OPTIONS,
} from "../config";
import { createEmptyDirector, createEmptyShareholder } from "../initialState";
import {
  isCompleteDirector,
  isCompleteShareholder,
  isShareholderApplicationComplete,
  requiresShareholderApplication,
} from "../applicationLogic";
import { ShareholderApplicationScreen } from "../components/ShareholderApplicationScreen";
import { OwnershipHierarchyGraph } from "../components/OwnershipHierarchyGraph";
import {
  Field,
  SectionIntro,
  SubsectionHeading,
  inputClass,
} from "../components/FormPrimitives";
import type { CompanyDirector, CompanyShareholder, PartyType } from "../types";
import type { OnboardingController } from "../useOnboardingController";

const queuedBadge = (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dce7f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#0f172a]">
    <Mail className="h-3 w-3 text-[#003478]" /> Invite queued
  </span>
);

export function CompanyDirectorsStep({
  controller,
}: {
  controller: OnboardingController;
}) {
  const {
    form,
    errors,
    sectionEyebrow,
    updateCompany,
    addDirector,
    removeDirector,
  } = controller;
  const [draft, setDraft] = useState<CompanyDirector>(createEmptyDirector);
  const [draftError, setDraftError] = useState("");
  const add = () => {
    if (!isCompleteDirector(draft)) {
      setDraftError(
        "Enter the director’s full name, valid email and phone number.",
      );
      return;
    }
    addDirector(draft);
    setDraft(createEmptyDirector());
    setDraftError("");
  };
  const recipientOptions = form.directors.map((director) => ({
    value: director.id,
    label: director.name,
    description: director.email,
  }));

  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("directors")}
        title="M.D. & Owners"
        description="List every director or partner and select the person who will receive company communications."
        icon={UsersRound}
      />
      <div className="space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
          <SubsectionHeading
            title="Add a director or partner"
            description="Invitations are queued now and sent when the entity application is submitted."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Full name" htmlFor="directorName">
              <input
                id="directorName"
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Full legal name"
                className={inputClass()}
              />
            </Field>
            <Field label="Email" htmlFor="directorEmail">
              <input
                id="directorEmail"
                type="email"
                value={draft.email}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="name@example.com"
                className={inputClass()}
              />
            </Field>
            <Field label="Phone number" htmlFor="directorPhone">
              <input
                id="directorPhone"
                type="tel"
                value={draft.phone}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="Phone number"
                className={inputClass()}
              />
            </Field>
          </div>
          {draftError ? (
            <p className="mt-3 text-xs font-medium text-red-600">
              {draftError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={add}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63]"
          >
            <Plus className="h-4 w-4" /> Add director
          </button>
        </section>

        <section>
          <SubsectionHeading
            title={`Saved directors (${form.directors.length})`}
            description="Each director completes their own identity onboarding after the application is submitted."
          />
          <div className="space-y-3">
            {form.directors.length ? (
              form.directors.map((director, index) => (
                <div
                  key={director.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-950">
                      {index + 1}. {director.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {director.email} · {director.phone}
                    </p>
                  </div>
                  {form.company.defaultRecipientId === director.id ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003478]">
                      <CheckCircle2 className="h-4 w-4" /> Default recipient
                    </span>
                  ) : (
                    queuedBadge
                  )}
                  <button
                    type="button"
                    onClick={() => removeDirector(director.id)}
                    aria-label={`Remove ${director.name}`}
                    className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No directors added yet.
              </div>
            )}
          </div>
          {errors.directors ? (
            <p className="mt-3 text-xs font-medium text-red-600">
              {errors.directors}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <SubsectionHeading
            title="Director declaration"
            description="The director or partner count is calculated automatically from the saved records above."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Number of directors or partners"
              htmlFor="directorCount"
              error={errors.directorCount}
              hint="Calculated automatically from saved directors and partners."
            >
              <input
                id="directorCount"
                type="number"
                value={form.directors.length}
                readOnly
                aria-readonly="true"
                className={`${inputClass(Boolean(errors.directorCount))} cursor-not-allowed bg-slate-100/80 text-slate-700`}
              />
            </Field>
            <Field
              label="Default communication recipient"
              htmlFor="defaultDirector"
              error={errors.defaultDirector}
            >
              <CustomSelect
                id="defaultDirector"
                value={form.company.defaultRecipientId}
                onChange={(value) => updateCompany("defaultRecipientId", value)}
                options={recipientOptions}
                placeholder={
                  form.directors.length
                    ? "Select a director"
                    : "Add a director first"
                }
                disabled={!form.directors.length}
                error={Boolean(errors.defaultDirector)}
              />
            </Field>
          </div>
        </section>
      </div>
    </div>
  );
}

export function CompanyShareholdersStep({
  controller,
}: {
  controller: OnboardingController;
}) {
  const {
    form,
    errors,
    sectionEyebrow,
    addShareholder,
    updateShareholder,
    removeShareholder,
    confirmAllShareholders,
    shareholderPercentageTotal,
    canConfirmShareholders,
    isPrivateCompany,
    openDocumentPreview,
  } = controller;
  const [draft, setDraft] = useState<CompanyShareholder>(
    createEmptyShareholder,
  );
  const [draftError, setDraftError] = useState("");
  const [activeApplication, setActiveApplication] = useState<{
    rootId: string;
    path: string[];
  } | null>(null);
  const activeShareholder = form.shareholders.find(
    (shareholder) => shareholder.id === activeApplication?.rootId,
  );
  const shareholderStructureSaved =
    form.company.shareholdersConfirmed &&
    Math.abs(shareholderPercentageTotal - 100) < 0.0001;
  const remainingOwnership = Math.max(0, 100 - shareholderPercentageTotal);
  const remainingOwnershipLabel = remainingOwnership
    .toFixed(2)
    .replace(/\.00$/, "");

  const updateDraftPercentage = (value: string) => {
    if (value !== "" && Number(value) > remainingOwnership) {
      setDraftError(
        `Total ownership cannot exceed 100%. You can allocate up to ${remainingOwnershipLabel}% more.`,
      );
      return;
    }
    setDraft((current) => ({ ...current, percentage: value }));
    setDraftError("");
  };

  const add = () => {
    if (
      shareholderPercentageTotal + (Number(draft.percentage) || 0) >
      100.0001
    ) {
      setDraftError(
        `Total ownership cannot exceed 100%. You can allocate up to ${remainingOwnershipLabel}% more.`,
      );
      return;
    }
    if (!isCompleteShareholder(draft)) {
      setDraftError(
        "Complete the shareholder type, structure where applicable, ownership percentage, full name, valid email and phone number.",
      );
      return;
    }
    addShareholder(draft);
    setDraft(createEmptyShareholder());
    setDraftError("");
  };

  if (!isPrivateCompany) return null;

  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      {activeShareholder && shareholderStructureSaved ? (
        <ShareholderApplicationScreen
          shareholder={activeShareholder}
          initialOwnerPath={activeApplication?.path || []}
          onChange={updateShareholder}
          onOpenDocument={openDocumentPreview}
          onClose={() => setActiveApplication(null)}
        />
      ) : null}

      <SectionIntro
        eyebrow={sectionEyebrow("shareholders")}
        title="Shareholders"
        description="Record each individual, corporate entity or trust shareholder and its ownership percentage."
        icon={UsersRound}
      />
      <div className="space-y-8">
        <section className="overflow-hidden rounded-2xl border border-[rgba(0,52,120,0.17)] bg-[#f3f7fb]">
          <div className="flex items-start gap-4 p-5 sm:p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]">
              <Info className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Please provide shareholder details for your company here.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                First add every direct shareholder and bring the total ownership
                to exactly 100%. Save the shareholder structure to reveal the
                overall interconnection graph and each shareholder application.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#003478] ring-1 ring-[rgba(0,52,120,0.12)]">
                <GitBranch className="h-4 w-4" /> After saving, complete
                applications at or above the 25% threshold and disclose
                ownership recursively.
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
          <SubsectionHeading
            title="Add a shareholder"
            description="Choose the correct shareholder structure so the application can create the appropriate ownership path."
          />
          <div
            className={`mb-5 flex flex-col gap-2 rounded-xl border px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between ${Math.abs(shareholderPercentageTotal - 100) < 0.0001 ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}
          >
            <span className="font-semibold">
              Total ownership must equal exactly 100%.
            </span>
            <span className="font-bold tabular-nums">
              Allocated{" "}
              {shareholderPercentageTotal.toFixed(2).replace(/\.00$/, "")}% ·
              Remaining {remainingOwnershipLabel}%
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Shareholder type" htmlFor="shareholderType">
              <CustomSelect
                id="shareholderType"
                value={draft.type}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    type: value as PartyType,
                    companyType:
                      value === "corporate" ? current.companyType : "",
                    trustType: value === "trust" ? current.trustType : "",
                  }))
                }
                options={SHAREHOLDER_PARTY_TYPE_OPTIONS}
                placeholder="Select type"
              />
            </Field>
            {draft.type === "corporate" ? (
              <Field label="Company structure" htmlFor="shareholderCompanyType">
                <CustomSelect
                  id="shareholderCompanyType"
                  value={draft.companyType}
                  onChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      companyType: value as typeof current.companyType,
                    }))
                  }
                  options={CORPORATE_ENTITY_TYPE_OPTIONS}
                  placeholder="Select company structure"
                />
              </Field>
            ) : null}
            {draft.type === "trust" ? (
              <Field label="Trust structure" htmlFor="shareholderTrustType">
                <CustomSelect
                  id="shareholderTrustType"
                  value={draft.trustType}
                  onChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      trustType: value as typeof current.trustType,
                    }))
                  }
                  options={SHAREHOLDER_TRUST_TYPE_OPTIONS}
                  placeholder="Select trust structure"
                />
              </Field>
            ) : null}
            <Field
              label="Ownership percentage"
              htmlFor="shareholderPercentage"
              hint={`Maximum available: ${remainingOwnershipLabel}%`}
            >
              <input
                id="shareholderPercentage"
                type="number"
                min="0.01"
                max={remainingOwnership}
                step="0.01"
                value={draft.percentage}
                onChange={(event) => updateDraftPercentage(event.target.value)}
                placeholder={
                  remainingOwnership > 0
                    ? `Up to ${remainingOwnershipLabel}`
                    : "100% allocated"
                }
                disabled={remainingOwnership <= 0}
                className={inputClass()}
              />
            </Field>
            <Field label="Full legal name" htmlFor="shareholderName">
              <input
                id="shareholderName"
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Person, entity or trust name"
                className={inputClass()}
              />
            </Field>
            <Field
              label={draft.type === "trust" ? "Trust contact email" : "Email"}
              htmlFor="shareholderEmail"
            >
              <input
                id="shareholderEmail"
                name="new-shareholder-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                value={draft.email}
                onChange={(event) => {
                  const email = event.currentTarget.value;
                  setDraft((current) => ({ ...current, email }));
                }}
                placeholder={
                  draft.type === "trust"
                    ? "trust.contact@example.com"
                    : "name@example.com"
                }
                className={inputClass()}
              />
            </Field>
            <Field label="Phone number" htmlFor="shareholderPhone">
              <input
                id="shareholderPhone"
                type="tel"
                value={draft.phone}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="Phone number"
                className={inputClass()}
              />
            </Field>
          </div>
          {draftError ? (
            <p className="mt-3 text-xs font-medium text-red-600">
              {draftError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={add}
            disabled={remainingOwnership <= 0}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Plus className="h-4 w-4" />{" "}
            {remainingOwnership <= 0 ? "100% allocated" : "Add shareholder"}
          </button>
        </section>

        <section>
          <SubsectionHeading
            title={`Saved shareholders (${form.shareholders.length})`}
            description={
              shareholderStructureSaved
                ? "The structure is saved. Open each available shareholder application below."
                : "Bring the direct ownership total to exactly 100%, then save the structure to unlock shareholder applications and the interconnection graph."
            }
          />
          <div className="space-y-3">
            {form.shareholders.length ? (
              form.shareholders.map((shareholder, index) => {
                const required = requiresShareholderApplication(shareholder);
                const complete = isShareholderApplicationComplete(shareholder);
                const typeLabel =
                  shareholder.type === "corporate"
                    ? "Corporate entity"
                    : shareholder.type === "trust"
                      ? "Trust"
                      : "Individual";
                return (
                  <div
                    key={shareholder.id}
                    className={`rounded-2xl border bg-white p-4 transition ${shareholderStructureSaved && required && !complete ? "border-amber-200" : "border-slate-200"}`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                        {shareholder.type === "corporate" ? (
                          <Building2 className="h-4 w-4" />
                        ) : shareholder.type === "trust" ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <UserRound className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-950">
                          {index + 1}. {shareholder.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {typeLabel} · {shareholder.percentage}% ·{" "}
                          {shareholder.email}
                        </p>
                      </div>
                      {shareholderStructureSaved ? (
                        <span
                          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] ${complete ? "bg-emerald-50 text-emerald-700" : required ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          {complete ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Info className="h-3 w-3" />
                          )}
                          {complete
                            ? "Application complete"
                            : required
                              ? "Application required"
                              : "Application available"}
                        </span>
                      ) : (
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-slate-500">
                          <Info className="h-3 w-3" />
                          Awaiting 100% save
                        </span>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        {shareholderStructureSaved ? (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveApplication({
                                rootId: shareholder.id,
                                path: [],
                              })
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#003478]/20 bg-white px-3.5 text-xs font-semibold text-[#003478] transition hover:bg-[#f3f7fb]"
                          >
                            {complete
                              ? "Review application"
                              : "Fill application"}
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removeShareholder(shareholder.id)}
                          aria-label={`Remove ${shareholder.name}`}
                          className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {shareholderStructureSaved && required && !complete ? (
                      <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                        <GitBranch className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        This {typeLabel.toLowerCase()} owns at least 25%.
                        Complete its profile and every required ownership layer.
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No shareholders added yet.
              </div>
            )}
          </div>
          {errors.shareholders ? (
            <p className="mt-3 text-xs font-medium text-red-600">
              {errors.shareholders}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <SubsectionHeading
            title="Save the direct shareholder structure"
            description="The shareholder count and ownership total are calculated automatically. At exactly 100%, save the structure to unlock the graph and shareholder applications."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Number of shareholders or partners"
              htmlFor="shareholderCount"
              error={errors.shareholderCount}
              hint="Calculated automatically from saved shareholders."
            >
              <input
                id="shareholderCount"
                type="number"
                value={form.shareholders.length}
                readOnly
                aria-readonly="true"
                className={`${inputClass(Boolean(errors.shareholderCount))} cursor-not-allowed bg-slate-100/80 text-slate-700`}
              />
            </Field>
            <Field
              label="Total direct ownership"
              htmlFor="shareholderTotal"
              error={errors.shareholderTotal}
              hint="Must equal exactly 100%."
            >
              <div className="relative">
                <input
                  id="shareholderTotal"
                  value={shareholderPercentageTotal
                    .toFixed(2)
                    .replace(/\.00$/, "")}
                  readOnly
                  aria-readonly="true"
                  className={`${inputClass(Boolean(errors.shareholderTotal))} cursor-not-allowed bg-slate-100/80 pr-10 text-slate-700`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                  %
                </span>
              </div>
            </Field>
          </div>
          <div
            className={`mt-5 flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${form.company.shareholdersConfirmed ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-slate-50"}`}
          >
            <div className="flex items-start gap-3">
              {form.company.shareholdersConfirmed ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              ) : (
                <GitBranch className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {form.company.shareholdersConfirmed
                    ? "Direct structure saved"
                    : "Ready to save?"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {form.company.shareholdersConfirmed
                    ? "The total is 100%. The overall graph is shown below and shareholder application actions are now available above."
                    : "Complete each shareholder record and bring direct ownership to exactly 100%."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={confirmAllShareholders}
              disabled={
                !canConfirmShareholders || form.company.shareholdersConfirmed
              }
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <CheckCircle2 className="h-4 w-4" />{" "}
              {form.company.shareholdersConfirmed
                ? "All shareholders saved"
                : "Save all shareholders"}
            </button>
          </div>
        </section>

        {shareholderStructureSaved ? (
          <OwnershipHierarchyGraph
            companyName={form.company.name}
            shareholders={form.shareholders}
            onOpen={(rootId, path) => setActiveApplication({ rootId, path })}
          />
        ) : null}
      </div>
    </div>
  );
}
