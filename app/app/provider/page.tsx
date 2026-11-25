"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AppHeader, DashboardStatCard } from "@/components/layout/app";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/wallet/useWallet";
import { useDashboardSummaryQuery } from "@/lib/api/hooks/useDashboard";
import { useProjectsQuery } from "@/lib/api/hooks/useProjects";
import { useDisputesQuery } from "@/lib/api/hooks/useDisputes";
import type { Dispute, Milestone, Project } from "@/lib/api/types";

const providerNav = [
  { label: "Projects", href: "/app/provider" },
  { label: "Transactions", href: "/app/provider/transactions" },
];

type TabKey = "All" | "Sign now" | "Active" | "Completed" | "Cancelled";

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

function shortAddr(a?: string | null) {
  if (!a) return "—";
  if (a.length <= 12) return a;
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}
function fmtUsdc(amount?: string | number | null) {
  if (amount == null || amount === "") return "0.00 USDC";
  const n = Number(amount);
  if (Number.isNaN(n)) return `${String(amount)} USDC`;
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}
function fmtDateShort(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
function timeLeftLabel(iso?: string | null) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const diffMs = t - Date.now();
  const abs = Math.abs(diffMs);
  const mins = Math.round(abs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (diffMs < 0) {
    if (days >= 1) return `${days} day${days === 1 ? "" : "s"} overdue`;
    if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"} overdue`;
    return `${Math.max(1, mins)} min overdue`;
  }
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"}${remHours ? ` ${remHours} min` : ""} left`;
  return `${Math.max(1, mins)} min left`;
}

function paidCount(milestones: Milestone[]) {
  return milestones.filter((m) => m.status === "PAID").length;
}
function isCompletedProject(p: Project) {
  const ms = p.milestones || [];
  return ms.length > 0 && ms.every((m) => m.status === "PAID" || m.status === "REFUNDED");
}
function projectTab(p: Project): Exclude<TabKey, "All"> {
  if (p.agreement_status === "CANCELLED") return "Cancelled";
  if (isCompletedProject(p)) return "Completed";
  if (p.is_mutually_approved || p.agreement_status === "APPROVED") return "Active";
  if (p.agreement_status === "AWAITING_APPROVAL") return "Sign now";
  return "Cancelled";
}

type NeedsActionItem = {
  id: string;
  badge: string;
  badgeTone: "teal" | "amber" | "red";
  secondary?: string;
  secondaryTone?: "amber" | "red";
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  ctaVariant: "primary" | "outline";
};

function badgeCls(tone: "teal" | "amber" | "red") {
  if (tone === "teal") return "bg-[#E7F5F3] text-[#0E5E5A]";
  if (tone === "amber") return "bg-[#FEF3E6] text-[#92400E]";
  return "bg-[#FDECEC] text-[#B42318]";
}

function ActionRow({ item }: { item: NeedsActionItem }) {
  const btnCls = item.ctaVariant === "primary"
    ? "bg-[#0E5E5A] text-white hover:bg-[#0B4E4B] border-transparent"
    : "bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50";
  return (
    <div className="flex flex-col gap-3 border-t border-zinc-100 py-4 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", badgeCls(item.badgeTone))}>{item.badge}</span>
          {item.secondary ? <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", badgeCls(item.secondaryTone || "amber"))}>{item.secondary}</span> : null}
        </div>
        <p className="mt-2 text-[15px] font-semibold leading-6 text-zinc-950">{item.title}</p>
        <p className="mt-0.5 text-sm text-zinc-600">{item.subtitle}</p>
      </div>
      <Link href={item.href} className={cn("inline-flex h-10 shrink-0 items-center justify-center rounded-xl border px-5 text-sm font-semibold transition-colors", btnCls)}>{item.cta}</Link>
    </div>
  );
}

