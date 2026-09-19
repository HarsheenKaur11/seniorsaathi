"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TTSButton } from "@/components/tts-button";
import { getStoredSettings, AccessibilitySettings, DEFAULT_SETTINGS, addRecentActivity } from "@/lib/storage";
import { TRANSLATIONS } from "@/lib/translations";
import { TaskResponse, TaskHelpResponse } from "@/lib/ai/schemas";
import { ListChecks, ArrowLeft, Check, HelpCircle, Loader2, Sparkles, AlertTriangle, ArrowRight, Home, RefreshCw } from "lucide-react";

function GuideContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTaskPrompt = searchParams.get("task") || "";

  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [taskQuery, setTaskQuery] = useState(initialTaskPrompt);
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState<TaskResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [helpLoading, setHelpLoading] = useState(false);
  const [stepHelp, setStepHelp] = useState<TaskHelpResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const fetchTaskSteps = async (goal: string) => {
    if (!goal.trim()) return;
    setLoading(true);
    setError(null);
    setTaskData(null);
    setCurrentStepIndex(0);
    setStepHelp(null);

    try {
      const res = await fetch("/api/ai/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskGoal: goal.trim(),
          language: settings.language,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Could not prepare steps.");
      }

      setTaskData(json.data);
      addRecentActivity(`Guided Task: ${goal.slice(0, 20)}...`, "guide");
    } catch (e: any) {
      setError(e?.message || "Could not fetch guided task steps.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTaskPrompt) {
      fetchTaskSteps(initialTaskPrompt);
    }
  }, [initialTaskPrompt]);

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTaskSteps(taskQuery);
  };

  const handleNextStep = () => {
    if (!taskData) return;
    setStepHelp(null);
    if (currentStepIndex < taskData.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setCurrentStepIndex(taskData.steps.length); // Completion state
    }
  };

  const handlePrevStep = () => {
    setStepHelp(null);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleRequestHelp = async () => {
    if (!taskData || !taskData.steps[currentStepIndex]) return;
    setHelpLoading(true);

    try {
      const currentStep = taskData.steps[currentStepIndex];
      const res = await fetch("/api/ai/task/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep,
          taskTitle: taskData.title,
          language: settings.language,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setStepHelp(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHelpLoading(false);
    }
  };

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.English;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 rounded-xl font-bold hover:bg-emerald-200 min-h-[48px]"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.back}
        </button>
        <h2 className="text-2xl sm:text-3xl font-black text-teal-950 dark:text-teal-100 flex items-center gap-2">
          <ListChecks className="w-8 h-8 text-teal-600" />
          Guided Task Mode
        </h2>
      </div>

      {/* Task Input Form if no active task */}
      {!taskData && !loading && (
        <form onSubmit={handleTaskSubmit} className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-3xl border-3 border-teal-200 dark:border-zinc-700 shadow-md space-y-4">
          <label className="block text-xl font-bold text-teal-950 dark:text-teal-100">
            What digital task would you like step-by-step help with?
          </label>
          <input
            type="text"
            value={taskQuery}
            onChange={(e) => setTaskQuery(e.target.value)}
            placeholder="e.g. How to change phone text size, Pay electricity bill, or Delete a message"
            className="w-full h-16 px-5 rounded-2xl bg-teal-50/40 dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold text-lg border-2 border-teal-300 dark:border-zinc-600 focus:outline-hidden focus:ring-4 focus:ring-amber-400"
          />
          <button
            type="submit"
            className="w-full h-16 bg-teal-700 hover:bg-teal-800 text-white font-black text-xl rounded-2xl shadow-lg flex items-center justify-center gap-2"
          >
            Start Guided Steps <ArrowRight className="w-6 h-6" />
          </button>
        </form>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-teal-50 dark:bg-zinc-800 border-2 border-teal-300 p-8 rounded-3xl text-center space-y-3">
          <Loader2 className="w-10 h-10 text-teal-700 animate-spin mx-auto" />
          <p className="text-xl font-bold text-teal-950 dark:text-teal-100">
            “Preparing your simple steps...”
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-300 p-6 rounded-3xl text-red-800 dark:text-red-200">
          <p className="text-lg font-bold">{error}</p>
        </div>
      )}

      {/* Active Step-by-Step Workflow */}
      {taskData && !loading && (
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border-2 border-teal-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="text-sm font-bold uppercase text-teal-700 dark:text-teal-400 tracking-wider">
                {taskData.title}
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                {currentStepIndex < taskData.steps.length
                  ? `Step ${currentStepIndex + 1} of ${taskData.steps.length}`
                  : "Task Complete"}
              </h3>
            </div>

            {/* Visual Step Dots */}
            <div className="flex items-center gap-2">
              {taskData.steps.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? "bg-teal-700 scale-125 ring-4 ring-teal-200"
                      : idx < currentStepIndex
                      ? "bg-emerald-500"
                      : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ACTIVE STEP CARD (DOMINATES SCREEN) */}
          {currentStepIndex < taskData.steps.length ? (
            <div className="bg-white dark:bg-zinc-800 p-6 sm:p-10 rounded-3xl border-4 border-teal-500 shadow-2xl space-y-8">
              {/* Step Header & TTS */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                <span className="w-12 h-12 rounded-2xl bg-teal-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
                  {taskData.steps[currentStepIndex].stepNumber}
                </span>

                <TTSButton
                  text={taskData.steps[currentStepIndex].instruction + ". " + (taskData.steps[currentStepIndex].simplifiedExplanation || "")}
                  language={settings.language}
                />
              </div>

              {/* Main Instruction */}
              <div className="space-y-4">
                <h4 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white leading-tight">
                  {taskData.steps[currentStepIndex].instruction}
                </h4>

                {taskData.steps[currentStepIndex].simplifiedExplanation && (
                  <p className="text-lg sm:text-xl font-medium text-teal-900 dark:text-teal-200 bg-teal-50/70 dark:bg-zinc-900 p-5 rounded-2xl border border-teal-200 dark:border-zinc-700 leading-relaxed">
                    {taskData.steps[currentStepIndex].simplifiedExplanation}
                  </p>
                )}
              </div>

              {/* Step Danger Warning if present */}
              {taskData.steps[currentStepIndex].dangerWarning && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 rounded-2xl text-amber-950 dark:text-amber-200 font-bold flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                  <span>{taskData.steps[currentStepIndex].dangerWarning}</span>
                </div>
              )}

              {/* Additional Step Help Box */}
              {stepHelp && (
                <div className="bg-amber-100 dark:bg-zinc-900 border-2 border-amber-400 p-6 rounded-2xl space-y-3">
                  <p className="font-black text-xl text-amber-950 dark:text-amber-200 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-amber-600" />
                    Extra Simple Help
                  </p>
                  <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                    {stepHelp.simpleExplanation}
                  </p>
                  <ul className="list-disc pl-6 space-y-1 font-medium text-base">
                    {stepHelp.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* PRIMARY CONTROLS (LARGE TOUCH TARGETS) */}
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStepIndex === 0}
                    className="px-5 py-4 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-lg rounded-2xl min-h-[56px] disabled:opacity-30"
                  >
                    ← Back
                  </button>

                  <button
                    onClick={handleRequestHelp}
                    disabled={helpLoading}
                    className="px-5 py-4 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 text-amber-950 dark:text-amber-200 font-bold text-lg rounded-2xl border-2 border-amber-300 flex items-center gap-2 min-h-[56px]"
                  >
                    {helpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <HelpCircle className="w-5 h-5" />}
                    <span>? I need help</span>
                  </button>
                </div>

                <button
                  onClick={handleNextStep}
                  className="px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xl rounded-2xl shadow-xl flex items-center gap-3 min-h-[56px] active:scale-95"
                >
                  <Check className="w-7 h-7" />
                  <span>Done (Next Step)</span>
                </button>
              </div>
            </div>
          ) : (
            /* COMPLETION STATE */
            <div className="bg-emerald-50 dark:bg-zinc-800 p-8 sm:p-12 rounded-3xl border-4 border-emerald-500 shadow-2xl text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-4xl mx-auto shadow-lg animate-bounce">
                🎉
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-emerald-100">
                You did it 🎉
              </h3>
              <p className="text-xl font-medium text-emerald-900 dark:text-emerald-200 max-w-lg mx-auto">
                {taskData.completionMessage}
              </p>

              <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => router.push("/")}
                  className="px-8 py-4 bg-emerald-800 text-white font-black text-xl rounded-2xl flex items-center gap-2 shadow-md hover:bg-emerald-900 min-h-[56px]"
                >
                  <Home className="w-6 h-6" /> Return to Home
                </button>

                <button
                  onClick={() => router.push("/reminders")}
                  className="px-8 py-4 bg-amber-400 text-emerald-950 font-black text-xl rounded-2xl flex items-center gap-2 shadow-md hover:bg-amber-300 min-h-[56px]"
                >
                  Set a Reminder
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-lg font-bold">Loading Guided Task...</div>}>
      <GuideContent />
    </Suspense>
  );
}
