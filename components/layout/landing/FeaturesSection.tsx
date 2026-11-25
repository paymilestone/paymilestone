import type { ReactNode } from "react";
import { AppColors } from "@/lib/app_colors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { Text } from "@/components/ui/Text";

function FeatureCard({
  title,
  description,
  children,
  className,
  contentClassName,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-3xl border border-zinc-200/80 bg-[#F8FAF9] p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <h3 className="text-lg font-bold leading-snug tracking-tight text-zinc-950 sm:text-xl">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 sm:text-[15px]">
        {description}
      </p>
      <div className={cn("mt-5 flex-1", contentClassName)}>{children}</div>
    </div>
  );
}

function MiniStatusRow({
  label,
  status,
  tone = "success",
}: {
  label: string;
  status: string;
  tone?: "success" | "neutral";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <span
        className={cn(
          "rounded-md px-2 py-0.5 text-xs font-semibold",
          tone === "success"
            ? "bg-[#DCEEEB] text-primary"
            : "bg-zinc-100 text-zinc-600",
        )}
      >
        {status}
      </span>
    </div>
  );
}

function AgreementMock() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900">
          Agreement · version 2
        </p>
      </div>
      <div className="space-y-2">
        <MiniStatusRow label="Project owner" status="Approved" />
        <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
          <span className="text-sm font-medium text-zinc-800">
            Service provider
          </span>
          <span className="rounded-md bg-[#DCEEEB] px-2 py-0.5 text-xs font-semibold text-primary">
            Signed
          </span>
        </div>
      </div>
    </div>
  );
}

function FundingMock() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-900">
            M3 · Backend integration
          </p>
          <p className="mt-1 text-xs text-zinc-500">Wallet balance</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-zinc-950">600.00 USDC</p>
          <p className="mt-1 text-xs text-zinc-500">3,250.00 USDC</p>
        </div>
      </div>
      <div className="mt-4">
        <Button variant="primary" fullWidth className="rounded-xl">
          Fund milestone
        </Button>
      </div>
    </div>
  );
}

function ReviewMock() {
  const items = [
    "Design file · final screens",
    "Handoff notes",
    "Staging link",
  ];
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-700">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 text-zinc-500">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 010 1.415l-7.25 7.25a1 1 0 01-1.415 0l-3.25-3.25a1 1 0 111.415-1.415l2.543 2.543 6.542-6.543a1 1 0 011.415 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Pill
          variant="warning"
          size="sm"
          className="bg-[#FDEAD2] text-[#A16207] font-semibold"
        >
          Revision requested
        </Pill>
      </div>
    </div>
  );
}

function DisputeMock() {
  return (
    <div
      className="rounded-2xl border p-4 sm:p-5"
      style={{
        backgroundColor: AppColors.subtleDanger,
        borderColor: "#F1C7C3",
      }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-danger/40 text-danger">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3" aria-hidden="true">
            <path d="M10 2.75a7.25 7.25 0 100 14.5 7.25 7.25 0 000-14.5zM9.25 6.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7.25a.9.9 0 110-1.8.9.9 0 010 1.8z" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-900">Payout frozen on M2</p>
          <p className="mt-0.5 text-sm text-zinc-700">
            600.00 USDC held until you both settle
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Pay provider
        </button>
        <button
          type="button"
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Refund owner
        </button>
        <button
          type="button"
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Split 60/40
        </button>
      </div>
    </div>
  );
}

function RecordMock() {
  const rows = [
    {
      label: "Payout · M2 Frontend",
      amount: "+700.00 USDC",
      amountClass: "text-primary",
      iconBg: "bg-[#DCEEEB] text-primary",
      icon: "↗",
    },
    {
      label: "Funded · M3 Backend",
      amount: "600.00 USDC",
      amountClass: "text-zinc-900",
      iconBg: "bg-blue-light text-blue",
      icon: "🔒",
    },
    {
      label: "Refund · M4 Testing",
      amount: "300.00 USDC",
      amountClass: "text-zinc-900",
      iconBg: "bg-[#F5EAD4] text-gold",
      icon: "↩",
    },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm sm:p-3">
      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 sm:px-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={cn(
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm",
                  row.iconBg,
                )}
                aria-hidden="true"
              >
                {row.icon}
              </span>
              <span className="truncate text-sm font-medium text-zinc-800">
                {row.label}
              </span>
            </div>
            <span className={cn("shrink-0 text-sm font-semibold", row.amountClass)}>
              {row.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className="w-full bg-[#F6F8F7]" id="how-it-works">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Pill
            variant="outline"
            size="sm"
            className="border-zinc-300 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-zinc-700"
          >
            FEATURES
          </Pill>
          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
            Everything a milestone needs.
          </h2>
          <Text
            as="p"
            variant="body"
            tone="muted"
            align="center"
            className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg"
          >
            Clear terms, locked funds, honest reviews and a record both sides can check.
          </Text>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          <FeatureCard
            title="Both sides sign the same terms"
            description="Wallet signatures on one version of the agreement. Change an amount or deadline and it goes back for approval."
          >
            <AgreementMock />
          </FeatureCard>

          <FeatureCard
            title="Fund one milestone at a time"
            description="Lock only what the next milestone needs. Your budget isn't tied up before the work starts."
          >
            <FundingMock />
          </FeatureCard>

          <FeatureCard
            title="Review with real evidence"
            description="Providers submit links and notes. Owners approve, or ask for revisions with a comment."
          >
            <ReviewMock />
          </FeatureCard>

          <FeatureCard
            title="Disputes freeze the payout"
            description="Either side can open a dispute on a funded milestone. The money stays put until you both agree on full payout, full refund or a split."
            className="lg:col-span-1 md:col-span-2 lg:col-span-1"
          >
            <DisputeMock />
          </FeatureCard>

          <FeatureCard
            title="A record both sides can check"
            description="Every funding, payout and refund lands on the Stellar ledger with a link to the explorer."
            className="md:col-span-2"
          >
            <RecordMock />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
