import { Plus, X } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import { Field, inputClass } from "./FormPrimitives";

const NONE_LABEL = "None";
const namePattern = /^[\p{L}\p{M}][\p{L}\p{M}' -]*$/u;

export const formatFormerNames = (names: string[]) =>
  names
    .map((name) => name.trim())
    .filter(Boolean)
    .join(", ");

export const isValidFormerName = (value: string) => {
  const name = value.trim();
  if (!name) return false;
  if (name.toLowerCase() === NONE_LABEL.toLowerCase()) return true;
  return name.length >= 2 && namePattern.test(name);
};

export const hasCompleteFormerNames = (names: string[]) =>
  names.length > 0 && names.every(isValidFormerName);

export function FormerNamesField({
  values,
  error,
  onChange,
}: {
  values: string[];
  error?: string;
  onChange: (names: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState("");

  const addName = (raw: string) => {
    const name = raw.trim().replace(/\s+/g, " ");
    if (!name) {
      setDraftError("Enter a former name, or None.");
      return;
    }
    if (!isValidFormerName(name)) {
      setDraftError("Use letters, spaces, apostrophes or hyphens.");
      return;
    }
    const exists = values.some(
      (saved) => saved.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      setDraftError("That name is already listed.");
      return;
    }
    onChange([
      ...values,
      name.toLowerCase() === NONE_LABEL.toLowerCase() ? NONE_LABEL : name,
    ]);
    setDraft("");
    setDraftError("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addName(draft);
    }
  };

  return (
    <Field
      label="Former name(s)"
      htmlFor="formerNames"
      error={error || draftError}
      hint="Add each former legal name. Enter None if you have not used another name."
    >
      <div
        className={`rounded-xl border bg-white p-2 ${error || draftError ? "border-red-400" : "border-slate-200"}`}
      >
        {values.length ? (
          <ul className="mb-2 flex flex-wrap gap-2">
            {values.map((name) => (
              <li
                key={name}
                className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[#dce7f2] py-1.5 pl-2.5 pr-1 text-xs font-semibold text-slate-900"
              >
                <span className="min-w-0 truncate">{name}</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange(values.filter((saved) => saved !== name))
                  }
                  aria-label={`Remove ${name}`}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-white hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="formerNames"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setDraftError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Former legal name or None"
            className={`${inputClass()} h-11`}
          />
          <button
            type="button"
            onClick={() => addName(draft)}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#003478] px-4 text-xs font-semibold text-white transition hover:bg-[#002b63]"
          >
            <Plus className="h-4 w-4" />
            Add name
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          if (
            !values.some(
              (name) => name.toLowerCase() === NONE_LABEL.toLowerCase(),
            )
          ) {
            onChange([...values.filter(Boolean), NONE_LABEL]);
          }
          setDraft("");
          setDraftError("");
        }}
        className="mt-2 text-xs font-semibold text-[#003478] hover:underline"
      >
        I have no former names
      </button>
    </Field>
  );
}
