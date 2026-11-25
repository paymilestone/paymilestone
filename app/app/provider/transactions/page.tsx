"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pill } from "@/components/ui/Pill";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { useTransactionsQuery } from "@/lib/api/hooks/useTransactions";
import { useWallet } from "@/lib/wallet/useWallet";
import type { TransactionRecord } from "@/lib/api/types";

const providerNav = [
  { label: "Projects", href: "/app/provider" },
  { label: "Transactions", href: "/app/provider/transactions" },
];

type TxTab = "All" | "Funding" | "Payouts" | "Refunds" | "Disputes" | "Settlements";

type TxView = {
  id: string;
  date: string;
  typeLabel: string;
  project: string;
  milestone: string;
  amount: string;
  flow: string;
  status: "Confirmed" | "Pending";
  hash: string;
  tab: Exclude<TxTab, "All"> | "Funding";
  raw: TransactionRecord;
};

function shortHash(h?: string | null) {
  if (!h) return "—";
  if (h.length <= 14) return h;
  return `${h.slice(0, 6)}...${h.slice(-4)}`;
}

function shortId(id?: string | number | null) {
  if (id == null) return "—";
  const s = String(id);
  return s.length <= 10 ? s : `${s.slice(0, 8)}…`;
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function mapTx(t: TransactionRecord): TxView {
  const e = (t.event_type || "").toUpperCase();
  let typeLabel = t.event_type?.replace(/_/g, " ") || "Transaction";
  let tab: TxView["tab"] = "Funding";
  let flow = t.actor_wallet ? `Actor ${shortHash(t.actor_wallet)}` : "—";
  if (e.includes("FUND") || e.includes("DEPOSIT") || e.includes("ESCROW")) { typeLabel = "Funding"; tab = "Funding"; flow = "Escrow activity"; }
  else if (e.includes("PAYOUT") || e.includes("RELEASE") || e.includes("PAID")) { typeLabel = "Payout"; tab = "Payouts"; flow = "To your wallet"; }
  else if (e.includes("REFUND")) { typeLabel = "Refund"; tab = "Refunds"; flow = "Refunded to owner"; }
  else if (e.includes("DISPUTE")) { typeLabel = "Dispute"; tab = "Disputes"; flow = "Dispute activity"; }
  else if (e.includes("SETTLE")) { typeLabel = "Settlement"; tab = "Settlements"; flow = "Settlement split"; }
  const amount = t.amount != null ? `${t.amount} USDC` : "—";
  const status: "Confirmed" | "Pending" = t.verified === false ? "Pending" : "Confirmed";
  return {
    id: String(t.id),
    date: fmtDate(t.created_at),
    typeLabel,
    project: t.project != null ? `Project ${shortId(t.project)}` : "—",
    milestone: t.milestone != null ? `Milestone ${shortId(t.milestone)}` : "—",
    amount,
    flow,
    status,
    hash: shortHash(t.tx_hash),
    tab,
    raw: t,
  };
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-600">{label}</p>
        <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[30px]">{value}</p>
        {sub ? <p className="mt-2 text-sm leading-5 text-zinc-600">{sub}</p> : null}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "Confirmed" | "Pending" }) {
  return status === "Pending" ? <Pill variant="warning" size="sm">Pending</Pill> : <Pill variant="success" size="sm">Confirmed</Pill>;
}

