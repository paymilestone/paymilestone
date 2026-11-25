"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/app";
import { cn } from "@/lib/utils";
import { useProjectsQuery } from "@/lib/api/hooks/useProjects";
import { useWallet } from "@/lib/wallet/useWallet";
import type { Project } from "@/lib/api/types";

const ownerNav = [
  { label: "Dashboard", href: "/app/owner" },
  { label: "Projects", href: "/app/owner/projects" },
  { label: "Transactions", href: "/app/owner/transactions" },
];

type ProjectStatus = "Draft" | "Active" | "With provider" | "Sign now" | "Disputed" | "Completed";

type ProjectItem = {
  id: string;
  name: string;
  dateCreated: string;
  provider: string;
  status: ProjectStatus;
  progress: string;
  escrow: string;
  nextDeadline: string;
  action: "Continue" | "View";
};

function shortAddr(addr?: string | null) {
  if (!addr) return "—";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function deriveStatus(p: Project): ProjectStatus {
  const milestones = p.milestones ?? [];
  if (milestones.some((m) => m.status === "DISPUTED")) return "Disputed";
  if (p.is_mutually_approved || p.agreement_status === "APPROVED") {
    const allPaid = milestones.length > 0 && milestones.every((m) => m.status === "PAID" || m.status === "REFUNDED");
    return allPaid ? "Completed" : "Active";
  }
  if (p.agreement_status === "AWAITING_APPROVAL") {
    if (p.owner_approved_version === p.agreement_version && p.provider_approved_version !== p.agreement_version) return "With provider";
    if (p.provider_approved_version === p.agreement_version && p.owner_approved_version !== p.agreement_version) return "Sign now";
    return "With provider";
  }
  return "Draft";
}

function toItem(p: Project): ProjectItem {
  const milestones = p.milestones ?? [];
  const paid = milestones.filter((m) => m.status === "PAID").length;
  const status = deriveStatus(p);
  const escrowNum = Number(p.remaining_escrow_balance || 0);
  const disputedEscrow = milestones.some((m) => m.status === "DISPUTED") && escrowNum > 0;
  const nextDeadlineMs = milestones
    .filter((m) => !["PAID", "REFUNDED"].includes(m.status))
    .map((m) => m.deadline)
    .filter(Boolean)
    .sort()[0];
  return {
    id: p.id,
    name: p.title,
    dateCreated: fmtDate(p.created_at),
    provider: p.provider_wallet ? shortAddr(p.provider_wallet) : "Not invited yet",
    status,
    progress: milestones.length ? `${paid} of ${milestones.length} paid` : "—",
    escrow: disputedEscrow ? `${p.remaining_escrow_balance} (disputed)` : (escrowNum > 0 ? p.remaining_escrow_balance : "0.00"),
    nextDeadline: nextDeadlineMs ? fmtDate(nextDeadlineMs) : (status === "Completed" ? "Done" : "—"),
    action: status === "Draft" ? "Continue" : "View",
  };
}

function projectHref(row: ProjectItem) {
  return `/app/owner/projects/${row.id}`;
}

function StatusPill({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    Draft: "bg-zinc-100 text-zinc-600",
    Active: "bg-[#DCEEEB] text-[#0E5E5A]",
    "With provider": "bg-[#E1EAFA] text-[#2D64C8]",
    "Sign now": "bg-[#FEF3E6] text-[#B45309]",
    Disputed: "bg-[#FDECEC] text-[#C2412D]",
    Completed: "bg-[#E9F8F1] text-[#059669]",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold leading-none", styles[status])}>
      {status}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-zinc-400" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.25 13.25L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function OwnerProjectsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | ProjectStatus>("All");
  const { address } = useWallet();
  const { data, isLoading } = useProjectsQuery(address ? { wallet: address, role: "owner" } : undefined, { enabled: !!address });

  const projects = useMemo(() => (data ?? []).map(toItem), [data]);
  const draftCount = projects.filter((p) => p.status === "Draft").length;

  const counts = useMemo(() => {
    const base: Record<string, number> = { All: projects.length, Draft: 0, Active: 0, "With provider": 0, "Sign now": 0, Disputed: 0, Completed: 0 };
    projects.forEach((p) => { base[p.status] = (base[p.status] || 0) + 1; });
    return base;
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter !== "All" && p.status !== filter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.provider.toLowerCase().includes(q);
    });
  }, [projects, query, filter]);

  const desktopFilters: { label: string; value: "All" | ProjectStatus }[] = [
    { label: `All ${counts.All}`, value: "All" },
    { label: `Drafts ${counts.Draft}`, value: "Draft" },
    { label: `Sign now ${counts["Sign now"]}`, value: "Sign now" },
    { label: `With provider ${counts["With provider"]}`, value: "With provider" },
    { label: `Active ${counts.Active}`, value: "Active" },
    { label: `Disputed ${counts.Disputed}`, value: "Disputed" },
    { label: `Completed ${counts.Completed}`, value: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={ownerNav} activeHref="/app/owner/projects" />

      <main className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Projects</h1>
          <Link
            href="/app/owner/projects/new"
            className="hidden h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#0b4c49] md:inline-flex"
          >
            <span aria-hidden="true">+</span> New project
          </Link>
          <Link
            href="/app/owner/projects/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#0b4c49] md:hidden"
          >
            <span aria-hidden="true">+</span> New project
          </Link>
        </div>

        <section className="mt-6 rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]" aria-label="All projects">
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-zinc-950 sm:text-xl">All projects</h2>
              <p className="text-sm text-zinc-500">
                {!address ? "Connect your wallet to view projects" : isLoading ? "Loading projects..." : `${projects.length} projects · ${draftCount} drafts`}
              </p>
            </div>

            {!address ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-12 text-center">
                <h3 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950">Connect your wallet</h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base">Connect your Stellar wallet to load your projects from the API.</p>
              </div>
            ) : !isLoading && projects.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center px-4 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DCEEEB] text-[#0E5E5A]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
                    <path d="M8 8.5h8M8 12h8M8 15.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    <path d="M16 15.5l1.8 1.8 1.8-1.8M17.8 17.3v-3.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-zinc-950">No projects yet</h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base">
                  Projects you create show up here, with their status, escrow and next deadline. Start one and invite the provider you already work with.
                </p>
                <Link href="/app/owner/projects/new" className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#0b4c49]">
                  <span aria-hidden="true">+</span> Create your first project
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <label className="relative block w-full max-w-xl">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center"><SearchIcon /></span>
                    <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by project or provider wallet" className="h-11 w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
                  </label>
                  <div className="hidden flex-wrap items-center gap-2 lg:flex">
                    {desktopFilters.map((f) => {
                      const active = filter === f.value;
                      return (
                        <button key={f.label} type="button" onClick={() => setFilter(f.value)} className={cn("inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors", active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100")}>{f.label}</button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-b border-zinc-200 lg:hidden">
                  {desktopFilters.slice(0, 5).map((t) => (
                    <button key={t.value} type="button" onClick={() => setFilter(t.value)} className={cn("relative pb-3 text-sm font-medium", filter === t.value ? "text-[#0E5E5A]" : "text-zinc-500")}>
                      {t.label}
                      {filter === t.value ? <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#0E5E5A]" /> : null}
                    </button>
                  ))}
                </div>

                <div className="mt-2 hidden overflow-x-auto lg:block">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-zinc-500">
                      <tr className="border-b border-zinc-200">
                        <th className="px-4 py-3 font-medium">Project</th>
                        <th className="px-4 py-3 font-medium">Date created</th>
                        <th className="px-4 py-3 font-medium">Provider</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Progress</th>
                        <th className="px-4 py-3 font-medium">Escrow held</th>
                        <th className="px-4 py-3 font-medium">Next deadline</th>
                        <th className="px-4 py-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {isLoading ? (
                        <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-500">Loading projects...</td></tr>
                      ) : filtered.length === 0 ? (
                        <tr><td colSpan={8} className="px-4 py-10 text-center text-zinc-500">No projects match your filters.</td></tr>
                      ) : filtered.map((row) => (
                        <tr key={row.id} className="hover:bg-zinc-50/60">
                          <td className="px-4 py-4 font-semibold text-zinc-950">{row.name}</td>
                          <td className="px-4 py-4 text-zinc-600">{row.dateCreated}</td>
                          <td className={cn("px-4 py-4", row.provider === "Not invited yet" ? "text-zinc-500" : "font-mono text-xs text-zinc-700")}>{row.provider}</td>
                          <td className="px-4 py-4"><StatusPill status={row.status} /></td>
                          <td className="px-4 py-4 text-zinc-700">{row.progress}</td>
                          <td className="px-4 py-4 text-zinc-700">{row.escrow}</td>
                          <td className={cn("px-4 py-4", row.nextDeadline === "Overdue" ? "font-medium text-[#C2412D]" : "text-zinc-600")}>{row.nextDeadline}</td>
                          <td className="px-4 py-4 text-right">
                            <Link href={projectHref(row)} className={cn("inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors", row.action === "Continue" ? "bg-primary text-white hover:bg-[#0b4c49]" : "text-zinc-700 hover:text-zinc-950")}>
                              {row.action}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-4 text-sm text-zinc-500">Showing {filtered.length} of {projects.length} projects</div>
                </div>

                <div className="mt-4 space-y-3 lg:hidden">
                  {isLoading ? <div className="py-10 text-center text-sm text-zinc-500">Loading projects...</div> : filtered.length === 0 ? <div className="py-10 text-center text-sm text-zinc-500">No projects match your filters.</div> : filtered.map((row) => (
                    <div key={row.id} className="rounded-xl border border-zinc-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <StatusPill status={row.status} />
                        <span className="text-xs font-medium text-zinc-500">{row.nextDeadline !== "—" ? row.nextDeadline : ""}</span>
                      </div>
                      <p className="mt-2 text-base font-semibold text-zinc-950">{row.name}</p>
                      <p className="mt-0.5 text-sm text-zinc-500">Created {row.dateCreated}</p>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div className="text-sm text-zinc-600"><p>{row.progress}</p></div>
                        <div className="text-right">
                          {row.escrow !== "—" && row.escrow !== "0.00" ? <p className="text-sm font-semibold text-zinc-900">{row.escrow}</p> : null}
                          <Link href={projectHref(row)} className={cn("mt-1 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors", row.action === "Continue" ? "bg-primary text-white hover:bg-[#0b4c49]" : "border border-zinc-300 text-zinc-800 hover:bg-zinc-50")}>
                            {row.action}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-zinc-100 pt-4 text-sm text-zinc-600">Showing {filtered.length} of {projects.length} projects</div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
