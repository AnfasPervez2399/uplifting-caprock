import {
  AlertCircle,
  Check,
  Eye,
  Landmark,
  PencilLine,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { CustomSelect } from "../../../components/ui/CustomSelect";

import { BANK_CURRENCY_OPTIONS } from "../config";
import {
  DocumentUpload,
  Field,
  SectionIntro,
  SubsectionHeading,
  inputClass,
  textareaClass,
} from "../components/FormPrimitives";

import { createEmptyBank } from "../initialState";
import { documentFromFile } from "../utils";
import type { OnboardingController } from "../useOnboardingController";

interface StepProps {
  controller: OnboardingController;
}

export function BankStep({ controller }: StepProps) {
  const {
    form,
    bankDraft,
    setBankDraft,
    editingBankId,
    setEditingBankId,
    errors,
    sectionEyebrow,
    openDocumentPreview,
    updateBankDraft,
    saveBankAccount,
    editBankAccount,
    removeBankAccount,
  } = controller;

  const renderBank = () => (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("bank")}
        title="External Bank Account"
        description="Add one or more verified accounts that may be used for transfers and settlement."
        icon={Landmark}
      />

      <div className="space-y-6">
        {form.bankAccounts.length > 0 ? (
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <SubsectionHeading
                title="Saved bank accounts"
                description="Each account requires independent verification evidence."
              />
              {!bankDraft ? (
                <button
                  type="button"
                  onClick={() => setBankDraft(createEmptyBank())}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63]"
                >
                  <Plus className="h-4 w-4" />
                  Add account
                </button>
              ) : null}
            </div>
            <div className="space-y-3">
              {form.bankAccounts.map((account, index) => (
                <div
                  key={account.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {account.bankName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {account.currency} · ••••{" "}
                      {account.accountNumber.slice(-4)} · SWIFT{" "}
                      {account.swiftCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.verificationDocument ? (
                      <button
                        type="button"
                        onClick={() =>
                          openDocumentPreview(
                            account.verificationDocument!,
                            "Bank verification document",
                          )
                        }
                        className="mr-auto inline-flex items-center gap-1.5 rounded-full bg-[#dce7f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-800 transition hover:text-[#003478] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20 sm:mr-2"
                      >
                        <Eye className="h-3 w-3" /> Open verified file
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => editBankAccount(account)}
                      aria-label={`Edit bank account ${index + 1}`}
                      className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-[#003478]"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBankAccount(account.id)}
                      aria-label={`Remove bank account ${index + 1}`}
                      className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {bankDraft ? (
          <section className="rounded-2xl border border-[rgba(0,52,120,0.15)] bg-[rgba(0,52,120,0.025)] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <SubsectionHeading
                title={
                  editingBankId
                    ? "Edit external account"
                    : form.bankAccounts.length
                      ? "Add another external account"
                      : "External account details"
                }
                description="Enter the details exactly as they appear on the bank record."
              />
              {form.bankAccounts.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setBankDraft(null);
                    setEditingBankId(null);
                  }}
                  aria-label="Close bank account form"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Bank name" htmlFor="bankName">
                <input
                  id="bankName"
                  value={bankDraft.bankName}
                  onChange={(event) =>
                    updateBankDraft("bankName", event.target.value)
                  }
                  placeholder="Financial institution name"
                  className={inputClass()}
                />
              </Field>
              <Field label="SWIFT / BIC code" htmlFor="swiftCode">
                <input
                  id="swiftCode"
                  value={bankDraft.swiftCode}
                  onChange={(event) =>
                    updateBankDraft(
                      "swiftCode",
                      event.target.value.toUpperCase(),
                    )
                  }
                  placeholder="8 or 11 characters"
                  className={inputClass()}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Bank address" htmlFor="bankAddress">
                  <textarea
                    id="bankAddress"
                    value={bankDraft.bankAddress}
                    onChange={(event) =>
                      updateBankDraft("bankAddress", event.target.value)
                    }
                    placeholder="Branch or registered bank address"
                    className={textareaClass()}
                  />
                </Field>
              </div>
              <Field
                label="Australian BSB"
                htmlFor="bsb"
                required={false}
                hint="Complete this field for Australian bank accounts."
              >
                <input
                  id="bsb"
                  value={bankDraft.bsb}
                  onChange={(event) =>
                    updateBankDraft("bsb", event.target.value)
                  }
                  inputMode="numeric"
                  placeholder="000-000"
                  className={inputClass()}
                />
              </Field>
              <Field label="Account number or IBAN" htmlFor="accountNumber">
                <input
                  id="accountNumber"
                  value={bankDraft.accountNumber}
                  onChange={(event) =>
                    updateBankDraft("accountNumber", event.target.value)
                  }
                  placeholder="Account number or IBAN"
                  className={inputClass()}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Account currency" htmlFor="bankCurrency">
                  <CustomSelect
                    id="bankCurrency"
                    value={bankDraft.currency}
                    onChange={(value) => updateBankDraft("currency", value)}
                    options={BANK_CURRENCY_OPTIONS}
                    placeholder="Select account currency"
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <DocumentUpload
                  id={`bankVerification-${bankDraft.id}`}
                  title="Bank verification document"
                  description="Upload a recent bank statement or official bank letter showing the account holder and account details."
                  value={bankDraft.verificationDocument}
                  onChange={(file) =>
                    updateBankDraft(
                      "verificationDocument",
                      documentFromFile(file),
                    )
                  }
                  onPreview={openDocumentPreview}
                />
              </div>
            </div>

            {errors.bankDraft ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-3 text-xs font-medium text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {errors.bankDraft}
              </div>
            ) : null}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={saveBankAccount}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#003478] px-5 text-xs font-semibold text-white transition hover:bg-[#002b63]"
              >
                <Check className="h-4 w-4" />
                {editingBankId ? "Save changes" : "Save bank account"}
              </button>
            </div>
          </section>
        ) : null}

        {errors.bank ? (
          <p className="text-xs font-medium text-red-600">{errors.bank}</p>
        ) : null}

        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-500">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
          Bank details and supporting evidence are encrypted in transit.
          Accounts are used only for approved application transfers and
          settlement.
        </div>
      </div>
    </div>
  );

  return renderBank();
}
