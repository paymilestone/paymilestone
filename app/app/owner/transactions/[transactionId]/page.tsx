"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app/AppHeader";
import { Pill } from "@/components/ui/Pill";
import { useWallet } from "@/lib/wallet/useWallet";
import { useTransactionsQuery } from "@/lib/api/hooks/useTransactions";
import type { TransactionRecord } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const ownerNav = [
  { label: "Dashboard", href: "/app/owner" },
  { label: "Projects", href: "/app/owner/projects" },
  { label: "Transactions", href: "/app/owner/transactions" },
];

function shortId(id?: string | null) {
  if (!id) return "—";
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

function formatUsdc(amount?: string | null) {
  if (!amount) return "—";
  const n = Number(amount);
  if (Number.isNaN(n)) return `${amount} USDC`;
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} USDC`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function typeInfo(eventType: string) {
  const e = eventType.toLowerCase();
  if (e.includes("refund")) return { label: "Refund", tone: "warning" as const };
  if (e.includes("dispute") && e.includes("sett")) return { label: "Settlement", tone: "warning" as const };
  if (e.includes("dispute")) return { label: "Dispute", tone: "danger" as const };
  if (e.includes("release") || e.includes("payout") || e.includes("paid")) return { label: "Payout release", tone: "success" as const };
  if (e.includes("fund")) return { label: "Escrow funding", tone: "info" as const };
  return { label: eventType.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()), tone: "neutral" as const };
}

function TypePill({ label, tone }: { label: string; tone: "success" | "warning" | "danger" | "info" | "neutral" }) {
  const cls = tone === "success" ? "border-teal-200 bg-teal-50 text-teal-800" : tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-800" : tone === "danger" ? "border-red-200 bg-red-50 text-red-800" : tone === "info" ? "border-blue-200 bg-blue-50 text-blue-800" : "border-zinc-200 bg-zinc-50 text-zinc-800";
  return <span className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold", cls)}>{label}</span>;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 py-3 last:border-b-0">
      <dt className="text-sm text-zinc-600">{label}</dt>
      <dd className="text-right text-sm font-medium text-zinc-950 break-all">{value}</dd>
    </div>
  );
}

function HashBox({ hash }: { hash?: string }) {
  const [copied, setCopied] = useState(false);
  if (!hash) return null;
  const explorer = `https://stellar.expert/explorer/public/tx/${hash}`;
  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-zinc-950">Transaction hash</h2>
      <p className="mt-1 text-sm text-zinc-600">The ID of this transaction on the Stellar network.</p>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-[#F8FAFA] px-3 py-3">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-800 sm:text-sm">{hash}</span>
        <button type="button" onClick={async () => { try { await navigator.clipboard?.writeText(hash); } catch {} setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50" aria-label="Copy hash">{copied ? "✓" : "⧉"}</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={async () => { try { await navigator.clipboard?.writeText(hash); } catch {} setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50">{copied ? "Copied hash" : "Copy hash"}</button>
        <a href={explorer} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0E5E5A] px-4 text-sm font-semibold text-white hover:bg-[#0B4C49]">View on Stellar Expert ↗</a>
      </div>
    </section>
  );
}

function TransactionDetailContent() {
  const params = useParams<{ transactionId: string }>();
  const id = params?.transactionId;
  const { address } = useWallet();
  const { data, isLoading, isError } = useTransactionsQuery({ wallet: address ?? undefined }, { enabled: !!address });

  const tx = useMemo(() => {
    const results = (data ?? []) as TransactionRecord[];
    return results.find((t) => t.id === id || t.tx_hash === id) ?? null;
  }, [data, id]);

  const related = useMemo(() => {
    const results = (data ?? []) as TransactionRecord[];
    if (!tx) return [] as TransactionRecord[];
    return results.filter((t) => (tx.project && t.project === tx.project) || (tx.milestone && t.milestone === tx.milestone)).slice(0, 8);
  }, [data, tx]);

  if (!address) {
    return (
      <div className="min-h-screen bg-[#F5F7F7]">
        <AppHeader navItems={ownerNav} activeHref="/app/owner/transactions" />
        <main className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-zinc-950">Connect your wallet</h1>
          <p className="mt-2 text-sm text-zinc-600">Connect the wallet used for this transaction to view its details.</p>
          <Link href="/app/owner/transactions" className="mt-4 inline-flex text-sm font-semibold text-[#0E5E5A] hover:underline">Back to transactions</Link>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7F7]">
        <AppHeader navItems={ownerNav} activeHref="/app/owner/transactions" />
        <main className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8 text-sm text-zinc-600">Loading transaction…</main>
      </div>
    );
  }

  if (isError || !tx) {
    return (
      <div className="min-h-screen bg-[#F5F7F7]">
        <AppHeader navItems={ownerNav} activeHref="/app/owner/transactions" />
        <main className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-zinc-950">Transaction not found</h1>
          <p className="mt-2 text-sm text-zinc-600">We couldn’t load this transaction for the connected wallet.</p>
          <Link href="/app/owner/transactions" className="mt-4 inline-flex text-sm font-semibold text-[#0E5E5A] hover:underline">Back to transactions</Link>
        </main>
      </div>
    );
  }

  const info = typeInfo(tx.event_type);
  const amount = tx.amount ? formatUsdc(tx.amount) : "—";
  const projectHref = tx.project ? `/app/owner/projects/${tx.project}` : null;

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={ownerNav} activeHref="/app/owner/transactions" />
      <main className="mx-auto w-full max-w-[1320px] overflow-x-hidden px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <nav className="flex flex-wrap items-center text-sm font-medium text-zinc-500" aria-label="Breadcrumb">
          <Link href="/app/owner/transactions" className="hover:text-zinc-700">Transactions</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="min-w-0 break-words text-zinc-700">{info.label}</span>
        </nav>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TypePill label={info.label} tone={info.tone} />
          <Pill variant={tx.verified ? "success" : "warning"} size="sm">{tx.verified ? "Confirmed" : "Pending"}</Pill>
        </div>
        <h1 className="mt-3 break-words text-[34px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[40px]">{amount}</h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-zinc-700">{tx.verified ? "This transaction has been recorded and verified." : "This transaction has been recorded and is awaiting confirmation."}</p>

        <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-4">
            <section className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-zinc-950">Transaction details</h2>
              <dl className="mt-2">
                <DetailRow label="Type" value={info.label} />
                <DetailRow label="Status" value={tx.verified ? "Confirmed" : "Pending"} />
                <DetailRow label="Amount" value={amount} />
                <DetailRow label="Project" value={projectHref ? <Link href={projectHref} className="font-semibold text-[#0E5E5A] hover:underline">{shortId(tx.project)}</Link> : "—"} />
                <DetailRow label="Milestone" value={tx.milestone ? shortId(tx.milestone) : "—"} />
                <DetailRow label="Actor" value={shortId(tx.actor_wallet)} />
                <DetailRow label="Date and time" value={formatDateTime(tx.created_at)} />
                <DetailRow label="Ledger" value={tx.ledger_sequence ?? "—"} />
                <DetailRow label="Currency" value={tx.currency || "USDC"} />
                <DetailRow label="Event type" value={tx.event_type} />
              </dl>
            </section>

            <HashBox hash={tx.tx_hash} />

            <section className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-zinc-950">From and to</h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div><dt className="text-zinc-600">Actor wallet</dt><dd className="mt-1 break-all font-mono text-xs font-medium text-zinc-950 sm:text-sm">{tx.actor_wallet}</dd></div>
              </dl>
            </section>
          </div>

          <aside className="min-w-0 space-y-4">
            <section className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-5">
              <h2 className="text-lg font-semibold text-zinc-950">Related project</h2>
              {projectHref ? (
                <>
                  <p className="mt-3 text-base font-semibold text-zinc-950">Project {shortId(tx.project)}</p>
                  <p className="mt-1 text-sm text-zinc-600">Open the project to view milestones, agreement, and escrow details.</p>
                  <div className="mt-4"><Link href={projectHref} className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0E5E5A] px-4 text-sm font-semibold text-white hover:bg-[#0B4C49]">Open project</Link></div>
                </>
              ) : (
                <p className="mt-3 text-sm text-zinc-600">This transaction is not linked to a project.</p>
              )}
            </section>

            <section className="min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-5">
              <h2 className="text-lg font-semibold text-zinc-950">Related transactions</h2>
              <p className="mt-1 text-sm text-zinc-600">Other transactions for the same project or milestone.</p>
              <div className="mt-4 space-y-3">
                {related.length === 0 ? <p className="text-sm text-zinc-600">No related transactions found.</p> : related.map((r) => {
                  const ri = typeInfo(r.event_type);
                  const active = r.id === tx.id;
                  return (
                    <Link key={r.id} href={`/app/owner/transactions/${r.id}`} className={cn("flex min-w-0 items-center justify-between gap-3 rounded-xl border px-3 py-3 text-sm", active ? "border-zinc-300 bg-zinc-50" : "border-zinc-200 hover:bg-zinc-50")}>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-950">{ri.label}{active ? " · Viewing" : ""}</p>
                        <p className="mt-0.5 break-words text-zinc-600">{r.amount ? formatUsdc(r.amount) : "—"}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">{formatDateTime(r.created_at)}</p>
                      </div>
                      <span className="text-zinc-400">›</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function OwnerTransactionDetailPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><TransactionDetailContent /></Suspense>;
}