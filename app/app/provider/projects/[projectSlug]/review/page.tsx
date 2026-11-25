"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app/AppHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/wallet/useWallet";
import { useApproveProjectMutation, useProjectMilestonesQuery, useProjectQuery, useProjectRevisionsQuery } from "@/lib/api/hooks/useProjects";
import type { AgreementRevision, Milestone, PaginatedAgreementRevisionList, PaginatedMilestoneList } from "@/lib/api/types";

const providerNav = [
  { label: "Projects", href: "/app/provider" },
  { label: "Transactions", href: "/app/provider/transactions" },
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
function asRevisions(data: AgreementRevision[] | PaginatedAgreementRevisionList | undefined) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as PaginatedAgreementRevisionList).results)) return (data as PaginatedAgreementRevisionList).results;
  return [];
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "amber" | "blue" | "green" | "red" | "neutral" }) {
  const cls = {
    amber: "bg-[#FEF3E6] text-[#B45309]",
    blue: "bg-[#EAF3F8] text-[#2D64C8]",
    green: "bg-[#E9F8F1] text-[#059669]",
    red: "bg-[#FDECEC] text-[#C2412D]",
    neutral: "bg-zinc-100 text-zinc-600",
  }[tone];
  return <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", cls)}>{children}</span>;
}

function ReviewContent() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const router = useRouter();
  const { address } = useWallet();
  const isDesktop = useIsDesktop(640);
  const { data: project, isLoading, error } = useProjectQuery(projectSlug, { enabled: !!projectSlug });
  const { data: milestonesData } = useProjectMilestonesQuery(projectSlug, { enabled: !!projectSlug });
  const { data: revisionsData } = useProjectRevisionsQuery(projectSlug, { enabled: !!projectSlug });
  const approveMutation = useApproveProjectMutation(projectSlug || "");

  const milestones = asMilestones(milestonesData, project?.milestones);
  const revisions = asRevisions(revisionsData).slice().sort((a, b) => b.version - a.version);
  const [dialog, setDialog] = useState<"confirm" | "done" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const canApprove = useMemo(() => {
    if (!project || !address) return false;
    if (project.provider_wallet && project.provider_wallet.toUpperCase() !== address.toUpperCase()) return false;
    // If already approved at this version as provider, don't prompt approve again.
    if ((project.provider_approved_version || 0) >= (project.agreement_version || 0)) return false;
    return true;
  }, [project, address]);

  const onApprove = async () => {
    if (!project) return;
    setErrorMsg("");
    try {
      await approveMutation.mutateAsync({ version: project.agreement_version });
      setDialog("done");
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.detail || e?.message || "Approval failed.");
      setDialog("error");
    }
  };

  const DialogWrap = ({ children }: { children: React.ReactNode }) =>
    isDesktop ? (
      <Modal open={!!dialog} onClose={() => setDialog(null)} size="sm" showCloseButton={false}>{children}</Modal>
    ) : (
      <BottomSheet open={!!dialog} onClose={() => setDialog(null)} showCloseButton={false} showHandle>{children}</BottomSheet>
    );

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={providerNav} activeHref="/app/provider" />
      <main className="mx-auto w-full max-w-[1320px] overflow-x-hidden px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link href="/app/provider" className="hover:text-zinc-800">Projects</Link>
          <span>/</span>
          <Link href={`/app/provider/projects/${projectSlug || ""}`} className="hover:text-zinc-800">{project?.title || "Project"}</Link>
          <span>/</span>
          <span className="text-zinc-700">Review agreement</span>
        </nav>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Loading agreement…</div>
        ) : error || !project ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center">
            <h1 className="text-2xl font-semibold text-zinc-950">Agreement unavailable</h1>
            <p className="mt-2 text-sm text-zinc-600">Could not load this project agreement from the API.</p>
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Review agreement</h1>
                  <Pill tone={project.agreement_status === "APPROVED" ? "green" : "amber"}>{(project.agreement_status || "—").replace(/_/g, " ")}</Pill>
                  <Pill tone="neutral">Version {project.agreement_version}</Pill>
                </div>
                <p className="mt-1 text-sm text-zinc-600">Owner {shortAddr(project.owner_wallet)} · Provider {shortAddr(project.provider_wallet)} · Updated {fmtDateTime(project.updated_at)}</p>
              </div>
            </div>

            <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-4">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Project summary</h2>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div><dt className="text-zinc-500">Project</dt><dd className="mt-1 font-medium text-zinc-950">{project.title}</dd></div>
                    <div><dt className="text-zinc-500">Total budget</dt><dd className="mt-1 font-semibold text-zinc-950">{fmtUsdc(project.total_budget)} {project.currency || "USDC"}</dd></div>
                    <div><dt className="text-zinc-500">Timeline</dt><dd className="mt-1 font-medium text-zinc-950">{fmtDateTime(project.start_date)} – {fmtDateTime(project.end_date)}</dd></div>
                    <div><dt className="text-zinc-500">Funding model</dt><dd className="mt-1 font-medium text-zinc-950">{(project.funding_model || "—").replace(/_/g, " ")}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-zinc-500">Description</dt><dd className="mt-1 text-zinc-800 leading-6">{project.description || "—"}</dd></div>
                  </dl>
                </section>

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Milestones</h2>
                  <div className="mt-4 space-y-3">
                    {milestones.length ? milestones.map((m, idx) => (
                      <article key={m.id} className="rounded-xl border border-zinc-200/80 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-zinc-500">Milestone {m.sequence_number ?? idx + 1}</p>
                          <Pill tone="neutral">{(m.status || "").replace(/_/g, " ") || "—"}</Pill>
                        </div>
                        <h3 className="mt-1 text-base font-semibold text-zinc-950">{m.title}</h3>
                        <p className="mt-1 text-sm text-zinc-600">{fmtUsdc(m.amount)} {project.currency || "USDC"}{m.deadline ? ` · Due ${fmtDateTime(m.deadline)}` : ""}</p>
                        {m.description ? <p className="mt-2 text-sm text-zinc-700">{m.description}</p> : null}
                        {m.acceptance_criteria ? <p className="mt-2 text-sm text-zinc-600"><span className="font-medium text-zinc-800">Acceptance criteria:</span> {m.acceptance_criteria}</p> : null}
                      </article>
                    )) : <p className="text-sm text-zinc-600">No milestones found.</p>}
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Revisions</h2>
                  <div className="mt-4 space-y-3">
                    {revisions.length ? revisions.map((r) => (
                      <article key={r.id} className="rounded-xl border border-zinc-200/80 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-zinc-950">Version {r.version}</p>
                          <p className="text-xs text-zinc-500">{fmtDateTime(r.created_at)}</p>
                        </div>
                        <p className="mt-1 text-sm text-zinc-600">By {shortAddr(r.changed_by_wallet)}</p>
                        {r.change_summary ? <p className="mt-2 text-sm text-zinc-700">{r.change_summary}</p> : null}
                      </article>
                    )) : <p className="text-sm text-zinc-600">No agreement revisions recorded.</p>}
                  </div>
                </section>
              </div>

              <aside className="min-w-0 space-y-4">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5">
                  <h2 className="text-lg font-semibold text-zinc-950">Signatures</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4"><dt className="text-zinc-600">Provider approved version</dt><dd className="font-medium text-zinc-950">{project.provider_approved_version ?? "—"}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="text-zinc-600">Owner approved version</dt><dd className="font-medium text-zinc-950">{project.owner_approved_version ?? "—"}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="text-zinc-600">Mutually approved</dt><dd className="font-medium text-zinc-950">{project.is_mutually_approved ? "Yes" : "No"}</dd></div>
                  </dl>

                  {!address ? (
                    <p className="mt-4 text-sm text-zinc-600">Connect your wallet to approve this agreement.</p>
                  ) : !canApprove ? (
                    <p className="mt-4 text-sm text-zinc-600">{(project.provider_approved_version || 0) >= (project.agreement_version || 0) ? "You have already approved the current version." : "This wallet cannot approve this agreement."}</p>
                  ) : (
                    <Button className="mt-5 h-11 w-full rounded-xl" onClick={() => setDialog("confirm")} disabled={approveMutation.isPending}>Approve version {project.agreement_version}</Button>
                  )}
                  <p className="mt-3 text-xs leading-5 text-zinc-500">Approving calls the project agreement approval API for the current version. Wallet signing/tx-hash submission may be required by your workflow or contract integration.</p>
                  <div className="mt-4">
                    <Link href={`/app/provider/projects/${project.id}`} className="block w-full text-center text-sm font-semibold text-zinc-700 hover:text-zinc-950">Back to project</Link>
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>

      {dialog ? (
        <DialogWrap>
          {dialog === "confirm" ? (
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">Approve agreement?</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">Approve version {project?.agreement_version} of {project?.title}. This sends your approval to the API.</p>
              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" className="h-11 rounded-xl" onClick={() => setDialog(null)} disabled={approveMutation.isPending}>Cancel</Button>
                <Button className="h-11 rounded-xl" onClick={() => { void onApprove(); }} disabled={approveMutation.isPending}>{approveMutation.isPending ? "Approving…" : "Approve"}</Button>
              </div>
            </div>
          ) : dialog === "done" ? (
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">Approval submitted</h2>
              <div className="mt-3 rounded-xl bg-[#E9F8F1] px-4 py-3 text-sm font-medium text-[#059669]">Your agreement approval was submitted successfully.</div>
              <Button className="mt-5 h-11 w-full rounded-xl" onClick={() => { setDialog(null); router.push(`/app/provider/projects/${projectSlug}`); }}>Back to project</Button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">Approval failed</h2>
              <div className="mt-3 rounded-xl bg-[#FDECEC] px-4 py-3 text-sm text-[#991B1B]">{errorMsg || "The API rejected this approval request."}</div>
              <div className="mt-5 flex justify-end"><Button className="h-11 rounded-xl" onClick={() => setDialog(null)}>Close</Button></div>
            </div>
          )}
        </DialogWrap>
      ) : null}
    </div>
  );
}

export default function ProviderReviewAgreementPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><ReviewContent /></Suspense>;
}