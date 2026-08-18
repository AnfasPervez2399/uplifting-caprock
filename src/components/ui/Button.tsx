import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/cn";
import { Loader2 } from "lucide-react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary:
    "bg-caprock text-white hover:bg-caprock-light shadow-lg shadow-caprock/20",
  secondary: "bg-ink-muted text-ink hover:bg-surface-dim border border-border",
  ghost: "bg-transparent text-muted hover:text-ink hover:bg-ink-muted/80",
  outline:
    "bg-transparent border border-border text-ink hover:border-caprock/40 hover:bg-caprock/5",
};

const sizes = {
  sm: "px-4 py-2 text-sm gap-1.5",
  md: "px-6 py-3 text-sm gap-2",
  lg: "px-8 py-3.5 text-base gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      whileTap={{
        scale: 0.97,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caprock/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </motion.button>
  );
}
