import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  GitBranch,
  Info,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import {
  CORPORATE_ENTITY_TYPE_OPTIONS,
  SHAREHOLDER_PARTY_TYPE_OPTIONS,
  SHAREHOLDER_TRUST_TYPE_OPTIONS,
} from "../config";
import { createEmptyBeneficiary } from "../initialState";
import {
  getShareholderDraftErrors,
  isShareholderApplicationComplete,
  requiresShareholderApplication,
  type PartyDraftErrors,
} from "../applicationLogic";
import { ShareholderApplicationScreen } from "../components/ShareholderApplicationScreen";
import { OwnershipHierarchyGraph } from "../components/OwnershipHierarchyGraph";
import {
  Field,
  SectionIntro,
  SubsectionHeading,
  inputClass,
} from "../components/FormPrimitives";
import type { PartyType, TrustBeneficiary } from "../types";
import type { OnboardingController } from "../useOnboardingController";

const cleanPercentage = (value: number) =>
  value.toFixed(2).replace(/\.00$/, "");

export function TrustBeneficiariesStep({
  controller,
}: {
  controller: OnboardingController;
}) {
  const {
    form,
    errors,
    sectionEyebrow,
    addBeneficiary,
    updateBeneficiary,
    removeBeneficiary,
    updateTrust,
    confirmAllBeneficiaries,
    beneficiaryPercentageTotal,
    canConfirmBeneficiaries,
    openDocumentPreview,
  } = controller;
  const [draft, setDraft] = useState<TrustBeneficiary>(createEmptyBeneficiary);
  const [draftErrors, setDraftErrors] = useState<PartyDraftErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeApplication, setActiveApplication] = useState<{
    rootId: string;
    path: string[];
  } | null>(null);
  const activeBeneficiary = form.beneficiaries.find(
    (beneficiary) => beneficiary.id === activeApplication?.rootId,
  );
  const structureSaved =
    form.trust.beneficiariesConfirmed &&
    Math.abs(beneficiaryPercentageTotal - 100) < 0.0001;
  const editingBeneficiary = form.beneficiaries.find(
    (beneficiary) => beneficiary.id === editingId,
  );
  const allocatedExcludingDraft =
    beneficiaryPercentageTotal - (Number(editingBeneficiary?.percentage) || 0);
  const remainingInterest = Math.max(0, 100 - allocatedExcludingDraft);
  const remainingLabel = cleanPercentage(remainingInterest);

  const updateDraft = (patch: Partial<TrustBeneficiary>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setDraftErrors((current) => {
      const next = { ...current };
      Object.keys(patch).forEach((key) => {
        delete next[key as keyof PartyDraftErrors];
      });
      return next;
    });
  };

  const resetDraft = () => {
    setDraft(createEmptyBeneficiary());
    setDraftErrors({});
    setEditingId(null);
  };

  const beginEdit = (beneficiary: TrustBeneficiary) => {
    setDraft({ ...beneficiary });
    setDraftErrors({});
    setEditingId(beneficiary.id);
  };

  const add = () => {
    const nextErrors = getShareholderDraftErrors(draft, remainingInterest);
    setDraftErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (editingId) {
      updateBeneficiary(draft);
      updateTrust("beneficiariesConfirmed", false);
    } else {
      addBeneficiary(draft);
    }
    resetDraft();
  };

  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      {activeBeneficiary && structureSaved ? (
        <ShareholderApplicationScreen
          shareholder={activeBeneficiary}
          initialOwnerPath={activeApplication?.path || []}
          onChange={updateBeneficiary}
          onOpenDocument={openDocumentPreview}
          onClose={() => setActiveApplication(null)}
          role="beneficiary"
        />
      ) : null}

      <SectionIntro
        eyebrow={sectionEyebrow("beneficiaries")}
        title="Beneficiaries"
        description="Record each individual, corporate entity or trust beneficiary and its direct beneficial-interest percentage."
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
                Build the trust’s complete beneficiary structure.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add every direct beneficiary and bring the allocated beneficial
                interests to exactly 100%. Save the structure to reveal each
                application and the complete interconnection graph.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#003478] ring-1 ring-[rgba(0,52,120,0.12)]">
                <GitBranch className="h-4 w-4" /> Corporate entities and trusts
                at or above 25% require recursive disclosure until an individual
                ultimate beneficial owner is identified.
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50/55 p-5 sm:p-6">
          <SubsectionHeading
            title={editingId ? "Edit beneficiary" : "Add a beneficiary"}
            description="Choose the beneficiary structure so the application can create the appropriate beneficial-ownership path."
          />
          <div
            className={`mb-5 flex flex-col gap-2 rounded-xl border px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between ${Math.abs(beneficiaryPercentageTotal - 100) < 0.0001 ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}
          >
            <span className="font-semibold">
              Total beneficial interests must equal exactly 100%.
            </span>
            <span className="font-bold tabular-nums">
              Allocated {cleanPercentage(beneficiaryPercentageTotal)}% ·
              Remaining {remainingLabel}%
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Beneficiary type"
              htmlFor="beneficiaryType"
              error={draftErrors.type}
            >
              <CustomSelect
                id="beneficiaryType"
                value={draft.type}
                onChange={(value) =>
                  updateDraft({
                    type: value as PartyType,
                    companyType: value === "corporate" ? draft.companyType : "",
                    trustType: value === "trust" ? draft.trustType : "",
                  })
                }
                options={SHAREHOLDER_PARTY_TYPE_OPTIONS}
                placeholder="Select type"
                error={Boolean(draftErrors.type)}
              />
            </Field>
            {draft.type === "corporate" ? (
              <Field
                label="Company structure"
                htmlFor="beneficiaryCompanyType"
                error={draftErrors.companyType}
              >
                <CustomSelect
                  id="beneficiaryCompanyType"
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
            {draft.type === "trust" ? (
              <Field
                label="Trust structure"
                htmlFor="beneficiaryTrustType"
                error={draftErrors.trustType}
              >
                <CustomSelect
                  id="beneficiaryTrustType"
                  value={draft.trustType}
                  onChange={(value) =>
                    updateDraft({ trustType: value as typeof draft.trustType })
                  }
                  options={SHAREHOLDER_TRUST_TYPE_OPTIONS}
                  placeholder="Select trust structure"
                  error={Boolean(draftErrors.trustType)}
                />
              </Field>
            ) : null}
            <Field
              label="Beneficial-interest percentage"
              htmlFor="beneficiaryPercentage"
              error={draftErrors.percentage}
              hint={`Maximum available: ${remainingLabel}%`}
            >
              <input
                id="beneficiaryPercentage"
                type="number"
                min="0.01"
                max={remainingInterest}
                step="0.01"
                value={draft.percentage}
                onChange={(event) =>
                  updateDraft({ percentage: event.target.value })
                }
                placeholder={
                  remainingInterest > 0
                    ? `Up to ${remainingLabel}`
                    : "100% allocated"
                }
                disabled={!editingId && remainingInterest <= 0}
                className={inputClass(Boolean(draftErrors.percentage))}
              />
            </Field>
            <Field
              label="Full legal name"
              htmlFor="beneficiaryName"
              error={draftErrors.name}
            >
              <input
                id="beneficiaryName"
                value={draft.name}
                onChange={(event) => updateDraft({ name: event.target.value })}
                placeholder="Person, entity or trust name"
                className={inputClass(Boolean(draftErrors.name))}
              />
            </Field>
            <Field
              label={draft.type === "trust" ? "Trust contact email" : "Email"}
              htmlFor="beneficiaryEmail"
              error={draftErrors.email}
            >
              <input
                id="beneficiaryEmail"
                name="new-beneficiary-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                value={draft.email}
                onChange={(event) =>
                  updateDraft({ email: event.currentTarget.value })
                }
                placeholder={
                  draft.type === "trust"
                    ? "trust.contact@example.com"
                    : "name@example.com"
                }
                className={inputClass(Boolean(draftErrors.email))}
              />
            </Field>
            <Field
              label="Phone number"
              htmlFor="beneficiaryPhone"
              error={draftErrors.phone}
            >
              <input
                id="beneficiaryPhone"
                type="tel"
                value={draft.phone}
                onChange={(event) => updateDraft({ phone: event.target.value })}
                placeholder="Phone number"
                className={inputClass(Boolean(draftErrors.phone))}
              />
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={add}
              disabled={!editingId && remainingInterest <= 0}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {editingId ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}{" "}
              {editingId
                ? "Save beneficiary"
                : remainingInterest <= 0
                  ? "100% allocated"
                  : "Add beneficiary"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetDraft}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            ) : null}
          </div>
        </section>

        <section>
          <SubsectionHeading
            title={`Saved beneficiaries (${form.beneficiaries.length})`}
            description={
              structureSaved
                ? "The structure is saved. Open each available beneficiary application below."
                : "Bring the direct beneficial-interest total to exactly 100%, then save the structure to unlock applications and the interconnection graph."
            }
          />
          <div className="space-y-3">
            {form.beneficiaries.length ? (
              form.beneficiaries.map((beneficiary, index) => {
                const required = requiresShareholderApplication(beneficiary);
                const complete = isShareholderApplicationComplete(beneficiary);
                const typeLabel =
                  beneficiary.type === "corporate"
                    ? "Corporate entity"
                    : beneficiary.type === "trust"
                      ? "Trust"
                      : "Individual";
                return (
                  <div
                    key={beneficiary.id}
                    className={`rounded-2xl border bg-white p-4 transition ${structureSaved && required && !complete ? "border-amber-200" : "border-slate-200"}`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                        {beneficiary.type === "corporate" ? (
                          <Building2 className="h-4 w-4" />
                        ) : beneficiary.type === "trust" ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <UserRound className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-950">
                          {index + 1}. {beneficiary.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {typeLabel} · {beneficiary.percentage}% ·{" "}
                          {beneficiary.email}
                        </p>
                      </div>
                      {structureSaved ? (
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
                        {structureSaved ? (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveApplication({
                                rootId: beneficiary.id,
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
                          onClick={() => beginEdit(beneficiary)}
                          aria-label={`Edit ${beneficiary.name}`}
                          className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-[#f3f7fb] hover:text-[#003478]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (editingId === beneficiary.id) resetDraft();
                            removeBeneficiary(beneficiary.id);
                          }}
                          aria-label={`Remove ${beneficiary.name}`}
                          className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {structureSaved && required && !complete ? (
                      <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                        <GitBranch className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        This {typeLabel.toLowerCase()} holds at least 25%.
                        Complete its application and every required ownership
                        layer.
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No beneficiaries added yet.
              </div>
            )}
          </div>
          {errors.beneficiaries ? (
            <p className="mt-3 text-xs font-medium text-red-600">
              {errors.beneficiaries}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <SubsectionHeading
            title="Save the direct beneficiary structure"
            description="The beneficiary count and beneficial-interest total are calculated automatically. At exactly 100%, save the structure to unlock the graph and beneficiary applications."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Number of beneficiaries"
              htmlFor="beneficiaryCount"
              error={errors.beneficiaryCount}
              hint="Calculated automatically from saved beneficiaries."
            >
              <input
                id="beneficiaryCount"
                type="number"
                value={form.beneficiaries.length}
                readOnly
                aria-readonly="true"
                className={`${inputClass(Boolean(errors.beneficiaryCount))} cursor-not-allowed bg-slate-100/80 text-slate-700`}
              />
            </Field>
            <Field
              label="Total direct beneficial interests"
              htmlFor="beneficiaryTotal"
              error={errors.beneficiaryTotal}
              hint="Must equal exactly 100%."
            >
              <div className="relative">
                <input
                  id="beneficiaryTotal"
                  value={cleanPercentage(beneficiaryPercentageTotal)}
                  readOnly
                  aria-readonly="true"
                  className={`${inputClass(Boolean(errors.beneficiaryTotal))} cursor-not-allowed bg-slate-100/80 pr-10 text-slate-700`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                  %
                </span>
              </div>
            </Field>
          </div>
          <div
            className={`mt-5 flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${form.trust.beneficiariesConfirmed ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-slate-50"}`}
          >
            <div className="flex items-start gap-3">
              {form.trust.beneficiariesConfirmed ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              ) : (
                <GitBranch className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {form.trust.beneficiariesConfirmed
                    ? "Direct structure saved"
                    : "Ready to save?"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {form.trust.beneficiariesConfirmed
                    ? "The total is 100%. The graph and beneficiary application actions are now available."
                    : "Complete each beneficiary record and bring direct beneficial interests to exactly 100%."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={confirmAllBeneficiaries}
              disabled={
                !canConfirmBeneficiaries || form.trust.beneficiariesConfirmed
              }
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <CheckCircle2 className="h-4 w-4" />{" "}
              {form.trust.beneficiariesConfirmed
                ? "All beneficiaries saved"
                : "Save all beneficiaries"}
            </button>
          </div>
        </section>

        {structureSaved ? (
          <OwnershipHierarchyGraph
            companyName={form.trust.name}
            shareholders={form.beneficiaries}
            onOpen={(rootId, path) => setActiveApplication({ rootId, path })}
            context="beneficiaries"
          />
        ) : null}
      </div>
    </div>
  );
}
