import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
} from "lucide-react";

const countryOptions = [
  { label: "Australia", code: "+61" },
  { label: "Pakistan", code: "+92" },
  { label: "United States", code: "+1" },
  { label: "United Kingdom", code: "+44" },
  { label: "UAE", code: "+971" },
];

const applicationOptions = [
  {
    label: "Individual",
    value: "individual",
    description: "For personal investing",
  },
  {
    label: "Joint",
    value: "joint",
    description: "For two or more applicants",
  },
  {
    label: "Company",
    value: "company",
    description: "For incorporated entities",
  },
  {
    label: "Trust",
    value: "trust",
    description: "For trust structures",
  },
  {
    label: "SMSF",
    value: "smsf",
    description: "For self-managed super funds",
  },
];

export function SignUp() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [focused, setFocused] = useState<string | null>(null);

  const [countryCode, setCountryCode] = useState("+61");
  const [countryOpen, setCountryOpen] = useState(false);

  const [applicationType, setApplicationType] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordStrong =
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const nextStep = () => {
    setStep(2);
  };

  const previousStep = () => {
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    if (!applicationType) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate("/onboarding");
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="relative w-full"
    >
      {/* Header */}
      <div className="mb-9">
        <div className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>

            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Create account
            </span>
          </div>

          <span className="text-xs font-medium text-slate-400">
            0{step} / 02
          </span>
        </div>

        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {[1, 2].map((item) => (
            <motion.div
              key={item}
              animate={{
                width: item <= step ? "50%" : "25%",
                opacity: item <= step ? 1 : 0.35,
              }}
              className="h-[3px] rounded-full bg-black"
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step-one-heading"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
            >
              <h2 className="text-[clamp(2.3rem,5vw,3.7rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-slate-950">
                Let's get
                <br />
                <span className="text-slate-400">started.</span>
              </h2>

              <p className="mt-5 text-[15px] leading-6 text-slate-500">
                Create your secure Caprock account in just a few steps.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="step-two-heading"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
            >
              <h2 className="text-[clamp(2.3rem,5vw,3.7rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-slate-950">
                Tell us
                <br />
                <span className="text-slate-400">about you.</span>
              </h2>

              <p className="mt-5 text-[15px] leading-6 text-slate-500">
                Choose the application structure that best fits you.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step-one"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.35 }}
              className="space-y-7"
            >
              {/* Full name */}
              <PremiumField
                label="Full name"
                icon={<User />}
                type="text"
                placeholder="Jane Doe"
                field="name"
                focused={focused}
                setFocused={setFocused}
              />

              {/* Email */}
              <PremiumField
                label="Email address"
                icon={<Mail />}
                type="email"
                placeholder="you@example.com"
                field="email"
                focused={focused}
                setFocused={setFocused}
              />

              {/* Phone */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Mobile number
                </label>

                <div className="relative flex items-center border-b border-slate-200">
                  {/* Country */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setCountryOpen(!countryOpen)}
                      className="flex items-center gap-2 border-r border-slate-200 py-3 pr-4 text-sm font-semibold text-slate-900"
                    >
                      {countryCode}

                      <ChevronDown
                        className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                          countryOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {countryOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.98 }}
                          className="absolute left-0 top-[calc(100%+8px)] z-30 w-52 overflow-hidden rounded-2xl bg-white p-1 shadow-[0_20px_60px_rgba(0,0,0,0.14)] ring-1 ring-black/5"
                        >
                          {countryOptions.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setCountryCode(country.code);
                                setCountryOpen(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                                countryCode === country.code
                                  ? "bg-slate-100 font-semibold"
                                  : "hover:bg-slate-50"
                              }`}
                            >
                              <span>{country.label}</span>
                              <span className="text-slate-400">
                                {country.code}
                              </span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Phone className="ml-4 mr-3 h-[18px] w-[18px] text-slate-400" />

                  <input
                    type="tel"
                    placeholder="412 345 678"
                    className="w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Password */}
              <PasswordField
                label="Password"
                value={password}
                setValue={setPassword}
                visible={showPassword}
                setVisible={setShowPassword}
                focused={focused}
                setFocused={setFocused}
                field="password"
              />

              {/* Password strength */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="-mt-3"
                >
                  <div className="mb-2 flex gap-1">
                    {[1, 2, 3, 4].map((item) => (
                      <motion.div
                        key={item}
                        animate={{
                          opacity: password.length >= item * 3 ? 1 : 0.2,
                        }}
                        className="h-1 flex-1 rounded-full bg-black"
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-400">
                    {passwordStrong
                      ? "Strong password"
                      : "Use 8+ characters with a number and uppercase letter"}
                  </p>
                </motion.div>
              )}

              {/* Confirm */}
              <PasswordField
                label="Confirm password"
                value={confirmPassword}
                setValue={setConfirmPassword}
                visible={showConfirm}
                setVisible={setShowConfirm}
                focused={focused}
                setFocused={setFocused}
                field="confirm"
              />

              {confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 text-xs font-medium ${
                    passwordsMatch ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {passwordsMatch ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Passwords match
                    </>
                  ) : (
                    "Passwords don't match"
                  )}
                </motion.div>
              )}

              {/* Continue */}
              <motion.button
                type="button"
                onClick={nextStep}
                disabled={!passwordStrong || !passwordsMatch}
                whileHover={{
                  scale: passwordStrong && passwordsMatch ? 1.01 : 1,
                }}
                whileTap={{ scale: 0.985 }}
                className="group flex h-[58px] w-full items-center justify-center gap-3 rounded-full bg-black text-sm font-semibold text-white shadow-[0_15px_40px_rgba(0,0,0,0.16)] transition disabled:cursor-not-allowed disabled:opacity-30"
              >
                Continue
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="step-two"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Application options */}
              <div className="space-y-3">
                {applicationOptions.map((option, index) => {
                  const selected = applicationType === option.value;

                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.05,
                      }}
                      onClick={() => setApplicationType(option.value)}
                      whileHover={{ x: 4 }}
                      className={`group relative flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-all duration-300 ${
                        selected
                          ? "bg-black text-white shadow-[0_15px_35px_rgba(0,0,0,0.14)]"
                          : "bg-slate-50 text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                          selected ? "bg-white/10" : "bg-white shadow-sm"
                        }`}
                      >
                        <Briefcase
                          className={`h-5 w-5 ${
                            selected ? "text-white" : "text-slate-500"
                          }`}
                        />
                      </span>

                      <span className="flex-1">
                        <span className="block text-sm font-semibold">
                          {option.label}
                        </span>

                        <span
                          className={`mt-0.5 block text-xs ${
                            selected ? "text-white/55" : "text-slate-400"
                          }`}
                        >
                          {option.description}
                        </span>
                      </span>

                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
                          selected
                            ? "bg-white text-black"
                            : "border border-slate-200"
                        }`}
                      >
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Terms */}
              <div className="pt-2">
                <p className="text-xs leading-5 text-slate-400">
                  By continuing, you agree to our{" "}
                  <button
                    type="button"
                    className="font-semibold text-black underline underline-offset-2"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="font-semibold text-black underline underline-offset-2"
                  >
                    Privacy Policy
                  </button>
                  .
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={previousStep}
                  whileTap={{ scale: 0.97 }}
                  className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-slate-100 text-black transition hover:bg-slate-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={!applicationType || loading}
                  whileHover={{
                    scale: applicationType ? 1.01 : 1,
                  }}
                  whileTap={{ scale: 0.985 }}
                  className="group flex h-[58px] flex-1 items-center justify-center gap-3 rounded-full bg-black text-sm font-semibold text-white shadow-[0_15px_40px_rgba(0,0,0,0.16)] transition disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:translate-x-1">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-9 text-center text-sm text-slate-500"
      >
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-black transition hover:text-slate-500"
        >
          Sign in
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Premium Field                                                              */
/* -------------------------------------------------------------------------- */

function PremiumField({
  label,
  icon,
  type,
  placeholder,
  field,
  focused,
  setFocused,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  field: string;
  focused: string | null;
  setFocused: (value: string | null) => void;
}) {
  return (
    <div className="relative">
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </label>

      <div
        className={`relative flex items-center transition-all duration-300 ${
          focused === field ? "translate-x-1" : ""
        }`}
      >
        <span
          className={`mr-3 transition-colors ${
            focused === field ? "text-black" : "text-slate-400"
          }`}
        >
          {icon}
        </span>

        <input
          type={type}
          placeholder={placeholder}
          required
          onFocus={() => setFocused(field)}
          onBlur={() => setFocused(null)}
          className="w-full bg-transparent py-3 text-[15px] text-slate-950 outline-none placeholder:text-slate-300"
        />

        <motion.div
          initial={false}
          animate={{
            scaleX: focused === field ? 1 : 0,
            opacity: focused === field ? 1 : 0,
          }}
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-black"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Password Field                                                             */
/* -------------------------------------------------------------------------- */

function PasswordField({
  label,
  value,
  setValue,
  visible,
  setVisible,
  focused,
  setFocused,
  field,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  visible: boolean;
  setVisible: (value: boolean) => void;
  focused: string | null;
  setFocused: (value: string | null) => void;
  field: string;
}) {
  return (
    <div className="relative">
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </label>

      <div
        className={`relative flex items-center transition-all duration-300 ${
          focused === field ? "translate-x-1" : ""
        }`}
      >
        <Lock
          className={`mr-3 h-[18px] w-[18px] transition-colors ${
            focused === field ? "text-black" : "text-slate-400"
          }`}
        />

        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            label === "Password"
              ? "Create a strong password"
              : "Repeat your password"
          }
          required
          onFocus={() => setFocused(field)}
          onBlur={() => setFocused(null)}
          className="w-full bg-transparent py-3 pr-10 text-[15px] text-slate-950 outline-none placeholder:text-slate-300"
        />

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-0 p-2 text-slate-400 transition hover:text-black"
        >
          {visible ? (
            <EyeOff className="h-[17px] w-[17px]" />
          ) : (
            <Eye className="h-[17px] w-[17px]" />
          )}
        </button>

        <motion.div
          initial={false}
          animate={{
            scaleX: focused === field ? 1 : 0,
            opacity: focused === field ? 1 : 0,
          }}
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-black"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200" />
    </div>
  );
}
