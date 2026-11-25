"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/app";
import { Button } from "@/components/ui/Button";
import { useProjectMilestonesQuery, useProjectQuery } from "@/lib/api/hooks/useProjects";
import { useMilestoneQuery, useMilestoneSubmissionsQuery, useReviewMilestoneDeliverableMutation } from "@/lib/api/hooks/useMilestones";
import type { DeliverableSubmission, Milestone, PaginatedDeliverableSubmissionList, PaginatedMilestoneList } from "@/lib/api/types";

const ownerNav = [
  { label: "Dashboard", href: "/app/owner" },
  { label: "Projects", href: "/app/owner/projects" },
  { label: "Transactions", href: "/app/owner/transactions" },
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

function ReviewContent() {
  const params = useParams<{ projectId: string; milestoneId: string }>();
  const projectId = params?.projectId || "";
  const milestoneId = params?.milestoneId || "";
  const { data: project } = useProjectQuery(projectId, { enabled: !!projectId });
  const { data: milestonesData } = useProjectMilestonesQuery(projectId, { enabled: !!projectId });
  const milestones = asMilestones(milestonesData, project?.milestones);
  const milestoneFromList = milestones.find((m) => m.id === milestoneId);
  const { data: milestoneDetail } = useMilestoneQuery(milestoneId, { enabled: !!milestoneId });
  const milestone = milestoneDetail || milestoneFromList || null;
  const { data: submissionsData, isLoading, error } = useMilestoneSubmissionsQuery(milestoneId, { enabled: !!milestoneId });
  const submissions = asSubmissions(submissionsData);
  const latest = submissions[0];
  const reviewMutation = useReviewMilestoneDeliverableMutation(milestoneId);

  const [comment, setComment] = useState("");
  const [txHash, setTxHash] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const canApprove = milestone?.status === "SUBMITTED_FOR_REVIEW" || milestone?.status === "APPROVED_FOR_PAYMENT";
  const canRequestRevision = milestone?.status === "SUBMITTED_FOR_REVIEW";

  const onReview = async (action: "approve" | "request_revision") => {
    setFormError(null); setMessage(null);
    if (action === "request_revision" && !comment.trim()) { setFormError("Add a comment so the provider knows what to change."); return; }
    try {
      await reviewMutation.mutateAsync({
        action,
        review_comment: comment.trim() || undefined,
        tx_hash: txHash.trim() || undefined,
      });
      setMessage(action === "approve" ? "Review submitted (approved)." : "Revision requested.");
    } catch (e: any) {
      setFormError(e?.message || "Failed to submit review.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={ownerNav} activeHref="/app/owner/projects" />
      <main className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <nav className="text-sm font-medium text-zinc-500" aria-label="Breadcrumb">
          <Link href="/app/owner/projects" className="hover:text-zinc-700">Projects</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <Link href={`/app/owner/projects/${projectId}`} className="hover:text-zinc-700">{project?.title || "Project"}</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="text-zinc-700">{milestone ? `Milestone ${milestone.sequence_number}` : "Milestone"}</span>
        </nav>

        {isLoading && !milestone ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Loading milestone…</div>
        ) : error && !milestone ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Could not load milestone data.</div>
        ) : (
          <>
            <div className="mt-3">
              <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Review: {milestone?.title || "Milestone"}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-[#E1EAFA] px-2.5 py-1 text-xs font-semibold text-[#2D64C8]">{(milestone?.status || "—").replace(/_/g, " ")}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-600">{project?.title || ""}{milestone?.deadline ? ` · Due ${fmtDateTime(milestone.deadline)}` : ""}</p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <div className="space-y-5">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Milestone details</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Amount</dt><dd className="font-semibold text-zinc-900">{fmtUsdc(milestone?.amount)}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Status</dt><dd className="font-semibold text-zinc-900">{(milestone?.status || "—").replace(/_/g, " ")}</dd></div>
                    {milestone?.deadline ? <div className="flex justify-between gap-4"><dt className="text-zinc-500">Deadline</dt><dd className="font-semibold text-zinc-900">{fmtDateTime(milestone.deadline)}</dd></div> : null}
                  </dl>
                  {milestone?.description ? <div className="mt-4"><p className="text-sm font-medium text-zinc-900">Description</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{milestone.description}</p></div> : null}
                  {milestone?.acceptance_criteria ? <div className="mt-4"><p className="text-sm font-medium text-zinc-900">Acceptance criteria</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{milestone.acceptance_criteria}</p></div> : null}
                </section>

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Latest submission</h2>
                  {latest ? (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-xl border border-zinc-200 bg-[#F8FAFA] p-4 text-sm">
                        <p className="font-medium text-zinc-900">Submitted {fmtDateTime(latest.created_at)} by <span className="font-mono">{latest.submitted_by_wallet ? `${latest.submitted_by_wallet.slice(0,6)}…${latest.submitted_by_wallet.slice(-4)}` : "—"}</span></p>
                        <p className="mt-1 text-zinc-600">Review status: {(latest.review_status || "—").replace(/_/g, " ")}</p>
                        {latest.notes ? <p className="mt-3 whitespace-pre-wrap leading-6 text-zinc-800">{latest.notes}</p> : null}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">Deliverable</p>
                        <a href={latest.deliverable_url} target="_blank" rel="noreferrer" className="mt-2 block break-all rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-[#0E5E5A] hover:bg-zinc-50">{latest.deliverable_url}</a>
                        {latest.evidence_reference ? <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700"><span className="font-medium">Evidence/reference:</span> {latest.evidence_reference}</p> : null}
                      </div>
                      {latest.review_comment ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-medium">Previous review comment</p><p className="mt-1 whitespace-pre-wrap">{latest.review_comment}</p></div> : null}
                    </div>
                  ) : <p className="mt-4 text-sm text-zinc-600">No submissions found for this milestone yet.</p>}
                </section>

                {submissions.length > 1 ? (
                  <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                    <h2 className="text-xl font-semibold text-zinc-950">Submission history</h2>
                    <div className="mt-4 space-y-3">
                      {submissions.slice(1).map((s) => (
                        <article key={s.id} className="rounded-xl border border-zinc-200 p-4 text-sm">
                          <p className="font-medium text-zinc-900">{fmtDateTime(s.created_at)} · {(s.review_status || "—").replace(/_/g, " ")}</p>
                          <a href={s.deliverable_url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-[#0E5E5A] hover:underline">{s.deliverable_url}</a>
                          {s.review_comment ? <p className="mt-2 whitespace-pre-wrap text-zinc-700">{s.review_comment}</p> : null}
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>

              <aside className="space-y-4">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3">
                  <h2 className="text-lg font-semibold text-zinc-950">Review actions</h2>
                  <div>
                    <label className="text-sm font-medium text-zinc-900">Comment to provider</label>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="mt-2 h-28 w-full resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" placeholder="Required when requesting revisions" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-900">Transaction hash <span className="font-normal text-zinc-500">(optional)</span></label>
                    <input value={txHash} onChange={(e) => setTxHash(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" placeholder="On-chain tx hash if applicable" />
                  </div>
                  {formError ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div> : null}
                  {message ? <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div> : null}
                  <Button fullWidth size="lg" className="h-12 rounded-xl" onClick={() => onReview("approve")} disabled={reviewMutation.isPending || !canApprove}>{reviewMutation.isPending ? "Submitting…" : "Approve"}</Button>
                  <button type="button" onClick={() => onReview("request_revision")} disabled={reviewMutation.isPending || !canRequestRevision} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-50">Request revisions</button>
                  <Link href={`/app/owner/projects/${projectId}/disputes/new?milestoneId=${encodeURIComponent(milestoneId)}`} className="block w-full text-center text-sm font-semibold text-[#C2412D] hover:text-[#A93625]">Open dispute</Link>
                  <Link href={`/app/owner/projects/${projectId}`} className="block w-full text-center text-sm font-semibold text-zinc-700 hover:text-zinc-950">Back to project</Link>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function MilestoneReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}>
      <ReviewContent />
    </Suspense>
  );
}