import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type OnboardingCardProps = {
  children: ReactNode;
  className?: string;
};

export function OnboardingCard({ children, className }: OnboardingCardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8 lg:p-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
