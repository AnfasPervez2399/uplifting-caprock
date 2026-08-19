import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";

type FieldProps = {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  required?: boolean;
};

/* -------------------------------------------------------------------------- */
/* Premium bordered field                                                     */
/* -------------------------------------------------------------------------- */

function PremiumField({
  label,
  placeholder,
  type = "text",
  value = "",
  onChange,
  icon,
  required,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      animate={{
        y: focused ? -1 : 0,
      }}
      transition={{ duration: 0.25 }}
      className="group relative"
    >
      <div
        className={`
          relative rounded-[18px]
          border bg-white
          transition-all duration-300
          ${
            focused
              ? "border-[#003478] shadow-[0_0_0_4px_rgba(0,52,120,0.07)]"
              : "border-black/[0.10] hover:border-black/25"
          }
        `}
      >
        {/* Small label sitting on border */}
        <div
          className={`
            absolute -top-[8px] left-4
            px-2 bg-white
            text-[10px] font-bold
            uppercase tracking-[0.15em]
            transition-colors duration-300
            ${focused ? "text-[#003478]" : "text-black/40"}
          `}
        >
          {label}
        </div>

        {/* Field */}
        <div className="flex min-h-[68px] items-center px-4">
          <motion.div
            animate={{
              scale: focused ? 1.05 : 1,
              x: focused ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className={`
              mr-3 flex h-9 w-9
              shrink-0 items-center justify-center
              rounded-xl transition-all duration-300
              ${
                focused
                  ? "bg-[#003478]/[0.07] text-[#003478]"
                  : "bg-black/[0.035] text-black/35"
              }
            `}
          >
            {icon}
          </motion.div>

          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="
              min-w-0 flex-1
              bg-transparent
              py-2
              text-[15px]
              font-medium
              text-black
              outline-none
              placeholder:text-black/25
            "
          />

          {/* Focus indicator */}
          <AnimatePresence>
            {focused && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="
                  ml-2 h-2 w-2
                  rounded-full
                  bg-[#003478]
                  shadow-[0_0_0_4px_rgba(0,52,120,0.08)]
                "
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Premium password field                                                     */
/* -------------------------------------------------------------------------- */

function PremiumPasswordField({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <motion.div
      animate={{
        y: focused ? -1 : 0,
      }}
      className="relative"
    >
      <div
        className={`
          relative rounded-[18px]
          border bg-white
          transition-all duration-300
          ${
            focused
              ? "border-[#003478] shadow-[0_0_0_4px_rgba(0,52,120,0.07)]"
              : "border-black/[0.10] hover:border-black/25"
          }
        `}
      >
        {/* Label */}
        <div
          className={`
            absolute -top-[8px] left-4
            bg-white px-2
            text-[10px] font-bold
            uppercase tracking-[0.15em]
            transition-colors duration-300
            ${focused ? "text-[#003478]" : "text-black/40"}
          `}
        >
          Password
        </div>

        <div className="flex min-h-[68px] items-center px-4">
          <motion.div
            animate={{
              scale: focused ? 1.05 : 1,
            }}
            className={`
              mr-3 flex h-9 w-9
              shrink-0 items-center justify-center
              rounded-xl
              transition-all duration-300
              ${
                focused
                  ? "bg-[#003478]/[0.07] text-[#003478]"
                  : "bg-black/[0.035] text-black/35"
              }
            `}
          >
            <Lock className="h-[16px] w-[16px]" />
          </motion.div>

          <input
            type={visible ? "text" : "password"}
            value={value}
            onChange={onChange}
            placeholder="Enter your password"
            required
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="
              min-w-0 flex-1
              bg-transparent
              py-2
              text-[15px]
              font-medium
              text-black
              outline-none
              placeholder:text-black/25
            "
          />

          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="
              ml-2 flex h-9 w-9
              shrink-0 items-center justify-center
              rounded-xl
              text-black/35
              transition-all
              hover:bg-[#003478]/[0.06]
              hover:text-[#003478]
            "
          >
            {visible ? (
              <EyeOff className="h-[17px] w-[17px]" />
            ) : (
              <Eye className="h-[17px] w-[17px]" />
            )}
          </button>
        </div>

        {/* Bottom progress line */}
        <motion.div
          initial={false}
          animate={{
            scaleX: focused ? 1 : 0,
          }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            absolute bottom-0 left-5 right-5
            h-[2px]
            origin-center
            rounded-full
            bg-[#003478]
          "
        />
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Animated button                                                            */
/* -------------------------------------------------------------------------- */

function SignInButton({ loading }: { loading: boolean }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover="hover"
      whileTap={{
        scale: 0.985,
      }}
      className="
        group relative
        h-[62px] w-full
        overflow-hidden
        rounded-[18px]
        bg-black
        px-5
        text-white
        shadow-[0_12px_35px_rgba(0,0,0,0.13)]
        transition-shadow duration-500
        hover:shadow-[0_18px_45px_rgba(0,0,0,0.20)]
        disabled:cursor-not-allowed
        disabled:opacity-70
      "
    >
      {/* Sliding blue background */}
      <motion.div
        variants={{
          hover: {
            x: 0,
          },
        }}
        initial={{
          x: "-100%",
        }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="
          absolute inset-0
          bg-[#003478]
        "
      />

      {/* Subtle moving shine */}
      <motion.div
        variants={{
          hover: {
            x: "120%",
          },
        }}
        initial={{
          x: "-120%",
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="
          absolute inset-y-0
          -left-1/2
          w-1/2
          skew-x-[-18deg]
          bg-white/[0.08]
        "
      />

      {/* Content */}
      <span className="relative z-10 flex h-full items-center justify-between">
        <span className="flex items-center gap-3 pl-1">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-[14px] font-semibold"
              >
                Signing you in
                <span className="ml-1 inline-flex">
                  <span className="animate-bounce [animation-delay:-0.3s]">
                    .
                  </span>
                  <span className="animate-bounce [animation-delay:-0.15s]">
                    .
                  </span>
                  <span className="animate-bounce">.</span>
                </span>
              </motion.span>
            ) : (
              <motion.span
                key="signin"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[14px] font-semibold"
              >
                Sign in to Caprock
              </motion.span>
            )}
          </AnimatePresence>
        </span>

        {/* Animated arrow */}
        <motion.span
          variants={{
            hover: {
              width: 43,
              rotate: 0,
            },
          }}
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-[13px]
            bg-white
            text-black
            transition-all duration-500
          "
        >
          <motion.span
            variants={{
              hover: {
                x: 2,
                y: -2,
              },
            }}
            className="flex"
          >
            <ArrowUpRight className="h-[17px] w-[17px]" />
          </motion.span>
        </motion.span>
      </span>
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */
/* Login                                                                      */
/* -------------------------------------------------------------------------- */

export function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full"
    >
      {/* Header */}
      <div className="mb-9">
        <motion.div
          initial={{
            opacity: 0,
            x: -8,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.1,
          }}
          className="mb-6 flex items-center gap-2"
        >
          <span
            className="
              flex h-7 w-7
              items-center justify-center
              rounded-[9px]
              bg-[#003478]
              text-white
            "
          >
            <Sparkles className="h-[13px] w-[13px]" />
          </span>

          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/45">
            Secure access
          </span>
        </motion.div>

        <motion.h1
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
            duration: 0.5,
          }}
          className="
            text-[clamp(2.5rem,5vw,3.8rem)]
            font-semibold
            leading-[0.92]
            tracking-[-0.06em]
            text-black
          "
        >
          Welcome
          <br />
          <span className="text-black/35">back.</span>
        </motion.h1>

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.3,
          }}
          className="
            mt-5 max-w-[380px]
            text-[14px]
            leading-6
            text-black/45
          "
        >
          Your portfolio is waiting. Sign in to pick up where you left off.
        </motion.p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <PremiumField
          label="Email address"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-[16px] w-[16px]" />}
          required
        />

        <PremiumPasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Options */}
        <div className="flex items-center justify-between px-1 pt-1">
          <button
            type="button"
            onClick={() => setRemember((value) => !value)}
            className="
              group flex items-center gap-2.5
              text-[12px] font-medium
              text-black/45
              transition-colors
              hover:text-black
            "
          >
            <motion.span
              animate={{
                backgroundColor: remember ? "#003478" : "#ffffff",
                borderColor: remember ? "#003478" : "rgba(0,0,0,0.16)",
              }}
              className="
                flex h-[18px] w-[18px]
                items-center justify-center
                rounded-[6px]
                border
              "
            >
              <AnimatePresence>
                {remember && (
                  <motion.span
                    initial={{
                      opacity: 0,
                      scale: 0.5,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.5,
                    }}
                  >
                    <Check className="h-3 w-3 text-white" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
            Remember me
          </button>

          <button
            type="button"
            className="
              relative
              text-[12px]
              font-semibold
              text-[#003478]
              after:absolute
              after:-bottom-1
              after:left-0
              after:h-px
              after:w-full
              after:origin-right
              after:scale-x-0
              after:bg-[#003478]
              after:transition-transform
              hover:after:origin-left
              hover:after:scale-x-100
            "
          >
            Forgot password?
          </button>
        </div>

        {/* CTA */}
        <SignInButton loading={loading} />
      </form>

      {/* Footer */}
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.55,
        }}
        className="
          mt-8
          flex items-center
          justify-between
          border-t border-black/[0.08]
          pt-6
        "
      >
        <p className="text-[12px] text-black/40">New to Caprock?</p>

        <Link
          to="/signup"
          className="
            group flex items-center gap-1.5
            text-[12px]
            font-bold
            text-black
          "
        >
          Create an account
          <span
            className="
              flex h-6 w-6
              items-center justify-center
              rounded-full
              border border-black/10
              transition-all duration-300
              group-hover:border-[#003478]
              group-hover:bg-[#003478]
              group-hover:text-white
            "
          >
            <ArrowUpRight
              className="
                h-3 w-3
                transition-transform
                group-hover:translate-x-[1px]
                group-hover:-translate-y-[1px]
              "
            />
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}
