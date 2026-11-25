import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type PillVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "outline";

type PillSize = "sm" | "md";

const variantClasses: Record<PillVariant, string> = {
  primary: "bg-primary text-white",
  secondary: "bg-primary-light text-primary",
  success: "bg-[#DCEEEB] text-[#0E5E5A]",
  warning: "bg-gold-light text-gold",
  danger: "bg-danger-subtle text-danger",
  info: "bg-blue-light text-blue",
  neutral: "bg-subtle text-zinc-700",
  outline: "border border-zinc-300 bg-transparent text-zinc-700",
};

const sizeClasses: Record<PillSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: PillVariant;
  size?: PillSize;
  dot?: boolean;
}

export function Pill({
  variant = "neutral",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium leading-none whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
        />
      ) : null}
      {children}
    </span>
  );
}
