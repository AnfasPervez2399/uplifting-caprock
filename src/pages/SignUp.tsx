import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";
import { CustomSelect, type SelectOption } from "../components/ui/CustomSelect";
import { useLoader } from "../components/ui/LoaderProvider";

type FieldName =
  | "firstName"
  | "lastName"
  | "mobile"
  | "email"
  | "password"
  | "confirmPassword";
type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName | "form", string>>;
type Status = "idle" | "loading" | "success";

const EASE = [0.22, 1, 0.36, 1] as const;
const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  mobile: "",
  email: "",
  password: "",
  confirmPassword: "",
};
const namePattern = /^[\p{L}\p{M}][\p{L}\p{M}' -]*$/u;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const passwordChecks = (password: string) => [
  { id: "length", label: "At least 12 characters", met: password.length >= 12 },
  {
    id: "case",
    label: "Uppercase and lowercase letters",
    met: /[A-Z]/.test(password) && /[a-z]/.test(password),
  },
  { id: "number", label: "At least one number", met: /\d/.test(password) },
  {
    id: "symbol",
    label: "At least one special character",
    met: /[^A-Za-z0-9\s]/.test(password),
  },
  {
    id: "spaces",
    label: "No spaces",
    met: Boolean(password) && !/\s/.test(password),
  },
];

type PasswordCheck = ReturnType<typeof passwordChecks>[number];

const strengthStates = [
  {
    label: "Start typing",
    detail: "Build a password you do not use anywhere else.",
    color: "#64748b",
    soft: "#f8fafc",
    border: "#e2e8f0",
  },
  {
    label: "Very weak",
    detail: "A few more ingredients will make this safer.",
    color: "#be123c",
    soft: "#fff1f2",
    border: "#fecdd3",
  },
  {
    label: "Weak",
    detail: "Keep going — length and variety both matter.",
    color: "#c2410c",
    soft: "#fff7ed",
    border: "#fed7aa",
  },
  {
    label: "Fair",
    detail: "Good progress. Complete the remaining checks.",
    color: "#a16207",
    soft: "#fefce8",
    border: "#fde68a",
  },
  {
    label: "Strong",
    detail: "Nearly there. One final security check remains.",
    color: "#003478",
    soft: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    label: "Excellent",
    detail: "All password security requirements are met.",
    color: "#047857",
    soft: "#ecfdf5",
    border: "#a7f3d0",
  },
] as const;

const strengthSegmentColors = [
  "#e11d48",
  "#f97316",
  "#eab308",
  "#2563eb",
  "#059669",
] as const;

const regionNames = new Intl.DisplayNames(["en-AU"], { type: "region" });
const countryName = (country: CountryCode) =>
  regionNames.of(country) || country;
const countryFlag = (country: CountryCode) =>
  String.fromCodePoint(
    ...country.split("").map((character) => 127397 + character.charCodeAt(0)),
  );

const mobileCountryOptions: SelectOption[] = getCountries()
  .map((country) => ({
    value: country,
    label: `${countryFlag(country)} +${getCountryCallingCode(country)}`,
    description: countryName(country),
  }))
  .sort((left, right) =>
    (left.description || "").localeCompare(right.description || ""),
  );

const parseMobileNumber = (value: string, country: CountryCode) => {
  const input = value.trim();
  if (!input) return undefined;
  return input.startsWith("+")
    ? parsePhoneNumberFromString(input)
    : parsePhoneNumberFromString(input, country);
};

const isValidMobile = (value: string, country: CountryCode) => {
  const phone = parseMobileNumber(value, country);
  if (!phone?.isPossible() || !phone.isValid()) return false;
  if (phone.country && phone.country !== country) return false;
  const type = phone.getType();
  return !type || type === "MOBILE" || type === "FIXED_LINE_OR_MOBILE";
};

