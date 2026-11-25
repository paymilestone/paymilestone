"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app";
import { Button } from "@/components/ui/Button";
import { useProjectMilestonesQuery, useProjectQuery, useSendProjectForApprovalMutation } from "@/lib/api/hooks/useProjects";
import type { Milestone, PaginatedMilestoneList } from "@/lib/api/types";

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
function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
function asMilestones(data: Milestone[] | PaginatedMilestoneList | undefined, fallback?: Milestone[]) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as PaginatedMilestoneList).results)) return (data as PaginatedMilestoneList).results;
  return fallback ?? [];
}

function PreviewContent() {
  const sp = useSearchParams();
  const projectId = sp.get("projectId") || sp.get("id") || "";
  const { data: project, isLoading, error } = useProjectQuery(projectId || undefined, { enabled: !!projectId });
  const { data: milestonesData } = useProjectMilestonesQuery(projectId || undefined, { enabled: !!projectId });
  const sendMutation = useSendProjectForApprovalMutation(projectId);

  const milestones = asMilestones(milestonesData, project?.milestones);

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={ownerNav} activeHref="/app/owner/projects" />
      <main className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <nav className="text-sm font-medium text-zinc-500" aria-label="Breadcrumb">
          <Link href="/app/owner/projects" className="hover:text-zinc-700">Projects</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <Link href="/app/owner/projects/new" className="hover:text-zinc-700">New</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="text-zinc-700">Preview</span>
        </nav>

        {!projectId ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center">
            <h1 className="text-2xl font-semibold text-zinc-950">Project not specified</h1>
            <p className="mt-2 text-sm text-zinc-600">Open preview from a saved/created project.</p>
          </div>
        ) : isLoading ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Loading project preview…</div>
        ) : error || !project ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center">
            <h1 className="text-2xl font-semibold text-zinc-950">Project unavailable</h1>
            <p className="mt-2 text-sm text-zinc-600">Could not load this project from the API.</p>
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Agreement preview</h1>
              <span className="inline-flex items-center rounded-md bg-zinc-200/80 px-2.5 py-1 text-xs font-semibold text-zinc-600">{(project.agreement_status || "Draft").replace(/_/g, " ")}</span>
              <span className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700">Version {project.agreement_version}</span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">Review the agreement details loaded from the API before sending to the provider.</p>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <div className="space-y-4 sm:space-y-5">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Project summary</h2>
                  <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 text-sm">
                    <div><dt className="font-medium text-zinc-500">Title</dt><dd className="mt-1 text-base font-medium text-zinc-900">{project.title}</dd></div>
                    <div><dt className="font-medium text-zinc-500">Total budget</dt><dd className="mt-1 text-base font-medium text-zinc-900">{fmtUsdc(project.total_budget)} {project.currency || "USDC"}</dd></div>
                    <div className="sm:col-span-2"><dt className="font-medium text-zinc-500">Description</dt><dd className="mt-1 text-base leading-7 text-zinc-800">{project.description || "—"}</dd></div>
                    <div><dt className="font-medium text-zinc-500">Start date</dt><dd className="mt-1 text-base font-medium text-zinc-900">{fmtDate(project.start_date)}</dd></div>
                    <div><dt className="font-medium text-zinc-500">End date</dt><dd className="mt-1 text-base font-medium text-zinc-900">{fmtDate(project.end_date)}</dd></div>
                    <div className="sm:col-span-2"><dt className="font-medium text-zinc-500">Funding model</dt><dd className="mt-1 text-base font-medium text-zinc-900">{(project.funding_model || "—").replace(/_/g, " ")}</dd></div>
                  </dl>
                </section>

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Parties</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">
                    <div className="rounded-xl border border-zinc-200 p-4"><p className="font-medium text-zinc-500">Owner</p><p className="mt-2 font-mono font-semibold text-zinc-900 break-all">{project.owner_wallet}</p></div>
                    <div className="rounded-xl border border-zinc-200 p-4"><p className="font-medium text-zinc-500">Provider</p><p className="mt-2 font-mono font-semibold text-zinc-900 break-all">{project.provider_wallet || "—"}</p></div>
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Milestones</h2>
                  <div className="mt-5 space-y-3">
                    {milestones.length ? milestones.map((m, idx) => (
                      <article key={m.id} className="rounded-xl border border-zinc-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-zinc-950">Milestone {m.sequence_number ?? idx + 1}: {m.title}</p>
                          <p className="text-sm font-medium text-zinc-800">{fmtUsdc(m.amount)}</p>
                        </div>
                        {m.description ? <p className="mt-2 text-sm leading-6 text-zinc-700">{m.description}</p> : null}
                        {m.acceptance_criteria ? <p className="mt-2 text-sm text-zinc-600"><span className="font-medium text-zinc-800">Acceptance criteria:</span> {m.acceptance_criteria}</p> : null}
                        {m.deadline ? <p className="mt-2 text-xs text-zinc-500">Deadline: {fmtDate(m.deadline)}</p> : null}
                      </article>
                    )) : <p className="text-sm text-zinc-600">No milestones found.</p>}
                  </div>
                </section>
              </div>

              <aside className="space-y-4 lg:sticky lg:top-24">
                <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
                  <h2 className="text-xl font-semibold text-zinc-950">Actions</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">Send this agreement for provider review using the API when ready. If the project is not in a sendable state, the API will return an error.</p>
                  <div className="mt-5 space-y-3">
                    <Button fullWidth size="lg" className="h-12 rounded-xl" disabled={sendMutation.isPending} onClick={async () => {
                      try {
                        await sendMutation.mutateAsync();
                        window.location.href = `/app/owner/projects/new/sent?projectId=${encodeURIComponent(project.id)}`;
                      } catch {
                        // keep on page; error can be surfaced by global handling or retried
                        window.location.href = `/app/owner/projects/${project.id}`;
                      }
                    }}>{sendMutation.isPending ? "Sending…" : "Send to provider"}</Button>
                    <Link href={`/app/owner/projects/${project.id}`} className="block text-center text-sm font-semibold text-zinc-700 hover:text-zinc-950">View project</Link>
                    <Link href="/app/owner/projects/new" className="block text-center text-sm font-semibold text-zinc-700 hover:text-zinc-950">Back to create</Link>
                  </div>
                  <div className="mt-4 rounded-xl bg-[#F8FAFA] p-3 text-xs leading-5 text-zinc-600">Owner: {shortAddr(project.owner_wallet)} · Provider: {shortAddr(project.provider_wallet)} · Status: {(project.agreement_status || "—").replace(/_/g, " ")}</div>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function AgreementPreviewPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><PreviewContent /></Suspense>;
}