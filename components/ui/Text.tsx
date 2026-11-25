import { type ElementType, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "bodySm"
  | "label"
  | "caption"
  | "overline";

type TextTone = "default" | "muted" | "primary" | "danger" | "success" | "inherit";

type TextWeight = "regular" | "medium" | "semibold" | "bold";

type TextAlign = "left" | "center" | "right";

const variantClasses: Record<TextVariant, string> = {
  h1: "text-4xl leading-tight tracking-tight sm:text-5xl",
  h2: "text-3xl leading-tight tracking-tight sm:text-4xl",
  h3: "text-2xl leading-snug tracking-tight",
  h4: "text-xl leading-snug",
  body: "text-base leading-7",
  bodySm: "text-sm leading-6",
  label: "text-sm leading-5",
  caption: "text-xs leading-5",
  overline: "text-xs uppercase tracking-[0.08em] leading-5",
};

const defaultVariantElement: Record<TextVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  bodySm: "p",
  label: "span",
  caption: "span",
  overline: "span",
};

const defaultVariantWeight: Record<TextVariant, TextWeight> = {
  h1: "bold",
  h2: "bold",
  h3: "semibold",
  h4: "semibold",
  body: "regular",
  bodySm: "regular",
  label: "medium",
  caption: "regular",
  overline: "semibold",
};

const toneClasses: Record<TextTone, string> = {
  default: "text-foreground",
  muted: "text-zinc-600",
  primary: "text-primary",
  danger: "text-danger",
  success: "text-[#0E5E5A]",
  inherit: "text-inherit",
};

const weightClasses: Record<TextWeight, string> = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const alignClasses: Record<TextAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: TextVariant;
  tone?: TextTone;
  weight?: TextWeight;
  align?: TextAlign;
}

export function Text({
  as,
  variant = "body",
  tone = "default",
  weight,
  align = "left",
  className,
  ...props
}: TextProps) {
  const Component = as ?? defaultVariantElement[variant];
  const resolvedWeight = weight ?? defaultVariantWeight[variant];

  return (
    <Component
      className={cn(
        "font-sans",
        variantClasses[variant],
        toneClasses[tone],
        weightClasses[resolvedWeight],
        alignClasses[align],
        className,
      )}
      {...props}
    />
  );
}
