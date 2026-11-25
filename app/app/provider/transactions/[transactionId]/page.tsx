"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/app/AppHeader";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/wallet/useWallet";
import { useTransactionsQuery } from "@/lib/api/hooks/useTransactions";
import type { TransactionRecord } from "@/lib/api/types";

const providerNav = [
  { label: "Projects", href: "/app/provider" },
  { label: "Transactions", href: "/app/provider/transactions" },
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
  if (e.includes("dispute")) return { label: "Dispute", tone: "warning" as const };
  if (e.includes("release") || e.includes("payout") || e.includes("paid")) return { label: "Payout received", tone: "success" as const };
  if (e.includes("fund")) return { label: "Escrow funded", tone: "info" as const };
  return { label: eventType.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()), tone: "neutral" as const };
}

function DetailContent() {
  const params = useParams<{ transactionId: string }>();
  const id = params?.transactionId;
  const { address } = useWallet();
  const { data, isLoading, isError } = useTransactionsQuery({ wallet: address ?? undefined }, { enabled: !!address });
  const [copied, setCopied] = useState(false);

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
        <AppHeader navItems={providerNav} activeHref="/app/provider/transactions" />
        <main className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-zinc-950">Connect your wallet</h1>
          <p className="mt-2 text-sm text-zinc-600">Connect the wallet used for this transaction to view its details.</p>
          <Link href="/app/provider/transactions" className="mt-4 inline-flex text-sm font-semibold text-[#0E5E5A] hover:underline">Back to transactions</Link>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7F7]">
        <AppHeader navItems={providerNav} activeHref="/app/provider/transactions" />
        <main className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8 text-sm text-zinc-600">Loading transaction…</main>
      </div>
    );
  }

  if (isError || !tx) {
    return (
      <div className="min-h-screen bg-[#F5F7F7]">
        <AppHeader navItems={providerNav} activeHref="/app/provider/transactions" />
        <main className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-zinc-950">Transaction not found</h1>
          <p className="mt-2 text-sm text-zinc-600">We couldn’t load this transaction for the connected wallet.</p>
          <Link href="/app/provider/transactions" className="mt-4 inline-flex text-sm font-semibold text-[#0E5E5A] hover:underline">Back to transactions</Link>
        </main>
      </div>
    );
  }

  const info = typeInfo(tx.event_type);
  const amount = tx.amount ? formatUsdc(tx.amount) : "—";
  const projectHref = tx.project ? `/app/provider/projects/${tx.project}` : null;
  const explorer = tx.tx_hash ? `https://stellar.expert/explorer/public/tx/${tx.tx_hash}` : null;
  const badgeCls = info.tone === "success" ? "bg-[#DFF5E8] text-[#059669]" : info.tone === "warning" ? "bg-[#FEF3E6] text-[#B45309]" : info.tone === "info" ? "bg-[#EAF3F8] text-[#245A9C]" : "bg-zinc-100 text-zinc-700";

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={providerNav} activeHref="/app/provider/transactions" />
      <main className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-500" aria-label="Breadcrumb">
          <Link href="/app/provider/transactions" className="hover:text-zinc-800">Transactions</Link>
          <span>/</span>
          <span className="text-zinc-700">{info.label}</span>
        </nav>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex rounded-md px-2.5 py-1 text-xs font-semibold", badgeCls)}>{info.label}</span>
          <span className={cn("inline-flex rounded-md px-2.5 py-1 text-xs font-semibold", tx.verified ? "bg-[#DFF5E8] text-[#059669]" : "bg-[#FEF3E6] text-[#B45309]")}>{tx.verified ? "Confirmed" : "Pending"}</span>
        </div>
        <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[42px]">{amount}</h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-zinc-700">{tx.verified ? "This transaction has been recorded and verified." : "This transaction has been recorded and is awaiting confirmation."}</p>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-zinc-950">Transaction details</h2>
              <dl className="mt-4 divide-y divide-zinc-100">
                {[
                  ["Type", info.label],
                  ["Status", tx.verified ? "Confirmed" : "Pending"],
                  ["Amount", amount],
                  ["Project", tx.project ? shortId(tx.project) : "—"],
                  ["Milestone", tx.milestone ? shortId(tx.milestone) : "—"],
                  ["Actor", shortId(tx.actor_wallet)],
                  ["Date and time", formatDateTime(tx.created_at)],
                  ["Ledger", tx.ledger_sequence != null ? String(tx.ledger_sequence) : "—"],
                  ["Currency", tx.currency || "USDC"],
                  ["Event type", tx.event_type],
                ].map(([label, value]) => (
                  <div key={label} className="grid gap-1 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-start sm:gap-4">
                    <dt className="text-sm text-zinc-500">{label}</dt>
                    <dd className="text-sm font-medium text-zinc-950 sm:text-right break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {tx.tx_hash ? (
              <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
                <h2 className="text-xl font-semibold text-zinc-950">Transaction hash</h2>
                <p className="mt-1 text-sm text-zinc-600">The ID of this transaction on the Stellar network.</p>
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-zinc-200 bg-[#F8FAFA] p-4">
                  <p className="min-w-0 flex-1 break-all font-mono text-sm leading-6 text-zinc-800">{tx.tx_hash}</p>
                  <button type="button" className="shrink-0 text-zinc-500 hover:text-zinc-800" aria-label="Copy hash" onClick={async () => { try { await navigator.clipboard?.writeText(tx.tx_hash); } catch {} setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? "✓" : "⧉"}</button>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={async () => { try { await navigator.clipboard?.writeText(tx.tx_hash); } catch {} setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50">{copied ? "Copied hash" : "Copy hash"}</button>
                  {explorer ? <a href={explorer} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center rounded-xl px-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50">View on Stellar Expert ↗</a> : null}
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-zinc-950">From and to</h2>
              <div className="mt-4 space-y-5">
                <div>
                  <p className="text-sm font-medium text-zinc-600">Actor</p>
                  <div className="mt-2 flex items-start gap-3 rounded-xl border border-zinc-200 bg-[#F8FAFA] p-4">
                    <p className="min-w-0 flex-1 break-all font-mono text-sm leading-6 text-zinc-800">{tx.actor_wallet}</p>
                  </div>
                </div>
              </div>
            </section>

            <Link href="/app/provider/transactions" className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white text-sm font-semibold text-zinc-900 hover:bg-zinc-50 xl:hidden">Back to all transactions</Link>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-zinc-200/80 bg-white p-5">
              <h2 className="text-lg font-semibold text-zinc-950">Related project</h2>
              {projectHref ? (
                <>
                  <p className="mt-3 text-base font-semibold text-zinc-950">Project {shortId(tx.project)}</p>
                  <p className="mt-1 text-sm text-zinc-600">Open the project to view milestones and agreement details.</p>
                  <Link href={projectHref} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white text-sm font-semibold text-zinc-900 hover:bg-zinc-50">Open project</Link>
                </>
              ) : <p className="mt-3 text-sm text-zinc-600">This transaction is not linked to a project.</p>}
            </section>

            <section className="rounded-2xl border border-zinc-200/80 bg-white p-5">
              <h2 className="text-lg font-semibold text-zinc-950">Related transactions</h2>
              <p className="mt-1 text-sm text-zinc-600">Other transactions for the same project or milestone.</p>
              <div className="mt-4 space-y-4">
                {related.length === 0 ? <p className="text-sm text-zinc-600">No related transactions found.</p> : related.map((r, i) => {
                  const ri = typeInfo(r.event_type);
                  const active = r.id === tx.id;
                  return (
                    <Link key={r.id} href={`/app/provider/transactions/${r.id}`} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className={cn("mt-1 inline-flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-semibold", active ? "bg-[#0E5E5A] text-white" : "bg-[#DFF5E8] text-[#059669]")}>{active ? "•" : "✓"}</span>
                        {i < related.length - 1 ? <span className="mt-1 h-full min-h-8 w-px bg-zinc-200" /> : null}
                      </div>
                      <div className="min-w-0 flex-1 pb-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={cn("text-sm font-medium", active ? "text-[#0E5E5A]" : "text-zinc-900")}>{ri.label}{active ? "  ›" : ""}</p>
                            <p className="mt-0.5 text-xs text-zinc-600">{formatDateTime(r.created_at)}</p>
                          </div>
                          <p className="text-sm font-medium text-zinc-900">{r.amount ? formatUsdc(r.amount) : "—"}</p>
                        </div>
                      </div>
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

export default function ProviderTransactionDetailPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><DetailContent /></Suspense>;
}
