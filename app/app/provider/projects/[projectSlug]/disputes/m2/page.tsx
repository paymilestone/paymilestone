"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app/AppHeader";
import { useProjectMilestonesQuery, useProjectQuery } from "@/lib/api/hooks/useProjects";
import { useDisputesQuery } from "@/lib/api/hooks/useDisputes";
import { useWallet } from "@/lib/wallet/useWallet";
import type { Milestone, PaginatedMilestoneList } from "@/lib/api/types";

const providerNav = [
  { label: "Projects", href: "/app/provider" },
  { label: "Transactions", href: "/app/provider/transactions" },
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
function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}
function asMilestones(data: Milestone[] | PaginatedMilestoneList | undefined, fallback?: Milestone[]) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as PaginatedMilestoneList).results)) return (data as PaginatedMilestoneList).results;
  return fallback ?? [];
}

function DisputeContent() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const sp = useSearchParams();
  const { address } = useWallet();
  const projectId = projectSlug;
  const base = `/app/provider/projects/${projectSlug}`;
  const { data: project, isLoading, error } = useProjectQuery(projectId, { enabled: !!projectId });
  const { data: milestonesData } = useProjectMilestonesQuery(projectId, { enabled: !!projectId });
  const { data: disputes } = useDisputesQuery(address ? { wallet: address } : undefined, { enabled: !!address });
  const milestones = asMilestones(milestonesData, project?.milestones);
  const milestone = useMemo(() => {
    const seq = sp.get("seq") ? Number(sp.get("seq")) : 2;
    return milestones.find((m) => m.sequence_number === seq) || milestones.find((m) => m.id === sp.get("milestoneId")) || milestones.find((m) => m.status === "DISPUTED") || milestones[0] || null;
  }, [milestones, sp]);

  const dispute = useMemo(() => {
    const list = disputes ?? [];
    const projectDisputes = list.filter((d) => d.project_id === projectId);
    if (milestone) {
      const byMilestone = projectDisputes.find((d) => d.milestone === milestone.id);
      if (byMilestone) return byMilestone;
    }
    return projectDisputes[0] || null;
  }, [disputes, projectId, milestone]);

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={providerNav} activeHref="/app/provider" />
      <main className="mx-auto w-full max-w-[1320px] overflow-x-hidden px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-500" aria-label="Breadcrumb">
          <Link href="/app/provider" className="hover:text-zinc-800">Projects</Link><span>/</span>
          <Link href={base} className="hover:text-zinc-800">{project?.title || "Project"}</Link><span>/</span>
          <span className="text-zinc-700">Dispute</span>
        </nav>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Loading dispute…</div>
        ) : error || !project ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Could not load this project.</div>
        ) : (
          <>
            <div className="mt-3">
              <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Dispute{milestone ? `: ${milestone.title}` : ""}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-md bg-[#FDECEC] px-2.5 py-1 text-xs font-semibold text-[#C2412D]">{(dispute?.status || milestone?.status || "Disputed").replace(/_/g, " ")}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-600">{project.title}{milestone ? ` · ${fmtUsdc(milestone.amount)}` : ""}</p>
            </div>

            <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Dispute details</h2>
                  {dispute ? (
                    <dl className="mt-4 space-y-3 text-sm">
                      <div><dt className="text-zinc-500">Dispute ID</dt><dd className="mt-1 font-mono text-zinc-900 break-all">{dispute.id}</dd></div>
                      <div><dt className="text-zinc-500">Opened by</dt><dd className="mt-1 font-mono text-zinc-900 break-all" title={dispute.opened_by_wallet}>{shortAddr(dispute.opened_by_wallet)}</dd></div>
                      <div><dt className="text-zinc-500">Status</dt><dd className="mt-1 font-medium text-zinc-900">{(dispute.status || "—").replace(/_/g, " ")}</dd></div>
                      <div><dt className="text-zinc-500">Reason</dt><dd className="mt-1 whitespace-pre-wrap leading-6 text-zinc-800">{dispute.reason || "—"}</dd></div>
                      {dispute.evidence_url ? <div><dt className="text-zinc-500">Evidence</dt><dd className="mt-1"><a href={dispute.evidence_url} target="_blank" rel="noreferrer" className="break-all text-[#0E5E5A] hover:underline">{dispute.evidence_url}</a></dd></div> : null}
                      <div><dt className="text-zinc-500">Created</dt><dd className="mt-1 text-zinc-900">{fmtDateTime(dispute.created_at)}</dd></div>
                      <div><dt className="text-zinc-500">Updated</dt><dd className="mt-1 text-zinc-900">{fmtDateTime(dispute.updated_at)}</dd></div>
                    </dl>
                  ) : (
                    <div className="mt-4 rounded-xl border border-zinc-200 bg-[#F8FAFA] p-4 text-sm text-zinc-700">
                      No dispute record found for this milestone/project in the currently loaded disputes. {milestone?.status === "DISPUTED" ? "The milestone is marked as disputed; open from the project page or refresh disputes to load details." : "Open a dispute from the milestone actions if needed."}
                    </div>
                  )}
                </section>

                {(dispute?.proposed_provider_amount || dispute?.proposed_owner_refund) ? (
                  <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                    <h2 className="text-xl font-semibold text-zinc-950">Settlement proposal</h2>
                    <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                      <div className="rounded-xl border border-zinc-200 p-4"><dt className="text-zinc-500">To provider</dt><dd className="mt-1 font-semibold text-zinc-950">{fmtUsdc(dispute.proposed_provider_amount)}</dd></div>
                      <div className="rounded-xl border border-zinc-200 p-4"><dt className="text-zinc-500">Refund to owner</dt><dd className="mt-1 font-semibold text-zinc-950">{fmtUsdc(dispute.proposed_owner_refund)}</dd></div>
                    </dl>
                    {dispute.proposed_by_wallet ? <p className="mt-4 text-sm text-zinc-700"><span className="font-medium">Proposed by:</span> <span className="break-all font-mono">{shortAddr(dispute.proposed_by_wallet)}</span></p> : null}
                    {dispute.resolved_at ? <p className="mt-2 text-sm text-zinc-700"><span className="font-medium">Resolved:</span> {fmtDateTime(dispute.resolved_at)}</p> : null}
                  </section>
                ) : null}
              </div>

              <aside className="space-y-4">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5">
                  <h2 className="text-lg font-semibold text-zinc-950">Milestone</h2>
                  {milestone ? (
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-4"><dt className="text-zinc-500">Title</dt><dd className="text-right font-medium text-zinc-950">{milestone.title}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-zinc-500">Amount</dt><dd className="font-medium text-zinc-950">{fmtUsdc(milestone.amount)}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-zinc-500">Status</dt><dd className="font-medium text-zinc-950">{(milestone.status || "—").replace(/_/g, " ")}</dd></div>
                    </dl>
                  ) : <p className="mt-3 text-sm text-zinc-600">Milestone details unavailable.</p>}
                  <div className="mt-5 space-y-2">
                    <Link href={base} className="block w-full rounded-xl bg-[#0E5E5A] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#0B4E4B]">Back to project</Link>
                    {milestone ? <Link href={`${base}/milestones/2/open-dispute?seq=${milestone.sequence_number}`} className="block w-full rounded-xl border border-zinc-300 px-4 py-3 text-center text-sm font-semibold text-zinc-800 hover:bg-zinc-50">Open or update dispute</Link> : null}
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function ProviderDisputePage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><DisputeContent /></Suspense>;
}