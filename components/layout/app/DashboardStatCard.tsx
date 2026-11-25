import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  label: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  iconClassName?: string;
  className?: string;
};

export function DashboardStatCard({ label, value, subtitle, icon, iconClassName, className }: DashboardStatCardProps) {
  return (
    <div className={cn("flex items-start justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5", className)}>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-6 text-zinc-600">{label}</p>
        <p className="mt-2 break-words text-3xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[34px]">{value}</p>
        {subtitle ? <p className="mt-1 text-sm text-zinc-600">{subtitle}</p> : null}
      </div>
      <span className={cn("ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconClassName)}>
        {icon}
      </span>
    </div>
  );
}
