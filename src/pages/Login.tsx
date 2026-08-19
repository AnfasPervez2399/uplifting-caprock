import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";

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
        <Link
          to="/"
          aria-label="Caprock home"
          className="mb-10 inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/20 focus-visible:ring-offset-4"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#003478]">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-r-transparent" />
          </span>
          <span className="text-sm font-bold tracking-[0.14em] text-slate-950">
            CAPROCK
          </span>
        </Link>

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
            !reduceMotion && status === "idle" ? { y: -1 } : undefined
          }
          whileTap={
            !reduceMotion && status === "idle" ? { scale: 0.99 } : undefined
          }
          transition={{ duration: 0.15 }}
          className="group flex h-12 w-full items-center justify-center rounded-lg bg-[#003478] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#00295f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003478]/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={status}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="flex items-center justify-center gap-2"
              aria-live="polite"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : status === "success" ? (
                <>
                  <Check className="h-4 w-4" />
                  Signed in
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </>
              )}
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
