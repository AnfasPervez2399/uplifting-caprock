import { Building2, Check, CircleUserRound, ShieldCheck, Sparkles } from "lucide-react";
import { APPLICATION_OPTIONS } from "../config";
import { SectionIntro } from "../components/FormPrimitives";
import type { ApplicationCategory, ApplicationType } from "../types";
import type { OnboardingController } from "../useOnboardingController";

const groups: Array<{
  category: ApplicationCategory;
  title: string;
  description: string;
  icon: typeof CircleUserRound;
}> = [
  { category: "individual", title: "Individual", description: "Personal, joint and sole-trader structures", icon: CircleUserRound },
  { category: "company", title: "Company", description: "Australian and non-Australian registered entities", icon: Building2 },
  { category: "trust", title: "Trust", description: "Regulated, custodian and non-custodian trusts", icon: ShieldCheck },
];

export function ApplicationTypeStep({ controller }: { controller: OnboardingController }) {
  const { form, errors, sectionEyebrow, handleApplicationTypeChange } = controller;
  const selected = form.personal.applicationType;

  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("application")}
        title="Choose your application type"
        description="Select the legal structure that is applying. Every section, required field, evidence request and review item will adapt to this choice."
        icon={Sparkles}
      />

      <div className="space-y-8">
        {groups.map((group) => {
          const Icon = group.icon;
          const options = APPLICATION_OPTIONS.filter((option) => option.category === group.category);
          return (
            <section key={group.category} aria-labelledby={`${group.category}-heading`}>
              <div className="mb-4 flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[rgba(0,52,120,0.07)] text-[#003478]">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h2 id={`${group.category}-heading`} className="text-base font-semibold text-slate-950">{group.title}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">{group.description}</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {options.map((option) => {
                  const isSelected = selected === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleApplicationTypeChange(option.value)}
                      aria-pressed={isSelected}
                      className={`group relative min-h-36 rounded-2xl border p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#003478]/10 ${
                        isSelected
                          ? "border-[#b9ccdf] bg-[#dce7f2] text-[#0f172a] shadow-sm"
                          : "border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
                      }`}
                    >
                      <span className={`grid h-8 w-8 place-items-center rounded-full transition ${isSelected ? "bg-[#003478] text-white" : "bg-slate-100 text-slate-400 group-hover:text-[#003478]"}`}>
                        {isSelected ? <Check className="h-4 w-4" strokeWidth={2.7} /> : <span className="h-2 w-2 rounded-full bg-current" />}
                      </span>
                      <span className="mt-4 block text-sm font-semibold leading-5">{option.label}</span>
                      <span className={`mt-1.5 block text-xs leading-5 ${isSelected ? "text-slate-600" : "text-slate-500"}`}>{option.description}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {errors.applicationType ? <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errors.applicationType}</p> : null}
      {selected ? (
        <div className="mt-7 flex items-center gap-3 rounded-2xl border border-[#c7d7e7] bg-[#f5f8fb] p-4 text-sm text-slate-700">
          <Check className="h-4 w-4 shrink-0 text-[#003478]" />
          <p><span className="font-semibold text-slate-950">Selected:</span> {APPLICATION_OPTIONS.find((option) => option.value === selected)?.label}. Continue to open the tailored application.</p>
        </div>
      ) : null}
    </div>
  );
}
