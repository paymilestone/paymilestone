"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useProjectMilestonesQuery, useProjectQuery } from "@/lib/api/hooks/useProjects";
import { useMilestoneSubmissionsQuery, useSubmitMilestoneDeliverableMutation } from "@/lib/api/hooks/useMilestones";
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
function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric" });
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

function ResubmitContent() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const sp = useSearchParams();
  const projectId = projectSlug;
  const base = `/app/provider/projects/${projectSlug}`;
  const { data: project, isLoading, error } = useProjectQuery(projectId, { enabled: !!projectId });
  const { data: milestonesData } = useProjectMilestonesQuery(projectId, { enabled: !!projectId });
  const milestones = asMilestones(milestonesData, project?.milestones);
  const milestone = useMemo(() => {
    if (!milestones.length) return null;
    const seq = sp.get("seq") ? Number(sp.get("seq")) : 2;
    return milestones.find((m) => m.sequence_number === seq) || milestones.find((m) => m.id === sp.get("milestoneId")) || milestones[0] || null;
  }, [milestones, sp]);
  const { data: submissionsData } = useMilestoneSubmissionsQuery(milestone?.id, { enabled: !!milestone?.id });
  const submissions = asSubmissions(submissionsData);
  const latest = submissions[0];
  const submitMutation = useSubmitMilestoneDeliverableMutation(milestone?.id || "");

  const [links, setLinks] = useState<string[]>(["", ""]);
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const validLinks = useMemo(() => links.map((l) => l.trim()).filter(Boolean), [links]);
  const updateLink = (idx: number, value: string) => setLinks((prev) => prev.map((l, i) => (i === idx ? value : l)));
  const addLink = () => setLinks((prev) => [...prev, ""]);
  const removeLink = (idx: number) => setLinks((prev) => (prev.length === 1 ? [""] : prev.filter((_, i) => i !== idx)));

  const onSubmit = async () => {
    setFormError(null);
    if (!milestone?.id) { setFormError("Milestone not loaded."); return; }
    if (validLinks.length === 0) { setFormError("Add at least one deliverable link."); return; }
    const extra = validLinks.slice(1);
    try {
      await submitMutation.mutateAsync({
        deliverable_url: validLinks[0],
        evidence_reference: extra.length ? extra.join("\n") : undefined,
        notes: note.trim() || undefined,
      });
      setSubmitted(true);
    } catch (e: any) {
      setFormError(e?.message || "Failed to resubmit deliverable.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={providerNav} activeHref="/app/provider" />
      <main className="mx-auto w-full max-w-[1320px] overflow-x-hidden px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <nav className="text-sm font-medium text-zinc-500" aria-label="Breadcrumb">
          <Link href="/app/provider" className="hover:text-zinc-700">Projects</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <Link href={base} className="hover:text-zinc-700">{project?.title || "Project"}</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="text-zinc-700">{milestone ? `Milestone ${milestone.sequence_number}` : "Milestone"}</span>
        </nav>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Loading milestone…</div>
        ) : error || !project || !milestone ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Could not load this milestone.</div>
        ) : (
          <>
            <div className="mt-3">
              <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Resubmit work: {milestone.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-[#FEF3E6] px-2.5 py-1 text-xs font-semibold text-[#B45309]">{(milestone.status || "—").replace(/_/g, " ")}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-600">Deadline {fmtDate(milestone.deadline)} · {fmtUsdc(milestone.amount)}</p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <div className="space-y-5">
                {latest ? (
                  <section className="rounded-2xl border border-[#F3D6A8] bg-[#FEF8EE] p-5 sm:p-6">
                    <h2 className="text-xl font-semibold text-zinc-950">Latest submission and review</h2>
                    <p className="mt-1 text-sm text-zinc-700">Submitted {fmtDateTime(latest.created_at)} · Review: {(latest.review_status || "—").replace(/_/g, " ")}</p>
                    {latest.review_comment ? <div className="mt-4 rounded-xl border border-[#F3D6A8] bg-white px-4 py-3 text-sm leading-7 text-zinc-800 whitespace-pre-wrap">{latest.review_comment}</div> : <p className="mt-3 text-sm text-zinc-700">No review comment provided.</p>}
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3"><p className="font-medium text-zinc-900">Deliverable URL</p><a href={latest.deliverable_url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-[#0E5E5A] hover:underline">{latest.deliverable_url}</a></div>
                      {latest.notes ? <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3"><p className="font-medium text-zinc-900">Notes</p><p className="mt-1 whitespace-pre-wrap text-zinc-700">{latest.notes}</p></div> : null}
                    </div>
                  </section>
                ) : null}

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">New submission</h2>
                  <p className="mt-1 text-sm text-zinc-600">Provide updated deliverable links and notes for the owner to review.</p>
                  <div className="mt-4 space-y-3">
                    {links.map((link, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="min-w-0 flex-1"><Input label={idx === 0 ? "Primary deliverable link" : `Link ${idx + 1}`} value={link} onChange={(e) => updateLink(idx, e.target.value)} placeholder="https://..." /></div>
                        <button type="button" onClick={() => removeLink(idx)} className="mt-7 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50" aria-label="Remove link">×</button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addLink} className="mt-3 text-sm font-semibold text-[#0E5E5A] hover:underline">+ Add another link</button>
                  <div className="mt-5">
                    <label className="text-sm font-medium text-zinc-900">Note to owner <span className="font-normal text-zinc-500">(optional)</span></label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Explain what changed..." className="mt-2 min-h-[140px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
                  </div>
                </section>

                {formError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div> : null}
                {submitted ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Deliverable resubmitted for review.</div> : null}
              </div>

              <aside className="space-y-4">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5">
                  <h2 className="text-lg font-semibold text-zinc-950">Acceptance criteria</h2>
                  {milestone.acceptance_criteria ? <p className="mt-3 text-sm leading-6 text-zinc-700 whitespace-pre-wrap">{milestone.acceptance_criteria}</p> : <p className="mt-3 text-sm text-zinc-600">No acceptance criteria provided.</p>}
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-4"><dt className="text-zinc-500">Amount</dt><dd className="font-semibold text-zinc-950">{fmtUsdc(milestone.amount)}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="text-zinc-500">Deadline</dt><dd className="font-semibold text-zinc-950">{fmtDate(milestone.deadline)}</dd></div>
                  </dl>
                </section>
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3">
                  <Button fullWidth size="lg" className="h-12 rounded-xl" onClick={onSubmit} disabled={submitMutation.isPending}>{submitMutation.isPending ? "Resubmitting…" : "Resubmit work"}</Button>
                  <Link href={base} className="block w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center text-sm font-semibold text-zinc-800 hover:bg-zinc-50">Back to project</Link>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function ProviderResubmitWorkPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><ResubmitContent /></Suspense>;
}