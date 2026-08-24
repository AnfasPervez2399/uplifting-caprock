import { FileCheck2, ShieldCheck } from "lucide-react";
import { getRequiredEntityDocuments } from "../config";
import { DocumentUpload, SectionIntro, SubsectionHeading } from "../components/FormPrimitives";
import type { OnboardingController } from "../useOnboardingController";

export function EntityDocumentsStep({ controller }: { controller: OnboardingController }) {
  const { form, errors, sectionEyebrow, selectedApplicationType, openDocumentPreview, updateEntityDocument } = controller;
  const requirements = getRequiredEntityDocuments(form.personal.applicationType, form.company.companyType);
  const uploaded = requirements.filter((document) => form.entityDocuments[document.key]).length;

  return (
    <div className="animate-[fadeUp_.35s_ease-out]">
      <SectionIntro
        eyebrow={sectionEyebrow("documents")}
        title="Upload Proof"
        description={`Upload the entity evidence required for ${selectedApplicationType}. Requirements update automatically when a public-company or trust condition applies.`}
        icon={FileCheck2}
      />
      <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-[#c9d8e7] bg-[#f6f9fc] p-5 sm:flex-row sm:items-center">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]"><ShieldCheck className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-950">Audit-matched evidence set</p><p className="mt-1 text-xs leading-5 text-slate-500">{uploaded} of {requirements.length} required document{requirements.length === 1 ? "" : "s"} attached. Accepted formats: PDF, PNG and JPG.</p></div>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#003478] ring-1 ring-slate-200">{requirements.length ? Math.round((uploaded / requirements.length) * 100) : 100}% ready</span>
      </div>
      <section>
        <SubsectionHeading title="Required entity documents" description="Every document shown below is required for the selected structure and current conditional answers." />
        <div className="grid gap-4 lg:grid-cols-2">
          {requirements.map((document) => (
            <DocumentUpload
              key={document.key}
              id={`entity-document-${document.key}`}
              title={document.title}
              description={document.description}
              value={form.entityDocuments[document.key]}
              onChange={(file) => updateEntityDocument(document.key, file)}
              onPreview={openDocumentPreview}
            />
          ))}
        </div>
        {errors.documents ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{errors.documents}</p> : null}
      </section>
    </div>
  );
}
