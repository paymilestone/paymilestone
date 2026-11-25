"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app/AppHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/wallet/useWallet";
import { useDashboardSummaryQuery } from "@/lib/api/hooks/useDashboard";
import { useProjectsQuery } from "@/lib/api/hooks/useProjects";
import type { Project } from "@/lib/api/types";

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

function formatUsdc(amount?: string | number | null) {
  if (amount == null || amount === "") return "—";
  const n = Number(amount);
  if (Number.isNaN(n)) return `${amount} USDC`;
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} USDC`;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-600">{label}</p>
        <p className="mt-2 break-words text-[28px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[30px]">{value}</p>
      </div>
      <span className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500">
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true"><rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 8h8M6 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </span>
    </div>
  );
}

function ToggleRow({ title, description, enabled, onChange, locked }: { title: string; description: string; enabled: boolean; onChange: (v: boolean) => void; locked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-base font-semibold text-zinc-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
      </div>
      <button type="button" role="switch" aria-checked={enabled} onClick={() => { if (!locked) onChange(!enabled); }} className={cn("relative mt-1 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors", enabled ? "bg-[#0E5E5A]" : "bg-zinc-300", locked && "cursor-not-allowed opacity-90")}>
        <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform", enabled ? "translate-x-6" : "translate-x-1")} />
      </button>
    </div>
  );
}

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

function OwnerProfileContent() {
  const searchParams = useSearchParams();
  const { address, disconnect } = useWallet();
  const { data: summary } = useDashboardSummaryQuery({ wallet: address ?? undefined }, { enabled: !!address });
  const { data: projectsData } = useProjectsQuery({ wallet: address ?? undefined, role: "owner" }, { enabled: !!address });

  const [editing, setEditing] = useState(searchParams.get("edit") === "1");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [savedName, setSavedName] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [toggles, setToggles] = useState({ agreement: true, work: true, funding: true, deadlines: false, disputes: true });
  const isDesktop = useIsDesktop(640);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("paymilestone.profile");
      if (!raw) return;
      const p = JSON.parse(raw) as { name?: string; email?: string };
      setDisplayName(p.name || "");
      setEmail(p.email || "");
      setSavedName(p.name || "");
      setSavedEmail(p.email || "");
    } catch {}
  }, []);

  const persistProfile = (name: string, mail: string) => {
    setSavedName(name);
    setSavedEmail(mail);
    try {
      const raw = localStorage.getItem("paymilestone.profile");
      const prev = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      localStorage.setItem("paymilestone.profile", JSON.stringify({ ...prev, name, email: mail }));
    } catch {}
  };

  const startEdit = () => { setDisplayName(savedName); setEmail(savedEmail); setEditing(true); };
  const cancelEdit = () => { setDisplayName(savedName); setEmail(savedEmail); setEditing(false); };
  const saveEdit = () => { persistProfile(displayName || savedName, email); setEditing(false); };

  const projects = (projectsData ?? []) as Project[];
  const recent = useMemo(() => projects.slice(0, 3).map((p) => {
    const paid = p.milestones.filter((m) => ["APPROVED_FOR_PAYMENT", "PAID"].includes(m.status)).length;
    const total = p.milestones.length;
    const disputed = p.milestones.some((m) => m.status === "DISPUTED");
    const tone = disputed ? "red" : p.agreement_status === "APPROVED" ? "green" : "blue";
    const status = disputed ? "Disputed" : p.agreement_status === "APPROVED" ? "Approved" : p.agreement_status === "AWAITING_APPROVAL" ? "With provider" : "Draft";
    return { id: p.id, name: p.title, meta: `${shortAddr(p.provider_wallet)} · ${paid} of ${total} paid`, status, tone };
  }), [projects]);

  const initials = (savedName || address || "U").split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const explorer = address ? `https://stellar.expert/explorer/public/account/${address}` : "https://stellar.expert/explorer/public";

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={ownerNav} activeHref="/app/owner" />
      <main className="mx-auto w-full max-w-[1320px] overflow-x-hidden px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EAF3F1] text-xl font-semibold text-[#0E5E5A]">{initials}</span>
            <div className="min-w-0">
              <h1 className="break-words text-[34px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[40px]">{editing ? "Edit profile" : (savedName || shortAddr(address))}</h1>
              <p className="mt-1 text-base text-zinc-600">{editing ? "Changes save locally on this device." : (address ? `${projects.length} project${projects.length === 1 ? "" : "s"} · ${shortAddr(address)}` : "Connect your wallet to view profile details.")}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 sm:shrink-0">
            {editing ? (
              <>
                <Button variant="outline" className="h-11 rounded-xl" onClick={cancelEdit}>Cancel</Button>
                <Button className="h-11 rounded-xl" onClick={saveEdit}>Save changes</Button>
              </>
            ) : (
              <Button variant="outline" className="h-11 rounded-xl" onClick={startEdit}>Edit profile</Button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Projects" value={String(summary?.active_projects ?? projects.length ?? "—")} />
          <StatCard label="Funded to escrow" value={summary ? formatUsdc(summary.total_funded_amount) : "—"} />
          <StatCard label="Held in escrow" value={summary ? formatUsdc(summary.remaining_escrow_balance) : "—"} />
          <StatCard label="Paid out" value={summary ? formatUsdc(summary.total_paid_amount) : "—"} />
        </div>

        <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-4">
            <section className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-zinc-950">Profile details</h2>
              <p className="mt-1 text-sm text-zinc-600">Shown to providers on agreements and project updates.</p>
              <div className="mt-5 space-y-4">
                {editing ? (
                  <>
                    <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    <Input label="Contact email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} hint="Only used for notifications. Leave it empty to get updates in the app only." />
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-zinc-500">Display name</p>
                      <p className="mt-1 text-base text-zinc-950">{savedName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-500">Contact email</p>
                      <p className="mt-1 break-words text-base text-zinc-950">{savedEmail || "—"}</p>
                      <p className="mt-1 text-sm text-zinc-600">Stored locally on this device.</p>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-zinc-950">Connected wallet</h2>
              <p className="mt-1 text-sm text-zinc-600">Your wallet is how you sign in, and how you sign every agreement and payment.</p>
              <div className="mt-5">
                <p className="text-sm font-medium text-zinc-500">Address</p>
                <div className="mt-2 flex min-w-0 items-center gap-2 rounded-xl border border-zinc-200 bg-[#F8FAFA] px-3 py-3">
                  <span className="min-w-0 flex-1 truncate font-mono text-sm text-zinc-800" title={address || ""}>{address || "Not connected"}</span>
                  <button type="button" disabled={!address} onClick={async () => { if (!address) return; try { await navigator.clipboard?.writeText(address); } catch {} setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-50" aria-label="Copy address">{copied ? "✓" : "⧉"}</button>
                </div>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4"><dt className="text-zinc-600">Network</dt><dd className="font-medium text-zinc-950">Stellar</dd></div>
                <div className="flex items-start justify-between gap-4"><dt className="text-zinc-600">USDC balance</dt><dd className="font-medium text-zinc-950">Unavailable</dd></div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="outline" className="h-10 rounded-xl" disabled={!address} onClick={() => setDisconnectOpen(true)}>Disconnect wallet</Button>
                <a href={explorer} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0E5E5A] px-5 text-sm font-semibold text-white hover:bg-[#0B4E4B]">View on Stellar Expert</a>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-600">To use a different wallet, disconnect and connect it. Your projects stay with the wallet that signed them.</p>
            </section>

            <section className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-zinc-950">Email notifications</h2>
              <p className="mt-1 text-sm text-zinc-600">Pick which updates also go to your email. Preferences are stored locally on this device.</p>
              <div className="mt-2 divide-y divide-zinc-100">
                <ToggleRow title="Agreement updates" description="When the provider signs, asks for changes or declines." enabled={toggles.agreement} onChange={(v) => setToggles((s) => ({ ...s, agreement: v }))} />
                <ToggleRow title="Work submitted" description="When a milestone is ready for you to review." enabled={toggles.work} onChange={(v) => setToggles((s) => ({ ...s, work: v }))} />
                <ToggleRow title="Funding and payouts" description="When a milestone needs funding and when a payment confirms." enabled={toggles.funding} onChange={(v) => setToggles((s) => ({ ...s, funding: v }))} />
                <ToggleRow title="Deadlines" description="Two days before a deadline, and when one is missed." enabled={toggles.deadlines} onChange={(v) => setToggles((s) => ({ ...s, deadlines: v }))} />
                <ToggleRow title="Disputes" description="When a dispute is opened, answered or settled. Always on, so nothing stalls." enabled={toggles.disputes} locked onChange={() => {}} />
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-4">
            <section className="rounded-2xl border border-zinc-200/80 bg-white p-5">
              <h2 className="text-lg font-semibold text-zinc-950">Recent projects</h2>
              <div className="mt-4 space-y-3">
                {!address ? <p className="text-sm text-zinc-600">Connect your wallet to see recent projects.</p> : recent.length === 0 ? <p className="text-sm text-zinc-600">No projects yet.</p> : recent.map((r) => (
                  <Link key={r.id} href={`/app/owner/projects/${r.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 px-3 py-3 hover:bg-zinc-50">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-950">{r.name}</p>
                      <p className="mt-0.5 truncate text-xs text-zinc-600">{r.meta}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-md px-2 py-1 text-xs font-semibold", r.tone === "green" ? "bg-[#E9F8F1] text-[#059669]" : r.tone === "blue" ? "bg-[#E1EAFA] text-[#2D64C8]" : "bg-[#FDECEC] text-[#C2412D]")}>{r.status}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-[#0E5E5A]">
                <Link href="/app/owner/projects" className="hover:underline">All projects →</Link>
                <Link href="/app/owner/transactions" className="hover:underline">All transactions →</Link>
              </div>
            </section>
          </aside>
        </div>

        {disconnectOpen ? (
          isDesktop ? (
            <Modal open={disconnectOpen} onClose={() => setDisconnectOpen(false)} size="sm" showCloseButton={false}>
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-zinc-950">Disconnect this wallet?</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">You&apos;ll be signed out on this device. Nothing on the contract changes: escrow, payouts and disputes carry on. Connect the same wallet to pick up where you left off.</p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" className="h-11 rounded-xl sm:min-w-[140px]" onClick={() => setDisconnectOpen(false)}>Keep connected</Button>
                <button type="button" onClick={async () => { await disconnect(); setDisconnectOpen(false); }} className="inline-flex h-11 items-center justify-center rounded-xl bg-[#DC2626] px-5 text-sm font-semibold text-white hover:bg-[#C81E1E] sm:min-w-[120px]">Disconnect</button>
              </div>
            </Modal>
          ) : (
            <BottomSheet open={disconnectOpen} onClose={() => setDisconnectOpen(false)} showCloseButton={false} showHandle>
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-zinc-950">Disconnect this wallet?</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">You&apos;ll be signed out on this device. Nothing on the contract changes: escrow, payouts and disputes carry on. Connect the same wallet to pick up where you left off.</p>
              <div className="mt-6 flex flex-col-reverse gap-3">
                <Button variant="outline" className="h-11 rounded-xl" onClick={() => setDisconnectOpen(false)}>Keep connected</Button>
                <button type="button" onClick={async () => { await disconnect(); setDisconnectOpen(false); }} className="inline-flex h-11 items-center justify-center rounded-xl bg-[#DC2626] px-5 text-sm font-semibold text-white">Disconnect</button>
              </div>
            </BottomSheet>
          )
        ) : null}
      </main>
    </div>
  );
}

export default function OwnerProfilePage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><OwnerProfileContent /></Suspense>;
}