function ProviderDashboardContent() {
  const { address } = useWallet();
  const { data: summary } = useDashboardSummaryQuery({ wallet: address ?? undefined }, { enabled: !!address });
  const { data: projectsData, isLoading } = useProjectsQuery({ wallet: address ?? undefined, role: "provider" }, { enabled: !!address });
  const { data: disputesData } = useDisputesQuery({ wallet: address ?? undefined }, { enabled: !!address });

  const [copied, setCopied] = useState<"address" | "message" | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("All");
  const [addUsdcOpen, setAddUsdcOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState("");
  const isDesktop = useIsDesktop(640);

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

  const inviteMessage = address ? `Hi, could we use PayMilestone for this project? Create the project and invite my wallet: ${address}` : "Connect your wallet to share your invite address.";
  const copy = async (type: "address" | "message") => {
    const text = type === "address" ? (address || "") : inviteMessage;
    if (!text) return;
    try { await navigator.clipboard?.writeText(text); } catch {}
    setCopied(type);
    setTimeout(() => setCopied((v) => (v === type ? null : v)), 1500);
  };

  const needsAction = useMemo<NeedsActionItem[]>(() => {
    const items: NeedsActionItem[] = [];

    disputes.filter((d) => d.status !== "RESOLVED").forEach((d) => {
      const project = projects.find((p) => p.id === d.project_id);
      const isCancelled = project?.agreement_status === "CANCELLED";
      const refundAmt = d.proposed_owner_refund || d.proposed_provider_amount;
      const isRefundLike = isCancelled || (!!refundAmt && Number(refundAmt) > 0 && d.status !== "OPEN");
      const title = isRefundLike
        ? `Owner cancelled and asked for ${fmtUsdc(refundAmt)} back`
        : (d.reason ? d.reason : "Dispute requires your response");
      items.push({
        id: `dispute-${d.id}`,
        badge: isRefundLike ? "Refund request" : "Dispute",
        badgeTone: "red",
        secondary: isRefundLike ? "Refund requested" : d.status.replace(/_/g, " ").toLowerCase(),
        secondaryTone: "red",
        title,
        subtitle: project?.title || d.milestone_title || `Project ${shortAddr(d.project_id)}`,
        cta: "Respond",
        href: `/app/provider/projects/${d.project_id}/refund-request?disputeId=${d.id}`,
        ctaVariant: "outline",
      });
    });

    projects.forEach((p) => {
      if (p.agreement_status === "AWAITING_APPROVAL" && p.provider_approved_version !== p.agreement_version) {
        items.push({
          id: `sign-${p.id}`,
          badge: "Agreement to review",
          badgeTone: "amber",
          secondary: "Sign now",
          secondaryTone: "amber",
          title: `Review and sign agreement version ${p.agreement_version}`,
          subtitle: p.title,
          cta: "Review",
          href: `/app/provider/projects/${p.id}/review`,
          ctaVariant: "primary",
        });
      }

      (p.milestones || []).forEach((m) => {
        if (m.status === "FUNDED") {
          items.push({
            id: `start-${m.id}`,
            badge: "Funded",
            badgeTone: "teal",
            secondary: "Ready to start",
            secondaryTone: "amber",
            title: `${m.title} funded · ${fmtUsdc(m.amount)} locked`,
            subtitle: p.title,
            cta: "Start work",
            href: `/app/provider/projects/${p.id}?state=active&milestone=${m.sequence_number}`,
            ctaVariant: "primary",
          });
        }
        if (m.status === "REVISION_REQUESTED") {
          items.push({
            id: `revision-${m.id}`,
            badge: "Revision requested",
            badgeTone: "red",
            secondary: "Needs revision",
            secondaryTone: "red",
            title: "Owner requested changes to your submission",
            subtitle: `${p.title} · ${m.title}`,
            cta: "View comments",
            href: `/app/provider/projects/${p.id}/milestones/${m.sequence_number}/resubmit`,
            ctaVariant: "outline",
          });
        }
      });
    });

    const seen = new Set<string>();
    return items.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true))).slice(0, 12);
  }, [projects, disputes]);

  const categorized = useMemo(() => projects.map((p) => ({ project: p, tab: projectTab(p) }))
    .sort((a, b) => String(b.project.updated_at || "").localeCompare(String(a.project.updated_at || ""))), [projects]);

  const tabs = useMemo(() => {
    const counts: Record<TabKey, number> = { All: categorized.length, "Sign now": 0, Active: 0, Completed: 0, Cancelled: 0 };
    categorized.forEach(({ tab }) => { counts[tab] = (counts[tab] || 0) + 1; });
    return (["All", "Sign now", "Active", "Completed", "Cancelled"] as TabKey[]).map((label) => ({ label, count: counts[label] || 0 }));
  }, [categorized]);

  const filtered = useMemo(() => categorized.filter(({ project: p, tab }) => {
    if (activeTab !== "All" && tab !== activeTab) return false;
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return p.title.toLowerCase().includes(q) || (p.owner_wallet || "").toLowerCase().includes(q) || shortAddr(p.owner_wallet).toLowerCase().includes(q);
  }), [categorized, activeTab, search]);

  const signNowCount = categorized.filter((c) => c.tab === "Sign now").length;
  const activeCount = categorized.filter((c) => c.tab === "Active").length;
  const fundedMilestonesAmount = useMemo(() => {
    if (summary?.total_funded_amount != null) return fmtUsdc(summary.total_funded_amount);
    const escrowTotal = projects.reduce((acc, p) => acc + (Number(p.remaining_escrow_balance || 0) || 0), 0);
    if (escrowTotal > 0) return fmtUsdc(escrowTotal);
    return fmtUsdc(projects.reduce((a, p) => a + (Number(p.total_funded || 0) || 0), 0));
  }, [projects, summary]);
  const completedAmount = useMemo(() => {
    if (summary?.total_paid_amount != null) return fmtUsdc(summary.total_paid_amount);
    return fmtUsdc(projects.reduce((acc, p) => acc + (Number(p.total_released || 0) || 0), 0));
  }, [projects, summary]);
  function renderProjectCard(p: Project, tab: Exclude<TabKey, "All">) {
    const milestones = p.milestones || [];
    const paid = paidCount(milestones);
    const paidAmt = Number(p.total_released || 0);
    const escrow = Number(p.remaining_escrow_balance || 0);
    const nextMs = milestones
      .filter((m) => !["PAID", "REFUNDED"].includes(m.status))
      .sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0))[0];
    const statusTone = tab === "Active"
      ? "bg-[#EAF7F1] text-[#059669]"
      : tab === "Sign now"
      ? "bg-[#FEF3E6] text-[#B45309]"
      : tab === "Completed"
      ? "bg-zinc-100 text-zinc-600"
      : "bg-[#FDECEC] text-[#B42318]";

    if (tab === "Sign now") {
      return (
        <article key={p.id} className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-zinc-950">{p.title}</h3>
                <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", statusTone)}>Sign now</span>
              </div>
              <p className="mt-1 text-sm text-zinc-600">Owner: {shortAddr(p.owner_wallet)}</p>
              <p className="mt-1 text-sm text-zinc-700">{paid} of {milestones.length} milestones paid</p>
              <p className="mt-1 text-sm text-zinc-600">Nothing funded yet</p>
              <p className="mt-2 text-sm font-medium text-[#245A9C]">Review and sign the agreement</p>
            </div>
            <div className="shrink-0">
              <Link href={`/app/provider/projects/${p.id}/review`} className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0E5E5A] px-5 text-sm font-semibold text-white hover:bg-[#0B4E4B]">Review agreement</Link>
            </div>
          </div>
        </article>
      );
    }

    if (tab === "Active") {
      const escrowLabel = fmtUsdc(escrow > 0 ? escrow : (p.remaining_escrow_balance || 0));
      let nextLine = "No upcoming milestones";
      let nextTone = "text-zinc-800";
      if (nextMs) {
        const tl = timeLeftLabel(nextMs.deadline);
        const prefix = nextMs.status === "FUNDED" ? `Next M${nextMs.sequence_number} not started` : (nextMs.status === "IN_PROGRESS" || nextMs.status === "SUBMITTED_FOR_REVIEW" || nextMs.status === "REVISION_REQUESTED" ? `Next M${nextMs.sequence_number}` : `Next M${nextMs.sequence_number}`);
        nextLine = tl ? `${prefix} · ${tl}` : `${prefix} · ${fmtDateShort(nextMs.deadline)}`;
        if (tl && (tl.includes("overdue") || (tl.includes("hour") && !tl.includes("day")) || (tl.startsWith("1 day") && !tl.includes("overdue")))) nextTone = "text-[#C2412D]";
      }
      return (
        <article key={p.id} className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-zinc-950">{p.title}</h3>
                <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", statusTone)}>Active</span>
              </div>
              <p className="mt-1 text-sm text-zinc-600">Owner: {shortAddr(p.owner_wallet)}</p>
              <p className="mt-1 text-sm text-zinc-700">{paid} of {milestones.length} milestones paid · {fmtUsdc(paidAmt)} paid · {escrowLabel} in escrow</p>
              <p className={cn("mt-1 text-sm font-medium", nextTone)}>{nextLine}</p>
            </div>
            <div className="shrink-0">
              <Link href={`/app/provider/projects/${p.id}?state=active`} className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0E5E5A] px-5 text-sm font-semibold text-white hover:bg-[#0B4E4B]">Open project</Link>
            </div>
          </div>
        </article>
      );
    }

    if (tab === "Completed") {
      return (
        <article key={p.id} className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-zinc-950">{p.title}</h3>
                <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", statusTone)}>Completed</span>
              </div>
              <p className="mt-1 text-sm text-zinc-600">Owner: {shortAddr(p.owner_wallet)}</p>
              <p className="mt-1 text-sm text-zinc-700">{paid} of {milestones.length} milestones paid</p>
              <p className="mt-1 text-sm text-zinc-700">{fmtUsdc(paidAmt).replace(" USDC", "")} paid</p>
              <p className="mt-1 text-sm font-medium text-zinc-800">Next Done {fmtDateShort(p.end_date || p.updated_at)}</p>
            </div>
            <div className="shrink-0">
              <Link href={`/app/provider/projects/${p.id}`} className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0E5E5A] px-5 text-sm font-semibold text-white hover:bg-[#0B4E4B]">Open project</Link>
            </div>
          </div>
        </article>
      );
    }

    // Cancelled
    const hasRefundDispute = disputes.some((d) => d.project_id === p.id && d.status !== "RESOLVED");
    const escrowLabel = fmtUsdc(escrow > 0 ? escrow : (p.remaining_escrow_balance || 0));
    return (
      <article key={p.id} className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-zinc-950">{p.title}</h3>
              <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", statusTone)}>Cancelled</span>
            </div>
            <p className="mt-1 text-sm text-zinc-600">Owner: {shortAddr(p.owner_wallet)}</p>
            <p className="mt-1 text-sm text-zinc-700">{paid} of {(milestones.length || 1)} milestones paid</p>
            {Number(escrowLabel.replace(/[^0-9.]/g, "")) > 0 ? <p className="mt-1 text-sm text-zinc-700">{escrowLabel} in escrow</p> : null}
            <p className="mt-1 text-sm font-medium text-zinc-900">{hasRefundDispute ? "Refund requested - your signature" : "Project cancelled"}</p>
          </div>
          <div className="shrink-0">
            <Link href={hasRefundDispute ? `/app/provider/projects/${p.id}/refund-request` : `/app/provider/projects/${p.id}`} className={cn("inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-semibold", hasRefundDispute ? "bg-[#0E5E5A] text-white hover:bg-[#0B4E4B]" : "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50")}>{hasRefundDispute ? "Respond" : "Open project"}</Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={providerNav} activeHref="/app/provider" />

      <main className="mx-auto w-full max-w-[1320px] overflow-x-hidden px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <div>
          <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Your projects</h1>
          {!address ? <p className="mt-2 max-w-3xl text-base text-zinc-600">Connect your wallet to load projects, invites, and actions from the API.</p> : null}
        </div>

        {!address ? (
          <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center">
            <h2 className="text-2xl font-semibold text-zinc-950">Connect your wallet</h2>
            <p className="mt-2 text-sm text-zinc-600">Provider projects and dashboard data are loaded for the connected wallet.</p>
          </div>
        ) : (
          <>
            <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="Dashboard summary">
              <DashboardStatCard label="Active projects" value={String(summary?.active_projects ?? activeCount)} icon={<FolderIcon />} iconClassName="bg-[#E8F3F1]" />
              <DashboardStatCard label="Sign now" value={String(summary?.pending_approvals ?? signNowCount)} subtitle="Agreement to review" icon={<ClockIcon />} iconClassName="bg-[#FEF3E6]" />
              <DashboardStatCard label="Funded milestones" value={fundedMilestonesAmount} icon={<WalletCardIcon />} iconClassName="bg-[#EDF4F7]" />
              <DashboardStatCard label="Completed" value={completedAmount} icon={<CheckIcon />} iconClassName="bg-[#E9F8F1]" />
            </section>

            {!isLoading && projects.length === 0 ? (
              <section className="mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold text-zinc-950">Get invited by your client</h2>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">Your projects appear here once a client invites you. Share your connected wallet address with them.</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">0 invites</span>
                  </div>
                  <div className="mt-5">
                    <p className="text-sm font-medium text-zinc-700">Your wallet address</p>
                    <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-[#F8FAFA] px-4 py-3">
                      <span className="min-w-0 truncate font-mono text-sm text-zinc-800" title={address || ""}>{shortAddr(address)}</span>
                      <button type="button" onClick={() => copy("address")} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700" aria-label="Copy address"><span className="text-base leading-none">⧉</span></button>
                    </div>
                  </div>
                  <div className="mt-5">
                    <p className="text-sm font-medium text-zinc-700">Or send them this message</p>
                    <div className="mt-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 text-zinc-700 break-words">{inviteMessage}</div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button variant="outline" className="h-11 rounded-xl" onClick={() => copy("address")}>{copied === "address" ? "Address copied" : "Copy address"}</Button>
                    <Button className="h-11 rounded-xl" onClick={() => copy("message")}>{copied === "message" ? "Message copied" : "Copy message"}</Button>
                  </div>
                </div>
                <aside className="min-w-0 space-y-4">
                  <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
                    <h2 className="text-lg font-semibold text-zinc-950">While you wait</h2>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">Your connected wallet address is used for invites, agreements, and payouts. Projects will appear here once loaded from the API.</p>
                  </section>
                </aside>
              </section>
            ) : (
              <section className="mt-6 space-y-6">
                {needsAction.length > 0 ? (
                  <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <h2 className="text-xl font-semibold text-zinc-950">Needs your action</h2>
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-zinc-100 px-2 text-xs font-semibold text-zinc-700">{needsAction.length}</span>
                    </div>
                    <div>
                      {needsAction.map((item) => <ActionRow key={item.id} item={item} />)}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full max-w-md">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true"><circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="M13.25 13.25L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
                      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by project or owner wallet" className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-primary focus:ring-4 focus:ring-primary/10" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tabs.map((t) => {
                        const active = activeTab === t.label;
                        return (
                          <button key={t.label} type="button" onClick={() => setActiveTab(t.label)} className={cn("inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors", active ? "bg-[#F3F4F6] text-zinc-900 border border-zinc-200" : "text-zinc-600 hover:bg-zinc-50 border border-transparent")}>
                            <span>{t.label}</span>
                            <span className={cn("inline-flex min-w-[20px] items-center justify-center rounded-md px-1.5 py-0.5 text-xs", active ? "bg-white text-zinc-700" : "bg-zinc-100 text-zinc-600")}>{t.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {isLoading ? <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-600">Loading projects…</div> : filtered.length ? filtered.map(({ project: p, tab }) => renderProjectCard(p, tab)) : <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-600">No projects match this view.</div>}
                  </div>
                  <p className="mt-4 text-sm text-zinc-600">Showing {filtered.length} of {categorized.length} projects</p>
                </div>
              </section>
            )}
          </>
        )}

        {addUsdcOpen ? (
          isDesktop ? (
            <Modal open={addUsdcOpen} onClose={() => setAddUsdcOpen(false)} size="md" showCloseButton={false}>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950">Add USDC to your wallet</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">This action depends on wallet/network support and is not available from the current API. Connect a wallet that can hold USDC to receive payments.</p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="outline" className="h-11 rounded-xl" onClick={() => setAddUsdcOpen(false)}>Close</Button></div>
            </Modal>
          ) : (
            <BottomSheet open={addUsdcOpen} onClose={() => setAddUsdcOpen(false)} showCloseButton={false} showHandle>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950">Add USDC to your wallet</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">This action depends on wallet/network support and is not available from the current API. Connect a wallet that can hold USDC to receive payments.</p>
              <div className="mt-6 flex flex-col-reverse gap-3"><Button variant="outline" className="h-11 rounded-xl" onClick={() => setAddUsdcOpen(false)}>Close</Button></div>
            </BottomSheet>
          )
        ) : null}

        {emailOpen ? (
          isDesktop ? (
            <Modal open={emailOpen} onClose={() => setEmailOpen(false)} size="md" showCloseButton={false}>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950">Get updates by email? <span className="font-medium text-zinc-500">(optional)</span></h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">Email preferences are stored locally on this device for now.</p>
              <div className="mt-5"><Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" hint="Change or remove it any time in Settings." /></div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="outline" className="h-11 rounded-xl" onClick={() => setEmailOpen(false)}>Skip for now</Button><Button className="h-11 rounded-xl" onClick={() => setEmailOpen(false)}>Save email</Button></div>
            </Modal>
          ) : (
            <BottomSheet open={emailOpen} onClose={() => setEmailOpen(false)} showCloseButton={false} showHandle>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950">Get updates by email? <span className="font-medium text-zinc-500">(optional)</span></h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">Email preferences are stored locally on this device for now.</p>
              <div className="mt-5"><Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" hint="Change or remove it any time in Settings." /></div>
              <div className="mt-6 flex flex-col-reverse gap-3"><Button variant="outline" className="h-11 rounded-xl" onClick={() => setEmailOpen(false)}>Skip for now</Button><Button className="h-11 rounded-xl" onClick={() => setEmailOpen(false)}>Save email</Button></div>
            </BottomSheet>
          )
        ) : null}
      </main>
    </div>
  );
}

export default function ProviderDashboardPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><ProviderDashboardContent /></Suspense>;
}