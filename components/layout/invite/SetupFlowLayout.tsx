import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppImages } from "@/lib/app_images";
import { cn } from "@/lib/utils";

export type SetupStep = {
  id: number;
  title: string;
  description: string;
};

type SetupFlowLayoutProps = {
  steps: SetupStep[];
  currentStep: number;
  children: ReactNode;
};

export function SetupFlowLayout({
  steps,
  currentStep,
  children,
}: SetupFlowLayoutProps) {
  const activeStep = steps.find((step) => step.id === currentStep) ?? steps[0];

  return (
    <main className="min-h-screen bg-[#EAF3F1]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-10 lg:py-5">
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
          <p className="hidden text-sm font-medium text-zinc-500 sm:block">
            Setup takes about 2 minutes
          </p>
        </header>

        <div className="px-4 sm:px-6 lg:hidden">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#DCE8E4]">
            <div
              className="h-full rounded-full bg-[#0E5E5A]"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-medium text-zinc-600">
            Step {currentStep} of {steps.length}
            <span className="ml-2 text-zinc-500">{activeStep.title}</span>
          </p>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row">
          <aside className="hidden w-full max-w-[380px] flex-col px-10 pb-10 pt-8 lg:flex xl:max-w-[420px]">
            <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">
              SET UP
            </p>
            <h1 className="mt-3 max-w-sm text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950">
              Get ready to be paid by milestone
            </h1>

            <ol className="mt-10 space-y-6">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isComplete = step.id < currentStep;
                return (
                  <li key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                          isActive &&
                            "border-[#0E5E5A] bg-[#0E5E5A] text-white",
                          isComplete &&
                            "border-[#0E5E5A] bg-[#DCEEEB] text-[#0E5E5A]",
                          !isActive &&
                            !isComplete &&
                            "border-zinc-300 bg-transparent text-zinc-500",
                        )}
                      >
                        {isComplete ? (
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path
                              d="M5 10.2l3 3L15 6.8"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          step.id
                        )}
                      </span>
                      {index < steps.length - 1 ? (
                        <span
                          className={cn(
                            "mt-2 h-10 w-px",
                            isComplete ? "bg-[#0E5E5A]/40" : "bg-zinc-300/80",
                          )}
                        />
                      ) : null}
                    </div>
                    <div className="pt-0.5">
                      <p
                        className={cn(
                          "text-base font-semibold",
                          isActive ? "text-zinc-950" : "text-zinc-500",
                        )}
                      >
                        {step.title}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-sm",
                          isActive ? "text-zinc-700" : "text-zinc-400",
                        )}
                      >
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="mt-auto max-w-sm pt-10 text-sm leading-6 text-zinc-500">
              Get paid as the work gets done. Payments sit in an escrow contract
              until each milestone is approved.
            </p>
          </aside>

          <section className="flex flex-1 items-start justify-center px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="w-full max-w-[720px]">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
