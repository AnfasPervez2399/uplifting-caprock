import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
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

const isValidMobile = (value: string) => {
  const normalised = value.replace(/[\s().-]/g, "");
  if (/^04\d{8}$/.test(normalised)) return true;
  return /^\+[1-9]\d{7,14}$/.test(normalised);
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
          {visible ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
      <ErrorText id={errorId} reducedMotion={reducedMotion}>
        {error}
      </ErrorText>
    </div>
  );
}

export function SignUp() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { withLoader } = useLoader();
  const [values, setValues] = useState<FormValues>(initialValues);
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
    else if (!isValidMobile(values.mobile))
      nextErrors.mobile =
        "Enter an Australian mobile number or an international number with its country code.";
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
          sessionStorage.setItem("caprockUserMobile", values.mobile.trim());
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
            className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20 focus-visible:ring-offset-4"
          >
            <img
              src="/company-logo.svg"
              alt="Caprock"
              className="h-9 w-auto max-w-[150px] object-contain object-left"
            />
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
        <TextField
          id="mobile"
          label="Mobile number"
          value={values.mobile}
          error={errors.mobile}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="04xx xxx xxx or +61…"
          onChange={updateField("mobile")}
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

        <div
          id="password-requirements"
          className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-[#003478]" />
              <p className="text-xs font-semibold text-slate-800">
                Password security
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-slate-400">
              {passwordStrength}/5
            </span>
          </div>
          <div className="mb-3 grid grid-cols-5 gap-1" aria-hidden="true">
            {checks.map((check) => (
              <span
                key={check.id}
                className={`h-1.5 rounded-full transition-colors ${check.met ? "bg-[#003478]" : "bg-slate-200"}`}
              />
            ))}
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {checks.map((check) => (
              <li
                key={check.id}
                className={`flex items-center gap-2 text-[11px] ${check.met ? "text-emerald-700" : "text-slate-500"}`}
              >
                <span
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${check.met ? "bg-emerald-100" : "bg-slate-200"}`}
                >
                  {check.met ? <Check className="h-2.5 w-2.5" /> : null}
                </span>
                {check.label}
              </li>
            ))}
          </ul>
        </div>

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
