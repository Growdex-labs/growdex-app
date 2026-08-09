"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Plug, Rocket, SendHorizontal, Wand2 } from "lucide-react";
import { GradientSparkle } from "../campaigns/components/GradientSparkle";
import { PURPLE_GRADIENT } from "../campaigns/components/ai-campaign-theme";
import { hydrateSocialAccounts } from "@/lib/social";

const SUGGESTED_PROMPTS = [
  "Create a campaign for my business",
  "Help me get more customers",
  "Write ad copy for my campaign",
  "Help me choose a campaign objective",
];

interface GettingStartedStep {
  title: string;
  description: string;
  action?: { label: string; href: string };
  done: boolean;
}

function StepCard({ step, index }: { step: GettingStartedStep; index: number }) {
  return (
    <li className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-gilroy-semibold ${
          step.done
            ? "bg-emerald-100 text-emerald-700"
            : "bg-khaki-200 text-gray-900"
        }`}
      >
        {step.done ? <Check className="size-4" /> : index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-gilroy-semibold text-gray-900">{step.title}</p>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          {step.description}
        </p>
        {step.action && !step.done && (
          <Link
            href={step.action.href}
            className="mt-3 inline-flex rounded-lg bg-khaki-200 px-4 py-2 text-sm font-gilroy-semibold text-gray-950 transition-colors hover:bg-khaki-300"
          >
            {step.action.label}
          </Link>
        )}
      </div>
    </li>
  );
}

export function DashboardEmptyState() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [platformsConnected, setPlatformsConnected] = useState(false);

  useEffect(() => {
    let active = true;
    void hydrateSocialAccounts()
      .then((result) => {
        if (!active || !result.success || !result.data) return;
        setPlatformsConnected(
          Boolean(result.data.meta?.connected || result.data.tiktok?.connected),
        );
      })
      .catch(() => {
        // A failed lookup only means the step stays open, which is the safe default.
      });
    return () => {
      active = false;
    };
  }, []);

  const askGrowdex = (question: string) => {
    const request = question.trim();
    if (!request) return;
    router.push(
      `/panel/campaigns/new?method=ai&prompt=${encodeURIComponent(request)}`,
    );
  };

  const steps: GettingStartedStep[] = [
    {
      title: "Connect your advertising accounts",
      description: "Connect Meta and TikTok to create and publish campaigns.",
      action: { label: "Connect Accounts", href: "/panel/integrations" },
      done: platformsConnected,
    },
    {
      title: "Create your first campaign",
      description:
        "Build a campaign yourself or let Growdex AI create one for you.",
      action: { label: "Create Campaign", href: "/panel/campaigns/new" },
      done: false,
    },
    {
      title: "Launch and start growing",
      description:
        "Review your campaign, publish it, and track performance from your dashboard.",
      done: false,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <section className="rounded-2xl bg-[#f9faff] p-5 lg:p-6">
        <div className="flex items-center gap-2">
          <Rocket className="size-4 text-peru-200" />
          <h2 className="font-gilroy-semibold text-gray-950">Ready to grow?</h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Create your first campaign and let Growdex help you get started.
        </p>

        <h3 className="mt-6 text-sm font-gilroy-semibold text-gray-900">
          Get your Growdex workspace ready
        </h3>
        <ol className="mt-3 grid gap-3 lg:grid-cols-3">
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center lg:px-6">
        <Plug className="mx-auto size-10 text-lavender-50" strokeWidth={1.5} />
        <h2 className="mt-5 text-xl font-gilroy-bold text-gray-950">
          Your campaigns will appear here
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          You haven&apos;t created any campaigns yet.
        </p>
        <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-gray-500">
          With Growdex, you can create, launch, manage, and optimize your
          digital advertising campaigns from one place.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/panel/campaigns/new?method=ai"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-gilroy-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: PURPLE_GRADIENT }}
          >
            <Wand2 className="size-4" /> Create with AI
          </Link>
          <Link
            href="/panel/campaigns/new?method=manual"
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-gilroy-semibold text-gray-800 transition-colors hover:bg-gray-50"
          >
            Build Manually
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-violet-100 bg-violet-50/40 p-5 lg:p-6">
        <div className="flex items-center gap-2">
          <GradientSparkle className="size-5" />
          <h2 className="font-gilroy-semibold text-gray-950">
            What do you want to achieve?
          </h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Tell Growdex what you&apos;re trying to accomplish and we&apos;ll help
          you get started.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-violet-200 bg-white py-1.5 pl-4 pr-1.5 focus-within:border-violet-300">
          <input
            type="text"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                askGrowdex(prompt);
              }
            }}
            placeholder="Describe what you want to achieve"
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => askGrowdex(prompt)}
            disabled={!prompt.trim()}
            style={{ background: PURPLE_GRADIENT }}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Ask Growdex"
          >
            <SendHorizontal className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {SUGGESTED_PROMPTS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => askGrowdex(suggestion)}
              className="rounded-xl bg-violet-50 px-4 py-3 text-left text-sm text-violet-700 transition-colors hover:bg-violet-100"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
