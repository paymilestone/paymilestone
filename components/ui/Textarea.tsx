"use client";

import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
  trailing?: ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, containerClassName, className, id, disabled, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const descriptionId = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

  return (
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      {label ? (
        <label htmlFor={textareaId} className="text-sm font-medium text-zinc-900">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={textareaId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionId}
        className={cn(
          "min-h-[112px] w-full rounded-xl border bg-white px-3 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400",
          "focus:border-primary focus:ring-4 focus:ring-primary/15",
          error ? "border-danger focus:border-danger focus:ring-danger/15" : "border-zinc-300",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={descriptionId} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={descriptionId} className="text-xs text-zinc-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
