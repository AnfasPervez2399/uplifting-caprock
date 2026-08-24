import { CheckCircle2, LockKeyhole } from "lucide-react";
import { SummaryItem } from "./FormPrimitives";
import type { OnboardingController } from "../useOnboardingController";

interface SubmittedApplicationProps {
  controller: OnboardingController;
}

export function SubmittedApplication({
  controller,
}: SubmittedApplicationProps) {
  const { form, selectedApplicationType } = controller;

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-10 text-slate-950 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="h-1.5 bg-[#003478]" />
        <div className="px-6 py-10 text-center sm:px-12 sm:py-14">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#dce7f2] text-[#003478]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#003478]">
            Application received
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Securely submitted
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500">
            Your Caprock individual application has been submitted for review.
            The authorised signatory will receive the next steps at{" "}
            {form.signature.email}.
          </p>
          <div className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left sm:grid-cols-3">
            <SummaryItem
              label="Reference"
              value={`CR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`}
            />
            <SummaryItem label="Application" value={selectedApplicationType} />
            <SummaryItem label="Status" value="Compliance review" />
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <LockKeyhole className="h-4 w-4" />
            Submission encrypted and time-stamped
          </div>
        </div>
      </div>
    </div>
  );
}
