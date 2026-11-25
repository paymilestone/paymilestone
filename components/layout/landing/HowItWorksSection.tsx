import { cn } from "@/lib/utils";
import { Pill } from "@/components/ui/Pill";
import { Text } from "@/components/ui/Text";

type StepRole = "Owner" | "Provider" | "Automatic";

interface Step {
  number: number;
  title: string;
  description: string;
  role: StepRole;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Create the project",
    description:
      "Set the budget, the overall timeline and milestones with clear acceptance criteria.",
    role: "Owner",
  },
  {
    number: 2,
    title: "Review and sign",
    description:
      "Your provider splits the timeline into deadlines. Both of you sign the same version with your wallets.",
    role: "Provider",
  },
  {
    number: 3,
    title: "Fund a milestone",
    description:
      "Lock USDC for the next milestone in the escrow contract. No need to fund the whole budget.",
    role: "Owner",
  },
  {
    number: 4,
    title: "Submit the work",
    description:
      "Share deliverable links and evidence when the milestone is done.",
    role: "Provider",
  },
  {
    number: 5,
    title: "Review and approve",
    description:
      "Approve it, or ask for revisions. Nothing moves until you decide.",
    role: "Owner",
  },
  {
    number: 6,
    title: "Get paid",
    description:
      "Approval releases that milestone's USDC straight to the provider's wallet. Once, never twice.",
    role: "Automatic",
  },
];

const milestones = [
  {
    id: "M1",
    name: "UI/UX design",
    status: "Paid",
    amount: "400.00",
    tone: "paid" as const,
  },
  {
    id: "M2",
    name: "Frontend",
    status: "Paid",
    amount: "700.00",
    tone: "paid" as const,
  },
  {
    id: "M3",
    name: "Backend integration",
    status: "In progress",
    amount: "600.00",
    tone: "progress" as const,
  },
  {
    id: "M4",
    name: "Testing and launch",
    status: "Pending",
    amount: "300.00",
    tone: "pending" as const,
  },
];

function roleClasses(role: StepRole) {
  switch (role) {
    case "Owner":
      return "bg-[#E8F0FE] text-[#2D64C8]";
    case "Provider":
      return "bg-[#F5EAD4] text-[#B07A1C]";
    case "Automatic":
      return "bg-[#DCEEEB] text-primary";
  }
}

function StepCard({ step }: { step: Step }) {
  const automatic = step.role === "Automatic";
  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            automatic ? "bg-[#B07A1C] text-white" : "bg-primary text-white",
          )}
        >
          {step.number}
        </span>
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
            roleClasses(step.role),
          )}
        >
          {step.role}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-snug text-zinc-950">
        {step.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{step.description}</p>
    </div>
  );
}

function ExampleBuild() {
  return (
    <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-zinc-950">
            Example: website build
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            4 milestones · 2,000.00 USDC total
          </p>
        </div>
        <p className="text-sm font-medium text-zinc-700 sm:text-right">
          Paid so far{" "}
          <span className="font-bold text-primary">1,100.00 USDC</span>
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={cn(
              "rounded-2xl border px-4 py-3",
              milestone.tone === "paid" &&
                "border-[#CFE7E3] bg-[#EEF7F5]",
              milestone.tone === "progress" &&
                "border-[#ECD9AE] bg-[#FBF4E6]",
              milestone.tone === "pending" &&
                "border-zinc-200 bg-[#F7F8F8]",
            )}
          >
            <p className="text-sm font-semibold text-zinc-900">
              {milestone.id} · {milestone.name}
            </p>
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                milestone.tone === "paid" && "text-primary",
                milestone.tone === "progress" && "text-[#B07A1C]",
                milestone.tone === "pending" && "text-zinc-500",
              )}
            >
              {milestone.status} {milestone.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section className="w-full bg-[#F6F8F7]" id="how-it-works-steps">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Pill
            variant="outline"
            size="sm"
            dot
            className="border-zinc-300 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-zinc-700"
          >
            HOW IT WORKS
          </Pill>
          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
            From signed agreement to payout in six steps.
          </h2>
          <Text
            as="p"
            variant="body"
            tone="muted"
            align="center"
            className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg"
          >
            Every step is a wallet action, so both sides always know who moved and when.
          </Text>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-5">
          {steps.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </div>

        <ExampleBuild />
      </div>
    </section>
  );
}
