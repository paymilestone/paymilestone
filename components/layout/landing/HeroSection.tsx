"use client";

import Image from "next/image";
import Link from "next/link";
import { AppColors } from "@/lib/app_colors";
import { AppImages } from "@/lib/app_images";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useWallet } from "@/lib/wallet/useWallet";
import { LandingHeader } from "./LandingHeader";

const trustPoints = [
  "Both sides sign the terms",
  "Funded before work starts",
  "Disputes freeze the payout",
];

function CheckIcon() {
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DCEEEB] text-primary">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
        <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.415l-7.25 7.25a1 1 0 01-1.415 0l-3.25-3.25a1 1 0 111.415-1.415l2.543 2.543 6.542-6.543a1 1 0 011.415 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

export function HeroSection() {
  const { isConnected, isConnecting, connect } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (e) {
      console.error("Wallet connect failed", e);
    }
  };

  return (
    <section className="relative flex w-full flex-col overflow-hidden" style={{ background: AppColors.heroGradient }}>
      <LandingHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-10 pt-10 text-center sm:px-6 sm:pt-14 lg:px-8 lg:pb-16 lg:pt-16">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#BFE3DD] bg-white/70 px-3 py-1.5 text-left shadow-sm backdrop-blur-sm sm:px-4">
          <Image src={AppImages.icon} alt="" width={18} height={18} className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          <span className="truncate text-xs font-medium text-[#0E5E5A] sm:text-sm">
            <span className="font-semibold">USDC escrow</span>
            <span className="mx-1.5 text-[#5F8F8A]">•</span>
            Milestone payments, secured by Soroban on Stellar
          </span>
        </div>

        <div className="mt-6 max-w-4xl sm:mt-8">
          <h1 className="font-sans text-4xl font-bold leading-[1.08] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
            <span className="block">Pay only for approved work.</span>
            <span className="block text-primary">Get paid as the work gets done.</span>
          </h1>
          <Text as="p" variant="body" tone="muted" align="center" className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">
            PayMilestone turns your project into signed milestones held in USDC escrow. Owners release money only for work they approve. Providers start every milestone knowing the money is already there.
          </Text>
        </div>

        <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link href="/app/onboarding" className="sm:min-w-[180px]">
            <Button variant="primary" size="lg" fullWidth className="rounded-full px-7">
              {isConnected ? "Open app" : "Start a project"}
            </Button>
          </Link>
          {isConnected ? (
            <Link href="/app/onboarding" className="sm:min-w-[180px]">
              <Button variant="outline" size="lg" fullWidth className="rounded-full border-zinc-300 bg-white px-7 text-zinc-900 hover:bg-zinc-50">
                Continue with wallet
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-zinc-300 bg-white px-7 text-zinc-900 hover:bg-zinc-50 sm:min-w-[180px]"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting wallet…" : "Connect Stellar wallet"}
            </Button>
          )}
        </div>

        <ul className="mt-8 flex flex-col items-start gap-3 text-left sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:gap-y-3">
          {trustPoints.map((point) => (
            <li key={point} className="flex items-center gap-2.5">
              <CheckIcon />
              <span className="text-sm font-medium text-zinc-700 sm:text-[15px]">{point}</span>
            </li>
          ))}
        </ul>

        <div className="relative mt-10 w-full max-w-5xl sm:mt-12 lg:mt-14">
          <div className="hidden w-full md:block">
            <Image src={AppImages.heroImageDesktop} alt="PayMilestone dashboard showing milestone progress, escrow balance, and payment actions" width={1440} height={900} priority className="h-auto w-full" sizes="(min-width: 768px) 100vw, 0px" />
          </div>
          <div className="block w-full md:hidden">
            <Image src={AppImages.heroImageMobile} alt="PayMilestone dashboard showing milestone progress, escrow balance, and payment actions" width={720} height={1200} priority className="h-auto w-full" sizes="(max-width: 767px) 100vw, 0px" />
          </div>
        </div>
      </div>
    </section>
  );
}