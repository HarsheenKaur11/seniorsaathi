"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TTSButton } from "@/components/tts-button";
import { StuckModal } from "@/components/stuck-modal";
import { SaathiCircleModal } from "@/components/saathi-circle-modal";
import {
  getStoredSettings,
  AccessibilitySettings,
  DEFAULT_SETTINGS,
  addRecentActivity,
  saveActiveTaskState,
  saveStoredTip,
} from "@/lib/storage";
import { TRANSLATIONS } from "@/lib/translations";
import { TaskResponse } from "@/lib/ai/schemas";
import {
  ListChecks,
  ArrowLeft,
  Check,
  HelpCircle,
  Loader2,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Home,
  BookOpen,
  Lightbulb,
  ShieldCheck,
  Bookmark,
  CheckCircle2,
  RotateCcw,
  Users,
} from "lucide-react";

function GuideContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTaskPrompt = searchParams.get("task") || "";

  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [taskQuery, setTaskQuery] = useState(initialTaskPrompt);
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState<TaskResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Teach Me Mode & Rationale Drawers
  const [teachMeMode, setTeachMeMode] = useState(false);
  const [showWhyDrawer, setShowWhyDrawer] = useState(false);

  // Modals
  const [stuckOpen, setStuckOpen] = useState(false);
  const [stuckExplanation, setStuckExplanation] = useState<string | null>(null);
  const [circleOpen, setCircleOpen] = useState(false);

  // Saved Tip State
  const [tipSaved, setTipSaved] = useState(false);
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
    setStuckExplanation(null);
    setTipSaved(false);

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

      saveActiveTaskState({
        title: json.data.title,
        currentStepIndex: 0,
        totalSteps: json.data.totalSteps,
        taskGoal: goal.trim(),
        steps: json.data.steps,
        timestamp: new Date().toISOString(),
      });
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
    setStuckExplanation(null);
    setShowWhyDrawer(false);
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < taskData.steps.length) {
      setCurrentStepIndex(nextIdx);
      saveActiveTaskState({
        title: taskData.title,
        currentStepIndex: nextIdx,
        totalSteps: taskData.totalSteps,
        taskGoal: taskQuery,
        steps: taskData.steps,
        timestamp: new Date().toISOString(),
      });
    } else {
      setCurrentStepIndex(taskData.steps.length); // Completion state
      saveActiveTaskState(null);
    }
  };

  const handlePrevStep = () => {
    setStuckExplanation(null);
    setShowWhyDrawer(false);
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      if (taskData) {
        saveActiveTaskState({
          title: taskData.title,
          currentStepIndex: prevIdx,
          totalSteps: taskData.totalSteps,
          taskGoal: taskQuery,
          steps: taskData.steps,
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  const handleSaveConfidenceTip = () => {
    if (!taskData || !taskData.confidenceTip) return;
    saveStoredTip({
      taskTitle: taskData.title,
      tip: taskData.confidenceTip,
    });
    setTipSaved(true);
  };

  const handleStuckRecoveryChoice = (actionType: "explain_simpler" | "step_by_step" | "previous_step") => {
    if (actionType === "previous_step") {
      handlePrevStep();
    } else if (actionType === "explain_simpler") {
      setTeachMeMode(true);
      setShowWhyDrawer(true);
      setStuckExplanation("Switched to Teach Me mode to explain why this step matters.");
    } else {
      setStuckExplanation("Look at the highlighted on-screen options or controls on your phone.");
    }
  };

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.English;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 rounded-xl font-bold hover:bg-emerald-200 min-h-[48px] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.back}
        </button>
        <h2 className="text-2xl sm:text-3xl font-black text-teal-950 dark:text-teal-100 flex items-center gap-2">
          <ListChecks className="w-8 h-8 text-teal-600" />
          Guided Task Mode V3
        </h2>
      </div>

      {/* Saathi Circle Modal */}
      <SaathiCircleModal
        isOpen={circleOpen}
        onClose={() => setCircleOpen(false)}
        rawSummaryToShare={taskData ? `Help me with step: ${taskData.steps[currentStepIndex]?.instruction}` : undefined}
      />

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
            className="w-full h-16 bg-teal-700 hover:bg-teal-800 text-white font-black text-xl rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
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
          {/* Progress Bar & Controls */}
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

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCircleOpen(true)}
                className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-blue-500/30"
              >
                <Users className="w-4 h-4" /> Ask Someone I Trust
              </button>

              <div className="flex items-center gap-2 bg-teal-50 dark:bg-zinc-900 p-2 rounded-xl border border-teal-200 dark:border-zinc-700">
                <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span className="font-bold text-xs">Teach Me</span>
                <button
                  type="button"
                  onClick={() => setTeachMeMode(!teachMeMode)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors flex items-center cursor-pointer ${
                    teachMeMode ? "bg-teal-700 justify-end" : "bg-zinc-300 dark:bg-zinc-600 justify-start"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-md block" />
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE STEP CARD */}
          {currentStepIndex < taskData.steps.length ? (
            <div className="bg-white dark:bg-zinc-800 p-6 sm:p-10 rounded-3xl border-4 border-teal-500 shadow-2xl space-y-8 animate-in fade-in duration-200">
              {/* Step Header & TTS */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                <span className="w-12 h-12 rounded-2xl bg-teal-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
                  {taskData.steps[currentStepIndex].stepNumber}
                </span>

                <TTSButton
                  text={
                    taskData.steps[currentStepIndex].instruction +
                    ". " +
                    (taskData.steps[currentStepIndex].simplifiedExplanation || "")
                  }
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

              {/* "WHY AM I DOING THIS?" RATIONALE TOGGLE & DRAWER */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowWhyDrawer(!showWhyDrawer)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-2.5 rounded-xl border border-amber-500/30 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Why am I doing this step?</span>
                </button>

                {(showWhyDrawer || teachMeMode) && (
                  <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 space-y-3 animate-in fade-in duration-200">
                    <p className="font-bold text-base text-amber-950 dark:text-amber-200">
                      💡 {taskData.steps[currentStepIndex].whyThisStep || "This step ensures your device performs the action safely without losing progress."}
                    </p>
                    {taskData.steps[currentStepIndex].safetyTip && (
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>Safety Tip: {taskData.steps[currentStepIndex].safetyTip}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Step Danger Warning */}
              {taskData.steps[currentStepIndex].dangerWarning && (
                <div className="p-4 bg-red-50 dark:bg-red-950/60 border-2 border-red-400 rounded-2xl text-red-950 dark:text-red-200 font-bold flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                  <span>{taskData.steps[currentStepIndex].dangerWarning}</span>
                </div>
              )}

              {/* Stuck explanation callout */}
              {stuckExplanation && (
                <div className="p-4 bg-teal-100 dark:bg-zinc-900 border border-teal-400 rounded-2xl text-teal-950 dark:text-teal-200 font-bold">
                  💡 {stuckExplanation}
                </div>
              )}

              {/* PRIMARY CONTROLS */}
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStepIndex === 0}
                    className="px-5 py-4 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-lg rounded-2xl min-h-[56px] disabled:opacity-30 cursor-pointer"
                  >
                    ← Back
                  </button>

                  <button
                    onClick={() => setStuckOpen(true)}
                    className="px-5 py-4 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 text-amber-950 dark:text-amber-200 font-bold text-lg rounded-2xl border-2 border-amber-300 flex items-center gap-2 min-h-[56px] cursor-pointer"
                  >
                    <HelpCircle className="w-5 h-5 text-amber-600" />
                    <span>I’m stuck</span>
                  </button>
                </div>

                <button
                  onClick={handleNextStep}
                  className="px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xl rounded-2xl shadow-xl flex items-center gap-3 min-h-[56px] active:scale-95 cursor-pointer"
                >
                  <Check className="w-7 h-7" />
                  <span>Done (Next Step)</span>
                </button>
              </div>
            </div>
          ) : (
            /* COMPLETION STATE & MEMORY ANCHOR */
            <div className="bg-emerald-50 dark:bg-zinc-800 p-8 sm:p-12 rounded-3xl border-4 border-emerald-500 shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
              <div className="w-20 h-20 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-4xl mx-auto shadow-lg animate-bounce">
                🎉
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-emerald-100">
                You did it 🎉
              </h3>
              <p className="text-xl font-medium text-emerald-900 dark:text-emerald-200 max-w-lg mx-auto">
                {taskData.completionMessage}
              </p>

              {/* MEMORY ANCHOR ("REMEMBER THIS") */}
              {taskData.confidenceTip && (
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border-2 border-amber-400 max-w-lg mx-auto space-y-3 shadow-md text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-amber-950 dark:text-amber-200 text-lg">
                      <Lightbulb className="w-6 h-6 text-amber-500" />
                      REMEMBER THIS (Memory Anchor)
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                    "{taskData.confidenceTip}"
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveConfidenceTip}
                      disabled={tipSaved}
                      className={`px-5 py-3 rounded-xl font-bold text-base flex items-center gap-2 min-h-[48px] cursor-pointer ${
                        tipSaved
                          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-400"
                          : "bg-amber-400 hover:bg-amber-300 text-emerald-950 shadow-md"
                      }`}
                    >
                      {tipSaved ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-700" /> Tip Saved to My Cards!
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-5 h-5" /> Save Tip to My Cards
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => router.push("/")}
                  className="px-8 py-4 bg-emerald-800 text-white font-black text-xl rounded-2xl flex items-center gap-2 shadow-md hover:bg-emerald-900 min-h-[56px] cursor-pointer"
                >
                  <Home className="w-6 h-6" /> Return to Home
                </button>

                <button
                  onClick={() => router.push("/tips")}
                  className="px-8 py-4 bg-amber-400 text-emerald-950 font-black text-xl rounded-2xl flex items-center gap-2 shadow-md hover:bg-amber-300 min-h-[56px] cursor-pointer"
                >
                  View My Confidence Cards
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stuck Modal */}
      <StuckModal
        isOpen={stuckOpen}
        onClose={() => setStuckOpen(false)}
        contextText={taskQuery}
        currentStep={taskData?.steps[currentStepIndex]}
        language={settings.language}
        onSelectOption={handleStuckRecoveryChoice}
      />
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-lg font-bold">Loading Guided Task V3...</div>}>
      <GuideContent />
    </Suspense>
  );
}
