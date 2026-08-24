import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";

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
  searchable?: boolean;
  searchPlaceholder?: string;
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
  searchable = false,
  searchPlaceholder = "Search options",
}: CustomSelectProps) {
  const menuId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    if (!searchable || !query) return options;
    return options.filter((option) =>
      `${option.label} ${option.description || ""}`
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [options, searchTerm, searchable]);

  const updatePosition = () => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const gutter = 12;
    const menuGap = 8;
    const searchHeight = searchable ? 58 : 0;
    const desiredHeight = Math.min(
      320,
      options.length * 54 + 12 + searchHeight,
    );
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
      150,
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
  }, [open, options.length, searchable]);

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
    if (!open) {
      setSearchTerm("");
      return;
    }

    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    if (searchable) {
      window.requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [open, searchable, selectedIndex]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    if (!open || !position || !filteredOptions.length) return;
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`${menuId}-option-${activeIndex}`)
        ?.scrollIntoView({
          block: "nearest",
        });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeIndex, filteredOptions.length, menuId, open, position]);

  const choose = (index: number) => {
    const option = filteredOptions[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    window.requestAnimationFrame(() => document.getElementById(id)?.focus());
  };

  const moveActive = (direction: 1 | -1) => {
    if (!filteredOptions.length) return;
    setActiveIndex(
      (current) =>
        (current + direction + filteredOptions.length) % filteredOptions.length,
    );
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      moveActive(event.key === "ArrowDown" ? 1 : -1);
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

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      choose(activeIndex);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      window.requestAnimationFrame(() => document.getElementById(id)?.focus());
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
        onKeyDown={handleTriggerKeyDown}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3.5 text-left text-sm font-normal leading-5 outline-none transition ${
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
              style={menuStyle}
              className="z-[100] flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-[0_20px_48px_-20px_rgba(15,23,42,0.28)]"
            >
              {searchable ? (
                <div className="shrink-0 border-b border-slate-100 p-1.5 pb-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder={searchPlaceholder}
                      aria-label={searchPlaceholder}
                      aria-controls={`${menuId}-listbox`}
                      aria-activedescendant={
                        filteredOptions.length
                          ? `${menuId}-option-${activeIndex}`
                          : undefined
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#003478] focus:bg-white focus:ring-3 focus:ring-[#003478]/[0.07]"
                    />
                  </div>
                </div>
              ) : null}

              <div
                id={`${menuId}-listbox`}
                role="listbox"
                aria-label={placeholder}
                aria-activedescendant={
                  filteredOptions.length
                    ? `${menuId}-option-${activeIndex}`
                    : undefined
                }
                className="min-h-0 overflow-y-auto"
              >
                {filteredOptions.length ? (
                  filteredOptions.map((option, index) => {
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
                          isSelected
                            ? "bg-[#dce7f2]"
                            : isActive
                              ? "bg-[rgba(0,52,120,0.065)]"
                              : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-xs font-semibold ${isSelected ? "text-slate-900" : "text-slate-700"}`}
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
                          className={`grid h-5 w-5 shrink-0 place-items-center ${isSelected ? "text-[#003478]" : "text-transparent"}`}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-7 text-center">
                    <p className="text-xs font-semibold text-slate-600">
                      No matching options
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Try another search term.
                    </p>
                  </div>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
