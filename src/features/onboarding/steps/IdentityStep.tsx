import {
  Camera,
  Check,
  ScanFace,
  ShieldCheck,
} from "lucide-react";

import { SectionIntro, SelfieUpload, SubsectionHeading } from "../components/FormPrimitives";

import type { OnboardingController } from "../useOnboardingController";

interface StepProps {
  controller: OnboardingController;
}

export function IdentityStep({ controller }: StepProps) {
  const {
    form,
    errors,
    sectionEyebrow,
    openDocumentPreview,
    updateSelfie,
  } = controller;

  const renderIdentity = () => {
    const selfieGuidance = [
      "Face the camera directly and keep your full face inside the frame.",
      "Remove sunglasses or tinted glasses and avoid glare on prescription lenses.",
      "Do not wear a face mask or anything that covers your face.",
      "Use even lighting with no strong shadows across your face.",
      "Stand in front of a plain, light-coloured and uncluttered background.",
      "Make sure only you appear in the image and that the photo is current.",
    ];

    return (
      <div className="animate-[fadeUp_.35s_ease-out]">
        <SectionIntro
          eyebrow={sectionEyebrow("identity")}
          title="Prove It’s You"
          description="Add a clear selfie so the identity team can compare your face with the identification documents supplied later in this application."
          icon={ScanFace}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <section>
            <SubsectionHeading
              title="Your identity selfie"
              description="Take a new photo with your camera or select a suitable image already saved on this device."
            />
            <SelfieUpload
              value={form.identity.selfie}
              error={errors.identity}
              onChange={updateSelfie}
              onPreview={openDocumentPreview}
            />
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]">
                <Camera className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-950">Selfie guidance</h2>
                <p className="mt-0.5 text-xs text-slate-500">For a faster identity check</p>
              </div>
            </div>
            <ul className="mt-5 space-y-3.5">
              {selfieGuidance.map((guidance) => (
                <li key={guidance} className="flex items-start gap-2.5 text-xs leading-5 text-slate-600">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[#003478] ring-1 ring-slate-200">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  {guidance}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[rgba(0,52,120,0.13)] bg-[rgba(0,52,120,0.035)] p-4 text-sm leading-6 text-slate-600">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#003478]" />
          Your selfie is handled as sensitive identity information and is used only for identity and compliance verification. Images must be 10 MB or smaller.
        </div>
      </div>
    );
  };

  return renderIdentity();
}
