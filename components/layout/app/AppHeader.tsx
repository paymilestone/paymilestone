"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AppImages } from "@/lib/app_images";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/wallet/useWallet";
import { useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation, useNotificationsQuery } from "@/lib/api/hooks/useNotifications";
import type { Notification, NotificationTypeEnum } from "@/lib/api/types";

type NavItem = {
  label: string;
  href: string;
};

type AppHeaderProps = {
  navItems: NavItem[];
  activeHref: string;
  /** @deprecated Wallet badge is derived from connected wallet state. */
  walletBadge?: string;
  notificationsHref?: string;
  profileHref?: string;
};

type NoticeTone = "blue" | "green" | "amber" | "red" | "teal";

function useIsDesktop(breakpoint = 768) {
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

function shortAddress(addr?: string | null) {
  if (!addr) return "Not connected";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function stellarExpertUrl(address?: string | null) {
  if (!address) return "#";
  const network = (process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet").toLowerCase();
  const sub = network === "public" || network === "mainnet" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${sub}/account/${address}`;
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function toneFor(type: NotificationTypeEnum): NoticeTone {
  switch (type) {
    case "PAYMENT_RELEASED":
    case "AGREEMENT_APPROVED":
    case "MILESTONE_APPROVED":
      return "green";
    case "DISPUTE_OPENED":
    case "MILESTONE_REFUNDED":
      return "red";
    case "DEADLINE_REMINDER":
    case "DISPUTE_SETTLED":
      return "amber";
    case "MILESTONE_FUNDED":
      return "teal";
    default:
      return "blue";
  }
}

function noticeLinkLabel(n: Notification, isProvider: boolean) {
  if (n.project && isProvider) return "Open project â†’";
  if (n.project) return "Open project â†’";
  return "";
}

function Dot({ tone }: { tone: NoticeTone }) {
  const tones = {
    blue: "bg-[#2D64C8]",
    green: "bg-[#059669]",
    amber: "bg-[#D97706]",
    red: "bg-[#DC2626]",
    teal: "bg-[#0E5E5A]",
  } as const;
  return <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", tones[tone])} aria-hidden="true" />;
}

function WalletMenuContent({
  profileHref,
  accountName,
  accountMeta,
  onCopy,
  copied,
  onViewProfile,
  onDisconnect,
  explorerHref,
  connected,
  onConnect,
  connecting,
}: {
  profileHref: string;
  accountName: string;
  accountMeta: string;
  onCopy: () => void;
  copied: boolean;
  onViewProfile: () => void;
  onDisconnect: () => void;
  explorerHref: string;
  connected: boolean;
  onConnect: () => void;
  connecting: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="border-b border-zinc-200 px-4 py-4 sm:px-5">
        <p className="text-base font-semibold text-zinc-950">{accountName}</p>
        <p className="mt-1 break-all text-sm text-zinc-600">{accountMeta}</p>
      </div>
      <div className="p-2 sm:p-3">
        {connected ? (
          <>
            <Link href={profileHref} onClick={onViewProfile} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
              <span className="inline-flex h-5 w-5 items-center justify-center text-zinc-500"><svg viewBox="0 0 20 20" fill="none" className="h-5 w-5"><circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M4 16c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
              View profile
            </Link>
            <button type="button" onClick={onCopy} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50">
              <span className="inline-flex h-5 w-5 items-center justify-center text-zinc-500"><svg viewBox="0 0 20 20" fill="none" className="h-5 w-5"><rect x="7" y="7" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="4" y="4" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg></span>
              {copied ? "Address copied" : "Copy address"}
            </button>
            <a href={explorerHref} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
              <span className="inline-flex h-5 w-5 items-center justify-center text-zinc-500"><svg viewBox="0 0 20 20" fill="none" className="h-5 w-5"><path d="M11 4h5v5M8 12l8-8M15 11v4a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              View on Stellar Expert
            </a>
            <button type="button" onClick={onDisconnect} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#DC2626] hover:bg-red-50">
              <span className="inline-flex h-5 w-5 items-center justify-center"><svg viewBox="0 0 20 20" fill="none" className="h-5 w-5"><path d="M7 4H5a1 1 0 00-1 1v10a1 1 0 001 1h2M13 14l4-4-4-4M17 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              Disconnect
            </button>
          </>
        ) : (
          <button type="button" onClick={onConnect} disabled={connecting} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#0E5E5A] hover:bg-[#EAF3F1] disabled:opacity-60">
            <span className="inline-flex h-5 w-5 items-center justify-center"><svg viewBox="0 0 20 20" fill="none" className="h-5 w-5"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg></span>
            {connecting ? "Connecting wallet..." : "Connect wallet"}
          </button>
        )}
      </div>
    </div>
  );
}

export function AppHeader({ navItems, activeHref, profileHref }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const walletRef = useRef<HTMLDivElement | null>(null);
  const isDesktop = useIsDesktop(768);
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();

  useEffect(() => {
    if (!notificationsOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setNotificationsOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKeyDown); };
  }, [notificationsOpen]);

  useEffect(() => {
    if (!walletMenuOpen || !isDesktop) return;
    const onDown = (e: MouseEvent) => {
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) setWalletMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setWalletMenuOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [walletMenuOpen, isDesktop]);

  const isProvider = activeHref.startsWith("/app/provider") || navItems.some((n) => n.href.includes("/app/provider"));
  const resolvedProfileHref = profileHref || (isProvider ? "/app/provider" : "/app/owner/profile");
  const badge = isConnected ? shortAddress(address) : "Connect wallet";
  const accountName = isProvider ? "Provider account" : "Owner account";
  const accountMeta = isConnected ? `${shortAddress(address)}${address ? ` Â· ${address}` : ""}` : "No wallet connected";

  const notificationsQuery = useNotificationsQuery(
    address ? { wallet: address } : undefined,
    { enabled: !!address },
  );
  const markOne = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();

  const notices = useMemo(() => {
    const data = notificationsQuery.data as unknown;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as { results?: unknown[] }).results)) {
      return (data as { results: typeof notificationsQuery.data extends (infer T)[] ? T[] : never }).results as NonNullable<typeof notificationsQuery.data>;
    }
    return [] as NonNullable<typeof notificationsQuery.data>;
  }, [notificationsQuery.data]);
  const unreadCount = notices.filter((n: any) => !n?.is_read).length;

  const copyAddress = async () => {
    if (!address) return;
    try { await navigator.clipboard?.writeText(address); } catch {}
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 1500);
  };

  const openDisconnect = () => { setWalletMenuOpen(false); setDisconnectOpen(true); };
  const onConnect = async () => { try { await connect(); } catch (e) { console.error("Wallet connect failed", e); } };

  const DisconnectDialog = () => {
    const content = (
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-zinc-950">Disconnect this wallet?</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">You&apos;ll be signed out on this device. Nothing on the contract changes: escrow, payouts and disputes carry on. Connect the same wallet to pick up where you left off.</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" className="h-11 rounded-xl sm:min-w-[140px]" onClick={() => setDisconnectOpen(false)}>Keep connected</Button>
          <button type="button" onClick={async () => { await disconnect(); setDisconnectOpen(false); }} className="inline-flex h-11 items-center justify-center rounded-xl bg-[#DC2626] px-5 text-sm font-semibold text-white hover:bg-[#C81E1E] sm:min-w-[120px]">Disconnect</button>
        </div>
      </div>
    );
    if (isDesktop) return <Modal open={disconnectOpen} onClose={() => setDisconnectOpen(false)} size="sm" showCloseButton={false}>{content}</Modal>;
    return <BottomSheet open={disconnectOpen} onClose={() => setDisconnectOpen(false)} showCloseButton={false} showHandle>{content}</BottomSheet>;
  };

  const menuProps = {
    profileHref: resolvedProfileHref,
    accountName,
    accountMeta: isConnected ? `${shortAddress(address)}` : "No wallet connected",
    onCopy: copyAddress,
    copied: copiedAddress,
    onViewProfile: () => setWalletMenuOpen(false),
    onDisconnect: openDisconnect,
    explorerHref: stellarExpertUrl(address),
    connected: isConnected,
    onConnect,
    connecting: isConnecting,
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 lg:gap-12">
            <Link href="/" className="flex items-center" aria-label="PayMilestone home">
              <Image src={AppImages.logo} alt="PayMilestone" width={140} height={28} className="h-7 w-auto" priority />
            </Link>
            <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
              {navItems.map((item) => {
                const active = item.href === activeHref;
                return (
                  <Link key={item.href} href={item.href} className={cn("relative py-5 text-sm font-semibold transition-colors", active ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-800")}>
                    {item.label}
                    {active ? <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#0E5E5A]" /> : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <button type="button" onClick={() => setNotificationsOpen(true)} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900">
              <span className="relative inline-flex">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path d="M12 4a5 5 0 00-5 5v2.6c0 .7-.2 1.4-.7 2l-.8 1.1c-.5.7 0 1.8.9 1.8h11.2c.9 0 1.4-1 .9-1.8l-.8-1.1c-.5-.6-.7-1.3-.7-2V9a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  <path d="M10 17a2 2 0 004 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                {unreadCount > 0 ? <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#DC2626]" /> : null}
              </span>
              Notifications
            </button>
            <div ref={walletRef} className="relative">
              <button type="button" onClick={() => (isConnected ? setWalletMenuOpen((v) => !v) : void onConnect())} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
                <span className={cn("h-2 w-2 rounded-full", isConnected ? "bg-[#0E5E5A]" : "bg-zinc-300")} aria-hidden="true" />
                {badge}
              </button>
              {walletMenuOpen && isConnected ? (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[360px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
                  <WalletMenuContent {...menuProps} accountMeta={isConnected ? address || "" : "No wallet connected"} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button type="button" onClick={() => (isConnected ? setWalletMenuOpen(true) : void onConnect())} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700">
              <span className={cn("h-1.5 w-1.5 rounded-full", isConnected ? "bg-[#0E5E5A]" : "bg-zinc-300")} aria-hidden="true" />
              {badge}
            </button>
            <button type="button" onClick={() => setMenuOpen((v) => !v)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-zinc-200 bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col" aria-label="Mobile">
              {navItems.map((item) => {
                const active = item.href === activeHref;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={cn("rounded-xl px-3 py-3 text-sm font-semibold", active ? "bg-[#EAF3F1] text-[#0E5E5A]" : "text-zinc-700 hover:bg-zinc-50")}>
                    {item.label}
                  </Link>
                );
              })}
              <button type="button" onClick={() => { setMenuOpen(false); setNotificationsOpen(true); }} className="mt-1 rounded-xl px-3 py-3 text-left text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}</button>
            </nav>
          </div>
        ) : null}
      </header>

      {walletMenuOpen && !isDesktop && isConnected ? (
        <BottomSheet open onClose={() => setWalletMenuOpen(false)} showCloseButton={false} showHandle>
          <WalletMenuContent {...menuProps} accountMeta={address || ""} />
        </BottomSheet>
      ) : null}

      {disconnectOpen ? <DisconnectDialog /> : null}

      {notificationsOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-transparent" aria-hidden="true" onClick={() => setNotificationsOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-zinc-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4 sm:px-6">
              <div><h2 className="text-xl font-semibold text-zinc-950">Notifications</h2></div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => markAll.mutate()} disabled={markAll.isPending || notices.length === 0} className="text-sm font-semibold text-[#0E5E5A] hover:underline disabled:opacity-50">Mark all as read</button>
                <button type="button" onClick={() => setNotificationsOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100" aria-label="Close notifications">
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {!address ? (
                <div className="px-5 py-8 text-sm text-zinc-600 sm:px-6">Connect your wallet to view notifications.</div>
              ) : notificationsQuery.isLoading ? (
                <div className="px-5 py-8 text-sm text-zinc-600 sm:px-6">Loading notifications...</div>
              ) : notices.length === 0 ? (
                <div className="px-5 py-8 text-sm text-zinc-600 sm:px-6">No notifications yet.</div>
              ) : (
                notices.map((n) => {
                  const tone = toneFor(n.notification_type);
                  const linkLabel = noticeLinkLabel(n, isProvider);
                  const href = n.project ? (isProvider ? `/app/provider/projects/${n.project}` : `/app/owner/projects/${n.project}`) : undefined;
                  const RowTag = href ? Link : "div";
                  return (
                    <RowTag
                      key={n.id}
                      href={href || "#"}
                      onClick={() => { if (!n.is_read) markOne.mutate(n.id); setNotificationsOpen(false); }}
                      className={cn("flex gap-3 px-5 py-4 sm:px-6", !n.is_read ? "bg-[#F8FBFB]" : "bg-white", "border-b border-zinc-100 hover:bg-zinc-50/70")}
                    >
                      {!n.is_read ? <Dot tone={tone} /> : <span className="mt-1.5 h-2.5 w-2.5 shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-zinc-950">{n.title}</p>
                          <span className="shrink-0 text-xs font-medium text-zinc-500">{timeAgo(n.created_at)}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-zinc-600">{n.message}</p>
                        {linkLabel ? <p className="mt-1.5 text-sm font-medium text-[#0E5E5A]">{linkLabel}</p> : null}
                      </div>
                    </RowTag>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

