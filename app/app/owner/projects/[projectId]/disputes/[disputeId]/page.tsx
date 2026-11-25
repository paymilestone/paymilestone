"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useDisputeQuery, useApproveDisputeSettlementMutation, useProposeDisputeSettlementMutation } from "@/lib/api/hooks/useDisputes";
import { useMilestoneQuery } from "@/lib/api/hooks/useMilestones";
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
function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function DisputeDetailContent() {
  const params = useParams<{ projectId: string; disputeId: string }>();
  const projectId = params?.projectId || "";
  const disputeId = params?.disputeId || "";
  const { data: dispute, isLoading, error } = useDisputeQuery(disputeId, { enabled: !!disputeId });
  const { data: project } = useProjectQuery(projectId || dispute?.project_id, { enabled: !!(projectId || dispute?.project_id) });
  const { data: milestone } = useMilestoneQuery(dispute?.milestone, { enabled: !!dispute?.milestone });

  const proposeMutation = useProposeDisputeSettlementMutation(disputeId);
  const approveMutation = useApproveDisputeSettlementMutation(disputeId);

  const [providerAmount, setProviderAmount] = useState("");
  const [ownerRefund, setOwnerRefund] = useState("");
  const [txHash, setTxHash] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const total = Number(milestone?.amount || 0);
  const proposalValid = useMemo(() => {
    const p = Number(providerAmount || 0), o = Number(ownerRefund || 0);
    if (!total) return p >= 0 && o >= 0 && (providerAmount !== "" || ownerRefund !== "");
    return p >= 0 && o >= 0 && Math.abs(p + o - total) < 0.000001;
  }, [providerAmount, ownerRefund, total]);

  const prefillFromDispute = () => {
    setProviderAmount(dispute?.proposed_provider_amount || (total ? String(total) : ""));
    setOwnerRefund(dispute?.proposed_owner_refund || "0");
  };

  const onPropose = async () => {
    setFormError(null); setMessage(null);
    if (!proposalValid) { setFormError(total ? `Amounts must add up to ${fmtUsdc(total)}.` : "Enter valid proposal amounts."); return; }
    try {
      await proposeMutation.mutateAsync({ provider_amount: String(providerAmount), owner_refund: String(ownerRefund) });
      setMessage("Settlement proposal submitted.");
    } catch (e: any) {
      setFormError(e?.message || "Failed to propose settlement.");
    }
  };

  const onApprove = async () => {
    setFormError(null); setMessage(null);
    const p = dispute?.proposed_provider_amount ?? providerAmount;
    const o = dispute?.proposed_owner_refund ?? ownerRefund;
    if (!p && p !== "0") { setFormError("Provider amount is required."); return; }
    if (!o && o !== "0") { setFormError("Owner refund amount is required."); return; }
    try {
      await approveMutation.mutateAsync({ provider_amount: String(p), owner_refund: String(o), tx_hash: txHash.trim() || undefined });
      setMessage("Settlement approval submitted.");
    } catch (e: any) {
      setFormError(e?.message || "Failed to approve settlement.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={ownerNav} activeHref="/app/owner/projects" />
      <main className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <nav className="text-sm font-medium text-zinc-500" aria-label="Breadcrumb">
          <Link href="/app/owner/projects" className="hover:text-zinc-700">Projects</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <Link href={`/app/owner/projects/${projectId || dispute?.project_id || ""}`} className="hover:text-zinc-700">{project?.title || "Project"}</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="text-zinc-700">Dispute</span>
        </nav>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Loading dispute…</div>
        ) : error || !dispute ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Could not load this dispute.</div>
        ) : (
          <>
            <div className="mt-3">
              <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Dispute: {dispute.milestone_title || milestone?.title || "Milestone"}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-md bg-[#FDECEC] px-2.5 py-1 text-xs font-semibold text-[#C2412D]">{(dispute.status || "—").replace(/_/g, " ")}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-600">{project?.title || `Project ${shortAddr(dispute.project_id)}`}{milestone ? ` · ${fmtUsdc(milestone.amount)}` : ""}</p>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Dispute details</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div><dt className="text-zinc-500">Dispute ID</dt><dd className="mt-1 break-all font-mono text-zinc-900">{dispute.id}</dd></div>
                    <div><dt className="text-zinc-500">Opened by</dt><dd className="mt-1 break-all font-mono text-zinc-900" title={dispute.opened_by_wallet}>{shortAddr(dispute.opened_by_wallet)}</dd></div>
                    <div><dt className="text-zinc-500">Status</dt><dd className="mt-1 font-medium text-zinc-900">{(dispute.status || "—").replace(/_/g, " ")}</dd></div>
                    <div><dt className="text-zinc-500">Created</dt><dd className="mt-1 text-zinc-900">{fmtDateTime(dispute.created_at)}</dd></div>
                    <div><dt className="text-zinc-500">Updated</dt><dd className="mt-1 text-zinc-900">{fmtDateTime(dispute.updated_at)}</dd></div>
                    <div><dt className="text-zinc-500">Reason</dt><dd className="mt-1 whitespace-pre-wrap leading-6 text-zinc-800">{dispute.reason || "—"}</dd></div>
                    {dispute.evidence_url ? <div><dt className="text-zinc-500">Evidence</dt><dd className="mt-1"><a href={dispute.evidence_url} target="_blank" rel="noreferrer" className="break-all text-[#0E5E5A] hover:underline">{dispute.evidence_url}</a></dd></div> : null}
                  </dl>
                </section>

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Current proposal</h2>
                  {(dispute.proposed_provider_amount || dispute.proposed_owner_refund) ? (
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-zinc-200 p-4"><p className="text-zinc-500">To provider</p><p className="mt-1 font-semibold text-zinc-950">{fmtUsdc(dispute.proposed_provider_amount)}</p></div>
                        <div className="rounded-xl border border-zinc-200 p-4"><p className="text-zinc-500">Refund to owner</p><p className="mt-1 font-semibold text-zinc-950">{fmtUsdc(dispute.proposed_owner_refund)}</p></div>
                      </div>
                      <p className="text-zinc-700"><span className="font-medium">Proposed by:</span> <span className="font-mono break-all">{shortAddr(dispute.proposed_by_wallet)}</span></p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-[#F8FAFA] p-4"><p className="text-zinc-500">Provider approved</p><p className="mt-1 font-medium text-zinc-900">{dispute.provider_approved ? "Yes" : "No / pending"}</p></div>
                        <div className="rounded-xl bg-[#F8FAFA] p-4"><p className="text-zinc-500">Owner approved</p><p className="mt-1 font-medium text-zinc-900">{dispute.owner_approved ? "Yes" : "No / pending"}</p></div>
                      </div>
                      {dispute.resolution_tx_hash ? <p className="text-zinc-700"><span className="font-medium">Resolution tx:</span> <span className="break-all font-mono">{dispute.resolution_tx_hash}</span></p> : null}
                      {dispute.resolved_at ? <p className="text-zinc-700"><span className="font-medium">Resolved:</span> {fmtDateTime(dispute.resolved_at)}</p> : null}
                    </div>
                  ) : <p className="mt-4 text-sm text-zinc-600">No settlement proposal recorded yet.</p>}
                </section>
              </div>

              <aside className="space-y-4">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3">
                  <h2 className="text-lg font-semibold text-zinc-950">Propose settlement</h2>
                  {total ? <p className="text-sm text-zinc-600">Milestone amount: {fmtUsdc(total)}. Amounts must add up to the total.</p> : null}
                  <div className="flex gap-2">
                    <button type="button" onClick={prefillFromDispute} className="text-sm font-medium text-[#0E5E5A] hover:underline">Use current proposal</button>
                  </div>
                  <Input label="To provider (USDC)" value={providerAmount} onChange={(e) => setProviderAmount(e.target.value)} placeholder="0.00" />
                  <Input label="Refund to owner (USDC)" value={ownerRefund} onChange={(e) => setOwnerRefund(e.target.value)} placeholder="0.00" />
                  {!proposalValid && (providerAmount || ownerRefund) ? <p className="text-xs text-[#C2412D]">Amounts must be valid{total ? ` and add up to ${fmtUsdc(total)}` : ""}.</p> : null}
                  <Button fullWidth className="h-11 rounded-xl" onClick={onPropose} disabled={proposeMutation.isPending || !proposalValid}>{proposeMutation.isPending ? "Submitting…" : "Propose settlement"}</Button>
                </section>

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 space-y-3">
                  <h2 className="text-lg font-semibold text-zinc-950">Approve settlement</h2>
                  <p className="text-sm text-zinc-600">Approves the currently proposed amounts (or the amounts entered above). Transaction hash may be required depending on backend/on-chain flow.</p>
                  <Input label="Transaction hash (if required)" value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="tx hash" />
                  <Button fullWidth variant="outline" className="h-11 rounded-xl" onClick={onApprove} disabled={approveMutation.isPending}>{approveMutation.isPending ? "Approving…" : "Approve settlement"}</Button>
                </section>

                {formError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div> : null}
                {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5">
                  <Link href={`/app/owner/projects/${projectId || dispute.project_id}`} className="block w-full rounded-xl bg-[#0E5E5A] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#0B4E4B]">Back to project</Link>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function OwnerDisputeDetailPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><DisputeDetailContent /></Suspense>;
}