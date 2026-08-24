import { Banknote, ShieldCheck, X } from "lucide-react";

import { CustomMultiSelect } from "../../../components/ui/CustomMultiSelect";

import { BANK_CURRENCY_OPTIONS } from "../config";
import { Field, SectionIntro, SubsectionHeading } from "../components/FormPrimitives";

import type { OnboardingController } from "../useOnboardingController";

interface StepProps {
  controller: OnboardingController;
}

export function CashAccountsStep({ controller }: StepProps) {
  const {
    form,
    errors,
    sectionEyebrow,
    updateCashAccounts,
  } = controller;

  const renderCashAccounts = () => (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("cash")}
        title="Cash Accounts"
        description="Choose the currencies you want available after your external bank account has been linked."
        icon={Banknote}
      />

      <div className="space-y-7">
        <section>
          <SubsectionHeading
            title="Select account currencies"
            description="Select one or more currencies. Each selected currency creates one cash account only."
          />
          <Field label="Cash account currencies" htmlFor="cashAccountCurrencies" error={errors.cashAccounts}>
            <CustomMultiSelect
              id="cashAccountCurrencies"
              values={form.cashAccounts}
              onChange={updateCashAccounts}
              options={BANK_CURRENCY_OPTIONS}
              placeholder="Select currencies"
              searchable
              searchPlaceholder="Search currencies"
              error={Boolean(errors.cashAccounts)}
            />
          </Field>
        </section>

        {form.cashAccounts.length ? (
          <section>
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-slate-950">Selected cash accounts</h2>
              <span className="rounded-full bg-[#dce7f2] px-2.5 py-1 text-[10px] font-bold text-slate-800">
                {form.cashAccounts.length} selected
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {form.cashAccounts.map((currency) => {
                const currencyLabel =
                  BANK_CURRENCY_OPTIONS.find((option) => option.value === currency)?.label || currency;
                return (
                  <div key={currency} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#003478] ring-1 ring-slate-200">
                      <Banknote className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{currencyLabel}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">One {currency} cash account</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateCashAccounts(form.cashAccounts.filter((value) => value !== currency))}
                      aria-label={`Remove ${currency} cash account`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-7 text-center">
            <Banknote className="mx-auto h-6 w-6 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">No currencies selected</p>
            <p className="mt-1 text-xs text-slate-500">Use the multi-selector above to add cash-account currencies.</p>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-2xl border border-[rgba(0,52,120,0.13)] bg-[rgba(0,52,120,0.035)] p-4 text-sm leading-6 text-slate-600">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
          No account numbers or additional account details are required here. Selecting a currency requests exactly one cash account in that currency.
        </div>
      </div>
    </div>
  );

  return renderCashAccounts();
}
