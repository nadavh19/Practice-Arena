"use client";

import { useEffect, useRef, type ChangeEvent, type TextareaHTMLAttributes } from "react";
import { fieldControlClassName } from "@/app/components/ui/form-field";

type AutoResizeTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> & {
  maxAutoHeight?: number;
  minRows?: number;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  value: string;
};

export function AutoResizeTextarea({
  className,
  maxAutoHeight = 160,
  minRows = 3,
  onChange,
  value,
  ...props
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, maxAutoHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxAutoHeight ? "auto" : "hidden";
  }, [maxAutoHeight, value]);

  const classes = [fieldControlClassName, "resize-none overflow-hidden", className ?? ""].filter(Boolean).join(" ");

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      rows={minRows}
      className={classes}
      {...props}
    />
  );
}
