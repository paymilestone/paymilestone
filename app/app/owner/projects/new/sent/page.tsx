"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app";
import { Button } from "@/components/ui/Button";
import { useProjectQuery } from "@/lib/api/hooks/useProjects";

const ownerNav = [
  { label: "Dashboard", href: "/app/owner" },
  { label: "Projects", href: "/app/owner/projects" },
  { label: "Transactions", href: "/app/owner/transactions" },
];

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

function SentContent() {
  const sp = useSearchParams();
  const projectId = sp.get("projectId") || sp.get("id") || "";
  const { data: project, isLoading, error } = useProjectQuery(projectId || undefined, { enabled: !!projectId });
  const [copied, setCopied] = useState<"link" | "token" | null>(null);

  const inviteLink = useMemo(() => {
    if (!project?.invite_token) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/invite/setup?token=${encodeURIComponent(project.invite_token)}`;
  }, [project?.invite_token]);

  const copy = async (kind: "link" | "token") => {
    const text = kind === "link" ? inviteLink : (project?.invite_token || "");
    if (!text) return;
    try { await navigator.clipboard?.writeText(text); } catch {}
    setCopied(kind);
    setTimeout(() => setCopied((v) => (v === kind ? null : v)), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={ownerNav} activeHref="/app/owner/projects" />
      <main className="mx-auto w-full max-w-[760px] px-4 pb-12 pt-8 sm:px-6 lg:pt-12">
        {!projectId ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 text-center">
            <h1 className="text-2xl font-semibold text-zinc-950">Project not specified</h1>
            <p className="mt-2 text-sm text-zinc-600">Open this page from a created project to view its invite details.</p>
            <div className="mt-5"><Link href="/app/owner/projects" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0E5E5A] px-5 text-sm font-semibold text-white">Back to projects</Link></div>
          </div>
        ) : isLoading ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Loading project…</div>
        ) : error || !project ? (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 text-center">
            <h1 className="text-2xl font-semibold text-zinc-950">Project unavailable</h1>
            <p className="mt-2 text-sm text-zinc-600">Could not load this project from the API.</p>
            <div className="mt-5"><Link href="/app/owner/projects" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0E5E5A] px-5 text-sm font-semibold text-white">Back to projects</Link></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DCEEEB] text-[#0E5E5A]">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true"><path d="M6.5 12.5l3.2 3.2 7.8-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <h1 className="mt-5 text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Project ready to share</h1>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-zinc-600 sm:text-base">
                <span className="inline-flex items-center rounded-md bg-[#E6F4F1] px-2.5 py-1 text-xs font-semibold text-[#0E5E5A]">{(project.agreement_status || "Draft").replace(/_/g, " ")}</span>
                <span>{project.title} · Version {project.agreement_version} · {fmtUsdc(project.total_budget)} across {project.milestones?.length ?? 0} milestones</span>
              </div>
            </div>

            <div className="mt-8 space-y-4 sm:space-y-5">
              <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
                <h2 className="text-lg font-semibold text-zinc-950 sm:text-xl">Share the invite</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600 sm:text-base">Share this invite token/link with your provider. They should connect the invited wallet to review and approve the agreement.</p>
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-700">Invited provider wallet</p>
                    <p className="mt-2 break-all font-mono text-sm font-medium text-zinc-900 sm:text-[15px]" title={project.provider_wallet}>{shortAddr(project.provider_wallet)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-700">Invite token</p>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex h-12 min-w-0 flex-1 items-center rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-800"><span className="truncate font-mono">{project.invite_token || "—"}</span></div>
                      <Button size="md" className="h-12 rounded-xl px-6 sm:shrink-0" onClick={() => copy("token")} disabled={!project.invite_token}>{copied === "token" ? "Copied" : "Copy token"}</Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-700">Shareable invite link</p>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex h-12 min-w-0 flex-1 items-center rounded-xl border border-zinc-300 bg-white px-4 text-sm text-zinc-800"><span className="truncate">{inviteLink || "Invite link unavailable"}</span></div>
                      <Button size="md" className="h-12 rounded-xl px-6 sm:shrink-0" onClick={() => copy("link")} disabled={!inviteLink}>{copied === "link" ? "Copied" : "Copy link"}</Button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
                <h2 className="text-lg font-semibold text-zinc-950 sm:text-xl">Next steps</h2>
                <ol className="mt-5 space-y-4 text-sm leading-6 text-zinc-700">
                  <li><span className="font-semibold text-zinc-950">1.</span> Provider opens the invite and connects the invited wallet.</li>
                  <li><span className="font-semibold text-zinc-950">2.</span> Provider reviews milestones, timeline split, and signs/approves the agreement version.</li>
                  <li><span className="font-semibold text-zinc-950">3.</span> You review and approve as owner, then fund milestones according to your workflow.</li>
                </ol>
              </section>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-center">
                <Link href={`/app/owner/projects/${project.id}`} className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0E5E5A] px-8 text-sm font-semibold text-white hover:bg-[#0B4E4B]">View project</Link>
                <Link href="/app/owner" className="inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold text-zinc-800 hover:bg-zinc-100">Back to dashboard</Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function TermsSentPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><SentContent /></Suspense>;
}