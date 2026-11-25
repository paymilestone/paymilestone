import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function ContractIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M7 3.75h7.19c.33 0 .65.13.88.37l2.81 2.81c.24.23.37.55.37.88v12.44A1.75 1.75 0 0116.5 22h-9.5A1.75 1.75 0 015.25 20.25V5.5A1.75 1.75 0 017 3.75z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M14 4v3.25c0 .69.56 1.25 1.25 1.25H18.5M8.5 12h7M8.5 15.5h7M8.5 9h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsdcIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7.25v1.1m0 7.3v1.1m2.7-7.32a3.2 3.2 0 00-2.02-.73h-1.28a2.4 2.4 0 100 4.8h1.2a2.4 2.4 0 010 4.8h-1.6a3.3 3.3 0 01-2.15-.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WalletSignedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4.75 7.75A2.75 2.75 0 017.5 5h9A2.75 2.75 0 0119.25 7.75v8.5A2.75 2.75 0 0116.5 19h-9a2.75 2.75 0 01-2.75-2.75v-8.5z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4.75 9.5h14.5M15 13.25h1.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 15.9l1.3 1.35L12 14.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LedgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect
        x="4.75"
        y="5.75"
        width="14.5"
        height="12.5"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 10h8M8 13h5M8 16h2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.5 15.25l1.25 1.25 2.25-2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface BenefitItem {
  label: string;
  icon: ReactNode;
}

const benefits: BenefitItem[] = [
  { label: "Soroban escrow contract", icon: <ContractIcon /> },
  { label: "USDC on Stellar", icon: <UsdcIcon /> },
  { label: "Signed with your wallet", icon: <WalletSignedIcon /> },
  { label: "Every payout on the public ledger", icon: <LedgerIcon /> },
];

export function BenefitsStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0",
        className,
      )}
    >
      {benefits.map((benefit) => (
        <div
          key={benefit.label}
          className="flex items-center gap-3 text-sm font-medium text-zinc-700"
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-zinc-200/70">
            {benefit.icon}
          </span>
          <span>{benefit.label}</span>
        </div>
      ))}
    </div>
  );
}
