"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VoiceInput } from "@/components/voice-input";
import { OnboardingModal } from "@/components/onboarding-modal";
import {
  getStoredSettings,
  AccessibilitySettings,
  DEFAULT_SETTINGS,
  getActiveTaskState,
  ActiveTaskState,
  getStoredSavedTips,
  SavedTipItem,
} from "@/lib/storage";
import { TRANSLATIONS } from "@/lib/translations";
import { routeUserIntent } from "@/lib/ai/intent-router";
import {
  HelpCircle,
  FileText,
  ShieldAlert,
  ListChecks,
  Bell,
  ArrowRight,
  Sparkles,
  Camera,
  Lightbulb,
  Play,
  RotateCcw,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [askQuery, setAskQuery] = useState("");
  const [activeTask, setActiveTask] = useState<ActiveTaskState | null>(null);
  const [savedTipsCount, setSavedTipsCount] = useState<number>(0);

  useEffect(() => {
    setSettings(getStoredSettings());
    setActiveTask(getActiveTaskState());
    setSavedTipsCount(getStoredSavedTips().length);
  }, []);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;

    // Use smart intent router
    const routed = routeUserIntent(askQuery.trim());
    if (routed.intent === "REMINDER" && routed.extractedDetails?.reminderTitle) {
      router.push(`/reminders?title=${encodeURIComponent(routed.extractedDetails.reminderTitle)}`);
    } else if (routed.intent === "SAFETY_CHECK") {
      router.push(`/safety?q=${encodeURIComponent(askQuery.trim())}`);
    } else if (routed.intent === "SIMPLIFY") {
      router.push(`/simplify?q=${encodeURIComponent(askQuery.trim())}`);
    } else if (routed.intent === "GUIDED_TASK") {
      router.push(`/guide?task=${encodeURIComponent(routed.extractedDetails?.targetTask || askQuery.trim())}`);
    } else {
      router.push(`/ask?q=${encodeURIComponent(askQuery.trim())}`);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setAskQuery(text);
    if (text.trim()) {
      const routed = routeUserIntent(text.trim());
      if (routed.intent === "SAFETY_CHECK") {
        router.push(`/safety?q=${encodeURIComponent(text.trim())}`);
      } else {
        router.push(`/ask?q=${encodeURIComponent(text.trim())}`);
      }
    }
  };

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.English;

  return (
    <div className="space-y-8 pb-8">
      {/* First-time setup onboarding */}
      <OnboardingModal />

      {/* Main Greeting Banner */}
      <section className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-emerald-900 space-y-6">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-amber-400 text-emerald-950 rounded-full font-black text-xs uppercase tracking-wider">
            Digital Companion
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            What can I help you with today? 👋
          </h2>
          <p className="text-lg sm:text-xl text-emerald-100 max-w-2xl">
            Ask any question, paste a message, or tell Saathi what you'd like to do.
          </p>
        </div>

        {/* Large Conversational Input */}
        <form onSubmit={handleAskSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <input
              type="text"
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              placeholder="e.g. Is this bank message real? or Remind me to call doctor tomorrow"
              className="w-full h-16 pl-5 pr-14 rounded-2xl bg-white text-zinc-900 placeholder:text-zinc-500 font-semibold text-lg sm:text-xl shadow-inner border-2 border-amber-300 focus:outline-hidden focus:ring-4 focus:ring-amber-400"
            />
          </div>
          <div className="flex gap-2">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              language={settings.language}
            />
            <button
              type="submit"
              className="h-16 px-6 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-lg sm:text-xl rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 min-w-[100px] active:scale-95"
            >
              Ask <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </form>
      </section>

      {/* Continue Where You Left Off Card if Active Task Exists */}
      {activeTask && (
        <div className="bg-amber-100 dark:bg-amber-950/60 border-3 border-amber-400 rounded-3xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-3 py-1 bg-amber-400 text-amber-950 font-black text-xs uppercase rounded-full">
              Continue your task
            </span>
            <h3 className="text-2xl font-black text-amber-950 dark:text-amber-100">
              {activeTask.title}
            </h3>
            <p className="text-base font-semibold text-amber-900 dark:text-amber-200">
              You were at Step {activeTask.currentStepIndex + 1} of {activeTask.totalSteps}
            </p>
          </div>

          <button
            onClick={() => router.push(`/guide?task=${encodeURIComponent(activeTask.taskGoal)}`)}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-lg rounded-2xl shadow-md flex items-center gap-2 min-h-[52px]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Continue Task</span>
          </button>
        </div>
      )}

      {/* SAATHI LENS BANNER */}
      <Link
        href="/lens"
        className="group bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 border-3 border-blue-600 shadow-xl flex items-center justify-between gap-4 hover:scale-[1.01] transition-transform focus:ring-4 focus:ring-amber-400"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center shrink-0 shadow-md">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black tracking-tight text-white">Saathi Lens</h3>
              <span className="px-2.5 py-0.5 bg-amber-400 text-blue-950 rounded-full font-black text-xs uppercase">
                Show & Tell
              </span>
            </div>
            <p className="text-blue-200 text-base sm:text-lg font-medium">
              Upload a screenshot, device screen, or document photo for instant plain explanation.
            </p>
          </div>
        </div>
        <ArrowRight className="w-7 h-7 text-amber-400 shrink-0 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* 4 GOAL-ORIENTED ACTION CARDS */}
      <section className="space-y-4">
        <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-amber-500" />
          How Saathi Can Help
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Goal 1: Understand Something (Simplify) */}
          <Link
            href="/simplify"
            className="group bg-white dark:bg-zinc-800 p-6 rounded-3xl border-3 border-emerald-300 dark:border-zinc-700 shadow-md hover:shadow-xl hover:border-emerald-600 transition-all flex flex-col justify-between space-y-4 focus:ring-4 focus:ring-amber-400"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black group-hover:text-blue-700 dark:group-hover:text-blue-400">
                Understand Something
              </h4>
              <p className="text-zinc-600 dark:text-zinc-300 font-medium text-base sm:text-lg">
                Make confusing bank messages, bills, or official notices easy to read.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 font-bold text-blue-800 dark:text-blue-400">
              Simplify Message <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Goal 2: Check Something (Safety) */}
          <Link
            href="/safety"
            className="group bg-amber-50 dark:bg-amber-950/40 p-6 rounded-3xl border-3 border-amber-300 dark:border-amber-800 shadow-md hover:shadow-xl hover:border-amber-500 transition-all flex flex-col justify-between space-y-4 focus:ring-4 focus:ring-amber-400"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black text-amber-950 dark:text-amber-200 group-hover:text-amber-700">
                Check Something
              </h4>
              <p className="text-amber-900/80 dark:text-amber-200/80 font-medium text-base sm:text-lg">
                Check if a suspicious SMS, email, link, or request looks like a scam.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
              Check Message Safety <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Goal 3: Guide Me (Guided Task) */}
          <Link
            href="/guide"
            className="group bg-white dark:bg-zinc-800 p-6 rounded-3xl border-3 border-emerald-300 dark:border-zinc-700 shadow-md hover:shadow-xl hover:border-emerald-600 transition-all flex flex-col justify-between space-y-4 focus:ring-4 focus:ring-amber-400"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
                <ListChecks className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black group-hover:text-teal-700 dark:group-hover:text-teal-400">
                Guide Me Through It
              </h4>
              <p className="text-zinc-600 dark:text-zinc-300 font-medium text-base sm:text-lg">
                Get calm, step-by-step help with phone settings, payments, or apps.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 font-bold text-teal-800 dark:text-teal-400">
              Start Guided Steps <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Goal 4: Remember Something (Reminders) */}
          <Link
            href="/reminders"
            className="group bg-white dark:bg-zinc-800 p-6 rounded-3xl border-3 border-emerald-300 dark:border-zinc-700 shadow-md hover:shadow-xl hover:border-emerald-600 transition-all flex flex-col justify-between space-y-4 focus:ring-4 focus:ring-amber-400"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold">
                <Bell className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black group-hover:text-purple-700 dark:group-hover:text-purple-400">
                Remember Something
              </h4>
              <p className="text-zinc-600 dark:text-zinc-300 font-medium text-base sm:text-lg">
                Set simple reminders for medicines, doctor appointments, and bills.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 font-bold text-purple-800 dark:text-purple-400">
              Manage Reminders <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* MY DIGITAL CONFIDENCE CARDS QUICK LINK */}
      {savedTipsCount > 0 && (
        <Link
          href="/tips"
          className="bg-emerald-100 dark:bg-zinc-800 border-2 border-emerald-300 dark:border-zinc-700 rounded-3xl p-5 flex items-center justify-between gap-4 text-emerald-950 dark:text-emerald-200 hover:border-emerald-500 transition-all"
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="w-7 h-7 text-amber-500 shrink-0" />
            <div>
              <p className="font-black text-xl">My Confidence Cards ({savedTipsCount})</p>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                View your saved safety tips and digital guidance lessons.
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-emerald-700 shrink-0" />
        </Link>
      )}
    </div>
  );
}
