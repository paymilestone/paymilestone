"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app/AppHeader";
import { useProjectMilestonesQuery, useProjectQuery } from "@/lib/api/hooks/useProjects";
import { useMilestoneSubmissionsQuery } from "@/lib/api/hooks/useMilestones";
import type { DeliverableSubmission, Milestone, PaginatedDeliverableSubmissionList, PaginatedMilestoneList } from "@/lib/api/types";

const providerNav = [
  { label: "Projects", href: "/app/provider" },
  { label: "Transactions", href: "/app/provider/transactions" },
];

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
function asSubmissions(data: DeliverableSubmission[] | PaginatedDeliverableSubmissionList | undefined) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as PaginatedDeliverableSubmissionList).results)) return (data as PaginatedDeliverableSubmissionList).results;
  return [];
}

function RefundRequestContent() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const sp = useSearchParams();
  const projectId = projectSlug;
  const base = `/app/provider/projects/${projectSlug}`;
  const { data: project, isLoading, error } = useProjectQuery(projectId, { enabled: !!projectId });
  const { data: milestonesData } = useProjectMilestonesQuery(projectId, { enabled: !!projectId });
  const milestones = asMilestones(milestonesData, project?.milestones);
  const milestone = useMemo(() => {
    const seq = sp.get("seq") ? Number(sp.get("seq")) : undefined;
    const id = sp.get("milestoneId");
    return milestones.find((m) => (id ? m.id === id : false)) || milestones.find((m) => (seq ? m.sequence_number === seq : false)) || milestones.find((m) => m.status === "REFUNDED" || m.status === "FUNDED" || m.status === "DISPUTED") || milestones[0] || null;
  }, [milestones, sp]);
  const { data: submissionsData } = useMilestoneSubmissionsQuery(milestone?.id, { enabled: !!milestone?.id });
  const submissions = asSubmissions(submissionsData);

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={providerNav} activeHref="/app/provider" />
      <main className="mx-auto w-full max-w-[1320px] overflow-x-hidden px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link href="/app/provider" className="hover:text-zinc-800">Projects</Link>
          <span>/</span>
          <Link href={base} className="hover:text-zinc-800">{project?.title || "Project"}</Link>
          <span>/</span>
          <span className="text-zinc-700">Refund request</span>
        </nav>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Loading…</div>
        ) : error || !project ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Could not load this project.</div>
        ) : (
          <>
            <div className="mt-3">
              <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Refund request</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">{(project.agreement_status || "—").replace(/_/g, " ")}</span>
                {milestone ? <span className="inline-flex rounded-md bg-[#FEF3E6] px-2.5 py-1 text-xs font-semibold text-[#B45309]">{(milestone.status || "—").replace(/_/g, " ")}</span> : null}
              </div>
              <p className="mt-2 text-sm text-zinc-600">{project.title}{milestone ? ` · ${milestone.title}` : ""}</p>
            </div>

            <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Refund context</h2>
                  {milestone ? (
                    <dl className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-4"><dt className="text-zinc-600">Milestone</dt><dd className="font-semibold text-zinc-950">M{milestone.sequence_number} · {milestone.title}</dd></div>
                      <div className="flex items-center justify-between gap-4"><dt className="text-zinc-600">Amount</dt><dd className="font-semibold text-zinc-950">{fmtUsdc(milestone.amount)}</dd></div>
                      <div className="flex items-center justify-between gap-4"><dt className="text-zinc-600">Status</dt><dd className="font-semibold text-zinc-950">{(milestone.status || "—").replace(/_/g, " ")}</dd></div>
                      <div className="flex items-center justify-between gap-4"><dt className="text-zinc-600">Deadline</dt><dd className="font-semibold text-zinc-950">{milestone.deadline ? fmtDateTime(milestone.deadline) : "—"}</dd></div>
                    </dl>
                  ) : <p className="mt-4 text-sm text-zinc-600">No milestone context available.</p>}
                </section>

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Work and submissions</h2>
                  {submissions.length ? (
                    <div className="mt-4 space-y-3">
                      {submissions.map((s) => (
                        <article key={s.id} className="rounded-xl border border-zinc-200 p-4 text-sm">
                          <p className="font-semibold text-zinc-950">Submission · {fmtDateTime(s.created_at)}</p>
                          <p className="mt-1 text-zinc-600">Review: {(s.review_status || "—").replace(/_/g, " ")} {s.review_comment ? `· ${s.review_comment}` : ""}</p>
                          <a href={s.deliverable_url} target="_blank" rel="noreferrer" className="mt-2 block truncate text-[#0E5E5A] hover:underline">{s.deliverable_url}</a>
                          {s.notes ? <p className="mt-2 whitespace-pre-wrap text-zinc-700">{s.notes}</p> : null}
                        </article>
                      ))}
                    </div>
                  ) : <p className="mt-4 text-sm text-zinc-600">No submissions found for this milestone.</p>}
                </section>
              </div>

              <aside className="space-y-4">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5">
                  <h2 className="text-lg font-semibold text-zinc-950">Next steps</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">Refund approval/rejection actions depend on the current escrow state and on-chain transaction flow. Use the project page to review current status and coordinate with the owner if a dispute or settlement is required.</p>
                  <div className="mt-5 space-y-2">
                    <Link href={base} className="block w-full rounded-xl bg-[#0E5E5A] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#0B4E4B]">Back to project</Link>
                    {milestone ? <Link href={`${base}/milestones/2/open-dispute?seq=${milestone.sequence_number}`} className="block w-full rounded-xl border border-zinc-300 px-4 py-3 text-center text-sm font-semibold text-zinc-800 hover:bg-zinc-50">Open dispute</Link> : null}
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

export default function RefundRequestPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><RefundRequestContent /></Suspense>;
}