"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AppImages } from "@/lib/app_images";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/lib/wallet/useWallet";

const navLinks = [
  {
    label: "How it works",
    href: "#how-it-works-steps",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
        <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6.5v3.6l2.3 1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "For project owners",
    href: "#for-owners",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M4.75 5.75A1.75 1.75 0 016.5 4h7A1.75 1.75 0 0115.25 5.75v8.5A1.75 1.75 0 0113.5 16h-7a1.75 1.75 0 01-1.75-1.75v-8.5z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7.5 7.5h5M7.5 10h5M7.5 12.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "For service providers",
    href: "#for-providers",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M10 3.75l6 2.5v3.2c0 3.4-2.2 5.9-6 6.8-3.8-.9-6-3.4-6-6.8v-3.2l6-2.5z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7.9 10.1l1.4 1.4 2.9-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  { label: "Disputes", href: "#disputes", icon: <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true"><circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" /><path d="M10 6.5v3.8M10 13.4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> },
  { label: "FAQ", href: "#faq", icon: <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true"><circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" /><path d="M8.1 7.9a1.9 1.9 0 113.2 1.35c-.55.5-1.05.85-1.05 1.75M10 13.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
];

function shortAddr(a?: string | null) {
  if (!a) return "";
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-zinc-400" aria-hidden="true">
      <path d="M7.5 5.5L12 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavItem({ href, icon, label, onClick }: { href: string; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <a href={href} onClick={onClick} className="flex items-center justify-between rounded-xl bg-[#F7F8F8] px-4 py-3 text-[15px] font-medium text-zinc-800 transition-colors hover:bg-[#EEF1F0]">
      <span className="flex items-center gap-3"><span className="text-zinc-600">{icon}</span>{label}</span>
      <ChevronIcon />
    </a>
  );
}

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileMenuOpen(false); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (e) {
      console.error("Wallet connect failed", e);
    }
  };

  return (
    <>
      <header className="w-full">
        <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-5">
            <a href="#" className="flex shrink-0 items-center gap-2">
              <Image src={AppImages.logo} alt="PayMilestone" width={140} height={28} className="h-7 w-auto" priority />
            </a>

            <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
              <a href="#how-it-works-steps" className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950">How it works</a>
              <a href="#for-owners" className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950">For owners</a>
              <a href="#for-providers" className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950">For providers</a>
              <a href="#disputes" className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950">Disputes</a>
              <a href="#faq" className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950">FAQ</a>
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              {isConnected ? (
                <>
                  <Button variant="outline" size="sm" className="rounded-full px-4" onClick={() => void disconnect()}>
                    {shortAddr(address)}
                  </Button>
                  <Link href="/app/onboarding">
                    <Button variant="primary" size="sm" className="rounded-full px-4">Open app</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="rounded-full px-4" onClick={handleConnect} disabled={isConnecting}>
                    {isConnecting ? "Connecting…" : "Connect wallet"}
                  </Button>
                  <Link href="/app/onboarding">
                    <Button variant="primary" size="sm" className="rounded-full px-4">Start a project</Button>
                  </Link>
                </>
              )}
            </div>

            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 lg:hidden" aria-label="Open menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-transparent" aria-hidden="true" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-x-0 top-0 mx-auto flex h-full max-w-md justify-center p-4 sm:p-5">
            <div className="flex h-full w-full flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4">
                <a href="#" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                  <Image src={AppImages.logo} alt="PayMilestone" width={140} height={28} className="h-7 w-auto" />
                </a>
                <button type="button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50">
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true"><path d="M5.5 5.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-5">
                <nav className="mt-1 space-y-2.5" aria-label="Mobile">
                  {navLinks.map((link) => <NavItem key={link.label} href={link.href} icon={link.icon} label={link.label} onClick={() => setMobileMenuOpen(false)} />)}
                </nav>
                <div className="mt-5 rounded-2xl bg-[#F5EAD4] p-4">
                  <p className="text-base font-semibold text-zinc-900">Got an invite link?</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-700">Open it to review the agreement, then connect the wallet it was sent to.</p>
                </div>
                <div className="mt-5 space-y-3">
                  <Link href="/app/onboarding" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" fullWidth size="lg" className="h-12 rounded-2xl">{isConnected ? "Open app" : "Start a project"}</Button>
                  </Link>
                  {isConnected ? (
                    <Button variant="outline" fullWidth size="lg" className="h-12 rounded-2xl border-zinc-300 bg-white" onClick={() => { void disconnect(); setMobileMenuOpen(false); }}>
                      Disconnect {shortAddr(address)}
                    </Button>
                  ) : (
                    <Button variant="outline" fullWidth size="lg" className="h-12 rounded-2xl border-zinc-300 bg-white" onClick={handleConnect} disabled={isConnecting}>
                      {isConnecting ? "Connecting…" : "Connect wallet"}
                    </Button>
                  )}
                </div>
                <p className="mt-8 text-center text-sm text-zinc-500">Payments in USDC on Stellar</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}