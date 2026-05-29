"use client";

import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { AppButton } from "@/app/components/ui/app-button";

type ChatComposerProps = {
  disabled?: boolean;
  maxLength?: number;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  sendingLabel?: string;
  submitLabel?: string;
  value: string;
};

const MAX_TEXTAREA_HEIGHT = 160;

export function ChatComposer({
  disabled = false,
  maxLength = 2000,
  onChange,
  onSubmit,
  placeholder = "Ask a question...",
  sendingLabel = "Sending...",
  submitLabel = "Send",
  value,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const canSubmit = value.trim().length > 0 && !disabled;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [value]);

  function submitIfReady() {
    if (!canSubmit) {
      return;
    }

    onSubmit();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitIfReady();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    submitIfReady();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-800">Message</span>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          maxLength={maxLength}
          disabled={disabled}
          className="min-h-14 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-zinc-950 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.7)] outline-none transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-slate-400 focus:border-emerald-600 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        />
      </label>
      <AppButton type="submit" disabled={!canSubmit} className="sm:mb-0.5">
        {disabled ? sendingLabel : submitLabel}
      </AppButton>
    </form>
  );
}
