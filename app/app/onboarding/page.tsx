"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OnboardingLayout } from "@/components/layout/onboarding";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/wallet/useWallet";

const steps = [
  { id: 1, title: "Connect wallet", description: "Your wallet is your account" },
  { id: 2, title: "Verify it's you", description: "Confirm your connected wallet" },
  { id: 3, title: "Choose how you'll use it", description: "Paying, getting paid, or both" },
  { id: 4, title: "Your profile", description: "Your name and optional email" },
  { id: 5, title: "USDC check", description: "So you can fund milestones" },
];

function shortAddr(addr?: string | null) {
  if (!addr) return undefined;
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { address, isConnected, connect, refresh } = useWallet();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"owner" | "provider">("owner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isConnected && address && step === 1) setStep(2);
  }, [isConnected, address, step]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("paymilestone.profile");
      if (saved) {
        const p = JSON.parse(saved) as { name?: string; email?: string; role?: "owner" | "provider" };
        if (p.name) setName(p.name);
        if (p.email) setEmail(p.email);
        if (p.role) setRole(p.role);
      }
    } catch {}
  }, []);

  const walletBadge = shortAddr(address);

  const goNext = () => setStep((s) => Math.min(5, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const onConnect = async () => {
    setError(null);
    setConnecting(true);
    try {
      const addr = await connect();
      if (addr) setStep(2);
      else setError("No wallet address was returned. Please try again.");
    } catch (e: any) {
      setError(e?.message || "Could not connect wallet.");
    } finally {
      setConnecting(false);
    }
  };

  const onCopy = async () => {
    if (!address) return;
    try { await navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  const finish = () => {
    try {
      localStorage.setItem("paymilestone.profile", JSON.stringify({ name, email, role, address }));
      localStorage.setItem("paymilestone.role", role);
    } catch {}
    router.push(role === "provider" ? "/app/provider" : "/app/owner");
  };

  const sidebarTitle = role === "provider" ? "Get ready to get paid by milestone" : "Get ready to pay by milestone";

  return (
    <OnboardingLayout
      steps={steps}
      currentStep={step}
      title={sidebarTitle}
      sidebarFooter="Get paid as the work gets done. Payments sit in an escrow contract until each milestone is approved."
      walletBadge={walletBadge}
    >
      {step === 1 ? (
        <div>
          <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-[44px]">Connect your Stellar wallet</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 sm:text-[17px]">
            Your wallet address is your PayMilestone account. There&apos;s no password to create or remember.
          </p>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <p className="text-[15px] font-semibold text-zinc-900">Connect with Stellar Wallets Kit</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">Choose Freighter, xBull, Albedo, LOBSTR or another supported wallet in the connection modal.</p>
            <div className="mt-5">
              <Button size="lg" className="h-12 rounded-2xl px-8" onClick={onConnect} disabled={connecting}>
                {connecting ? "Connecting..." : "Connect wallet"}
              </Button>
            </div>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          </div>

          <div className="mt-6 flex items-start gap-2.5 text-sm text-zinc-500">
            <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true"><rect x="4.5" y="8.5" width="11" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M7 8.5V6.8a3 3 0 116 0v1.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <p>We never see your secret key. Connecting doesn&apos;t move any funds or cost a fee.</p>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-[44px]">Confirm this wallet is yours</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
            We&apos;ll use your connected Stellar address to identify your account. You can disconnect or switch wallets later.
          </p>

          <div className="mt-8 rounded-2xl bg-[#F7F8F8] p-5 sm:p-6">
            <dl className="space-y-3 text-[15px] sm:text-base">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Connected wallet</dt>
                <dd className="text-right font-semibold text-zinc-900">{walletBadge || "Not connected"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-zinc-200 pt-3">
                <dt className="text-zinc-500">Address</dt>
                <dd className="max-w-[360px] break-all text-right font-mono text-sm text-zinc-800">{address || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-3">
                <dt className="text-zinc-500">Network fee</dt>
                <dd className="font-semibold text-zinc-900">None</dd>
              </div>
            </dl>
          </div>

          {address ? (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#CFE7DE] bg-[#EAF7F1] px-4 py-3.5 text-sm font-medium text-[#0E5E5A]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0E5E5A] text-white">✓</span>
              Wallet connected successfully.
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
              No wallet connected yet. Connect a wallet to continue.
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" className="h-12 rounded-2xl px-8" onClick={goNext} disabled={!address}>Continue</Button>
            <button type="button" className="h-12 px-2 text-sm font-semibold text-zinc-700 hover:text-zinc-950" onClick={() => setStep(1)}>
              Use a different wallet
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-[44px]">How will you use PayMilestone?</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">Pick the one you&apos;ll do most. The same wallet can do both, and you can switch any time.</p>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <button type="button" onClick={() => setRole("owner")} className={cn("rounded-2xl border p-5 text-left transition-colors sm:p-6", role === "owner" ? "border-[#0E5E5A] bg-[#F3FAF8] ring-1 ring-[#0E5E5A]/15" : "border-zinc-200 hover:border-zinc-300")}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F4F4] text-zinc-700"><svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true"><path d="M4 7.5A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v9a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5v-9z" stroke="currentColor" strokeWidth="1.6"/><path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg></span>
                <span className={cn("mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2", role === "owner" ? "border-[#0E5E5A]" : "border-zinc-300")}>{role === "owner" ? <span className="h-2.5 w-2.5 rounded-full bg-[#0E5E5A]" /> : null}</span>
              </div>
              <p className="mt-4 text-xl font-semibold text-zinc-950">I&apos;m paying for work</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">For clients and project owners.</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-700"><li>· Create projects and milestones</li><li>· Fund each milestone into escrow</li><li>· Approve work to release payment</li></ul>
            </button>

            <button type="button" onClick={() => setRole("provider")} className={cn("rounded-2xl border p-5 text-left transition-colors sm:p-6", role === "provider" ? "border-[#0E5E5A] bg-[#F3FAF8] ring-1 ring-[#0E5E5A]/15" : "border-zinc-200 hover:border-zinc-300")}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F4F4] text-zinc-700"><svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true"><path d="M12 20V10M8.5 13.5L12 10l3.5 3.5M5 6.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                <span className={cn("mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2", role === "provider" ? "border-[#0E5E5A]" : "border-zinc-300")}>{role === "provider" ? <span className="h-2.5 w-2.5 rounded-full bg-[#0E5E5A]" /> : null}</span>
              </div>
              <p className="mt-4 text-xl font-semibold text-zinc-950">I&apos;m getting paid</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">For freelancers and service providers.</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-700"><li>· Accept agreements from clients</li><li>· Submit work for each milestone</li><li>· Receive USDC when it&apos;s approved</li></ul>
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" className="h-12 rounded-2xl px-8" onClick={goNext}>Continue</Button>
            <button type="button" className="h-12 px-2 text-sm font-semibold text-zinc-700 hover:text-zinc-950" onClick={goBack}>Back</button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div>
          <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-[44px]">What should we call you?</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">Your counterpart sees this name on the agreement and in project updates.</p>

          <div className="mt-8 space-y-6">
            <Input label="Your name" value={name} onChange={(e) => setName(e.target.value)} containerClassName="gap-2" />
            <Input label="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} hint="Optional contact info for your local profile on this device." containerClassName="gap-2" />
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F7F8F8] px-4 py-4">
              <span className="text-sm font-medium text-zinc-500">Wallet</span>
              <span className="max-w-[260px] truncate text-sm font-semibold tracking-wide text-zinc-900">{walletBadge || "—"}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" className="h-12 rounded-2xl px-8" onClick={goNext}>Continue</Button>
            <button type="button" className="h-12 px-2 text-sm font-semibold text-zinc-700 hover:text-zinc-950" onClick={goBack}>Back</button>
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div>
          <h2 className="text-[40px] font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-[44px]">Is your wallet ready to fund?</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
            You pay milestones in USDC from this wallet. Make sure USDC is enabled and funded before you fund a milestone.
          </p>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className={cn("mt-0.5 flex h-6 w-6 items-center justify-center rounded-full", address ? "bg-[#0E5E5A] text-white" : "border-2 border-zinc-300 text-zinc-500")}>{address ? "✓" : "1"}</span>
                <div>
                  <p className="text-base font-semibold text-zinc-950">{address ? "Wallet connected" : "Wallet not connected"}</p>
                  <p className="mt-1 text-sm text-zinc-600">{address ? "This address will be used with the PayMilestone API." : "Connect a wallet to continue."}</p>
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-300 text-sm font-semibold text-zinc-500">2</span>
                <div>
                  <p className="text-base font-semibold text-zinc-950">USDC balance: not available</p>
                  <p className="mt-1 text-sm text-zinc-600">USDC balance/trustline checks are not available from the API yet. You can still finish setup and fund milestones from your wallet when ready.</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-[#F5EAD4] px-2.5 py-1 text-xs font-semibold text-[#B07A1C]">Check wallet</span>
            </div>
            <div className="border-t border-zinc-200 p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-[0.12em] text-zinc-500">Your wallet address</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="break-all font-mono text-sm font-medium text-zinc-800">{address || "—"}</p>
                <button type="button" className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50" onClick={onCopy} disabled={!address}>
                  {copied ? "Copied" : "Copy address"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#CFE0E8] bg-[#EAF3F8] p-4 text-sm leading-6 text-[#245A9C]">
            You can finish setup now. Funding and milestone actions will use your connected wallet.
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" className="h-12 rounded-2xl px-8" onClick={finish} disabled={!address}>Finish setup</Button>
            <button type="button" className="h-12 px-2 text-sm font-semibold text-zinc-700 hover:text-zinc-950" onClick={() => { void refresh(); }}>Refresh wallet</button>
          </div>
        </div>
      ) : null}
    </OnboardingLayout>
  );
}
