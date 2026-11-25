"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppImages } from "@/lib/app_images";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function extractToken(value: string) {
  const v = value.trim();
  if (!v) return "";
  try {
    const url = new URL(v.startsWith("http") ? v : `https://${v}`);
    const token = url.searchParams.get("token") || url.searchParams.get("invite");
    if (token) return token;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  } catch {}
  return v;
}

function OpenInviteContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const initial = sp.get("token") || sp.get("invite") || "";
  const [value, setValue] = useState(initial);

  useEffect(() => { if (initial) setValue(initial); }, [initial]);

  const token = extractToken(value);
  const continueHref = token ? `/invite/setup?token=${encodeURIComponent(token)}` : "";

  return (
    <main className="min-h-screen bg-[#EAF3F1]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-2 sm:py-3">
          <Link href="/" className="flex items-center" aria-label="PayMilestone home">
            <Image src={AppImages.logo} alt="PayMilestone" width={140} height={28} className="h-7 w-auto" priority />
          </Link>
          <Link href="/" className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 bg-white/70 px-4 text-sm font-medium text-zinc-800 transition-colors hover:bg-white">Back to home</Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-8 sm:py-12">
          <div className="w-full max-w-[560px] rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F1EF] text-[#0E5E5A]">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true"><path d="M10.5 13.5L13.5 10.5M8.25 9.75l-1.06 1.06a4.5 4.5 0 106.36 6.36l1.06-1.06M15.75 14.25l1.06-1.06a4.5 4.5 0 10-6.36-6.36L9.39 7.89" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>

            <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-[#6B7280]">FOR SERVICE PROVIDERS</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[40px]">Open your invite</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-zinc-600">Paste the invite link or token your project owner sent you. We&apos;ll load the project from the API and help you get set up.</p>

            <div className="mt-6">
              <Input label="Invite link or token" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Paste invite link or token" containerClassName="gap-2" className="text-[15px] text-zinc-800" />
            </div>

            {token ? (
              <div className="mt-4 rounded-2xl border border-[#CFE3DE] bg-[#EDF6F3] p-4 sm:p-5">
                <p className="text-sm font-semibold text-[#0E5E5A]">Token detected</p>
                <p className="mt-2 break-all font-mono text-sm text-zinc-800">{token}</p>
                <p className="mt-2 text-sm text-zinc-600">Continue to load the invitation details for this token.</p>
              </div>
            ) : null}

            <div className="mt-6">
              <Button fullWidth size="lg" className="h-12 rounded-2xl text-base" disabled={!continueHref} onClick={() => { if (continueHref) router.push(continueHref); }}>Continue</Button>
            </div>

            <p className="mt-6 text-center text-sm leading-6 text-zinc-500"><span className="font-medium text-zinc-600">No link?</span> Ask the person paying you to resend it from their project. Providers can only join a project they&apos;ve been invited to.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OpenInvitePage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#EAF3F1]" />}><OpenInviteContent /></Suspense>;
}