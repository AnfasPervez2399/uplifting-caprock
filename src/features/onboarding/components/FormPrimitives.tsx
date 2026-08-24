import {
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  PencilLine,
  ScanFace,
  UploadCloud,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import type { UploadedDocument, YesNo } from "./types";

export const inputClass = (hasError = false) =>
  `h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/[0.08]"
      : "border-slate-200 hover:border-slate-300 focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/[0.07]"
  }`;

export const textareaClass = (hasError = false) =>
  `${inputClass(hasError)} h-auto min-h-24 resize-y py-3 leading-6`;

export function RequiredIndicator() {
  return (
    <>
      <span aria-hidden="true" className="ml-0.5 font-bold text-red-600">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required = true,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-[13px] font-semibold text-slate-800"
      >
        {label}
        {required ? (
          <RequiredIndicator />
        ) : (
          <span className="ml-1 font-normal text-slate-400">(optional)</span>
        )}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mb-7 flex items-start gap-4 border-b border-slate-100 pb-7 sm:mb-8 sm:gap-5 sm:pb-8">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[rgba(0,52,120,0.075)] text-[#003478] sm:h-14 sm:w-14">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#003478]">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-[30px]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
        <p className="mt-2.5 text-[11px] font-medium text-slate-400">
          <span aria-hidden="true" className="font-bold text-red-600">
            *
          </span>
          <span className="sr-only">Asterisk:</span> Required field · Optional
          fields are labelled
        </p>
      </div>
    </div>
  );
}

export function SubsectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold tracking-[-0.015em] text-slate-950">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export function DocumentUpload({
  id,
  title,
  description,
  value,
  onChange,
  onPreview,
  required = true,
  accept = ".pdf,.png,.jpg,.jpeg",
}: {
  id: string;
  title: string;
  description: string;
  value?: UploadedDocument;
  onChange: (file?: File) => void;
  onPreview: (document: UploadedDocument, label: string) => void;
  required?: boolean;
  accept?: string;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition sm:p-5 ${
        value
          ? "border-[rgba(0,52,120,0.18)] bg-[rgba(0,52,120,0.035)]"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            value ? "bg-[#003478] text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          {value ? (
            <Check className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {title}
            {required ? (
              <RequiredIndicator />
            ) : (
              <span className="ml-1 font-normal text-slate-400">
                (optional)
              </span>
            )}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
          {value ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white p-1.5 ring-1 ring-slate-200/80">
              <button
                type="button"
                onClick={() => onPreview(value, title)}
                aria-label={`Open ${value.name}`}
                className="group/file flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#dce7f2] text-[#003478]">
                  <Eye className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-slate-800 group-hover/file:text-[#003478]">
                    {value.name}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-slate-400">
                    {(value.size / 1024 / 1024).toFixed(2)} MB · Click to open
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => onChange(undefined)}
                aria-label={`Remove ${title}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor={id}
              className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-[#003478] focus-within:ring-2 focus-within:ring-[#003478]/20"
            >
              <UploadCloud className="h-4 w-4" />
              Choose file
              <input
                id={id}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="sr-only"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export function SelfieUpload({
  value,
  error,
  onChange,
  onPreview,
}: {
  value?: UploadedDocument;
  error?: string;
  onChange: (file?: File) => void;
  onPreview: (document: UploadedDocument, label: string) => void;
}) {
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white transition ${
        error
          ? "border-red-300 ring-4 ring-red-500/[0.05]"
          : value
            ? "border-[rgba(0,52,120,0.2)]"
            : "border-slate-200"
      }`}
    >
      <div className="flex flex-col items-center px-5 py-8 text-center sm:px-8 sm:py-10">
        <div
          className={`grid h-20 w-20 place-items-center rounded-[26px] ${
            value
              ? "bg-[#dce7f2] text-[#003478]"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {value ? (
            <CheckCircle2 className="h-9 w-9" />
          ) : (
            <ScanFace className="h-9 w-9" />
          )}
        </div>
        <h3 className="mt-5 text-base font-semibold text-slate-950">
          {value
            ? "Selfie ready for verification"
            : "Add a clear, current selfie"}
          <RequiredIndicator />
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Use your front-facing camera now or choose a recent selfie from this
          device.
        </p>

        {value ? (
          <div className="mt-5 flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 text-left">
            <button
              type="button"
              onClick={() => onPreview(value, "Identity selfie")}
              className="group/file flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
              aria-label={`Open ${value.name}`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-[#003478] ring-1 ring-slate-200">
                <Eye className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-slate-800 group-hover/file:text-[#003478]">
                  {value.name}
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-400">
                  {(value.size / 1024 / 1024).toFixed(2)} MB · Click to open
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20"
              aria-label="Remove selfie"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="mt-5 flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:justify-center">
          <label
            htmlFor="selfieCamera"
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#002b63] focus-within:ring-4 focus-within:ring-[#003478]/15"
          >
            <Camera className="h-4 w-4" />
            Take a selfie
            <input
              id="selfieCamera"
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFile}
              className="sr-only"
            />
          </label>
          <label
            htmlFor="selfieDevice"
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-[#003478] focus-within:ring-4 focus-within:ring-[#003478]/10"
          >
            <UploadCloud className="h-4 w-4" />
            Choose from device
            <input
              id="selfieDevice"
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="sr-only"
            />
          </label>
        </div>
        {error ? (
          <p className="mt-3 text-xs font-medium text-red-600">{error}</p>
        ) : null}
      </div>
    </div>
  );
}

export function BinaryChoice({
  value,
  onChange,
  ariaLabel,
}: {
  value: YesNo;
  onChange: (value: Exclude<YesNo, "">) => void;
  ariaLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label={ariaLabel}>
      {(["yes", "no"] as const).map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={selected}
            className={`h-12 rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20 ${
              selected
                ? "border-[rgba(0,52,120,0.18)] bg-[#dce7f2] text-slate-950"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            {option === "yes" ? "Yes" : "No"}
          </button>
        );
      })}
    </div>
  );
}

export function ReviewSection({
  title,
  icon: Icon,
  onEdit,
  children,
}: {
  title: string;
  icon: LucideIcon;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[rgba(0,52,120,0.07)] text-[#003478]">
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#003478] transition hover:bg-[#dce7f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
        >
          <PencilLine className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}

export function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm font-medium leading-6 text-slate-800">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

export function CheckRow({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-slate-600">
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
          checked ? "bg-[#003478] text-white" : "bg-slate-100 text-slate-400"
        }`}
      >
        {checked ? (
          <Check className="h-3 w-3" strokeWidth={3} />
        ) : (
          <Clock3 className="h-3 w-3" />
        )}
      </span>
      {label}
    </div>
  );
}
