import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Eye, EyeOff, Loader2, LogIn } from "lucide-react";

type Status = "idle" | "loading" | "success";
type Errors = Partial<Record<"email" | "password", string>>;

const EASE = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: EASE },
  },
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function HeaderVisual({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <svg
      viewBox="0 0 128 72"
      role="img"
      aria-labelledby="header-visual-title"
      className="h-[64px] w-[112px] shrink-0"
    >
      <title id="header-visual-title">Secure portfolio overview</title>

      <rect
        x="0.75"
        y="0.75"
        width="126.5"
        height="70.5"
        rx="13"
        fill="#f8fafc"
        stroke="#e2e8f0"
        strokeWidth="1.5"
      />

      <path
        d="M15 19H48"
        stroke="#cbd5e1"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M15 28H35"
        stroke="#e2e8f0"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <g fill="#dbe3ee">
        <rect x="15" y="50" width="8" height="9" rx="2" />
        <rect x="30" y="43" width="8" height="16" rx="2" />
        <rect x="45" y="47" width="8" height="12" rx="2" />
        <rect x="60" y="37" width="8" height="22" rx="2" />
        <rect x="75" y="40" width="8" height="19" rx="2" />
        <rect x="90" y="29" width="8" height="30" rx="2" />
        <rect x="105" y="24" width="8" height="35" rx="2" />
      </g>

      <motion.path
        d="M15 53C27 51 31 42 41 44C53 47 57 36 68 38C79 40 84 31 94 32C103 33 107 25 114 21"
        fill="none"
        stroke="#003478"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0.35 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
      />

      <motion.g
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.72, ease: EASE }}
      >
        <circle cx="114" cy="21" r="6" fill="#003478" />
        <path
          d="M111.5 21L113.2 22.7L116.6 19.3"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </svg>
  );
}

export function Login() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (errors.email) {
      setErrors((current) => ({ ...current, email: undefined }));
    }
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    if (errors.password) {
      setErrors((current) => ({ ...current, password: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status !== "idle") return;

    const nextErrors: Errors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus("loading");

    // Replace this demo delay with your authentication request.
    await wait(1000);
    setStatus("success");
    await wait(450);
    navigate("/dashboard");
  };

  return (
    <motion.section
      variants={container}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      className="mx-auto w-full max-w-[420px] px-5 py-8 sm:px-0 sm:py-10"
    >
      <motion.header variants={item} className="mb-9">
        <div className="mb-9 flex items-start justify-between gap-5">
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

          <HeaderVisual reduceMotion={reduceMotion} />
        </div>

        <h1 className="text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-[34px]">
          Welcome back
        </h1>
        <p className="mt-2.5 text-[15px] leading-6 text-slate-500">
          Sign in to continue to your account.
        </p>
      </motion.header>

      <motion.form
        variants={container}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5"
      >
        <motion.div variants={item}>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`h-12 w-full rounded-lg border bg-white px-3.5 text-[15px] text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                : "border-slate-300 hover:border-slate-400 focus:border-[#003478] focus:ring-[#003478]/10"
            }`}
          />
          <AnimatePresence initial={false}>
            {errors.email ? (
              <motion.p
                id="email-error"
                role="alert"
                initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="mt-1.5 overflow-hidden text-xs text-red-600"
              >
                {errors.email}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={item}>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-800"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="rounded text-sm font-medium text-[#003478] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`h-12 w-full rounded-lg border bg-white px-3.5 pr-12 text-[15px] text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-300 hover:border-slate-400 focus:border-[#003478] focus:ring-[#003478]/10"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute inset-y-1 right-1 grid w-10 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={showPassword ? "visible" : "hidden"}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.14 }}
                  className="flex"
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
          <AnimatePresence initial={false}>
            {errors.password ? (
              <motion.p
                id="password-error"
                role="alert"
                initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="mt-1.5 overflow-hidden text-xs text-red-600"
              >
                {errors.password}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <motion.label
          variants={item}
          className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-slate-600"
        >
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-[#003478]"
          />
          Keep me signed in
        </motion.label>

        <motion.button
          variants={item}
          type="submit"
          disabled={status !== "idle"}
          whileHover={
            !reduceMotion && status === "idle" ? { y: -2 } : undefined
          }
          whileTap={
            !reduceMotion && status === "idle" ? { scale: 0.985 } : undefined
          }
          transition={{ duration: 0.18, ease: EASE }}
          className="group relative h-14 w-full overflow-hidden rounded-xl bg-[#003478] text-white shadow-[0_6px_16px_-10px_rgba(0,52,120,0.75)] transition-[background-color,box-shadow] duration-200 hover:bg-[#002d69] hover:shadow-[0_12px_24px_-12px_rgba(0,52,120,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/25 focus-visible:ring-offset-2 disabled:cursor-wait disabled:bg-[#003478] disabled:opacity-90"
        >
          <AnimatePresence initial={false}>
            <motion.span
              key={status}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="absolute inset-0 flex items-center justify-between gap-4 pl-5 pr-2"
              aria-live="polite"
            >
              <span className="text-[15px] font-semibold tracking-[-0.015em]">
                {status === "loading"
                  ? "Verifying account"
                  : status === "success"
                    ? "Access granted"
                    : "Sign in to Caprock"}
              </span>

              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white/10 text-white transition-[width,background-color,color,transform] duration-300 ease-out group-hover:w-12 group-hover:bg-white group-hover:text-[#003478] group-disabled:!w-10 group-disabled:!bg-white/10 group-disabled:!text-white"
              >
                {status === "loading" ? (
                  <Loader2 className="h-[18px] w-[18px] animate-spin" />
                ) : status === "success" ? (
                  <motion.span
                    initial={reduceMotion ? false : { scale: 0.75 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 24 }}
                  >
                    <Check className="h-[18px] w-[18px]" strokeWidth={2.4} />
                  </motion.span>
                ) : (
                  <LogIn
                    className="h-[18px] w-[18px] transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                    strokeWidth={2.2}
                  />
                )}
              </span>
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.form>

      <motion.p
        variants={item}
        className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500"
      >
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="rounded font-semibold text-slate-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20"
        >
          Create an account
        </Link>
      </motion.p>
    </motion.section>
  );
}
