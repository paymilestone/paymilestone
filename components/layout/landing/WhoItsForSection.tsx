import type { ReactNode } from "react";
import Link from "next/link";
import { AppColors } from "@/lib/app_colors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Text } from "@/components/ui/Text";
import { BenefitsStrip } from "./BenefitsStrip";

function CircleCheckIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary",
        className,
      )}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M16.704 5.29a1 1 0 010 1.415l-7.25 7.25a1 1 0 01-1.415 0l-3.25-3.25a1 1 0 111.415-1.415l2.543 2.543 6.542-6.543a1 1 0 011.415 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.96a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.96-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-zinc-500" aria-hidden="true">
      <path
        d="M8.5 11.5l3-3M7.75 6.5H6.5A3 3 0 003.5 9.5v4a3 3 0 003 3h4a3 3 0 003-3v-1.25M12.25 3.5h4.25v4.25M16.25 3.75L10.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="4.75" y="8.75" width="10.5" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 8.75V7a2.5 2.5 0 015 0v1.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface AudienceCardProps {
  background: string;
  label: string;
  title: string;
  points: string[];
  panel: ReactNode;
  ctaLabel: string;
}

function AudienceCard({
  background,
  label,
  title,
  points,
  panel,
  ctaLabel,
}: AudienceCardProps) {
  return (
    <div
      className="flex h-full flex-col rounded-3xl border border-black/5 p-5 shadow-sm sm:p-6 lg:p-7"
      style={{ background }}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-600">
        {label}
      </span>
      <h3 className="mt-2 max-w-sm text-2xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-[2rem] sm:leading-[1.15]">
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-sm leading-6 text-zinc-700 sm:text-[15px]">
            <CircleCheckIcon className="mt-0.5" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex-1">{panel}</div>
      <Link href={ctaLabel === "Accept an invite" ? "/invite" : "/app/onboarding"} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-[#0b4c49]">{ctaLabel}<ArrowRightIcon /></Link>
    </div>
  );
}

function OwnerPanel() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">M2 Â· Frontend development</p>
          <p className="mt-0.5 text-xs text-zinc-500">Submitted 10 Dec Â· 700.00 USDC in escrow</p>
        </div>
        <Pill variant="warning" size="sm" className="shrink-0 font-semibold">
          Review
        </Pill>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-700">
        <span className="flex items-center gap-2">
          <LinkIcon />
          Staging site and release notes
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button variant="outline" size="md" className="w-full rounded-xl bg-white">
          Request revisions
        </Button>
        <Button variant="primary" size="md" className="w-full rounded-xl">
          Approve and pay
        </Button>
      </div>
    </div>
  );
}

function ProviderPanel() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">In escrow for you</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">600.00 USDC</p>
          <p className="mt-1 text-xs text-zinc-500">M3 Backend integration Â· funded 12 Dec</p>
        </div>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F5EAD4] text-gold">
          <LockIcon />
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Due in 6 days</p>
            <p className="text-xs text-zinc-500">Counted from Start work</p>
          </div>
          <Button variant="primary" size="sm" className="rounded-xl px-4">
            Submit work
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WhoItsForSection() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <BenefitsStrip />

        <div className="mx-auto mt-14 max-w-3xl text-center sm:mt-16 lg:mt-20">
          <Pill
            variant="outline"
            size="sm"
            className="border-zinc-300 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-zinc-700"
          >
            WHO IT&apos;S FOR
          </Pill>
          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
            One agreement. Protection on both sides.
          </h2>
          <Text
            as="p"
            variant="body"
            tone="muted"
            align="center"
            className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg"
          >
            Owners and providers sign the same terms, see the same milestones and
            watch the same escrow balance. Nobody has to take anyone&apos;s word for it.
          </Text>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:mt-12 lg:grid-cols-2 lg:gap-6">
          <AudienceCard
            background={AppColors.cardGradientGreen}
            label="For project owners"
            title="Only pay for work you approve."
            points={[
              "Fund one milestone at a time, not the whole budget up front",
              "USDC stays in escrow until you approve the deliverable",
              "Ask for revisions or open a dispute before anything is released",
              "Invite the provider you already work with by wallet or link",
            ]}
            panel={<OwnerPanel />}
            ctaLabel="Start a project"
          />
          <AudienceCard
            background={AppColors.cardGradientGold}
            label="For service providers"
            title="Start working knowing the money is there."
            points={[
              "See each milestone funded in escrow before you begin",
              "Get paid in USDC the moment your work is approved",
              "Agree the split and deadlines before you sign anything",
              "A dispute freezes the money. Nobody can pull it back alone",
            ]}
            panel={<ProviderPanel />}
            ctaLabel="Accept an invite"
          />
        </div>
      </div>
    </section>
  );
}

