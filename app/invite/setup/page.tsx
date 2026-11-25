"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Modal } from "@/components/ui/Modal";
import { SetupFlowLayout } from "@/components/layout/invite/SetupFlowLayout";
import { useProjectByInviteTokenQuery } from "@/lib/api/hooks/useProjects";

const steps = [
  { id: 1, title: "Your invitation", description: "See who invited you" },
  { id: 2, title: "Connect wallet", description: "Use the invited wallet" },
  { id: 3, title: "Verify it's you", description: "A free signature, no fee" },
  { id: 4, title: "Your profile", description: "Your name and optional email" },
  { id: 5, title: "Receive USDC", description: "So payouts can reach you" },
];

function useIsDesktop(breakpoint = 640) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isDesktop;
}

function shortAddr(a?: string | null) {
  if (!a) return "—";
  if (a.length <= 12) return a;
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}
function fmtUsdc(amount?: string | number | null) {
  if (amount == null || amount === "") return "0.00 USDC";
  const n = Number(amount);
  if (Number.isNaN(n)) return `${amount} USDC`;
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} USDC`;
}

function HowEscrowWorksContent() {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold tracking-[0.14em] text-zinc-500">HOW ESCROW WORKS</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[34px]">Your pay is set aside before you start</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-600 sm:text-base">Each milestone&apos;s USDC is locked in an escrow contract before you begin, and released to your wallet when the owner approves that piece of work.</p>
      <ol className="mt-5 space-y-4">
        {[
          { n: "1", title: "You both agree on the terms", body: "Milestones, amounts and deadlines. Nothing is binding until you've both signed." },
          { n: "2", title: "The owner funds the milestone", body: "USDC moves into the escrow contract. You'll see it funded before you start." },
          { n: "3", title: "You do the work and submit it", body: "Share links to what you made. The owner approves it or asks for changes." },
          { n: "4", title: "Approval pays you", body: "The contract sends the USDC straight to your wallet." },
        ].map((item) => (
          <li key={item.n} className="flex gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E7F1EF] text-sm font-semibold text-[#0E5E5A]">{item.n}</span>
            <div className="min-w-0">
              <p className="text-base font-semibold text-zinc-950">{item.title}</p>
              <p className="mt-0.5 text-sm leading-6 text-zinc-600">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function InviteSetupContent() {
  const sp = useSearchParams();
  const token = sp.get("token") || sp.get("invite") || "";
  const { data: project, isLoading, error } = useProjectByInviteTokenQuery(token || undefined, { enabled: !!token });
  const [howOpen, setHowOpen] = useState(false);
  const isDesktop = useIsDesktop(640);

  const nextHref = `/invite/setup/wallet${token ? `?token=${encodeURIComponent(token)}` : ""}`;

  return (
    <SetupFlowLayout steps={steps} currentStep={1}>
      <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8 lg:p-10">
        <span className="inline-flex rounded-full border border-[#CFE0E8] bg-[#EAF3F8] px-3 py-1 text-xs font-semibold text-[#2D64C8]">You&apos;ve been invited</span>

        {!token ? (
          <>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-5xl">Invite link required</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">Open the invite link sent by the project owner to view project details and continue setup.</p>
          </>
        ) : isLoading ? (
          <>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-5xl">Loading invitation…</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">Fetching project details from the API.</p>
          </>
        ) : error || !project ? (
          <>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-5xl">Invitation unavailable</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">We couldn&apos;t load this invitation. The token may be invalid or expired.</p>
          </>
        ) : (
          <>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-5xl">You&apos;ve been invited to a milestone project</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">Each payment is locked in escrow first, then released to you when the owner approves that piece of work.</p>

            <div className="mt-6 rounded-2xl bg-[#F7F8F8] p-5 sm:p-6">
              <dl className="space-y-3.5 text-[15px] sm:text-base">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"><dt className="text-zinc-500">Project</dt><dd className="font-semibold text-zinc-950">{project.title}</dd></div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"><dt className="text-zinc-500">From</dt><dd className="text-right font-medium text-zinc-900 font-mono">{shortAddr(project.owner_wallet)}</dd></div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"><dt className="text-zinc-500">Invited wallet</dt><dd className="font-semibold text-zinc-950 font-mono">{shortAddr(project.provider_wallet)}</dd></div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"><dt className="text-zinc-500">Total budget</dt><dd className="font-semibold text-zinc-950">{fmtUsdc(project.total_budget)}</dd></div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"><dt className="text-zinc-500">Milestones</dt><dd className="font-semibold text-zinc-950">{project.milestones?.length ?? 0}</dd></div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"><dt className="text-zinc-500">Agreement status</dt><dd className="font-semibold text-zinc-950">{(project.agreement_status || "—").replace(/_/g, " ")}</dd></div>
              </dl>
            </div>
            {project.description ? <div className="mt-5 rounded-2xl border border-zinc-200 p-4 text-sm leading-6 text-zinc-700">{project.description}</div> : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={nextHref} className="w-full sm:w-auto"><Button size="lg" className="h-12 w-full rounded-2xl px-8 sm:w-auto">Get started</Button></Link>
              <button type="button" onClick={() => setHowOpen(true)} className="inline-flex h-12 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-zinc-700 hover:text-zinc-950">How escrow works</button>
            </div>
          </>
        )}
      </div>

      {howOpen ? (
        isDesktop ? (
          <Modal open={howOpen} onClose={() => setHowOpen(false)} size="lg"><HowEscrowWorksContent /></Modal>
        ) : (
          <BottomSheet open={howOpen} onClose={() => setHowOpen(false)} showHandle><HowEscrowWorksContent /></BottomSheet>
        )
      ) : null}
    </SetupFlowLayout>
  );
}

export default function InviteSetupPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#EAF3F1]" />}><InviteSetupContent /></Suspense>;
}