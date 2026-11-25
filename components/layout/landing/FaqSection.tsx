"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Pill } from "@/components/ui/Pill";
import { Text } from "@/components/ui/Text";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Do I need crypto experience?",
    answer:
      "You need a Stellar wallet that holds USDC. PayMilestone checks your wallet is ready and walks you through each signature. Providers only need a wallet that can receive USDC.",
  },
  {
    question: "What happens if we disagree about the work?",
    answer:
      "Either side can open a dispute on a funded milestone. The escrowed funds stay frozen until you both agree on a resolution such as full payout, full refund, or a split.",
  },
  {
    question: "Can I find freelancers on PayMilestone?",
    answer:
      "PayMilestone is not a marketplace. You bring your own client or provider and use the platform to agree terms, fund milestones, and manage payouts securely.",
  },
  {
    question: "Can the terms change after we both sign?",
    answer:
      "Changes to amounts, deadlines, or payment conditions require both parties to review and sign again. Funded milestones remain locked under the agreed terms.",
  },
  {
    question: "What if the project is cancelled?",
    answer:
      "If work stops, any unfunded milestones do not need to be paid. For funded milestones, you can resolve outcomes based on what was delivered or use the dispute flow if needed.",
  },
];

function MinusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M5.75 10h8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M10 5.75v8.5M5.75 10h8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section className="w-full bg-[#F6F8F7]" id="faq">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
          <div>
            <Pill
              variant="outline"
              size="sm"
              dot
              className="border-zinc-300 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-zinc-700"
            >
              FAQ
            </Pill>
            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
              Questions, answered.
            </h2>
            <Text
              as="p"
              variant="body"
              tone="muted"
              className="mt-4 max-w-md text-base leading-7 text-zinc-600 sm:text-lg"
            >
              Still unsure? Start a project as a draft. Nothing is sent or
              funded until you choose to.
            </Text>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const buttonId = `faq-button-${index}`;
              const panelId = `faq-panel-${index}`;
              return (
                <div
                  key={faq.question}
                  className={cn(
                    "rounded-2xl border bg-white transition-colors",
                    isOpen
                      ? "border-[#8BCFC7] shadow-sm"
                      : "border-zinc-200 hover:border-zinc-300",
                  )}
                >
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left sm:px-5 sm:py-5"
                  >
                    <span className="text-base font-semibold leading-6 text-zinc-950 sm:text-lg">
                      {faq.question}
                    </span>
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                        isOpen
                          ? "border-primary bg-primary text-white"
                          : "border-zinc-300 bg-white text-zinc-600",
                      )}
                    >
                      {isOpen ? <MinusIcon /> : <PlusIcon />}
                    </span>
                  </button>
                  {isOpen ? (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="px-4 pb-4 sm:px-5 sm:pb-5"
                    >
                      <p className="max-w-3xl text-sm leading-6 text-zinc-600 sm:text-[15px]">
                        {faq.answer}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
