"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useProjectMilestonesQuery, useProjectQuery } from "@/lib/api/hooks/useProjects";
import { useCreateDisputeMutation, useProposeDisputeSettlementMutation } from "@/lib/api/hooks/useDisputes";
import type { Milestone, PaginatedMilestoneList } from "@/lib/api/types";

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
function asMilestones(data: Milestone[] | PaginatedMilestoneList | undefined, fallback?: Milestone[]) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as PaginatedMilestoneList).results)) return (data as PaginatedMilestoneList).results;
  return fallback ?? [];
}

function OpenDisputeContent() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const projectId = projectSlug;
  const base = `/app/provider/projects/${projectSlug}`;
  const { data: project, isLoading, error } = useProjectQuery(projectId, { enabled: !!projectId });
  const { data: milestonesData } = useProjectMilestonesQuery(projectId, { enabled: !!projectId });
  const milestones = asMilestones(milestonesData, project?.milestones);
  const milestone = useMemo(() => {
    const seq = sp.get("seq") ? Number(sp.get("seq")) : 2;
    return milestones.find((m) => m.sequence_number === seq) || milestones.find((m) => m.id === sp.get("milestoneId")) || milestones[0] || null;
  }, [milestones, sp]);

  const createDispute = useCreateDisputeMutation();
  const [reason, setReason] = useState("");
  const [explanation, setExplanation] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [providerAmount, setProviderAmount] = useState("");
  const [ownerRefund, setOwnerRefund] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [createdDisputeId, setCreatedDisputeId] = useState<string | null>(null);
  const proposeMutation = useProposeDisputeSettlementMutation(createdDisputeId || "00000000-0000-0000-0000-000000000000");

  const amount = Number(milestone?.amount || 0);

  const applySplit = (mode: "full" | "refund" | "custom") => {
    if (!amount) return;
    if (mode === "full") { setProviderAmount(String(amount)); setOwnerRefund("0"); }
    if (mode === "refund") { setProviderAmount("0"); setOwnerRefund(String(amount)); }
  };

  const splitValid = useMemo(() => {
    const p = Number(providerAmount || 0), o = Number(ownerRefund || 0);
    if (!amount) return false;
    return p >= 0 && o >= 0 && Math.abs(p + o - amount) < 0.000001;
  }, [providerAmount, ownerRefund, amount]);

  const onCreate = async () => {
    setFormError(null);
    if (!milestone?.id) { setFormError("Milestone not loaded."); return; }
    if (!reason.trim() || !explanation.trim()) { setFormError("Provide a reason and explanation."); return; }
    const combinedReason = `${reason.trim()}\n\n${explanation.trim()}`.slice(0, 4000);
    try {
      const dispute = await createDispute.mutateAsync({
        milestone_id: milestone.id,
        reason: combinedReason,
        evidence_url: evidenceUrl.trim() || undefined,
      });
      setCreatedDisputeId(dispute.id);
      if (splitValid) {
        try {
          await proposeMutation.mutateAsync({ provider_amount: String(providerAmount), owner_refund: String(ownerRefund) });
        } catch {}
      }
      router.push(`${base}`);
    } catch (e: any) {
      setFormError(e?.message || "Failed to open dispute.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={providerNav} activeHref="/app/provider" />
      <main className="mx-auto w-full max-w-[1320px] overflow-x-hidden px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-500" aria-label="Breadcrumb">
          <Link href="/app/provider" className="hover:text-zinc-800">Projects</Link><span>/</span>
          <Link href={base} className="hover:text-zinc-800">{project?.title || "Project"}</Link><span>/</span>
          <span className="text-zinc-700">Open dispute</span>
        </nav>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Loading…</div>
        ) : error || !project || !milestone ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Could not load project or milestone.</div>
        ) : (
          <>
            <div className="mt-3">
              <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Open a dispute</h1>
              <p className="mt-2 text-sm text-zinc-600">{milestone.title} · {fmtUsdc(milestone.amount)} · {(milestone.status || "").replace(/_/g, " ")}</p>
            </div>

            <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Reason and explanation</h2>
                  <div className="mt-4 space-y-4">
                    <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Brief reason for the dispute" />
                    <div>
                      <label className="text-sm font-medium text-zinc-900">Explanation</label>
                      <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explain what happened and why you are opening this dispute..." className="mt-2 min-h-[140px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
                    </div>
                    <Input label="Evidence link (optional)" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} placeholder="https://..." />
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Propose a settlement (optional)</h2>
                  <p className="mt-1 text-sm text-zinc-600">Amounts must add up to {fmtUsdc(milestone.amount)}. If provided, a proposal will be submitted after the dispute is created.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => applySplit("full")} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50">Full payment to you</button>
                    <button type="button" onClick={() => applySplit("refund")} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50">Full refund to owner</button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Input label="To you (provider)" value={providerAmount} onChange={(e) => setProviderAmount(e.target.value)} placeholder="0.00" />
                    <Input label="To owner (refund)" value={ownerRefund} onChange={(e) => setOwnerRefund(e.target.value)} placeholder="0.00" />
                  </div>
                  {providerAmount || ownerRefund ? <p className={`mt-2 text-sm ${splitValid ? "text-zinc-500" : "text-[#C2412D]"}`}>{splitValid ? "Split is valid." : `Amounts must add up to ${fmtUsdc(milestone.amount)}.`}</p> : null}
                </section>

                {milestone.acceptance_criteria ? (
                  <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                    <h2 className="text-xl font-semibold text-zinc-950">Acceptance criteria</h2>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{milestone.acceptance_criteria}</p>
                  </section>
                ) : null}

                {formError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div> : null}
              </div>

              <aside className="space-y-4">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5">
                  <h2 className="text-lg font-semibold text-zinc-950">Milestone</h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Title</dt><dd className="text-right font-medium text-zinc-950">{milestone.title}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Amount</dt><dd className="font-medium text-zinc-950">{fmtUsdc(milestone.amount)}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-zinc-500">Status</dt><dd className="font-medium text-zinc-950">{(milestone.status || "—").replace(/_/g, " ")}</dd></div>
                  </dl>
                  <Button fullWidth size="lg" className="mt-5 h-12 rounded-xl" onClick={onCreate} disabled={createDispute.isPending || proposeMutation.isPending}>{createDispute.isPending ? "Opening dispute…" : "Open dispute"}</Button>
                  <Link href={base} className="mt-3 block text-center text-sm font-semibold text-zinc-700 hover:text-zinc-950">Cancel</Link>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function ProviderOpenDisputePage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><OpenDisputeContent /></Suspense>;
}