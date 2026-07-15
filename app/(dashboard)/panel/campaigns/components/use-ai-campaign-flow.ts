"use client";

import { useEffect, useRef, useState } from "react";

// "pending" steps haven't started. "loading" = AI working on its own (timer).
// "awaiting" = AI needs the user to make a selection before it can finish.
export type StepStatus =
  | "pending"
  | "loading"
  | "awaiting"
  | "review"
  | "approved";

export interface AiStep {
  id: string;
  title: string; // used for the default "{title} complete" heading
  label: string; // the "✦ {label}" descriptor above the block
  reason: string; // sent to the chat when "Why this?" is clicked
  status: StepStatus;
  result?: string; // completion heading override (e.g. a result statement)
  detail?: string; // extra line shown in a light bubble under the bar
  chips?: string[]; // small chips under the bar (e.g. an age range)
  question?: string; // present => interactive, waits for user selection
  options?: string[];
  answer?: string[]; // what the user selected
}

// How long an autonomous step "generates" before completing.
const MIN_STEP_MS = 10_000;
const MAX_STEP_MS = 30_000;

// An interactive step (has a question) waits for the user; others run on a timer.
const startStatus = (step: AiStep): StepStatus =>
  step.question ? "awaiting" : "loading";

const INITIAL_STEPS: AiStep[] = [
  {
    id: "setup",
    title: "Setup campaign",
    label: "Getting started...",
    reason:
      "We named the campaign and set up its structure based on your prompt so the next steps have a foundation to build on.",
    status: "loading",
  },
  {
    id: "goals",
    title: "Set campaign goals",
    label: "Setting campaign goals",
    result: "Campaign goals complete",
    reason:
      "We ask for your objective directly because it drives budget, targeting and optimization for the whole campaign.",
    status: "pending",
    question: "What are your campaign goals?",
    options: [
      "Lead Generation",
      "Traffic",
      "Brand Awareness",
      "Sales",
      "Tell us in detail",
    ],
  },
  {
    id: "platform",
    title: "Choose platform",
    label: "Choosing the optimal platforms",
    result: "Platforms chosen is TikTok and Meta",
    detail: "Your campaign is for a Real estate with a video.",
    reason:
      "Selecting the platforms where your audience is most active for the chosen objective.",
    status: "pending",
  },
  {
    id: "audience",
    title: "Target audience",
    label: "Choosing your optimal audience",
    result: "25-35 is the most optimized audience for your campaign",
    chips: ["25", "35"],
    reason:
      "This age range shows the strongest intent for your objective based on similar campaigns.",
    status: "pending",
  },
  {
    id: "budget",
    title: "Budget and schedule",
    label: "Setting up budget",
    result: "Budget set up of ₦6,700.00 per day",
    reason:
      "Recommending a budget and flight dates that give the campaign enough room to learn and perform.",
    status: "pending",
  },
  {
    id: "creative",
    title: "Creative setup",
    label: "Preparing creatives",
    result: "Creative setup complete",
    reason:
      "Drafting ad copy and creative direction aligned with your brand and objective.",
    status: "pending",
  },
];

export function useAiCampaignFlow() {
  const [steps, setSteps] = useState<AiStep[]>(() =>
    INITIAL_STEPS.map((s, i) =>
      i === 0 ? { ...s, status: startStatus(s) } : s,
    ),
  );

  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Complete a step and start the next pending one.
  const completeAndAdvance = (
    prev: AiStep[],
    id: string,
    patch: Partial<AiStep> = {},
  ): AiStep[] => {
    const index = prev.findIndex((s) => s.id === id);
    return prev.map((s, i) => {
      if (s.id === id) return { ...s, status: "review", ...patch };
      if (i === index + 1 && s.status === "pending")
        return { ...s, status: startStatus(s) };
      return s;
    });
  };

  // Only autonomous ("loading") steps get a timer; interactive steps wait.
  useEffect(() => {
    steps.forEach((step) => {
      if (step.status !== "loading" || timersRef.current[step.id]) return;

      const delay = MIN_STEP_MS + Math.random() * (MAX_STEP_MS - MIN_STEP_MS);
      timersRef.current[step.id] = setTimeout(() => {
        delete timersRef.current[step.id];
        setSteps((prev) => completeAndAdvance(prev, step.id));
      }, delay);
    });
  }, [steps]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
      // Empty the map so React Strict Mode's remount reschedules the timers
      // instead of seeing stale (already-cleared) ids and skipping them.
      timersRef.current = {};
    };
  }, []);

  const approve = (id: string) =>
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "approved" } : s)),
    );

  const decline = (id: string) =>
    setSteps((prev) =>
      prev.map((s) =>
        // Regenerate: interactive steps re-ask, autonomous ones re-run.
        s.id === id ? { ...s, status: startStatus(s) } : s,
      ),
    );

  const updateReason = (id: string, reason: string) =>
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, reason } : s)),
    );

  // The user answered an interactive step; complete it and move on.
  const answerQuestion = (id: string, answer: string[]) =>
    setSteps((prev) => completeAndAdvance(prev, id, { answer }));

  const awaiting = steps.find((s) => s.status === "awaiting");
  const activeQuestion = awaiting
    ? {
        id: awaiting.id,
        question: awaiting.question ?? "",
        options: awaiting.options ?? [],
      }
    : null;

  // Every step has finished generating (nothing pending/loading/awaiting).
  const allDone = steps.every(
    (s) => s.status === "review" || s.status === "approved",
  );

  return {
    steps,
    approve,
    decline,
    updateReason,
    activeQuestion,
    answerQuestion,
    allDone,
  };
}
