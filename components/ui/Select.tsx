"use client";

import {
  forwardRef,
  useId,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
  leading?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      hint,
      error,
      options,
      placeholder,
      containerClassName,
      leading,
      className,
      id,
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const descriptionId = error
      ? `${selectId}-error`
      : hint
        ? `${selectId}-hint`
        : undefined;

    return (
      <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
        {label ? (
          <label
            htmlFor={selectId}
              className="text-sm font-medium text-zinc-900"
          >
            {label}
          </label>
        ) : null}

        <div
          className={cn(
            "relative flex h-11 w-full items-center rounded-xl border bg-white px-3 transition-colors",
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
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={descriptionId}
            className={cn(
              "h-full w-full min-w-0 appearance-none bg-transparent pr-8 text-sm text-zinc-900 outline-none",
              "disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options
              ? options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))
              : children}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute right-3 h-4 w-4 text-zinc-500"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
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
  },
);
