"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

export type AppSelectOption<TValue extends string = string> = {
  description?: string;
  label: string;
  value: TValue;
};

type AppSelectProps<TValue extends string = string> = {
  className?: string;
  disabled?: boolean;
  helperText?: string;
  label: string;
  onChange: (value: TValue) => void;
  options: AppSelectOption<TValue>[];
  value: TValue;
};

export function AppSelect<TValue extends string = string>({
  className = "",
  disabled = false,
  helperText,
  label,
  onChange,
  options,
  value,
}: AppSelectProps<TValue>) {
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const selectedOption = options[selectedIndex] ?? options[0];
  const listboxId = `${baseId}-listbox`;

  const normalizedOptions = useMemo(() => options, [options]);

  useEffect(() => {
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  function selectOption(index: number) {
    const nextOption = normalizedOptions[index];
    if (!nextOption) {
      return;
    }

    onChange(nextOption.value);
    setOpen(false);
  }

  function moveActiveIndex(direction: 1 | -1) {
    setActiveIndex((current) => {
      const optionCount = normalizedOptions.length;
      return (current + direction + optionCount) % optionCount;
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || normalizedOptions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      moveActiveIndex(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      moveActiveIndex(-1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      selectOption(activeIndex);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={`relative block space-y-1.5 ${className}`}>
      <span className="text-sm font-medium text-violet-950">{label}</span>
      {helperText ? <span className="block text-xs leading-5 text-slate-500">{helperText}</span> : null}

      <button
        type="button"
        disabled={disabled}
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          setOpen((current) => !current);
        }}
        onKeyDown={handleKeyDown}
        className="mt-2 flex w-full items-center justify-between gap-4 rounded-2xl border border-violet-200 bg-white px-4 py-3 text-left text-sm text-[#171326] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_30px_-28px_rgba(76,29,149,0.42)] transition-[border-color,box-shadow,transform,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-violet-300 hover:bg-violet-50/60 focus:border-violet-700/50 focus:outline-none focus:ring-2 focus:ring-violet-700/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="min-w-0">
          <span className="block truncate font-semibold tracking-tight">{selectedOption?.label ?? "Select"}</span>
          {selectedOption?.description ? (
            <span className="mt-0.5 block truncate text-xs text-slate-500">{selectedOption.description}</span>
          ) : null}
        </span>
        <span
          aria-hidden="true"
          className={`grid size-8 shrink-0 place-items-center rounded-full border border-violet-200 bg-violet-50 text-violet-700 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-violet-200/80 bg-white p-1.5 shadow-[0_24px_55px_-32px_rgba(76,29,149,0.35)]"
        >
          {normalizedOptions.map((option, index) => {
            const selected = option.value === value;
            const active = index === activeIndex;

            return (
              <button
                id={`${baseId}-option-${index}`}
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
                className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.99] ${
                  selected
                    ? "bg-violet-50 text-violet-950 ring-1 ring-violet-200/80"
                    : active
                      ? "bg-violet-100 text-violet-950"
                      : "text-slate-700 hover:bg-violet-50"
                }`}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold tracking-tight">{option.label}</span>
                  {option.description ? (
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">{option.description}</span>
                  ) : null}
                </span>
                {selected ? (
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-amber-400 shadow-[0_0_0_3px_rgba(250,204,21,0.18)]" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