function ErrorText({
  id,
  children,
  reducedMotion,
}: {
  id: string;
  children?: ReactNode;
  reducedMotion: boolean | null;
}) {
  return (
    <AnimatePresence initial={false}>
      {children ? (
        <motion.p
          id={id}
          role="alert"
          initial={reducedMotion ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.16 }}
          className="mt-1.5 overflow-hidden text-xs text-red-600"
        >
          {children}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

function TextField({
  id,
  label,
  value,
  error,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
  onChange,
  reducedMotion,
}: {
  id: FieldName;
  label: string;
  value: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "email" | "tel" | "text";
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  reducedMotion: boolean | null;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-800"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`h-12 w-full rounded-lg border bg-white px-3.5 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-slate-300 hover:border-slate-400 focus:border-[#003478] focus:ring-[#003478]/10"}`}
      />
      <ErrorText id={errorId} reducedMotion={reducedMotion}>
        {error}
      </ErrorText>
    </div>
  );
}

function MobileField({
  value,
  country,
  error,
  onChange,
  onCountryChange,
  reducedMotion,
}: {
  value: string;
  country: CountryCode;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCountryChange: (country: CountryCode) => void;
  reducedMotion: boolean | null;
}) {
  const errorId = "mobile-error";
  const hintId = "mobile-hint";

  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium text-slate-800">
        Mobile number
      </legend>
      <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-2.5 sm:grid-cols-[138px_minmax(0,1fr)]">
        <div>
          <label htmlFor="mobile-country" className="sr-only">
            Country calling code
          </label>
          <CustomSelect
            id="mobile-country"
            value={country}
            options={mobileCountryOptions}
            onChange={(nextCountry) =>
              onCountryChange(nextCountry as CountryCode)
            }
            placeholder="Code"
            error={Boolean(error)}
            searchable
            searchPlaceholder="Search country or code"
          />
        </div>
        <div>
          <label htmlFor="mobile" className="sr-only">
            National mobile number
          </label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            value={value}
            onChange={onChange}
            autoComplete="tel-national"
            inputMode="tel"
            placeholder={country === "AU" ? "412 345 678" : "Mobile number"}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={[hintId, error ? errorId : ""]
              .filter(Boolean)
              .join(" ")}
            className={`h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-slate-300 hover:border-slate-400 focus:border-[#003478] focus:ring-[#003478]/10"}`}
          />
        </div>
      </div>
      <p id={hintId} className="mt-1.5 text-[11px] leading-4 text-slate-500">
        Select the country code, then enter the mobile number without it.
      </p>
      <ErrorText id={errorId} reducedMotion={reducedMotion}>
        {error}
      </ErrorText>
    </fieldset>
  );
}

function PasswordField({
  id,
  label,
  value,
  error,
  visible,
  onToggle,
  onChange,
  reducedMotion,
  describedBy,
}: {
  id: "password" | "confirmPassword";
  label: string;
  value: string;
  error?: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  reducedMotion: boolean | null;
  describedBy?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-800"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          placeholder={
            id === "password"
              ? "Create a strong password"
              : "Enter the password again"
          }
          required
          aria-invalid={Boolean(error)}
          aria-describedby={
            [error ? errorId : "", describedBy || ""]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`h-12 w-full rounded-lg border bg-white px-3.5 pr-12 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-slate-300 hover:border-slate-400 focus:border-[#003478] focus:ring-[#003478]/10"}`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          aria-pressed={visible}
          className="absolute inset-y-1 right-1 grid w-10 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={visible ? "visible" : "hidden"}
              initial={
                reducedMotion ? false : { opacity: 0, rotate: -12, scale: 0.72 }
              }
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={
                reducedMotion
                  ? undefined
                  : { opacity: 0, rotate: 12, scale: 0.72 }
              }
              transition={{ duration: 0.16, ease: EASE }}
              className="flex"
            >
              {visible ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      <ErrorText id={errorId} reducedMotion={reducedMotion}>
        {error}
      </ErrorText>
    </div>
  );
}

function PasswordStrengthPanel({
  checks,
  strength,
  password,
  reducedMotion,
}: {
  checks: PasswordCheck[];
  strength: number;
  password: string;
  reducedMotion: boolean | null;
}) {
  const state = strengthStates[strength] ?? strengthStates[0];
  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.42, ease: EASE };

  return (
    <motion.section
      id="password-requirements"
      aria-label={`Password strength: ${state.label}, ${strength} of 5 requirements met`}
      initial={false}
      animate={{ backgroundColor: state.soft, borderColor: state.border }}
      transition={transition}
      className="relative overflow-hidden rounded-2xl border p-4 sm:p-[18px]"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 origin-left"
        initial={false}
        animate={{ backgroundColor: state.color, scaleX: strength / 5 }}
        transition={transition}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <motion.span
            initial={false}
            animate={{
              backgroundColor: state.color,
              rotate: strength === 5 ? 0 : -4,
            }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 360, damping: 24 }
            }
            className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white shadow-sm"
            aria-hidden="true"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={strength === 5 ? "complete" : "building"}
                initial={
                  reducedMotion
                    ? false
                    : { opacity: 0, scale: 0.55, rotate: -18 }
                }
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={
                  reducedMotion
                    ? undefined
                    : { opacity: 0, scale: 0.55, rotate: 18 }
                }
                transition={{ duration: 0.2, ease: EASE }}
                className="flex"
              >
                {strength === 5 ? (
                  <ShieldCheck className="h-[18px] w-[18px]" />
                ) : (
                  <LockKeyhole className="h-[17px] w-[17px]" />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.span>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
              Password security
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={state.label}
                  aria-live="polite"
                  initial={reducedMotion ? false : { opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -7 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="text-sm font-bold"
                  style={{ color: state.color }}
                >
                  {state.label}
                </motion.span>
              </AnimatePresence>
              {password ? (
                <span className="rounded-full bg-white/75 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.07em] text-slate-500 ring-1 ring-black/5">
                  Live score
                </span>
              ) : null}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={state.detail}
                initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="mt-1 text-[11px] leading-4 text-slate-600"
              >
                {state.detail}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div
          className="relative grid h-12 w-12 shrink-0 place-items-center"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 44 44"
            className="absolute inset-0 h-full w-full -rotate-90"
          >
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3.5"
            />
            <motion.circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke={state.color}
              strokeWidth="3.5"
              strokeLinecap="round"
              pathLength="1"
              initial={false}
              animate={{ pathLength: strength / 5, stroke: state.color }}
              transition={
                reducedMotion ? { duration: 0 } : { duration: 0.46, ease: EASE }
              }
            />
          </svg>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={strength}
              initial={
                reducedMotion ? false : { opacity: 0, scale: 0.55, y: 4 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                reducedMotion ? undefined : { opacity: 0, scale: 0.55, y: -4 }
              }
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 440, damping: 25 }
              }
              className="text-sm font-extrabold tabular-nums"
              style={{ color: state.color }}
            >
              {strength}
            </motion.span>
          </AnimatePresence>
          <span className="absolute bottom-0.5 right-0 text-[8px] font-bold text-slate-400">
            /5
          </span>
        </div>
      </div>

      <div className="my-4 grid grid-cols-5 gap-1.5" aria-hidden="true">
        {strengthSegmentColors.map((color, index) => {
          const active = index < strength;
          return (
            <motion.span
              key={color}
              initial={false}
              animate={{
                backgroundColor: active ? color : "#e2e8f0",
                opacity: active ? 1 : 0.7,
                scaleY: active ? 1 : 0.58,
              }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      duration: 0.3,
                      delay: active ? index * 0.035 : 0,
                      ease: EASE,
                    }
              }
              className="h-2 origin-bottom rounded-full"
            />
          );
        })}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {checks.map((check) => (
          <motion.li
            key={check.id}
            layout={!reducedMotion}
            initial={false}
            animate={{
              backgroundColor: check.met ? "#ffffff" : "rgba(255,255,255,0.46)",
              borderColor: check.met ? "#a7f3d0" : "rgba(203,213,225,0.72)",
            }}
            transition={
              reducedMotion ? { duration: 0 } : { duration: 0.24, ease: EASE }
            }
            className={`flex min-h-9 items-center gap-2 rounded-lg border px-2.5 py-2 text-[11px] font-medium ${check.met ? "text-emerald-800" : "text-slate-500"}`}
          >
            <motion.span
              initial={false}
              animate={{
                backgroundColor: check.met ? "#059669" : "#e2e8f0",
                color: check.met ? "#ffffff" : "#94a3b8",
                scale: check.met ? 1 : 0.9,
              }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 460, damping: 25 }
              }
              className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full"
              aria-hidden="true"
            >
              <AnimatePresence initial={false}>
                {check.met ? (
                  <motion.span
                    initial={reducedMotion ? false : { scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="flex"
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.span>
            <span>{check.label}</span>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}

export function SignUp() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { withLoader } = useLoader();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [mobileCountry, setMobileCountry] = useState<CountryCode>("AU");
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const checks = useMemo(
    () => passwordChecks(values.password),
    [values.password],
  );
  const passwordStrength = checks.filter((check) => check.met).length;

  const updateField =
    (field: FieldName) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({
        ...current,
        [field]: undefined,
        form: undefined,
      }));
    };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const email = values.email.trim().toLowerCase();

    if (!firstName) nextErrors.firstName = "First name is required.";
    else if (firstName.length < 2 || !namePattern.test(firstName))
      nextErrors.firstName =
        "Enter a valid first name using letters, spaces, apostrophes or hyphens.";
    if (!lastName) nextErrors.lastName = "Last name is required.";
    else if (lastName.length < 2 || !namePattern.test(lastName))
      nextErrors.lastName =
        "Enter a valid last name using letters, spaces, apostrophes or hyphens.";
    if (!values.mobile.trim()) nextErrors.mobile = "Mobile number is required.";
    else if (!isValidMobile(values.mobile, mobileCountry))
      nextErrors.mobile = `Enter a valid mobile number for ${countryName(mobileCountry)}.`;
    if (!email) nextErrors.email = "Email address is required.";
    else if (!emailPattern.test(email))
      nextErrors.email = "Enter a valid email address.";

    if (!values.password) nextErrors.password = "Password is required.";
    else if (!checks.every((check) => check.met))
      nextErrors.password =
        "Your password must satisfy every security requirement below.";
    else {
      const personalTerms = [firstName, lastName, email.split("@")[0]]
        .filter((term) => term.length >= 3)
        .map((term) => term.toLowerCase());
      if (
        personalTerms.some((term) =>
          values.password.toLowerCase().includes(term),
        )
      )
        nextErrors.password =
          "Do not include your name or email in your password.";
    }
    if (!values.confirmPassword)
      nextErrors.confirmPassword = "Confirm your password.";
    else if (values.confirmPassword !== values.password)
      nextErrors.confirmPassword = "Passwords do not match.";
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status !== "idle") return;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const firstInvalid = Object.keys(nextErrors)[0] as FieldName;
      window.requestAnimationFrame(() =>
        document.getElementById(firstInvalid)?.focus(),
      );
      return;
    }

    setErrors({});
    setStatus("loading");
    try {
      await withLoader(
        async () => {
          // Replace this short delay with the account-creation API request.
          await wait(900);
          const email = values.email.trim().toLowerCase();
          sessionStorage.setItem("caprockUserEmail", email);
          sessionStorage.setItem(
            "caprockUserName",
            `${values.firstName.trim()} ${values.lastName.trim()}`,
          );
          const mobile = parseMobileNumber(values.mobile, mobileCountry);
          sessionStorage.setItem(
            "caprockUserMobile",
            mobile?.number || values.mobile.trim(),
          );
          setStatus("success");
          await wait(400);
          navigate("/onboarding");
        },
        { minimumDuration: 750 },
      );
    } catch {
      setStatus("idle");
      setErrors({
        form: "We could not create your account. Please try again.",
      });
    }
  };

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: EASE }}
      className="mx-auto w-full max-w-[460px] px-5 py-7 sm:px-0 sm:py-9"
    >
      <header className="mb-7">
        <div className="mb-7 flex items-center justify-between gap-4">
          <Link
            to="/"
            aria-label="Caprock home"
            className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20 focus-visible:ring-offset-4"
          >
            <img
              src="/blue-logo.svg"
              alt="Caprock"
              className="h-10 w-auto max-w-[140px] object-contain object-left sm:max-w-[168px]"
            />
            <span className="text-sm font-bold tracking-[0.14em] text-slate-950">
              CAPROCK
            </span>
          </Link>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#dce7f2] text-[#003478]">
            <UserPlus className="h-5 w-5" />
          </span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#003478]">
          Secure account setup
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-[34px]">
          Create your account
        </h1>
        <p className="mt-2.5 text-[15px] leading-6 text-slate-500">
          Set up secure access, then continue directly to your onboarding
          application.
        </p>
      </header>

      {errors.form ? (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errors.form}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="firstName"
            label="First name"
            value={values.firstName}
            error={errors.firstName}
            autoComplete="given-name"
            placeholder="First name"
            onChange={updateField("firstName")}
            reducedMotion={reducedMotion}
          />
          <TextField
            id="lastName"
            label="Last name"
            value={values.lastName}
            error={errors.lastName}
            autoComplete="family-name"
            placeholder="Last name"
            onChange={updateField("lastName")}
            reducedMotion={reducedMotion}
          />
        </div>
        <MobileField
          value={values.mobile}
          country={mobileCountry}
          error={errors.mobile}
          onChange={updateField("mobile")}
          onCountryChange={(country) => {
            setMobileCountry(country);
            setErrors((current) => ({
              ...current,
              mobile: undefined,
              form: undefined,
            }));
          }}
          reducedMotion={reducedMotion}
        />
        <TextField
          id="email"
          label="Email address"
          value={values.email}
          error={errors.email}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          onChange={updateField("email")}
          reducedMotion={reducedMotion}
        />
        <PasswordField
          id="password"
          label="Password"
          value={values.password}
          error={errors.password}
          visible={showPassword}
          onToggle={() => setShowPassword((current) => !current)}
          onChange={updateField("password")}
          reducedMotion={reducedMotion}
          describedBy="password-requirements"
        />

        <PasswordStrengthPanel
          checks={checks}
          strength={passwordStrength}
          password={values.password}
          reducedMotion={reducedMotion}
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          visible={showConfirmation}
          onToggle={() => setShowConfirmation((current) => !current)}
          onChange={updateField("confirmPassword")}
          reducedMotion={reducedMotion}
        />

        <button
          type="submit"
          disabled={status !== "idle"}
          className="group flex h-14 w-full items-center justify-between rounded-xl bg-[#003478] pl-5 pr-2 text-white shadow-[0_8px_20px_-14px_rgba(0,52,120,0.75)] transition hover:-translate-y-0.5 hover:bg-[#002b63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/25 focus-visible:ring-offset-2 disabled:cursor-wait disabled:translate-y-0 disabled:opacity-90"
        >
          <span className="text-[15px] font-semibold">
            {status === "loading"
              ? "Creating secure account"
              : status === "success"
                ? "Account created"
                : "Create account"}
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/10">
            {status === "loading" ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-[18px] w-[18px]" />
            ) : (
              <UserPlus className="h-[18px] w-[18px]" />
            )}
          </span>
        </button>
      </form>

      <p className="mt-7 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="rounded font-semibold text-slate-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
        >
          Sign in
        </Link>
      </p>
    </motion.section>
  );
}

export default SignUp;
