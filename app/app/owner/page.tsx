"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader, DashboardStatCard } from "@/components/layout/app";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/wallet/useWallet";
import { useDashboardSummaryQuery } from "@/lib/api/hooks/useDashboard";
import { useProjectsQuery } from "@/lib/api/hooks/useProjects";
import { useDisputesQuery } from "@/lib/api/hooks/useDisputes";
import type { Dispute, Project } from "@/lib/api/types";

const ownerNav = [
  { label: "Dashboard", href: "/app/owner" },
  { label: "Projects", href: "/app/owner/projects" },
  { label: "Transactions", href: "/app/owner/transactions" },
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

function ResponsiveDialog({ open, onClose, children, size = "sm" }: { open: boolean; onClose: () => void; children: React.ReactNode; size?: "sm" | "md" }) {
  const isDesktop = useIsDesktop();
  if (isDesktop) return <Modal open={open} onClose={onClose} size={size} showCloseButton={false}>{children}</Modal>;
  return <BottomSheet open={open} onClose={onClose} showCloseButton={false} showHandle>{children}</BottomSheet>;
}

function FolderIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#2B7A78]" aria-hidden="true"><path d="M3.75 7.5A2.25 2.25 0 016 5.25h3.38c.5 0 .97.2 1.32.55l.88.87c.21.22.5.33.8.33H18A2.25 2.25 0 0120.25 9.25v7.25A2.25 2.25 0 0118 18.75H6A2.25 2.25 0 013.75 16.5V7.5z" stroke="currentColor" strokeWidth="1.7" /></svg>);
}
function ClockIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#D97706]" aria-hidden="true"><circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7" /><path d="M12 7.75V12l2.75 1.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function WalletCardIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#4B7B8F]" aria-hidden="true"><rect x="4" y="6" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M4 10h16M15.5 14h1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>);
}
function CheckIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#059669]" aria-hidden="true"><circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7" /><path d="M8.5 12.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function CopyIcon({ className }: { className?: string }) {
  return (<svg viewBox="0 0 20 20" fill="none" className={cn("h-4 w-4", className)} aria-hidden="true"><rect x="7" y="7" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M13 7V5.5A1.5 1.5 0 0011.5 4h-6A1.5 1.5 0 004 5.5v8A1.5 1.5 0 005.5 15H7" stroke="currentColor" strokeWidth="1.4" /></svg>);
}
function SearchIcon() {
  return (<svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-zinc-400" aria-hidden="true"><circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" /><path d="M13.25 13.25L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>);
}

type WithProviderItem = { id: string; title: string; subtitle: string; href: string; copyText: string };
type ActionItem = { id: string; type: "dispute" | "review_submission" | "awaiting_funding" | "sign"; title: string; subtitle: string; cta: string; href: string };
type ProjectRow = { id: string; name: string; dateCreated: string; provider: string; agreement: "Approved" | "With provider" | "Draft" | "Disputed"; progress: string; escrow: string; nextDeadline: string; overdue?: boolean; action: "View" | "Continue"; href: string };

function shortAddr(a?: string | null) {
  if (!a) return "—";
  if (a.length <= 12) return a;
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}
function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
function fmtUsdc(amount?: string | number | null) {
  if (amount == null || amount === "") return "0.00 USDC";
  const n = Number(amount);
  if (Number.isNaN(n)) return `${amount} USDC`;
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} USDC`;
}

function deriveAgreement(p: Project): ProjectRow["agreement"] {
  if (p.milestones?.some((m) => m.status === "DISPUTED")) return "Disputed";
  if (p.is_mutually_approved || p.agreement_status === "APPROVED") return "Approved";
  if (p.agreement_status === "AWAITING_APPROVAL") return "With provider";
  return "Draft";
}

function AgreementPill({ status }: { status: ProjectRow["agreement"] }) {
  if (status === "Approved") return <Pill variant="success" size="sm" className="font-semibold">Approved</Pill>;
  if (status === "With provider") return <Pill variant="info" size="sm" className="font-semibold bg-[#E1EAFA] text-[#2D64C8]">With provider</Pill>;
  if (status === "Disputed") return <Pill variant="danger" size="sm" className="font-semibold">Disputed</Pill>;
  return <Pill variant="neutral" size="sm" className="font-semibold bg-zinc-100 text-zinc-600">Draft</Pill>;
}

function ActionTypePill({ type }: { type: ActionItem["type"] }) {
  if (type === "review_submission") return <span className="inline-flex rounded-md bg-[#FEF3E6] px-2 py-0.5 text-xs font-semibold text-[#B45309]">Review submission</span>;
  if (type === "awaiting_funding") return <span className="inline-flex rounded-md bg-[#EAF3F8] px-2 py-0.5 text-xs font-semibold text-[#245A9C]">Awaiting funding</span>;
  if (type === "sign") return <span className="inline-flex rounded-md bg-[#FEF3E6] px-2 py-0.5 text-xs font-semibold text-[#B45309]">Sign now</span>;
  return <span className="inline-flex rounded-md bg-[#FDECEC] px-2 py-0.5 text-xs font-semibold text-[#C2412D]">Dispute</span>;
}

function OwnerDashboardContent() {
  const searchParams = useSearchParams();
  const { address } = useWallet();
  const { data: summary } = useDashboardSummaryQuery({ wallet: address ?? undefined }, { enabled: !!address });
  const { data: projectsData, isLoading: projectsLoading } = useProjectsQuery({ wallet: address ?? undefined, role: "owner" }, { enabled: !!address });
  const { data: disputesData } = useDisputesQuery({ wallet: address ?? undefined }, { enabled: !!address });

  const [toast, setToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [emailPromptOpen, setEmailPromptOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = searchParams.get("draftSaved");
    if (saved) setToast(`Saved as draft. ${saved === "1" ? "Your project" : saved} is in your projects table.`);
    if (searchParams.get("emailPrompt") === "1") setEmailPromptOpen(true);
  }, [searchParams]);
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(null), 4000); return () => window.clearTimeout(t); }, [toast]);

  const projects = useMemo(() => {
    const data = projectsData as unknown;
    if (Array.isArray(data)) return data as Project[];
    if (data && Array.isArray((data as { results?: Project[] }).results)) return (data as { results: Project[] }).results;
    return [] as Project[];
  }, [projectsData]);
  const disputes = useMemo(() => {
    const data = disputesData as unknown;
    if (Array.isArray(data)) return data as Dispute[];
    if (data && Array.isArray((data as { results?: Dispute[] }).results)) return (data as { results: Dispute[] }).results;
    return [] as Dispute[];
  }, [disputesData]);
  const [profileName, setProfileName] = useState<string | undefined>(undefined);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("paymilestone.profile");
      const name = raw ? (JSON.parse(raw) as { name?: string }).name : undefined;
      setProfileName(name || undefined);
    } catch {
      setProfileName(undefined);
    }
  }, []);

  const withProviderItems = useMemo<WithProviderItem[]>(() => projects
    .filter((p) => p.agreement_status === "AWAITING_APPROVAL" && p.owner_approved_version === p.agreement_version && p.provider_approved_version !== p.agreement_version)
    .map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: `Sent to ${shortAddr(p.provider_wallet)}${p.updated_at ? ` · ${fmtDate(p.updated_at)}` : ""}`,
      href: `/app/owner/projects/${p.id}`,
      copyText: typeof window !== "undefined" ? `${window.location.origin}/invite/${p.invite_token}` : p.invite_token,
    })), [projects]);

  const needsActionItems = useMemo<ActionItem[]>(() => {
    const items: ActionItem[] = [];
    disputes.filter((d) => d.status !== "RESOLVED").forEach((d) => {
      items.push({ id: `dispute-${d.id}`, type: "dispute", title: `${d.milestone_title || "Milestone"} · dispute ${d.status.toLowerCase().replace("_"," ")}`, subtitle: `Project ${shortAddr(d.project_id)} · ${fmtUsdc(d.proposed_provider_amount || d.proposed_owner_refund)}`, cta: "Respond", href: `/app/owner/projects/${d.project_id}/disputes/${d.id}` });
    });
    projects.forEach((p) => {
      if (p.agreement_status === "AWAITING_APPROVAL" && p.provider_approved_version === p.agreement_version && p.owner_approved_version !== p.agreement_version) {
        items.push({ id: `sign-${p.id}`, type: "sign", title: `Agreement ready to sign · v${p.agreement_version}`, subtitle: p.title, cta: "Review", href: `/app/owner/projects/${p.id}` });
      }
      (p.milestones || []).forEach((m) => {
        if (m.status === "SUBMITTED_FOR_REVIEW") items.push({ id: `review-${m.id}`, type: "review_submission", title: `${m.title} · submitted for review`, subtitle: p.title, cta: "Review", href: `/app/owner/projects/${p.id}/milestones/${m.id}/review` });
        if (m.status === "PENDING_FUNDING") items.push({ id: `fund-${m.id}`, type: "awaiting_funding", title: `${m.title} · ${fmtUsdc(m.amount)}`, subtitle: p.title, cta: "Fund", href: `/app/owner/projects/${p.id}` });
      });
    });
    return items.slice(0, 12);
  }, [projects, disputes]);

  const projectRows = useMemo<ProjectRow[]>(() => projects.map((p) => {
    const agreement = deriveAgreement(p);
    const milestones = p.milestones || [];
    const paid = milestones.filter((m) => m.status === "PAID").length;
    const upcoming = milestones.filter((m) => !["PAID", "REFUNDED"].includes(m.status)).map((m) => m.deadline).filter(Boolean).sort()[0];
    const overdue = upcoming ? new Date(upcoming).getTime() < Date.now() && !["PAID", "REFUNDED"].includes(milestones.find((m) => m.deadline === upcoming)?.status || "") : false;
    const escrowNum = Number(p.remaining_escrow_balance || 0);
    const disputedEscrow = milestones.some((m) => m.status === "DISPUTED") && escrowNum > 0;
    return {
      id: p.id,
      name: p.title,
      dateCreated: fmtDate(p.created_at),
      provider: p.provider_wallet ? shortAddr(p.provider_wallet) : "Not invited yet",
      agreement,
      progress: milestones.length ? `${paid} of ${milestones.length} paid` : "—",
      escrow: disputedEscrow ? `${p.remaining_escrow_balance} (disputed)` : (escrowNum > 0 ? String(p.remaining_escrow_balance) : "0.00"),
      nextDeadline: upcoming ? (overdue ? "Overdue" : fmtDate(upcoming)) : (agreement === "Approved" ? "—" : "—"),
      overdue,
      action: agreement === "Draft" ? "Continue" : "View",
      href: agreement === "Draft" ? "/app/owner/projects/new" : `/app/owner/projects/${p.id}`,
    };
  }), [projects]);

  const filters = useMemo(() => {
    const base = { All: projectRows.length, Draft: 0, Approved: 0, "Sign now": needsActionItems.filter((i) => i.type === "sign" || i.type === "review_submission" || i.type === "awaiting_funding").length, "With provider": withProviderItems.length } as Record<string, number>;
    projectRows.forEach((r) => {
      if (r.agreement === "Draft") base.Draft++;
      if (r.agreement === "Approved" || r.agreement === "Disputed") base.Approved++;
    });
    return ["All", "Draft", "Approved", "Sign now", "With provider"].map((label) => ({ label, count: base[label] || 0 }));
  }, [projectRows, needsActionItems, withProviderItems]);

  const rows = useMemo(() => projectRows.filter((r) => {
    if (activeFilter === "Draft" && r.agreement !== "Draft") return false;
    if (activeFilter === "Approved" && !(r.agreement === "Approved" || r.agreement === "Disputed")) return false;
    if (activeFilter === "With provider" && r.agreement !== "With provider") return false;
    if (activeFilter === "Sign now") {
      const needs = needsActionItems.some((i) => i.href.includes(r.id) || i.subtitle === r.name);
      if (!needs) return false;
    }
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return r.name.toLowerCase().includes(q) || r.provider.toLowerCase().includes(q);
  }), [projectRows, activeFilter, search, needsActionItems]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const copyLink = async (id: string, text: string) => {
    try { await navigator.clipboard?.writeText(text); } catch {}
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((v) => (v === id ? null : v)), 1800);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={ownerNav} activeHref="/app/owner" />

      <main className="mx-auto w-full max-w-[1320px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Good morning{profileName ? `, ${profileName}` : ""}</h1>
            {toast ? <span className="inline-flex items-center rounded-lg bg-[#16A34A] px-3 py-2 text-sm font-medium text-white shadow-sm">{toast}</span> : null}
          </div>
          <Link href="/app/owner/projects/new" className="hidden h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#0b4c49] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 md:inline-flex"><span aria-hidden="true">+</span> New project</Link>
        </div>

        {!address ? (
          <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center">
            <h2 className="text-2xl font-semibold text-zinc-950">Connect your wallet</h2>
            <p className="mt-2 text-sm text-zinc-600">Connect your Stellar wallet to load dashboard data from the API.</p>
          </div>
        ) : (
          <>
            <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-8 lg:grid-cols-4" aria-label="Dashboard summary">
              <DashboardStatCard label="Active projects" value={String(summary?.active_projects ?? projects.filter((p) => p.agreement_status === "APPROVED" || p.is_mutually_approved).length)} icon={<FolderIcon />} iconClassName="bg-[#E8F3F1]" />
              <DashboardStatCard label="Sign now" value={String(summary?.pending_approvals ?? needsActionItems.filter((i) => i.type === "sign" || i.type === "review_submission").length)} icon={<ClockIcon />} iconClassName="bg-[#FEF3E6]" />
              <DashboardStatCard label="Total funded milestones" value={String(summary?.total_funded_milestones ?? projects.reduce((acc, p) => acc + (p.milestones||[]).filter((m)=>!["PENDING_FUNDING"].includes(m.status)).length, 0))} icon={<WalletCardIcon />} iconClassName="bg-[#EDF4F7]" />
              <DashboardStatCard label="Completed payments" value={summary ? fmtUsdc(summary.total_paid_amount) : fmtUsdc(projects.reduce((acc,p)=>acc+Number(p.total_released||0),0))} icon={<CheckIcon />} iconClassName="bg-[#E9F8F1]" />
            </section>

            <section className="mt-5 grid gap-4 lg:grid-cols-2" aria-label="Attention">
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-950">With provider</h2>
                    <p className="mt-1 text-sm text-zinc-600">Agreements you sent that your provider hasn&apos;t signed yet.</p>
                  </div>
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-zinc-100 px-2 text-xs font-semibold text-zinc-700">{withProviderItems.length}</span>
                </div>
                <div className="mt-5 space-y-4">
                  {withProviderItems.length === 0 ? <p className="text-sm text-zinc-600">Nothing with your provider right now.</p> : withProviderItems.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2"><span className="inline-flex rounded-md bg-[#E1EAFA] px-2 py-0.5 text-[11px] font-semibold text-[#2D64C8]">With provider</span></div>
                        <Link href={item.href} className="mt-1.5 block text-[15px] font-semibold text-zinc-950 hover:underline">{item.title}</Link>
                        <p className="mt-0.5 text-sm text-zinc-500">{item.subtitle}</p>
                      </div>
                      <button type="button" onClick={() => copyLink(item.id, item.copyText)} className="mt-1 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-zinc-700 hover:text-zinc-950"><CopyIcon /><span className="hidden sm:inline">{copiedId === item.id ? "Copied" : "Copy link"}</span></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-950">Needs your action</h2>
                    <p className="mt-1 text-sm text-zinc-600">Sign, fund, review, or decide on a dispute.</p>
                  </div>
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-zinc-100 px-2 text-xs font-semibold text-zinc-700">{needsActionItems.length}</span>
                </div>
                <div className="mt-5 space-y-4">
                  {needsActionItems.length === 0 ? <p className="text-sm text-zinc-600">Nothing needs your attention.</p> : needsActionItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="min-w-0">
                        <ActionTypePill type={item.type} />
                        <p className="mt-1.5 text-[15px] font-semibold text-zinc-950">{item.title}</p>
                        <p className="mt-0.5 text-sm text-zinc-500">{item.subtitle}</p>
                      </div>
                      <Link href={item.href} className="inline-flex h-9 items-center justify-center rounded-lg bg-[#0E5E5A] px-4 text-sm font-semibold text-white hover:bg-[#0B4A47]">{item.cta}</Link>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-5 rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]" aria-label="Projects">
              <div className="border-b border-zinc-200 p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <h2 className="text-xl font-semibold text-zinc-950">Projects</h2>
                  <label className="relative block w-full max-w-md">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center"><SearchIcon /></span>
                    <input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search projects or wallets" className="h-10 w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-b border-transparent">
                  {filters.map((f) => (
                    <button key={f.label} type="button" onClick={() => { setActiveFilter(f.label); setPage(1); }} className={cn("relative pb-3 text-sm font-medium transition-colors", activeFilter === f.label ? "text-[#0E5E5A]" : "text-zinc-500 hover:text-zinc-800")}>
                      {f.label} <span className={cn("ml-0.5", activeFilter === f.label ? "text-[#0E5E5A]" : "text-zinc-400")}>{f.count}</span>
                      {activeFilter === f.label ? <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#0E5E5A]" /> : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-sm">
                  <thead className="bg-white text-left text-zinc-500">
                    <tr className="border-b border-zinc-200">
                      <th className="px-5 py-3 font-medium">Project</th>
                      <th className="px-5 py-3 font-medium">Date created</th>
                      <th className="px-5 py-3 font-medium">Provider</th>
                      <th className="px-5 py-3 font-medium">Agreement</th>
                      <th className="px-5 py-3 font-medium">Progress</th>
                      <th className="px-5 py-3 font-medium">Escrow held</th>
                      <th className="px-5 py-3 font-medium">Next deadline</th>
                      <th className="px-5 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {projectsLoading ? <tr><td colSpan={8} className="px-5 py-10 text-center text-zinc-500">Loading projects…</td></tr> : pagedRows.length === 0 ? <tr><td colSpan={8} className="px-5 py-10 text-center text-zinc-500">No projects found.</td></tr> : pagedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-zinc-50/60">
                        <td className="px-5 py-4 font-semibold text-zinc-950">{row.name}</td>
                        <td className="px-5 py-4 text-zinc-600">{row.dateCreated}</td>
                        <td className={cn("px-5 py-4", row.provider === "Not invited yet" ? "text-zinc-400" : "font-mono text-xs text-zinc-700")}>{row.provider}</td>
                        <td className="px-5 py-4"><AgreementPill status={row.agreement} /></td>
                        <td className="px-5 py-4 text-zinc-700">{row.progress}</td>
                        <td className="px-5 py-4 text-zinc-700">{row.escrow}</td>
                        <td className={cn("px-5 py-4", row.overdue ? "font-semibold text-[#C2412D]" : "text-zinc-600")}>{row.nextDeadline}</td>
                        <td className="px-5 py-4 text-right">
                          <Link href={row.href} className={cn("inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors", row.action === "Continue" ? "bg-primary text-white hover:bg-[#0b4c49]" : "text-zinc-700 hover:text-zinc-950")}>{row.action}</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {projectsLoading ? <div className="py-8 text-center text-sm text-zinc-500">Loading projects…</div> : pagedRows.length === 0 ? <div className="py-8 text-center text-sm text-zinc-500">No projects found.</div> : pagedRows.map((row) => (
                  <div key={row.id} className="rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-start justify-between gap-3"><AgreementPill status={row.agreement} /><span className="text-xs text-zinc-500">{row.dateCreated}</span></div>
                    <p className="mt-2 text-base font-semibold text-zinc-950">{row.name}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">{row.provider}</p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-zinc-600">{row.progress}</span>
                      <Link href={row.href} className={cn("inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold", row.action === "Continue" ? "bg-primary text-white hover:bg-[#0b4c49]" : "border border-zinc-300 text-zinc-800 hover:bg-zinc-50")}>{row.action}</Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 px-4 py-4 text-sm text-zinc-600 sm:flex-row sm:px-5">
                <p>Showing {rows.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, rows.length)} of {rows.length} projects</p>
                <div className="flex items-center gap-2">
                  <button type="button" className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-300 px-3 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹ Previous</button>
                  <span className="text-sm text-zinc-600">{page} / {totalPages}</span>
                  <button type="button" className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-300 px-3 font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next ›</button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Link href="/app/owner/projects/new" className="fixed bottom-6 right-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0E5E5A] text-white shadow-lg shadow-[#0E5E5A]/25 transition-colors hover:bg-[#0B4A47] md:hidden" aria-label="New project">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </Link>

      <ResponsiveDialog open={emailPromptOpen} onClose={() => setEmailPromptOpen(false)} size="sm">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950">Get updates by email? <span className="text-zinc-500">(optional)</span></h2>
          <p className="mt-3 text-base leading-7 text-zinc-600">Get an email when work is submitted or a payment needs your signature. We only use it for notifications on your projects.</p>
          <div className="mt-5">
            <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} hint="You can change or remove this any time in Settings." />
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-[#F8FAFA] px-4 py-3 text-sm">
            <span className="text-zinc-600">Connected wallet</span>
            <span className="inline-flex items-center gap-2 font-semibold text-zinc-800"><span className="h-2 w-2 rounded-full bg-[#0E5E5A]" aria-hidden="true" />{shortAddr(address)}</span>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" className="h-11 rounded-xl sm:min-w-[130px]" onClick={() => setEmailPromptOpen(false)}>Skip for now</Button>
            <Button className="h-11 rounded-xl sm:min-w-[130px]" onClick={() => setEmailPromptOpen(false)}>Save email</Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}

export default function OwnerDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}>
      <OwnerDashboardContent />
    </Suspense>
  );
}