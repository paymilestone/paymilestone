"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Wallet = {
  id: "freighter" | "xbull" | "albedo" | "lobstr";
  name: string;
  description: string;
  status: "detected" | "install";
  icon: string;
  accountLabel: string;
  existingUser?: boolean;
};

type View = "select" | "checking" | "welcome" | "new";

const wallets: Wallet[] = [
  {
    id: "freighter",
    name: "Freighter",
    description: "Browser extension or mobile",
    status: "detected",
    icon: "F",
    accountLabel: "GCDE...9XQ2",
    existingUser: true,
  },
  {
    id: "xbull",
    name: "xBull",
    description: "Browser extension or mobile",
    status: "detected",
    icon: "x",
    accountLabel: "GB7T...Q4NA",
    existingUser: false,
  },
  {
    id: "albedo",
    name: "Albedo",
    description: "Works in any browser",
    status: "install",
    icon: "A",
    accountLabel: "—",
  },
  {
    id: "lobstr",
    name: "LOBSTR",
    description: "Mobile app, scan a QR code",
    status: "install",
    icon: "L",
    accountLabel: "—",
  },
];

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M5.5 5.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function WalletIcon({ label }: { label: string }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm font-bold text-zinc-800">
      {label}
    </span>
  );
}

function StatusPill({ status }: { status: Wallet["status"] }) {
  if (status === "detected") {
    return (
      <span className="rounded-full bg-[#DCEEEB] px-2.5 py-1 text-xs font-semibold text-[#0E5E5A]">
        Detected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500">
      Install
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M5 3h8v8M13 3L5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function StepRow({
  state,
  title,
  subtitle,
}: {
  state: "done" | "active" | "pending";
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          state === "done" && "bg-[#0E5E5A] text-white",
          state === "active" && "text-[#0E5E5A]",
          state === "pending" && "border border-zinc-300 bg-white",
        )}
      >
        {state === "done" ? (
          <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M5 10.2l3 3L15 6.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : state === "active" ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 animate-spin" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" className="opacity-20" />
            <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : null}
      </span>
      <div>
        <p className={cn("text-[15px] font-semibold", state === "pending" ? "text-zinc-400" : "text-zinc-900")}>
          {title}
        </p>
        <p className={cn("text-sm", state === "pending" ? "text-zinc-400" : "text-zinc-500")}>{subtitle}</p>
      </div>
    </div>
  );
}

export function WalletAuthFlow({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<View>("select");
  const [selectedWalletId, setSelectedWalletId] = useState<Wallet["id"] | null>(null);
  const [checkStep, setCheckStep] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setView("select");
      setSelectedWalletId(null);
      setCheckStep(0);
    }
  }, [open]);

  const selectedWallet = useMemo(
    () => wallets.find((w) => w.id === selectedWalletId) ?? wallets[0],
    [selectedWalletId],
  );

  useEffect(() => {
    if (view !== "checking") return;
    setCheckStep(0);
    const t1 = window.setTimeout(() => setCheckStep(1), 700);
    const t2 = window.setTimeout(() => setCheckStep(2), 1500);
    const t3 = window.setTimeout(() => {
      setView(selectedWallet.existingUser ? "welcome" : "new");
    }, 2400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [view, selectedWallet]);

  if (!mounted || !open) return null;

  const handleWalletClick = (wallet: Wallet) => {
    if (wallet.status !== "detected") return;
    setSelectedWalletId(wallet.id);
    setView("checking");
  };

  const panelBaseClass =
    "relative z-10 w-full bg-white p-6 shadow-2xl sm:max-w-[460px] sm:rounded-[28px] sm:p-7 " +
    "rounded-t-[28px] rounded-b-none max-h-[92vh] overflow-y-auto [animation:slide-up_220ms_ease-out] sm:[animation:none]";

  const panel = (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-transparent" onClick={onClose} aria-hidden="true" />

      {view === "select" ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Log in with your wallet"
          className={panelBaseClass}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-[28px]">
                Log in with your wallet
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 sm:text-[15px]">
                Your wallet is your PayMilestone account. Connect it and we&apos;ll check if you&apos;ve been here before.
              </p>
            </div>
            <CloseButton onClick={onClose} />
          </div>

          <div className="mt-5 space-y-3">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                onClick={() => handleWalletClick(wallet)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 text-left transition-colors",
                  wallet.status === "detected" ? "hover:border-zinc-300 hover:bg-zinc-50" : "opacity-80 hover:bg-zinc-50",
                )}
              >
                <span className="flex items-center gap-3">
                  <WalletIcon label={wallet.icon} />
                  <span>
                    <span className="block text-[15px] font-semibold text-zinc-900">{wallet.name}</span>
                    <span className="block text-sm text-zinc-500">{wallet.description}</span>
                  </span>
                </span>
                <StatusPill status={wallet.status} />
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-2 text-sm text-zinc-500">
            <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
              <rect x="4.5" y="8.5" width="11" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 8.5V6.8a3 3 0 116 0v1.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p>We never see your secret key. Connecting doesn&apos;t move any funds or cost a fee.</p>
          </div>

          <p className="mt-6 border-t border-zinc-200 pt-4 text-center text-sm text-zinc-500">
            New here? Connecting also starts your setup.
          </p>
        </div>
      ) : null}

      {view === "checking" ? (
        <div role="dialog" aria-modal="true" aria-label="Checking your wallet" className={panelBaseClass}>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-[28px]">Checking your wallet</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">This takes a few seconds.</p>

          <div className="mt-6 space-y-5">
            <StepRow
              state={checkStep >= 1 ? "done" : "active"}
              title={`Connected with ${selectedWallet.name}`}
              subtitle={selectedWallet.accountLabel}
            />
            <StepRow
              state={checkStep >= 2 ? "done" : checkStep === 1 ? "active" : "pending"}
              title="Signed in"
              subtitle="Free signature, no transaction sent"
            />
            <StepRow
              state={checkStep >= 2 ? "active" : "pending"}
              title="Looking for your account"
              subtitle={checkStep >= 2 ? "Checking your account" : "Waiting for sign-in"}
            />
          </div>

          <div className="mt-8 pb-[max(0rem,env(safe-area-inset-bottom))]">
            <Button variant="outline" fullWidth size="lg" className="h-12 rounded-2xl" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {view === "welcome" ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Welcome back"
          className={cn(panelBaseClass, "p-8 text-center sm:p-10")}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DCEEEB] text-xl font-bold text-[#0E5E5A]">
            AO
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-[34px]">Welcome back, Ada</h2>
          <p className="mt-2 text-base text-zinc-600">Wallet recognised. Opening your dashboard...</p>
          <p className="mt-4 text-sm font-medium text-zinc-500">
            Project owner <span className="mx-1 text-zinc-300">·</span> {selectedWallet.accountLabel}
          </p>
          <div className="mt-8 pb-[max(0rem,env(safe-area-inset-bottom))]">
            <Button fullWidth size="lg" className="h-12 rounded-2xl" onClick={onClose}>
              Go to dashboard
            </Button>
          </div>
        </div>
      ) : null}

      {view === "new" ? (
        <div role="dialog" aria-modal="true" aria-label="New wallet" className={panelBaseClass}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2F4F4] text-zinc-700">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              <rect x="4" y="6.5" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M4 10h16M15.5 14h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-zinc-950">
            This wallet is new to PayMilestone
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-zinc-600">
            There&apos;s no account for it yet. Set one up in about 2 minutes. Your wallet is already connected and verified, so we&apos;ll skip those steps.
          </p>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-[#F7F8F8] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Connected with {selectedWallet.name}</p>
              <p className="text-sm text-zinc-500">{selectedWallet.accountLabel}</p>
            </div>
            <span className="rounded-full bg-[#DCEEEB] px-2.5 py-1 text-xs font-semibold text-[#0E5E5A]">Verified</span>
          </div>

          <div className="mt-6 space-y-3 pb-[max(0rem,env(safe-area-inset-bottom))]">
            <Button fullWidth size="lg" className="h-12 rounded-2xl" onClick={onClose}>
              Start setup
            </Button>
            <button
              type="button"
              onClick={() => {
                setView("select");
                setSelectedWalletId(null);
                setCheckStep(0);
              }}
              className="w-full text-center text-sm font-semibold text-zinc-700 hover:text-zinc-950"
            >
              Use a different wallet
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  return createPortal(panel, document.body);
}
