"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SetupFlowLayout } from "@/components/layout/invite/SetupFlowLayout";
import { cn } from "@/lib/utils";
import { useProjectByInviteTokenQuery } from "@/lib/api/hooks/useProjects";
import { useWallet } from "@/lib/wallet/useWallet";

const steps = [
  { id: 1, title: "Your invitation", description: "See who invited you" },
  { id: 2, title: "Connect wallet", description: "Use the invited wallet" },
  { id: 3, title: "Verify it's you", description: "A free signature, no fee" },
  { id: 4, title: "Your profile", description: "Your name and optional email" },
  { id: 5, title: "Receive USDC", description: "So payouts can reach you" },
];

function shortAddr(a?: string | null) {
  if (!a) return "—";
  if (a.length <= 12) return a;
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}

function WalletSetupContent() {
  const sp = useSearchParams();
  const token = sp.get("token") || sp.get("invite") || "";
  const { data: project, isLoading, error } = useProjectByInviteTokenQuery(token || undefined, { enabled: !!token });
  const { address, isConnecting, connect, disconnect } = useWallet();

  const invited = project?.provider_wallet || "";
  const connectedMatches = useMemo(() => {
    if (!address || !invited) return false;
    return address.toUpperCase() === invited.toUpperCase();
  }, [address, invited]);
  const wrong = !!address && !!invited && !connectedMatches;

  return (
    <SetupFlowLayout steps={steps} currentStep={2}>
      <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8 lg:p-10">
        <h2 className="text-4xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[44px] sm:leading-[1.1]">Connect the invited wallet</h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">Connect the wallet that was invited to this project agreement. Your wallet address is used for signing and payouts.</p>

        {!token ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Invite token is missing. Open this step from your invite link.</div>
        ) : isLoading ? (
          <div className="mt-6 text-sm text-zinc-600">Loading invited project details…</div>
        ) : error || !project ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Unable to load invitation details for this token.</div>
        ) : (
          <>
            <div className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-[#F8FAFA] px-3 py-2 text-sm text-zinc-700">
              <span className="font-medium text-zinc-600">Invited wallet</span>
              <span className="font-semibold text-zinc-900 font-mono" title={invited}>{shortAddr(invited)}</span>
            </div>

            {wrong ? (
              <div className="mt-5 rounded-2xl border border-[#E7B4B4] bg-[#FBEAEA] p-4 sm:p-5">
                <p className="text-base font-semibold text-[#8F2D22]">This wallet wasn&apos;t invited</p>
                <p className="mt-1 text-sm leading-6 text-[#8F2D22]/90">You connected <span className="font-mono">{shortAddr(address)}</span>. This invitation is for <span className="font-mono">{shortAddr(invited)}</span>. Disconnect and connect the invited wallet.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="outline" className="h-10 rounded-xl" onClick={() => { void disconnect(); }}>Disconnect</Button>
                  <Button className="h-10 rounded-xl" onClick={() => { void connect(); }} disabled={isConnecting}>{isConnecting ? "Connecting…" : "Connect different wallet"}</Button>
                </div>
              </div>
            ) : null}

            {!address ? (
              <div className={cn("mt-5 rounded-2xl border border-zinc-200 bg-white p-5")}>
                <p className="text-base font-semibold text-zinc-950">Connect your Stellar wallet</p>
                <p className="mt-1 text-sm leading-6 text-zinc-600">Use a wallet that controls the invited address to continue. Connecting does not move funds or cost a fee.</p>
                <Button className="mt-4 h-11 rounded-xl" onClick={() => { void connect(); }} disabled={isConnecting}>{isConnecting ? "Connecting…" : "Connect wallet"}</Button>
              </div>
            ) : connectedMatches ? (
              <div className="mt-5 rounded-2xl border border-[#B8D8D3] bg-[#F3FAF8] p-5">
                <p className="text-base font-semibold text-[#0E5E5A]">Invited wallet connected</p>
                <p className="mt-1 text-sm leading-6 text-zinc-700 font-mono break-all">{address}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/invite/setup/profile${token ? `?token=${encodeURIComponent(token)}` : ""}`} className="inline-flex h-11 items-center justify-center rounded-xl bg-[#0E5E5A] px-5 text-sm font-semibold text-white hover:bg-[#0B4E4B]">Continue</Link>
                  <Button variant="outline" className="h-11 rounded-xl" onClick={() => { void disconnect(); }}>Disconnect</Button>
                </div>
              </div>
            ) : null}

            <p className="mt-6 text-sm leading-6 text-zinc-600">We never see your secret key. Connecting doesn&apos;t move any funds or cost a fee.</p>
          </>
        )}
      </div>
    </SetupFlowLayout>
  );
}

export default function InviteWalletSetupPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#EAF3F1]" />}><WalletSetupContent /></Suspense>;
}