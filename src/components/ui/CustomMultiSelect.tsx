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
import type { SelectOption } from "./CustomSelect";

type CustomMultiSelectProps = {
  id: string;
  values: string[];
  options: SelectOption[];
  onChange: (values: string[]) => void;
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

export function CustomMultiSelect({
  id,
  values,
  options,
  onChange,
  placeholder = "Select one or more options",
  error = false,
  disabled = false,
  searchable = false,
  searchPlaceholder = "Search options",
}: CustomMultiSelectProps) {
  const menuId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOptions = useMemo(
    () => options.filter((option) => values.includes(option.value)),
    [options, values],
  );
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
    const gap = 8;
    const desiredHeight = Math.min(
      380,
      options.length * 48 + (searchable ? 116 : 58),
    );
    const spaceBelow = window.innerHeight - rect.bottom - gutter - gap;
    const spaceAbove = rect.top - gutter - gap;
    const placeAbove =
      spaceBelow < Math.min(240, desiredHeight) && spaceAbove > spaceBelow;
    const width = Math.min(
      Math.max(rect.width, 260),
      window.innerWidth - gutter * 2,
    );
    const left = Math.min(
      Math.max(gutter, rect.left),
      window.innerWidth - width - gutter,
    );
    const maxHeight = Math.max(
      180,
      Math.min(desiredHeight, placeAbove ? spaceAbove : spaceBelow),
    );

    setPosition(
      placeAbove
        ? {
            left,
            width,
            maxHeight,
            bottom: window.innerHeight - rect.top + gap,
          }
        : { left, width, maxHeight, top: rect.bottom + gap },
    );
  };

  useLayoutEffect(() => {
    if (open) updatePosition();
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
    setActiveIndex(0);
    if (searchable) {
      window.requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [open, searchable]);

  useEffect(() => {
    if (open) setActiveIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    if (!open || !position || !filteredOptions.length) return;
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`${menuId}-option-${activeIndex}`)
        ?.scrollIntoView({ block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeIndex, filteredOptions.length, menuId, open, position]);

  const toggleOption = (optionValue: string) => {
    onChange(
      values.includes(optionValue)
        ? values.filter((value) => value !== optionValue)
        : [...values, optionValue],
    );
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
      if (!open) setOpen(true);
      else moveActive(event.key === "ArrowDown" ? 1 : -1);
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
    if (event.key === "Enter" && filteredOptions[activeIndex]) {
      event.preventDefault();
      toggleOption(filteredOptions[activeIndex].value);
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

  const selectionText = selectedOptions.length
    ? selectedOptions.length <= 2
      ? selectedOptions.map((option) => option.value).join(", ")
      : `${selectedOptions
          .slice(0, 2)
          .map((option) => option.value)
          .join(", ")} +${selectedOptions.length - 2}`
    : placeholder;

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
          className={`min-w-0 flex-1 truncate ${selectedOptions.length ? "font-normal text-slate-950" : "text-slate-400"}`}
        >
          {selectionText}
        </span>
        {selectedOptions.length ? (
          <span className="shrink-0 rounded-full bg-[#dce7f2] px-2 py-0.5 text-[10px] font-bold text-slate-800">
            {selectedOptions.length}
          </span>
        ) : null}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180 text-[#003478]" : ""}`}
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
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#003478] focus:bg-white focus:ring-3 focus:ring-[#003478]/[0.07]"
                    />
                  </div>
                </div>
              ) : null}

              <div
                id={`${menuId}-listbox`}
                role="listbox"
                aria-multiselectable="true"
                className="min-h-0 overflow-y-auto py-1"
              >
                {filteredOptions.length ? (
                  filteredOptions.map((option, index) => {
                    const selected = values.includes(option.value);
                    const active = index === activeIndex;
                    return (
                      <button
                        key={option.value}
                        id={`${menuId}-option-${index}`}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onPointerMove={() => setActiveIndex(index)}
                        onClick={() => toggleOption(option.value)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                          selected
                            ? "bg-[#dce7f2]"
                            : active
                              ? "bg-[rgba(0,52,120,0.055)]"
                              : "hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${selected ? "border-[#003478] bg-[#003478] text-white" : "border-slate-300 bg-white text-transparent"}`}
                        >
                          <Check className="h-3 w-3" strokeWidth={2.7} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-slate-800">
                            {option.label}
                          </span>
                          {option.description ? (
                            <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                              {option.description}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-7 text-center text-xs font-semibold text-slate-500">
                    No matching options
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 px-2 py-2">
                <span className="text-[10px] font-medium text-slate-400">
                  {values.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    window.requestAnimationFrame(() =>
                      document.getElementById(id)?.focus(),
                    );
                  }}
                  className="h-8 rounded-lg bg-[#003478] px-3 text-[10px] font-bold text-white transition hover:bg-[#002b63]"
                >
                  Done
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
