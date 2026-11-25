import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Text } from "@/components/ui/Text";

const tags = [
  "Milestone escrow",
  "Wallet signatures",
  "USDC payouts",
  "Mutual settlement",
];

function IconWrap({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DCEEEB] text-primary">
      {children}
    </span>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="5.75" y="10.75" width="12.5" height="8.5" rx="2.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.75 10.75V8.5a3.25 3.25 0 016.5 0v2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SignatureIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M6 17.25h12M7.5 14.25c1.2-1.8 2.7-3.75 4.2-3.75 1.1 0 1.3 1.1 2.1 1.1.95 0 1.8-1.2 2.7-2.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.25 7.5l1.1 1.1 2.15-2.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v6M14 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4.75 8.5A2.75 2.75 0 017.5 5.75h2.4c.5 0 .98.2 1.33.56l.96.94h4.31A2.75 2.75 0 0119.25 10v5.5A2.75 2.75 0 0116.5 18.25h-9A2.75 2.75 0 014.75 15.5V8.5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 12.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TraceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M7 17l3.2-3.2m3.6-3.6L17 7M8.5 7.5h2m-2 0v2m7 5v2m0-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="5.75" y="5.75" width="4.5" height="4.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.75" y="13.75" width="4.5" height="4.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const benefits = [
  {
    title: "Money is locked, not promised",
    description:
      "Each funded milestone sits in the Soroban escrow contract. Neither side can move it alone.",
    icon: <LockIcon />,
  },
  {
    title: "Changes need both signatures",
    description:
      "Edit amounts, deadlines or payment conditions and the provider approves again. Funded milestones stay locked.",
    icon: <SignatureIcon />,
  },
  {
    title: "Disputes pause, they don't punish",
    description:
      "Either side can open one. The payout freezes until you both agree on an outcome.",
    icon: <PauseIcon />,
  },
  {
    title: "Bring your own provider",
    description:
      "Not a marketplace. Invite someone you already work with by wallet address or link.",
    icon: <FolderIcon />,
  },
  {
    title: "Every payout is traceable",
    description:
      "Funding, releases and refunds each link to the Stellar explorer.",
    icon: <TraceIcon />,
  },
];

export function WhyPayMilestoneSection() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
          <div className="flex flex-col items-start">
            <Pill
              variant="outline"
              size="sm"
              dot
              className="border-zinc-300 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-zinc-700"
            >
              WHY PAYMILESTONE
            </Pill>

            <h2 className="mt-5 max-w-xl text-3xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
              Built so neither side has to trust a promise.
            </h2>

            <Text
              as="p"
              variant="body"
              tone="muted"
              className="mt-4 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg"
            >
              The rules live in the escrow contract, not in an inbox. That keeps
              owners and providers on the same page from the first signature to
              the last payout.
            </Text>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            <a
              href="#"
              className="mt-6 text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:text-[#0b4c49]"
            >
              Full audit trail
            </a>

            <div className="mt-8">`r`n              <Link href="/app/onboarding">`r`n                <Button variant="primary" size="lg" className="rounded-xl px-7">`r`n                  Start a project`r`n                </Button>`r`n              </Link>`r`n            </div>
          </div>

          <div className="relative border-l border-[#D4A72C]/60 pl-5 sm:pl-6 lg:border-l lg:border-zinc-200 lg:pl-10">
            <div className="space-y-8 sm:space-y-9">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <IconWrap>{benefit.icon}</IconWrap>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold leading-snug text-zinc-950 sm:text-xl">
                      {benefit.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-zinc-600 sm:text-[15px]">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

