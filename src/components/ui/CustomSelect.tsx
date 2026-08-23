import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
};

type CustomSelectProps = {
  id: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
};

type MenuPosition = {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
};

export function CustomSelect({
  id,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  error = false,
  disabled = false,
}: CustomSelectProps) {
  const menuId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const [activeIndex, setActiveIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : 0,
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const updatePosition = () => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const gutter = 12;
    const menuGap = 8;
    const desiredHeight = Math.min(256, options.length * 54 + 12);
    const spaceBelow = window.innerHeight - rect.bottom - gutter - menuGap;
    const spaceAbove = rect.top - gutter - menuGap;
    const placeAbove =
      spaceBelow < Math.min(220, desiredHeight) && spaceAbove > spaceBelow;
    const width = Math.min(
      Math.max(rect.width, 220),
      window.innerWidth - gutter * 2,
    );
    const left = Math.min(
      Math.max(gutter, rect.left),
      window.innerWidth - width - gutter,
    );
    const maxHeight = Math.max(
      120,
      Math.min(desiredHeight, placeAbove ? spaceAbove : spaceBelow),
    );

    setPosition(
      placeAbove
        ? {
            left,
            width,
            maxHeight,
            bottom: window.innerHeight - rect.top + menuGap,
          }
        : {
            left,
            width,
            maxHeight,
            top: rect.bottom + menuGap,
          },
    );
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const handleViewportChange = () => updatePosition();

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, selectedIndex]);

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    window.requestAnimationFrame(() => document.getElementById(id)?.focus());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(
        (current) => (current + direction + options.length) % options.length,
      );
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      choose(activeIndex);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  const menuStyle: CSSProperties | undefined = position
    ? {
        position: "fixed",
        left: position.left,
        top: position.top,
        bottom: position.bottom,
        width: position.width,
        maxHeight: position.maxHeight,
      }
    : undefined;

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${menuId}-listbox`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3.5 text-left text-sm outline-none transition ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/[0.08]"
            : open
              ? "border-[#003478] ring-4 ring-[#003478]/[0.07]"
              : "border-slate-200 hover:border-slate-300 focus:border-[#003478] focus:ring-4 focus:ring-[#003478]/[0.07]"
        } disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
      >
        <span
          className={`min-w-0 flex-1 truncate ${selected ? "text-slate-950" : "text-slate-400"}`}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-[#003478]" : ""}`}
        />
      </button>

      {open && position && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              id={`${menuId}-listbox`}
              role="listbox"
              aria-label={placeholder}
              aria-activedescendant={`${menuId}-option-${activeIndex}`}
              style={menuStyle}
              className="z-[100] overflow-y-auto rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-[0_20px_48px_-20px_rgba(15,23,42,0.28)]"
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;

                return (
                  <button
                    key={option.value}
                    id={`${menuId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onPointerMove={() => setActiveIndex(index)}
                    onClick={() => choose(index)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition ${
                      isActive
                        ? "bg-[rgba(0,52,120,0.065)]"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-xs font-semibold ${isSelected ? "text-[#003478]" : "text-slate-700"}`}
                      >
                        {option.label}
                      </span>
                      {option.description ? (
                        <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${isSelected ? "bg-[#003478] text-white" : "text-transparent"}`}
                    >
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
