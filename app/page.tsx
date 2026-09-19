"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VoiceInput } from "@/components/voice-input";
import { OnboardingModal } from "@/components/onboarding-modal";
import { DigitalGuardianModal } from "@/components/digital-guardian";
import { SaathiCircleModal } from "@/components/saathi-circle-modal";
import { DictionaryModal } from "@/components/dictionary-modal";
import {
  getStoredSettings,
  AccessibilitySettings,
  DEFAULT_SETTINGS,
  getActiveTaskState,
  ActiveTaskState,
  getStoredSavedTips,
  getStoredReminders,
  ReminderItem,
} from "@/lib/storage";
import { TRANSLATIONS } from "@/lib/translations";
import { routeUserIntent } from "@/lib/ai/intent-router";
import { scanWithDigitalGuardian, GuardianScanResult } from "@/lib/ai/guardian";
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
  Users,
  BookOpen,
  Feather,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [askQuery, setAskQuery] = useState("");
  const [activeTask, setActiveTask] = useState<ActiveTaskState | null>(null);
  const [savedTipsCount, setSavedTipsCount] = useState<number>(0);
  const [activeReminders, setActiveReminders] = useState<ReminderItem[]>([]);

  // Modals state
  const [guardianScanResult, setGuardianScanResult] = useState<GuardianScanResult | null>(null);
  const [pendingSubmitQuery, setPendingSubmitQuery] = useState<string>("");
  const [isCircleOpen, setIsCircleOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);

  useEffect(() => {
    setSettings(getStoredSettings());
    setActiveTask(getActiveTaskState());
    setSavedTipsCount(getStoredSavedTips().length);
    setActiveReminders(getStoredReminders().filter((r) => !r.completed));
  }, []);

  const executeQueryRouting = (text: string) => {
    const routed = routeUserIntent(text);
    if (routed.intent === "PRACTICE") {
      router.push("/practice");
    } else if (routed.intent === "DICTIONARY" && routed.extractedDetails?.dictionaryTerm) {
      setIsDictionaryOpen(true);
    } else if (routed.intent === "REMINDER" && routed.extractedDetails?.reminderTitle) {
      router.push(`/reminders?title=${encodeURIComponent(routed.extractedDetails.reminderTitle)}`);
    } else if (routed.intent === "SAFETY_CHECK") {
      router.push(`/safety?q=${encodeURIComponent(text)}`);
    } else if (routed.intent === "SIMPLIFY") {
      router.push(`/simplify?q=${encodeURIComponent(text)}`);
    } else if (routed.intent === "GUIDED_TASK") {
      router.push(`/guide?task=${encodeURIComponent(routed.extractedDetails?.targetTask || text)}`);
    } else {
      router.push(`/ask?q=${encodeURIComponent(text)}`);
    }
  };

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;

    // Digital Guardian proactive scan
    const scan = scanWithDigitalGuardian(askQuery.trim());
    if (scan && scan.hasHighRisk) {
      setGuardianScanResult(scan);
      setPendingSubmitQuery(askQuery.trim());
      return;
    }

    executeQueryRouting(askQuery.trim());
  };

  const handleVoiceTranscript = (text: string) => {
    setAskQuery(text);
    if (text.trim()) {
      const scan = scanWithDigitalGuardian(text.trim());
      if (scan && scan.hasHighRisk) {
        setGuardianScanResult(scan);
        setPendingSubmitQuery(text.trim());
        return;
      }
      executeQueryRouting(text.trim());
    }
  };

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.English;

  return (
    <div className="space-y-8 pb-8">
      {/* First-time setup onboarding */}
      <OnboardingModal />

      {/* Digital Guardian Interruption Shield */}
      <DigitalGuardianModal
        scanResult={guardianScanResult}
        onCheckSafety={() => {
          setGuardianScanResult(null);
          router.push(`/safety?q=${encodeURIComponent(pendingSubmitQuery)}`);
        }}
        onProceedAnyway={() => {
          setGuardianScanResult(null);
          executeQueryRouting(pendingSubmitQuery);
        }}
        onClose={() => setGuardianScanResult(null)}
      />

      {/* Saathi Circle Modal */}
      <SaathiCircleModal
        isOpen={isCircleOpen}
        onClose={() => setIsCircleOpen(false)}
      />

      {/* Digital Dictionary Modal */}
      <DictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />

      {/* Main Greeting Banner */}
      <section className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-emerald-900 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 bg-amber-400 text-emerald-950 rounded-full font-black text-xs uppercase tracking-wider">
              {t.appName}
            </span>
            {settings.calmMode && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-200 rounded-full font-semibold text-xs border border-emerald-500/30">
                <Feather className="w-3.5 h-3.5" />
                <span>Calm Mode Active</span>
              </span>
            )}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Namaste. What can I help you with today? 👋
          </h2>
          <p className="text-lg sm:text-xl text-emerald-100 max-w-2xl">
            Ask any question, paste a message, or speak to SeniorSaathi in {settings.language}.
          </p>
        </div>

        {/* Large Conversational Input */}
        <form onSubmit={handleAskSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <input
              type="text"
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              placeholder="e.g. Is this bank message real? or How to connect Wi-Fi?"
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
              className="h-16 px-6 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-lg sm:text-xl rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 min-w-[100px] active:scale-95 cursor-pointer"
            >
              Ask <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </form>
      </section>

      {/* TODAY WITH SAATHI - REAL STATE SUMMARY */}
      <section className="rounded-3xl bg-[var(--surface)] p-6 border border-[var(--border)] shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>Today with Saathi</span>
          </h3>
          <span className="text-xs text-[var(--foreground)]/60 font-semibold">
            Real Local Companion Updates
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Reminders summary */}
          <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-1">
            <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400">
              Active Reminders
            </span>
            <p className="text-lg font-bold">
              {activeReminders.length > 0 ? `${activeReminders.length} reminder(s)` : "No pending reminders"}
            </p>
            {activeReminders.length > 0 && (
              <p className="text-xs text-[var(--foreground)]/70 truncate">Next: {activeReminders[0].title}</p>
            )}
          </div>

          {/* Active Task summary */}
          <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-1">
            <span className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400">
              Current Guided Task
            </span>
            <p className="text-lg font-bold">
              {activeTask ? activeTask.title : "No active task"}
            </p>
            {activeTask && (
              <p className="text-xs text-[var(--foreground)]/70">Step {activeTask.currentStepIndex + 1} of {activeTask.totalSteps}</p>
            )}
          </div>

          {/* Saved Tips summary */}
          <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-1">
            <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">
              Saved Confidence Cards
            </span>
            <p className="text-lg font-bold">{savedTipsCount} digital tip(s)</p>
            <p className="text-xs text-[var(--foreground)]/70">Stored safely on device</p>
          </div>
        </div>
      </section>

      {/* QUICK COMPANION ACTIONS: PRACTICE, SAATHI CIRCLE, DICTIONARY */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/practice"
          className="p-5 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 hover:border-emerald-500 transition-all flex items-center gap-4 cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-base">Practice with Saathi</h4>
            <p className="text-xs text-[var(--foreground)]/70">Safe digital simulations</p>
          </div>
        </Link>

        <button
          onClick={() => setIsCircleOpen(true)}
          className="p-5 rounded-3xl bg-blue-500/10 border-2 border-blue-500/30 hover:border-blue-500 transition-all flex items-center gap-4 text-left cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-base">Saathi Circle</h4>
            <p className="text-xs text-[var(--foreground)]/70">Ask Someone I Trust</p>
          </div>
        </button>

        <button
          onClick={() => setIsDictionaryOpen(true)}
          className="p-5 rounded-3xl bg-purple-500/10 border-2 border-purple-500/30 hover:border-purple-500 transition-all flex items-center gap-4 text-left cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-base">Digital Dictionary</h4>
            <p className="text-xs text-[var(--foreground)]/70">OTP, UPI, QR, Wi-Fi defined</p>
          </div>
        </button>
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
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-lg rounded-2xl shadow-md flex items-center gap-2 min-h-[52px] cursor-pointer"
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

        <div className={`grid gap-5 ${settings.oneThingAtATime ? "grid-cols-1 max-w-xl mx-auto" : "grid-cols-1 md:grid-cols-2"}`}>
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
          {!settings.oneThingAtATime && (
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
          )}

          {/* Goal 3: Guide Me (Guided Task) */}
          {!settings.oneThingAtATime && (
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
          )}

          {/* Goal 4: Remember Something (Reminders) */}
          {!settings.oneThingAtATime && (
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
          )}
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
