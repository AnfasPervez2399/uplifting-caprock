import { Check, Clock3, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import type { OnboardingController } from "../useOnboardingController";

interface SubmittedApplicationProps {
  controller: OnboardingController;
}

function SubmissionDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1.5 truncate text-sm font-semibold text-slate-800">
        {value}
      </dd>
    </div>
  );
}

export function SubmittedApplication({
  controller,
}: SubmittedApplicationProps) {
  const { form, selectedApplicationType } = controller;
  const [reference] = useState(
    () => `CR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#003478] px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <style>{`
        @keyframes submissionBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes submissionModalIn {
          0% { opacity: 0; transform: translateY(18px) scale(0.965); }
          68% { opacity: 1; transform: translateY(-2px) scale(1.004); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .submission-backdrop,
          .submission-modal { animation: none !important; }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="submission-backdrop absolute inset-0 animate-[submissionBackdropIn_.3s_ease-out] bg-[linear-gradient(145deg,#003478_0%,#002b63_100%)]"
      />

      <section
        role="status"
        aria-live="polite"
        aria-label="Application submitted"
        className="submission-modal relative z-10 w-full max-w-2xl animate-[submissionModalIn_.48s_cubic-bezier(.22,1,.36,1)] overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_32px_90px_rgba(0,20,50,0.32)]"
      >
        <div className="h-1.5 bg-[#dce7f2]" />
        <div className="px-5 py-8 sm:px-10 sm:py-10 lg:px-12">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#003478] text-white shadow-[0_12px_28px_rgba(0,52,120,0.2)]">
            <Check className="h-8 w-8" strokeWidth={2.5} />
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#003478]">
              Application submitted
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[36px]">
              Your application is with us
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
              Your application was securely received. A confirmation and any
              future updates will be sent to {form.signature.email}.
            </p>
          </div>

          <div className="mt-7 rounded-2xl border border-[rgba(0,52,120,0.14)] bg-[#f3f7fb] p-4 sm:p-5">
            <div className="flex items-start gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]">
                <Clock3 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-950">
                    The Caprock onboarding team is reviewing your application
                  </h2>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#003478] ring-1 ring-[rgba(0,52,120,0.12)]">
                    Under review
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-slate-600">
                  We’ll contact you if any additional information is required
                  and email you when the next step is ready.
                </p>
              </div>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left sm:grid-cols-3 sm:p-5">
            <SubmissionDetail label="Reference" value={reference} />
            <SubmissionDetail
              label="Application"
              value={selectedApplicationType}
            />
            <SubmissionDetail label="Status" value="Under review" />
          </dl>

          <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center text-xs text-slate-400 sm:flex-row sm:gap-4">
            <span className="hidden h-3 w-px bg-slate-200 sm:block" />
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#003478]" />
              Updates sent by email
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
