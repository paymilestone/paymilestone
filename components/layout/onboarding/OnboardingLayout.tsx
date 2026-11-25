import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppImages } from "@/lib/app_images";
import { cn } from "@/lib/utils";

export type OnboardingStep = {
  id: number;
  title: string;
  description: string;
};

type OnboardingLayoutProps = {
  steps: OnboardingStep[];
  currentStep: number;
  title: string;
  sidebarFooter: string;
  children: ReactNode;
  walletBadge?: string;
  headerRightText?: string;
};

export function OnboardingLayout({
  steps,
  currentStep,
  title,
  sidebarFooter,
  children,
  walletBadge,
  headerRightText = "Setup takes about 2 minutes",
}: OnboardingLayoutProps) {
  const activeStep = steps.find((step) => step.id === currentStep) ?? steps[0];

  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10 lg:py-5">
        <Link href="/" className="flex items-center" aria-label="PayMilestone home">
          <Image
            src={AppImages.logo}
            alt="PayMilestone"
            width={140}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          {headerRightText ? (
            <p className="hidden text-sm font-medium text-zinc-500 sm:block">
              {headerRightText}
            </p>
          ) : null}
          {walletBadge ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              {walletBadge}
            </span>
          ) : null}
        </div>
      </header>

      <div className="border-t border-zinc-100 px-5 py-4 sm:px-8 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-zinc-700">
            Step {currentStep} of {steps.length}
          </p>
          <p className="truncate text-sm font-medium text-zinc-500">{activeStep.title}</p>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E3ECE9]">
          <div
            className="h-full rounded-full bg-[#0E5E5A] transition-all"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-73px)] flex-col lg:flex-row">
        <aside className="hidden w-[360px] shrink-0 flex-col bg-[#EAF3F1] px-10 pb-10 pt-10 lg:flex xl:w-[420px] xl:px-14">
          <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">SET UP</p>
          <h1 className="mt-3 max-w-[320px] text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-zinc-950">
            {title}
          </h1>

          <ol className="mt-10 space-y-7">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isComplete = step.id < currentStep;
              return (
                <li key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                        isActive && "border-[#0E5E5A] bg-[#0E5E5A] text-white",
                        isComplete && "border-[#0E5E5A] bg-[#DCEEEB] text-[#0E5E5A]",
                        !isActive && !isComplete && "border-zinc-300 bg-transparent text-zinc-500",
                      )}
                    >
                      {isComplete ? (
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                          <path d="M5 10.2l3 3L15 6.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </span>
                    {index < steps.length - 1 ? (
                      <span className={cn("mt-2 h-11 w-px", isComplete ? "bg-[#0E5E5A]/35" : "bg-zinc-300/80")} />
                    ) : null}
                  </div>
                  <div className="pt-0.5">
                    <p className={cn("text-[15px] font-semibold leading-6", isActive ? "text-zinc-950" : "text-zinc-500")}>
                      {step.title}
                    </p>
                    <p className={cn("mt-0.5 text-sm leading-6", isActive ? "text-zinc-600" : "text-zinc-400")}>
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-auto max-w-[320px] pt-10 text-sm leading-7 text-zinc-500">
            {sidebarFooter}
          </p>
        </aside>

        <section className="flex flex-1 items-start justify-center bg-white px-5 py-8 sm:px-8 lg:px-12 lg:py-14 xl:px-20">
          <div className="w-full max-w-[640px]">{children}</div>
        </section>
      </div>
    </main>
  );
}
