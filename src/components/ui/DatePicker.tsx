import { useEffect, useMemo, useState } from "react";
import { CustomSelect, type SelectOption } from "./CustomSelect";

export type DatePickerCondition = {
  id: string;
  test: (isoDate: string) => boolean;
  message: string;
};

type DateParts = {
  day: string;
  month: string;
  year: string;
};

type DatePickerProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  helperText?: string;
  conditions?: readonly DatePickerCondition[];
  minYear?: number;
  maxYear?: number;
  yearOrder?: "ascending" | "descending";
  labels?: Partial<Record<keyof DateParts, string>>;
  placeholders?: Partial<Record<keyof DateParts, string>>;
  disabled?: boolean;
};

const EMPTY_PARTS: DateParts = { day: "", month: "", year: "" };
const NO_CONDITIONS: readonly DatePickerCondition[] = [];

const MONTH_OPTIONS: SelectOption[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, index) => ({
  value: String(index + 1).padStart(2, "0"),
  label,
}));

const parseDate = (value: string): DateParts => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return EMPTY_PARTS;
  return { year: match[1], month: match[2], day: match[3] };
};

const daysInSelectedMonth = (month: string, year: string) => {
  if (!month) return 31;
  const numericYear = Number(year) || 2000;
  return new Date(numericYear, Number(month), 0).getDate();
};

const isValidIsoDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export const isAtLeastAge = (value: string, minimumAge: number) => {
  if (!isValidIsoDate(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  const birthdayHasPassed =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!birthdayHasPassed) age -= 1;
  return age >= minimumAge;
};

export const minimumAgeCondition = (
  minimumAge: number,
  message = `The selected person must be at least ${minimumAge} years old.`,
): DatePickerCondition => ({
  id: `minimum-age-${minimumAge}`,
  test: (value) => isAtLeastAge(value, minimumAge),
  message,
});

export function DatePicker({
  id,
  value,
  onChange,
  errorMessage,
  helperText,
  conditions = NO_CONDITIONS,
  minYear = new Date().getFullYear() - 100,
  maxYear = new Date().getFullYear() + 20,
  yearOrder = "descending",
  labels,
  placeholders,
  disabled = false,
}: DatePickerProps) {
  const [parts, setParts] = useState<DateParts>(() => parseDate(value));

  useEffect(() => {
    setParts(parseDate(value));
  }, [value]);

  const yearOptions = useMemo<SelectOption[]>(() => {
    const firstYear = Math.min(minYear, maxYear);
    const lastYear = Math.max(minYear, maxYear);
    const years = Array.from(
      { length: Math.min(lastYear - firstYear + 1, 301) },
      (_, index) => firstYear + index,
    );
    if (yearOrder === "descending") years.reverse();
    return years.map((year) => ({ value: String(year), label: String(year) }));
  }, [maxYear, minYear, yearOrder]);

  const dayOptions = useMemo<SelectOption[]>(
    () =>
      Array.from(
        { length: daysInSelectedMonth(parts.month, parts.year) },
        (_, index) => {
          const day = String(index + 1).padStart(2, "0");
          return { value: day, label: String(index + 1) };
        },
      ),
    [parts.month, parts.year],
  );

  const conditionError = useMemo(() => {
    if (!value || !isValidIsoDate(value)) return "";
    return (
      conditions.find((condition) => !condition.test(value))?.message || ""
    );
  }, [conditions, value]);

  const displayedError = errorMessage || conditionError;

  const updatePart = (key: keyof DateParts, valueForPart: string) => {
    const next = { ...parts, [key]: valueForPart };
    const availableDays = daysInSelectedMonth(next.month, next.year);
    if (next.day && Number(next.day) > availableDays) {
      next.day = String(availableDays).padStart(2, "0");
    }

    setParts(next);
    onChange(
      next.day && next.month && next.year
        ? `${next.year}-${next.month}-${next.day}`
        : "",
    );
  };

  const fieldLabels = {
    day: labels?.day || "Day",
    month: labels?.month || "Month",
    year: labels?.year || "Year",
  };
  const fieldPlaceholders = {
    day: placeholders?.day || "DD",
    month: placeholders?.month || "Month",
    year: placeholders?.year || "YYYY",
  };

  return (
    <div>
      <div className="grid grid-cols-[0.8fr_1.35fr_1fr] gap-2.5">
        <div>
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
            {fieldLabels.day}
          </span>
          <CustomSelect
            id={id}
            value={parts.day}
            onChange={(next) => updatePart("day", next)}
            options={dayOptions}
            placeholder={fieldPlaceholders.day}
            error={Boolean(displayedError)}
            disabled={disabled}
          />
        </div>
        <div>
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
            {fieldLabels.month}
          </span>
          <CustomSelect
            id={`${id}-month`}
            value={parts.month}
            onChange={(next) => updatePart("month", next)}
            options={MONTH_OPTIONS}
            placeholder={fieldPlaceholders.month}
            error={Boolean(displayedError)}
            disabled={disabled}
          />
        </div>
        <div>
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
            {fieldLabels.year}
          </span>
          <CustomSelect
            id={`${id}-year`}
            value={parts.year}
            onChange={(next) => updatePart("year", next)}
            options={yearOptions}
            placeholder={fieldPlaceholders.year}
            searchable
            searchPlaceholder="Find year"
            error={Boolean(displayedError)}
            disabled={disabled}
          />
        </div>
      </div>
      {displayedError ? (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {displayedError}
        </p>
      ) : helperText ? (
        <p className="mt-2 text-[11px] leading-5 text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
