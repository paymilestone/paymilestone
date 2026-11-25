"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app/AppHeader";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/wallet/useWallet";
import { useProjectQuery, useProjectMilestonesQuery } from "@/lib/api/hooks/useProjects";
import { useDisputesQuery } from "@/lib/api/hooks/useDisputes";
import type { Dispute, Milestone, PaginatedMilestoneList, Project } from "@/lib/api/types";

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

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "amber" | "blue" | "green" | "red" | "neutral" | "teal" }) {
  const cls = {
    amber: "bg-[#FEF3E6] text-[#B45309]",
    blue: "bg-[#EAF3F8] text-[#2D64C8]",
    green: "bg-[#E9F8F1] text-[#059669]",
    red: "bg-[#FDECEC] text-[#C2412D]",
    neutral: "bg-zinc-100 text-zinc-600",
    teal: "bg-[#DCEEEB] text-[#0E5E5A]",
  }[tone];
  return <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", cls)}>{children}</span>;
}

function milestoneTone(status?: string): "amber" | "blue" | "green" | "red" | "neutral" | "teal" {
  const s = (status || "").toUpperCase();
  if (s === "PAID" || s === "APPROVED_FOR_PAYMENT") return "green";
  if (s === "FUNDED" || s === "IN_PROGRESS" || s === "SUBMITTED_FOR_REVIEW") return "blue";
  if (s === "REVISION_REQUESTED" || s === "PENDING_FUNDING") return "amber";
  if (s === "DISPUTED") return "red";
  return "neutral";
}

function projectStatus(project?: Project | null) {
  if (!project) return { label: "Loading", tone: "neutral" as const };
  if (project.agreement_status === "CANCELLED") return { label: "Cancelled", tone: "neutral" as const };
  const milestones = project.milestones || [];
  if (milestones.some((m) => m.status === "DISPUTED")) return { label: "Disputed", tone: "red" as const };
  if (milestones.length > 0 && milestones.every((m) => m.status === "PAID" || m.status === "REFUNDED")) return { label: "Completed", tone: "green" as const };
  if (project.is_mutually_approved || project.agreement_status === "APPROVED") return { label: "Active", tone: "blue" as const };
  if (project.agreement_status === "AWAITING_APPROVAL") return { label: "Awaiting approval", tone: "amber" as const };
  return { label: project.agreement_status?.replace(/_/g, " ") || "Draft", tone: "neutral" as const };
}

