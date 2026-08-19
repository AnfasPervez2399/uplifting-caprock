import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/cn";

interface Option {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  label: string;
  placeholder?: string;
  icon?: React.ReactNode;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Select({
  label,
  placeholder = "Select an option",
  icon,
  options,
  value,
  onChange,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <label className="mb-2 block text-sm font-medium text-ink">{label}</label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "group flex h-14 w-full items-center justify-between rounded-2xl",
          "border border-slate-200 bg-white px-4",
          "shadow-sm transition-all duration-300",
          "hover:border-slate-300 hover:shadow-md",
          "focus:border-caprock focus:outline-none",
          "focus:ring-4 focus:ring-caprock/10",
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-slate-400">{icon}</div>}

          <span
            className={cn(
              "text-sm",
              selected ? "font-medium text-ink" : "text-slate-400",
            )}
          >
            {selected?.label || placeholder}
          </span>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 10,
              scale: 0.98,
            }}
            transition={{
              duration: 0.2,
            }}
            className={cn(
              "absolute z-50 mt-2 w-full overflow-hidden",
              "rounded-2xl border border-slate-200",
              "bg-white p-2 shadow-2xl",
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between",
                  "rounded-xl px-4 py-3 text-left",
                  "transition-all hover:bg-slate-100",
                )}
              >
                <div className="flex items-center gap-3">
                  {option.icon}

                  <span className="text-sm text-ink">{option.label}</span>
                </div>

                {value === option.value && (
                  <Check className="h-4 w-4 text-caprock" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
