"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useProjectMilestonesQuery, useProjectQuery } from "@/lib/api/hooks/useProjects";
import { useCreateDisputeMutation } from "@/lib/api/hooks/useDisputes";
import type { Milestone, PaginatedMilestoneList } from "@/lib/api/types";

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
function asMilestones(data: Milestone[] | PaginatedMilestoneList | undefined, fallback?: Milestone[]) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as PaginatedMilestoneList).results)) return (data as PaginatedMilestoneList).results;
  return fallback ?? [];
}

function OpenDisputeContent() {
  const params = useParams<{ projectId: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const projectId = params?.projectId || "";
  const { data: project, isLoading, error } = useProjectQuery(projectId, { enabled: !!projectId });
  const { data: milestonesData } = useProjectMilestonesQuery(projectId, { enabled: !!projectId });
  const milestones = asMilestones(milestonesData, project?.milestones);
  const initialMilestoneId = sp.get("milestoneId") || "";
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(initialMilestoneId);
  const milestone = useMemo(() => milestones.find((m) => m.id === selectedMilestoneId) || milestones.find((m) => m.id === initialMilestoneId) || milestones[0] || null, [milestones, selectedMilestoneId, initialMilestoneId]);

  const createDispute = useCreateDisputeMutation();
  const [reason, setReason] = useState("");
  const [explanation, setExplanation] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const canSubmit = !!milestone?.id && reason.trim().length > 0 && explanation.trim().length > 0;

  const onSubmit = async () => {
    setFormError(null);
    if (!milestone?.id) { setFormError("Select a milestone."); return; }
    if (!reason.trim() || !explanation.trim()) { setFormError("Provide a reason and explanation."); return; }
    try {
      await createDispute.mutateAsync({
        milestone_id: milestone.id,
        reason: `${reason.trim()}\n\n${explanation.trim()}`.slice(0, 4000),
        evidence_url: evidenceUrl.trim() || undefined,
      });
      router.push(`/app/owner/projects/${projectId}`);
    } catch (e: any) {
      setFormError(e?.message || "Failed to open dispute.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={ownerNav} activeHref="/app/owner/projects" />
      <main className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <nav className="text-sm font-medium text-zinc-500" aria-label="Breadcrumb">
          <Link href="/app/owner/projects" className="hover:text-zinc-700">Projects</Link><span className="mx-2 text-zinc-400">/</span>
          <Link href={`/app/owner/projects/${projectId}`} className="hover:text-zinc-700">{project?.title || "Project"}</Link><span className="mx-2 text-zinc-400">/</span>
          <span className="text-zinc-700">Open dispute</span>
        </nav>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Loading project…</div>
        ) : error || !project ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Could not load project.</div>
        ) : (
          <>
            <div className="mt-5">
              <h1 className="text-[2rem] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[2.2rem]">Open a dispute</h1>
              <p className="mt-1 text-sm font-medium text-zinc-500">{project.title}</p>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-zinc-950">Milestone</h2>
                  <p className="mt-2 text-sm text-zinc-600">Select the milestone this dispute relates to.</p>
                  <div className="mt-4 space-y-2">
                    {milestones.map((m) => (
                      <label key={m.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${ (milestone?.id === m.id) ? "border-[#0E5E5A] bg-[#F3FBFA]" : "border-zinc-200 hover:bg-zinc-50"}`}>
                        <input type="radio" name="milestone" checked={milestone?.id === m.id} onChange={() => setSelectedMilestoneId(m.id)} className="mt-1" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-950">M{m.sequence_number} · {m.title}</p>
                          <p className="mt-1 text-sm text-zinc-600">{fmtUsdc(m.amount)} · {(m.status || "").replace(/_/g, " ")}</p>
                          {m.acceptance_criteria ? <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{m.acceptance_criteria}</p> : null}
                        </div>
                      </label>
                    ))}
                    {!milestones.length ? <p className="text-sm text-zinc-600">No milestones found.</p> : null}
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-zinc-950">What went wrong?</h2>
                  <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Short reason for the dispute" />
                  <div>
                    <label className="block text-sm font-medium text-zinc-900">Explanation</label>
                    <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={6} placeholder="Explain what happened, what you expected, and any relevant details." className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#0E5E5A] focus:ring-4 focus:ring-[#0E5E5A]/10" />
                  </div>
                  <Input label="Evidence link (optional)" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} placeholder="https://..." />
                  {formError ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div> : null}
                </section>
              </div>

              <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5">
                  <h2 className="text-lg font-semibold text-zinc-950">Summary</h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-zinc-600">Project</dt><dd className="text-right font-medium text-zinc-900">{project.title}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-600">Milestone</dt><dd className="text-right font-medium text-zinc-900">{milestone ? `M${milestone.sequence_number} · ${milestone.title}` : "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-600">Amount</dt><dd className="text-right font-semibold text-zinc-900">{fmtUsdc(milestone?.amount)}</dd></div>
                  </dl>
                  <p className="mt-4 text-sm text-zinc-600">Opening a dispute records it via the API. Funds movement and settlement depend on the dispute/escrow process and on-chain requirements.</p>
                  <Button fullWidth size="lg" className="mt-4 h-11 rounded-xl" onClick={onSubmit} disabled={!canSubmit || createDispute.isPending}>{createDispute.isPending ? "Opening…" : "Open dispute"}</Button>
                  <Link href={`/app/owner/projects/${projectId}`} className="mt-3 block text-center text-sm font-semibold text-zinc-600 hover:text-zinc-900">Cancel</Link>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function OpenDisputePage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><OpenDisputeContent /></Suspense>;
}