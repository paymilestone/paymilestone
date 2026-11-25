"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { AppHeader } from "@/components/layout/app/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Textarea } from "@/components/ui/Textarea";
import { useCreateProjectMutation, useProjectQuery, useUpdateProjectMutation } from "@/lib/api/hooks/useProjects";
import type { MilestoneInputRequest } from "@/lib/api/types";
import { useWallet } from "@/lib/wallet/useWallet";
import { cn } from "@/lib/utils";

const ownerNav = [
  { label: "Dashboard", href: "/app/owner" },
  { label: "Projects", href: "/app/owner/projects" },
  { label: "Transactions", href: "/app/owner/transactions" },
];

type MilestoneDraft = {
  id: string;
  title: string;
  description: string;
  amount: string;
  acceptanceCriteria: string;
  deadline: string;
};

function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6", className)}>{children}</section>;
}
function formatMoney(value: number) {
  if (!Number.isFinite(value)) return "0.00";
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function parseAmount(v: string) {
  const n = Number(String(v || "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}
function isValidStellarAddress(addr: string) {
  return /^G[A-Z2-7]{55}$/.test(addr.trim());
}
function toIsoDateInput(v?: string | null) {
  if (!v) return "";
  // accept YYYY-MM-DD or ISO datetime
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
function newMilestone(i: number): MilestoneDraft {
  return { id: `m-${Date.now()}-${i}`, title: "", description: "", amount: "0.00", acceptanceCriteria: "", deadline: "" };
}

function CreateProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("projectId") || searchParams.get("id") || "";
  const [projectId, setProjectId] = useState(initialProjectId);
  const { address, isConnected } = useWallet();
  const { data: project, isLoading: projectLoading } = useProjectQuery(projectId || undefined, { enabled: !!projectId });
  const createMutation = useCreateProjectMutation();
  const updateMutation = useUpdateProjectMutation(projectId || "pending");

  const [hydratedFromProjectId, setHydratedFromProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [providerAddress, setProviderAddress] = useState("");
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([newMilestone(1)]);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 3500);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    if (!project || hydratedFromProjectId === project.id) return;
    setProjectTitle(project.title || "");
    setDescription(project.description || "");
    setTotalBudget(project.total_budget != null ? String(project.total_budget) : "");
    setStartDate(toIsoDateInput(project.start_date));
    setEndDate(toIsoDateInput(project.end_date));
    setProviderAddress(project.provider_wallet || "");
    const ms = (project.milestones || []).slice().sort((a, b) => (a.sequence_number ?? 0) - (b.sequence_number ?? 0));
    setMilestones(ms.length ? ms.map((m, i) => ({
      id: m.id || `m-${i}`,
      title: m.title || "",
      description: m.description || "",
      amount: m.amount != null ? String(m.amount) : "0",
      acceptanceCriteria: m.acceptance_criteria || "",
      deadline: toIsoDateInput(m.deadline),
    })) : [newMilestone(1)]);
    setHydratedFromProjectId(project.id);
  }, [project, hydratedFromProjectId]);

  const allocated = useMemo(() => milestones.reduce((sum, m) => sum + parseAmount(m.amount), 0), [milestones]);
  const budgetNum = parseAmount(totalBudget);
  const differenceRaw = budgetNum - allocated;
  const differenceAbs = Math.abs(differenceRaw);
  const hasBudgetValues = budgetNum > 0 || allocated > 0;
  const isBalanced = hasBudgetValues && Math.abs(differenceRaw) < 0.00001;
  const isShort = differenceRaw > 0.00001;
  const isOver = differenceRaw < -0.00001;

  const trimmedProvider = providerAddress.trim();
  const addressTouchedInvalid = trimmedProvider.length > 0 && !isValidStellarAddress(trimmedProvider);
  const addressError = addressTouchedInvalid ? "Not a valid Stellar address. It should start with G and be 56 characters long." : "";

  const buildMilestonesPayload = (): MilestoneInputRequest[] =>
    milestones.map((m, idx) => ({
      sequence_number: idx + 1,
      title: m.title.trim(),
      description: m.description.trim(),
      acceptance_criteria: m.acceptanceCriteria.trim(),
      amount: String(parseAmount(m.amount)),
      deadline: m.deadline,
    }));

  const validateForSave = (requirePreviewReady = false) => {
    if (!isConnected || !address) return "Connect your wallet to create or save a project.";
    if (!projectTitle.trim()) return "Project title is required.";
    if (!trimmedProvider) return "Provider Stellar wallet address is required.";
    if (!isValidStellarAddress(trimmedProvider)) return "Provider wallet address is not a valid Stellar address.";
    if (!startDate || !endDate) return "Start date and end date are required.";
    if (budgetNum <= 0) return "Total budget must be greater than 0.";
    if (milestones.length === 0) return "Add at least one milestone.";
    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i];
      if (!m.title.trim()) return `Milestone ${i + 1} title is required.`;
      if (!m.deadline) return `Milestone ${i + 1} deadline is required.`;
      if (parseAmount(m.amount) <= 0) return `Milestone ${i + 1} amount must be greater than 0.`;
    }
    if (requirePreviewReady && !isBalanced) return "Milestone amounts must equal the total budget before preview.";
    return null;
  };

  const persistProject = async (mode: "draft" | "preview") => {
    setFormError(null);
    const err = validateForSave(mode === "preview");
    if (err) { setFormError(err); return null; }
    const milestonePayload = buildMilestonesPayload();
    try {
      if (!projectId) {
        const created = await createMutation.mutateAsync({
          title: projectTitle.trim(),
          description: description.trim(),
          owner_wallet: address!,
          provider_wallet: trimmedProvider,
          total_budget: String(parseAmount(totalBudget)),
          currency: "USDC",
          start_date: startDate,
          end_date: endDate,
          milestones: milestonePayload,
        });
        setProjectId(created.id);
        setHydratedFromProjectId(created.id);
        router.replace(`/app/owner/projects/new?projectId=${created.id}`);
        return created.id;
      } else {
        await updateMutation.mutateAsync({
          title: projectTitle.trim(),
          description: description.trim(),
          total_budget: String(parseAmount(totalBudget)),
          start_date: startDate,
          end_date: endDate,
          milestones: milestonePayload,
          change_summary: mode === "preview" ? "Prepared project for agreement preview" : "Saved draft changes",
        });
        return projectId;
      }
    } catch (e: any) {
      setFormError(e?.message || "Failed to save project.");
      return null;
    }
  };

  const onSaveDraft = async () => {
    const id = await persistProject("draft");
    if (id) setToastMessage("Project saved as draft.");
  };

  const onPreview = async () => {
    const id = await persistProject("preview");
    if (id) router.push(`/app/owner/projects/new/preview?projectId=${id}`);
  };

  const addMilestone = () => setMilestones((prev) => [...prev, newMilestone(prev.length + 1)]);
  const removeMilestone = (id: string) => setMilestones((prev) => (prev.length === 1 ? prev : prev.filter((m) => m.id !== id)));
  const moveMilestone = (index: number, dir: -1 | 1) => {
    setMilestones((prev) => {
      const next = [...prev]; const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1); next.splice(target, 0, item); return next;
    });
  };
  const updateMilestone = (id: string, patch: Partial<MilestoneDraft>) => setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const canPreview = isBalanced && isValidStellarAddress(trimmedProvider) && !!projectTitle.trim() && !!startDate && !!endDate && milestones.every(m => m.title.trim() && m.deadline && parseAmount(m.amount) > 0) && isConnected;

  const sidebar = (
    <div className="space-y-4">
      <SectionCard>
        <h2 className="text-lg font-semibold text-zinc-950">Budget check</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4"><dt className="text-zinc-600">Total budget</dt><dd className="font-semibold text-zinc-950">{formatMoney(budgetNum)} USDC</dd></div>
          <div className="flex items-center justify-between gap-4"><dt className="text-zinc-600">Allocated to milestones</dt><dd className="font-semibold text-zinc-950">{formatMoney(allocated)} USDC</dd></div>
          <div className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-3"><dt className="font-medium text-zinc-900">Difference</dt><dd className={cn("font-semibold", isBalanced ? "text-[#0E5E5A]" : (isShort || isOver) ? "text-[#C2412D]" : "text-zinc-950")}>{formatMoney(differenceAbs)} USDC{isShort ? " short" : isOver ? " over" : ""}</dd></div>
        </dl>
        {isBalanced ? (
          <div className="mt-4 flex items-start gap-2 text-sm font-medium text-[#0E5E5A]"><svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M6.5 10.2l2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg><p>Milestones match the total budget.</p></div>
        ) : (isShort || isOver) ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-[#C2412D]">{formatMoney(differenceAbs)} USDC is {isShort ? "not allocated" : "over the total budget"}. Milestone amounts must equal the total budget before you can preview.</div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-zinc-500">Enter a budget and milestone amounts. They must add up exactly.</p>
        )}
      </SectionCard>

      <SectionCard>
        <h2 className="text-lg font-semibold text-zinc-950">Funding model</h2>
        <p className="mt-3 text-base font-semibold text-zinc-950">Individual milestone funding</p>
        <p className="mt-2 text-sm leading-6 text-zinc-600">You fund each milestone into escrow separately, after both of you have signed.</p>
        {!isConnected ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Connect your wallet to save or preview this project.</div> : null}
        <div className="mt-5 space-y-3">
          <Button fullWidth size="lg" className={cn("h-12 rounded-xl", !canPreview && "bg-zinc-300 text-zinc-600 hover:bg-zinc-300")} disabled={!canPreview || isSaving} onClick={() => void onPreview()}>
            {isSaving ? "Saving…" : "Preview agreement"}
          </Button>
          {!canPreview && (isShort || isOver || addressError) ? <p className="text-center text-sm font-medium text-[#C2412D]">Fix the budget, dates, milestones, and wallet address to preview.</p> : null}
          <Button fullWidth variant="outline" size="lg" className="h-12 rounded-xl" onClick={() => void onSaveDraft()} disabled={isSaving || !isConnected}>
            {isSaving ? "Saving…" : "Save draft"}
          </Button>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-500">Saving and previewing call the API to persist this project draft. You can continue editing before sending for approval.</p>
        {formError ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#C2412D]">{formError}</div> : null}
      </SectionCard>
    </div>
  );

  const leaveContent = (
    <div>
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-zinc-950">Leave this page?</h2>
      <p className="mt-3 text-base leading-7 text-zinc-600">Save your latest changes as a draft before leaving, or return to projects.</p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button type="button" className="inline-flex h-11 items-center justify-center px-2 text-sm font-semibold text-red-600 hover:text-red-700 sm:mr-auto" onClick={() => { setLeaveOpen(false); router.push("/app/owner/projects"); }}>
          Leave without saving
        </button>
        <Button variant="outline" size="md" className="h-11 rounded-xl px-5" onClick={() => setLeaveOpen(false)}>Keep editing</Button>
        <Button size="md" className="h-11 rounded-xl px-5" onClick={async () => { await onSaveDraft(); setLeaveOpen(false); }} disabled={isSaving || !isConnected}>Save draft</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7F7]">
      <AppHeader navItems={ownerNav} activeHref="/app/owner/projects" />

      <main className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <nav className="text-sm font-medium text-zinc-500" aria-label="Breadcrumb">
          <Link href="/app/owner/projects" className="hover:text-zinc-700" onClick={(e) => { e.preventDefault(); setLeaveOpen(true); }}>Projects</Link>
          <span className="mx-2 text-zinc-400">/</span>
          <span className="text-zinc-700">{projectId ? "Edit project" : "New project"}</span>
        </nav>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-zinc-950 sm:text-[40px]">{projectId ? "Edit project" : "Create project"}</h1>
          <span className="inline-flex items-center rounded-md bg-zinc-200/80 px-2.5 py-1 text-xs font-semibold text-zinc-600">Draft</span>
          {projectId ? <span className="text-xs font-mono text-zinc-500">{projectId}</span> : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-600 sm:text-base">
          {isConnected ? `Connected as owner ${address?.slice(0,4)}…${address?.slice(-4)}. ` : "Connect your wallet to create this project. "}
          Changes are saved through the API when you save draft or preview.
        </p>

        {projectLoading && projectId ? (
          <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-sm text-zinc-600">Loading project…</div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="space-y-4 sm:space-y-5">
              <SectionCard>
                <h2 className="text-xl font-semibold text-zinc-950">Project details</h2>
                <p className="mt-1 text-sm text-zinc-600">The terms both of you will agree to.</p>
                <div className="mt-5 space-y-5">
                  <Input label="Project title" placeholder="e.g. Brand identity refresh" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} containerClassName="gap-2" />
                  <Textarea label="Description" placeholder="What is the project about?" value={description} onChange={(e) => setDescription(e.target.value)} containerClassName="gap-2" className="min-h-[120px]" />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input label="Total budget (USDC)" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} containerClassName="gap-2" placeholder="0.00" />
                    <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} containerClassName="gap-2" />
                    <Input label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} containerClassName="gap-2" />
                  </div>
                  <div className="rounded-xl border border-[#CFE0E8] bg-[#EAF3F8] px-4 py-3.5 text-sm leading-6 text-[#245A9C]">
                    Set a timeline for the project and each milestone. Deadlines are sent to the API as milestone due dates.
                  </div>
                </div>
              </SectionCard>

              <SectionCard>
                <h2 className="text-xl font-semibold text-zinc-950">Provider</h2>
                <p className="mt-1 text-sm text-zinc-600">Invite someone you already work with. PayMilestone is not a marketplace.</p>
                <div className="mt-5">
                  <Input label="Provider Stellar wallet address" placeholder="G..." value={providerAddress} onChange={(e) => setProviderAddress(e.target.value)} error={addressError || undefined} hint={addressError ? undefined : "Must be a valid Stellar address. You'll also get a shareable invite token/link after sending for approval."} containerClassName="gap-2" />
                </div>
              </SectionCard>

              <SectionCard>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-950">Milestones</h2>
                    <p className="mt-1 text-sm text-zinc-600">Split the work and budget into parts you can review and pay one at a time. Each milestone requires a deadline for the API.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">{milestones.length} milestone{milestones.length === 1 ? "" : "s"}</span>
                    <button type="button" onClick={addMilestone} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0E5E5A] hover:underline"><span aria-hidden="true">+</span> Add milestone</button>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {milestones.map((m, index) => (
                    <div key={m.id} className="rounded-2xl border border-zinc-200 bg-[#FCFCFC] p-4 sm:p-5">
                      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <div className="flex items-center gap-2 text-base font-semibold text-zinc-900"><span className="text-zinc-400" aria-hidden="true">≡</span> Milestone {index + 1}</div>
                          <div className="flex items-center gap-3 text-sm font-medium text-zinc-500">
                            <button type="button" onClick={() => moveMilestone(index, -1)} className="hover:text-zinc-800 disabled:opacity-40" disabled={index === 0}>Move up</button>
                            <span className="text-zinc-300">·</span>
                            <button type="button" onClick={() => moveMilestone(index, 1)} className="hover:text-zinc-800 disabled:opacity-40" disabled={index === milestones.length - 1}>Move down</button>
                            <span className="text-zinc-300">·</span>
                            <button type="button" onClick={() => removeMilestone(m.id)} className="font-semibold text-red-600 hover:text-red-700 disabled:opacity-40" disabled={milestones.length === 1}>Remove</button>
                          </div>
                        </div>
                        <div className="grid w-full gap-3 sm:max-w-[360px] sm:grid-cols-2">
                          <Input label="Amount (USDC)" value={m.amount} onChange={(e) => updateMilestone(m.id, { amount: e.target.value })} containerClassName="gap-2" />
                          <Input label="Deadline" type="date" value={m.deadline} onChange={(e) => updateMilestone(m.id, { deadline: e.target.value })} containerClassName="gap-2" />
                        </div>
                      </div>
                      <div className="mt-4 space-y-4">
                        <Input label="Milestone title" placeholder="e.g. Logo concepts" value={m.title} onChange={(e) => updateMilestone(m.id, { title: e.target.value })} containerClassName="gap-2" />
                        <Textarea label="Description" placeholder="What this milestone covers" value={m.description} onChange={(e) => updateMilestone(m.id, { description: e.target.value })} containerClassName="gap-2" className="min-h-[110px]" />
                        <Textarea label="Acceptance criteria" placeholder="How you will judge it done" value={m.acceptanceCriteria} onChange={(e) => updateMilestone(m.id, { acceptanceCriteria: e.target.value })} containerClassName="gap-2" className="min-h-[110px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <div className="lg:hidden">{sidebar}</div>
            </div>

            <aside className="hidden lg:block lg:sticky lg:top-24">{sidebar}</aside>
          </div>
        )}
      </main>

      {toastMessage ? (
        <div className="pointer-events-none fixed left-1/2 top-5 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 sm:left-auto sm:right-6 sm:top-6 sm:translate-x-0">
          <div className="pointer-events-auto rounded-lg bg-[#16A34A] px-4 py-3 text-sm font-medium text-white shadow-lg">{toastMessage}</div>
        </div>
      ) : null}

      {isDesktop ? (
        <Modal open={leaveOpen} onClose={() => setLeaveOpen(false)} size="md" showCloseButton={false}>{leaveContent}</Modal>
      ) : (
        <BottomSheet open={leaveOpen} onClose={() => setLeaveOpen(false)} showCloseButton={false} showHandle>{leaveContent}</BottomSheet>
      )}
    </div>
  );
}

export default function CreateProjectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F7F7]" />}>
      <CreateProjectContent />
    </Suspense>
  );
}