function TransactionsContent() {
  const { address } = useWallet();
  const { data, isLoading } = useTransactionsQuery(address ? { wallet: address } : undefined, { enabled: !!address });
  const [typeTab, setTypeTab] = useState<TxTab>("All");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const all = useMemo(() => (data ?? []).map(mapTx), [data]);
  const counts = useMemo(() => {
    const c = { All: all.length, Funding: 0, Payouts: 0, Refunds: 0, Disputes: 0, Settlements: 0 } as Record<TxTab, number>;
    all.forEach((t) => { if (t.tab in c) c[t.tab as TxTab] += 1; });
    return c;
  }, [all]);

  const rows = useMemo(() => {
    let list = typeTab === "All" ? all : all.filter((t) => t.tab === typeTab);
    if (statusFilter !== "All statuses") list = list.filter((t) => t.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((t) => `${t.project} ${t.milestone} ${t.hash} ${t.typeLabel}`.toLowerCase().includes(q));
    }
    return list;
  }, [all, typeTab, statusFilter, query]);

  const stats = useMemo(() => {
    const sum = (pred: (t: TxView) => boolean) => all.filter(pred).reduce((n, t) => n + (Number(t.raw.amount || 0) || 0), 0);
    const fmt = (n: number) => `${n.toFixed(2)} USDC`;
    return {
      received: fmt(sum((t) => t.tab === "Payouts" || t.tab === "Settlements")),
      funding: fmt(sum((t) => t.tab === "Funding")),
      refunded: fmt(sum((t) => t.tab === "Refunds")),
      count: all.length,
    };
  }, [all]);

  const tabs: TxTab[] = ["All", "Funding", "Payouts", "Refunds", "Disputes", "Settlements"];
  const clearFilters = () => { setTypeTab("All"); setStatusFilter("All statuses"); setQuery(""); };

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={providerNav} activeHref="/app/provider/transactions" />
      <main className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Transactions</h1>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total received / settled" value={stats.received} sub="Payouts and settlements" />
          <StatCard label="Funding activity" value={stats.funding} />
          <StatCard label="Refunded to owners" value={stats.refunded} />
          <StatCard label="Total records" value={String(stats.count)} sub={address ? "From connected wallet" : "Connect wallet to load"} />
        </div>

        <section className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-zinc-950">All transactions</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {!address ? "Connect your wallet to load transactions from the API." : "Payouts, refunds, disputes and settlements on your milestones. Newest first."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button key={t} type="button" onClick={() => setTypeTab(t)} className={cn("inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium", typeTab === t ? "bg-zinc-100 text-zinc-950" : "text-zinc-700 hover:bg-zinc-50")}>
                {t}{t !== "All" ? <span className={typeTab === t ? "text-zinc-700" : "text-zinc-400"}>{counts[t]}</span> : null}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search project, milestone, type or tx hash" />
            <Select label="Status" options={[{ label: "All statuses", value: "All statuses" }, { label: "Pending", value: "Pending" }, { label: "Confirmed", value: "Confirmed" }]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
            <div className="flex items-end"><Button variant="outline" className="h-11 rounded-xl" onClick={clearFilters}>Clear filters</Button></div>
          </div>

          {!address ? (
            <div className="mt-8 flex flex-col items-center justify-center rounded-xl py-12 text-center">
              <h3 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950">Connect your wallet</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">Transactions for your connected wallet will appear here.</p>
            </div>
          ) : isLoading ? (
            <div className="mt-8 py-12 text-center text-sm text-zinc-500">Loading transactions...</div>
          ) : rows.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center rounded-xl py-12 text-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#CFE7DE] text-2xl text-[#0E5E5A]">✓</span>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-zinc-950">{all.length === 0 ? "No transactions yet" : "No transactions match these filters"}</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">{all.length === 0 ? "When you receive a payout, refund, or settlement, it will appear here." : "Try different filters or clear them to see everything."}</p>
              {all.length > 0 ? <Button variant="outline" className="mt-6 h-11 rounded-xl" onClick={clearFilters}>Clear filters</Button> : null}
            </div>
          ) : (
            <>
              <div className="mt-4 hidden overflow-x-auto lg:block">
                <table className="min-w-full text-sm">
                  <thead className="border-y border-zinc-200 text-left text-zinc-500">
                    <tr><th className="px-3 py-3 font-medium">Date</th><th className="px-3 py-3 font-medium">Type</th><th className="px-3 py-3 font-medium">Project / milestone</th><th className="px-3 py-3 font-medium">Amount</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 font-medium">Stellar tx</th><th className="px-3 py-3" /></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {rows.map((t) => (
                      <tr key={t.id} className="hover:bg-zinc-50/60">
                        <td className="px-3 py-4 whitespace-nowrap text-zinc-700">{t.date}</td>
                        <td className="px-3 py-4 font-medium text-zinc-900">{t.typeLabel}</td>
                        <td className="px-3 py-4"><p className="font-medium text-zinc-900">{t.project}</p><p className="mt-0.5 text-zinc-600">{t.milestone}</p></td>
                        <td className="px-3 py-4"><p className="font-semibold text-zinc-950">{t.amount}</p><p className="mt-0.5 text-xs text-zinc-600">{t.flow}</p></td>
                        <td className="px-3 py-4"><StatusPill status={t.status} /></td>
                        <td className="px-3 py-4 font-mono text-xs text-zinc-700">{t.hash}</td>
                        <td className="px-3 py-4 text-right"><Link href={`/app/provider/transactions/${t.id}`} className="text-lg text-zinc-400 hover:text-zinc-700">›</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 space-y-3 lg:hidden">
                {rows.map((t) => (
                  <Link key={t.id} href={`/app/provider/transactions/${t.id}`} className="block rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="font-semibold text-zinc-950">{t.typeLabel}</p><StatusPill status={t.status} /></div>
                      <span className="text-xl text-zinc-400">›</span>
                    </div>
                    <p className="mt-3 text-xl font-semibold tracking-[-0.02em] text-zinc-950">{t.amount}</p>
                    <p className="mt-1 text-sm text-zinc-700">{t.flow}</p>
                    <p className="mt-2 text-sm font-medium text-zinc-900">{t.project} · {t.milestone}</p>
                    <div className="mt-3 flex items-center justify-between text-sm text-zinc-600"><span>{t.date}</span><span className="font-mono text-xs">{t.hash}</span></div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default function ProviderTransactionsPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}><TransactionsContent /></Suspense>;
}