function ProviderProjectContent() {
  const params = useParams<{ projectSlug: string }>();
  const sp = useSearchParams();
  const projectId = params?.projectSlug;
  const { address } = useWallet();
  const { data: project, isLoading, error } = useProjectQuery(projectId, { enabled: !!projectId });
  const { data: milestonesData } = useProjectMilestonesQuery(projectId, { enabled: !!projectId });
  const { data: disputesData } = useDisputesQuery({ wallet: address ?? undefined }, { enabled: !!address });

  const milestones = asMilestones(milestonesData, project?.milestones);
  const disputes = ((disputesData ?? []) as Dispute[]).filter((d) => d.project_id === projectId);
  const status = projectStatus(project);
  const view = sp.get("view");
  const state = sp.get("state");

  const stats = useMemo(() => {
    const paid = milestones.filter((m) => m.status === "PAID").length;
    return { paid, total: milestones.length };
  }, [milestones]);

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={providerNav} activeHref="/app/provider" />
      <main className="mx-auto w-full max-w-[1320px] overflow-x-hidden px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link href="/app/provider" className="hover:text-zinc-800">Projects</Link>
          <span>/</span>
          <span className="text-zinc-700">{project?.title || "Project"}</span>
        </nav>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Loading project…</div>
        ) : error || !project ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center">
            <h1 className="text-2xl font-semibold text-zinc-950">Project unavailable</h1>
            <p className="mt-2 text-sm text-zinc-600">Could not load this project from the API. Check the project link or your connected wallet access.</p>
            <div className="mt-5"><Link href="/app/provider" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0E5E5A] px-5 text-sm font-semibold text-white">Back to projects</Link></div>
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[40px]">{project.title}</h1>
                  <Pill tone={status.tone}>{status.label}</Pill>
                  <Pill tone="teal">Agreement v{project.agreement_version}</Pill>
                </div>
                <p className="mt-1 text-sm text-zinc-600">Owner {shortAddr(project.owner_wallet)} · Updated {fmtDateTime(project.updated_at)}</p>
                {project.description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-700">{project.description}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/app/provider/projects/${project.id}/review`} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50">Review agreement</Link>
              </div>
            </div>

            {(view || state) ? (
              <div className="mt-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">Showing API-backed project data. Requested view/state: <span className="font-medium text-zinc-900">{view || state}</span>.</div>
            ) : null}

            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Project summary">
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-4"><p className="text-sm text-zinc-600">Budget</p><p className="mt-1 text-2xl font-semibold text-zinc-950">{fmtUsdc(project.total_budget)}</p></div>
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-4"><p className="text-sm text-zinc-600">Funded</p><p className="mt-1 text-2xl font-semibold text-zinc-950">{fmtUsdc(project.total_funded)}</p></div>
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-4"><p className="text-sm text-zinc-600">Released</p><p className="mt-1 text-2xl font-semibold text-zinc-950">{fmtUsdc(project.total_released)}</p></div>
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-4"><p className="text-sm text-zinc-600">Milestones paid</p><p className="mt-1 text-2xl font-semibold text-zinc-950">{stats.paid}/{stats.total}</p></div>
            </section>

            <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-4">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-zinc-950">Milestones</h2>
                    <span className="text-sm text-zinc-600">{stats.total} total</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {milestones.length ? milestones.map((m, idx) => {
                      const seq = m.sequence_number ?? idx + 1;
                      const dispute = disputes.find((d) => d.milestone === m.id);
                      const canSubmit = ["FUNDED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(m.status || "");
                      return (
                        <article key={m.id} className="rounded-2xl border border-zinc-200/80 p-4 sm:p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-zinc-500">Milestone {seq}</p>
                                <Pill tone={milestoneTone(m.status)}>{(m.status || "unknown").replace(/_/g, " ")}</Pill>
                                {dispute ? <Pill tone="red">Disputed</Pill> : null}
                              </div>
                              <h3 className="mt-1 text-lg font-semibold text-zinc-950">{m.title}</h3>
                              <p className="mt-1 text-sm text-zinc-600">{fmtUsdc(m.amount)}{m.deadline ? ` · Due ${fmtDate(m.deadline)}` : ""}</p>
                              {m.description ? <p className="mt-2 text-sm leading-6 text-zinc-700">{m.description}</p> : null}
                              {m.acceptance_criteria ? <p className="mt-2 text-sm text-zinc-600"><span className="font-medium text-zinc-800">Acceptance:</span> {m.acceptance_criteria}</p> : null}
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2">
                              {canSubmit ? <Link href={`/app/provider/projects/${project.id}/milestones/${seq}/submit`} className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0E5E5A] px-4 text-sm font-semibold text-white">Submit</Link> : null}
                              {m.status === "REVISION_REQUESTED" ? <Link href={`/app/provider/projects/${project.id}/milestones/${seq}/resubmit`} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800">Resubmit</Link> : null}
                              {dispute ? <Link href={`/app/provider/projects/${project.id}/disputes/m2`} className="inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700">View dispute</Link> : null}
                            </div>
                          </div>
                        </article>
                      );
                    }) : <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600">No milestones found for this project.</div>}
                  </div>
                </section>
              </div>

              <aside className="min-w-0 space-y-4">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-zinc-950">Agreement</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4"><dt className="text-zinc-500">Status</dt><dd className="font-medium text-zinc-950">{(project.agreement_status || "—").replace(/_/g, " ")}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="text-zinc-500">Version</dt><dd className="font-medium text-zinc-950">{project.agreement_version ?? "—"}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="text-zinc-500">Provider approved</dt><dd className="font-medium text-zinc-950">{project.provider_approved_version ?? "—"}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="text-zinc-500">Owner approved</dt><dd className="font-medium text-zinc-950">{project.owner_approved_version ?? "—"}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="text-zinc-500">Funding model</dt><dd className="font-medium text-zinc-950">{(project.funding_model || "—").replace(/_/g, " ")}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="text-zinc-500">Currency</dt><dd className="font-medium text-zinc-950">{project.currency || "USDC"}</dd></div>
                  </dl>
                  <div className="mt-5 space-y-2">
                    <Link href={`/app/provider/projects/${project.id}/review`} className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#0E5E5A] px-4 text-sm font-semibold text-white">Open review</Link>
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-zinc-950">Disputes</h2>
                  <div className="mt-3 space-y-3">
                    {disputes.length ? disputes.map((d) => (
                      <div key={d.id} className="rounded-xl border border-zinc-200 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-zinc-950">{d.milestone_title || shortAddr(d.milestone || d.id)}</p>
                          <Pill tone={d.status === "RESOLVED" ? "green" : "red"}>{d.status}</Pill>
                        </div>
                        {d.reason ? <p className="mt-1 text-sm text-zinc-600 line-clamp-3">{d.reason}</p> : null}
                      </div>
                    )) : <p className="text-sm text-zinc-600">No disputes for this project.</p>}
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-zinc-950">Parties & timeline</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div><dt className="text-zinc-500">Owner</dt><dd className="mt-1 font-mono text-zinc-900 break-all">{project.owner_wallet}</dd></div>
                    <div><dt className="text-zinc-500">Provider</dt><dd className="mt-1 font-mono text-zinc-900 break-all">{project.provider_wallet || "—"}</dd></div>
                    <div><dt className="text-zinc-500">Start</dt><dd className="mt-1 font-medium text-zinc-900">{fmtDate(project.start_date)}</dd></div>
                    <div><dt className="text-zinc-500">End</dt><dd className="mt-1 font-medium text-zinc-900">{fmtDate(project.end_date)}</dd></div>
                  </dl>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function ProviderProjectPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><ProviderProjectContent /></Suspense>;
}
