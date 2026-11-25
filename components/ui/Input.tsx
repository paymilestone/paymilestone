"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    leading,
    trailing,
    containerClassName,
    className,
    id,
    disabled,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-zinc-900"
        >
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          "flex h-11 w-full items-center rounded-xl border bg-white px-3 transition-colors",
          "focus-within:ring-4 focus-within:ring-primary/15",
          error
            ? "border-danger focus-within:border-danger focus-within:ring-danger/15"
            : "border-zinc-300 focus-within:border-primary",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {leading ? (
          <span className="mr-2 inline-flex shrink-0 text-zinc-500">
            {leading}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptionId}
          className={cn(
            "h-full w-full min-w-0 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400",
            "disabled:cursor-not-allowed",
            className,
          )}
          {...props}
        />
        {trailing ? (
          <span className="ml-2 inline-flex shrink-0 text-zinc-500">
            {trailing}
          </span>
        ) : null}
      </div>

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
