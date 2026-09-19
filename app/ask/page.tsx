"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { VoiceInput } from "@/components/voice-input";
import { TTSButton } from "@/components/tts-button";
import { getStoredSettings, AccessibilitySettings, DEFAULT_SETTINGS, addRecentActivity } from "@/lib/storage";
import { TRANSLATIONS } from "@/lib/translations";
import { AskResponse } from "@/lib/ai/schemas";
import { routeUserIntent } from "@/lib/ai/intent-router";
import { 
  HelpCircle, 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  Bell, 
  MessageSquare,
  ThumbsUp,
  RotateCcw,
  Globe
} from "lucide-react";

function AskContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [detectedIntent, setDetectedIntent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Conversational context memory turn
  const [previousTurn, setPreviousTurn] = useState<{
    lastQuery?: string;
    lastAnswer?: string;
    topic?: string;
  } | null>(null);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const handleAsk = async (textToAsk: string, overrideContext?: any) => {
    if (!textToAsk.trim()) return;
    setLoading(true);
    setError(null);

    // Parse smart intent locally
    const routed = routeUserIntent(textToAsk.trim());
    setDetectedIntent(routed.intent);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToAsk.trim(),
          language: settings.language,
          explanationLevel: settings.explanationLevel,
          previousContext: overrideContext || previousTurn,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Could not fetch answer.");
      }

      setResponse(json.data);
      setPreviousTurn({
        lastQuery: textToAsk.trim(),
        lastAnswer: json.data.simpleAnswer,
        topic: json.data.intent,
      });

      addRecentActivity(`Ask: ${textToAsk.slice(0, 25)}...`, "ask");
    } catch (e: any) {
      setError(e?.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleAsk(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(query);
  };

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.English;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 rounded-xl font-bold hover:bg-emerald-200 min-h-[48px] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.back}
        </button>
        <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
          <HelpCircle className="w-8 h-8 text-emerald-700" />
          Ask Saathi V3
        </h2>
      </div>

      {/* Question Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border-3 border-emerald-200 dark:border-zinc-700 shadow-md space-y-4">
        <label className="block text-lg font-bold text-emerald-950 dark:text-emerald-100">
          What would you like to ask today?
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. How do I change WhatsApp profile photo? or What is UPI?"
            className="flex-1 h-16 px-5 rounded-2xl bg-emerald-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold text-lg border-2 border-emerald-300 dark:border-zinc-600 focus:outline-hidden focus:ring-4 focus:ring-amber-400"
          />
          <div className="flex gap-2">
            <VoiceInput
              onTranscript={(text) => {
                setQuery(text);
                handleAsk(text);
              }}
              language={settings.language}
            />
            <button
              type="submit"
              disabled={loading}
              className="h-16 px-6 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-md min-w-[100px] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Ask"}
            </button>
          </div>
        </div>
      </form>

      {/* SMART INTENT ROUTER BANNER IF DETECTED */}
      {detectedIntent === "REMINDER" && !loading && (
        <div className="bg-purple-100 dark:bg-purple-950/60 border-2 border-purple-400 p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="w-7 h-7 text-purple-700" />
            <div>
              <p className="font-black text-lg text-purple-950 dark:text-purple-200">
                Looks like you'd like to set a Reminder!
              </p>
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                Would you like Saathi to create this reminder for you?
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/reminders?title=${encodeURIComponent(query)}`)}
            className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-black text-base rounded-2xl shadow-md flex items-center gap-2 min-h-[48px] cursor-pointer"
          >
            <Bell className="w-5 h-5" /> Create Reminder Now
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-amber-50 dark:bg-zinc-800 border-2 border-amber-300 p-8 rounded-3xl text-center space-y-3">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mx-auto" />
          <p className="text-xl font-bold text-emerald-950 dark:text-amber-200">
            “Saathi is thinking about your question carefully...”
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-300 p-6 rounded-3xl text-red-800 dark:text-red-200 space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-red-600 shrink-0" />
            <p className="text-lg font-bold">{error}</p>
          </div>
          <button
            onClick={() => handleAsk(query)}
            className="px-5 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center gap-2 min-h-[48px] cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" /> Try Again
          </button>
        </div>
      )}

      {/* Structured AI Response */}
      {response && !loading && (
        <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-3xl border-3 border-emerald-400 dark:border-zinc-700 shadow-xl space-y-6 animate-in fade-in duration-200">
          {/* Top Bar with Read Aloud */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 dark:border-zinc-700 pb-4">
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 rounded-full font-bold text-sm uppercase">
              Saathi Answer
            </span>
            <TTSButton text={response.simpleAnswer + " " + response.keyPoints.join(" ")} language={settings.language} />
          </div>

          {/* Warnings if any */}
          {response.warnings.length > 0 && (
            <div className="bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400 p-4 rounded-2xl space-y-2 text-amber-950 dark:text-amber-200">
              <p className="font-bold flex items-center gap-2 text-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                Important Safety Warning
              </p>
              <ul className="list-disc pl-6 space-y-1 font-semibold text-base sm:text-lg">
                {response.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Simple Answer */}
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
              Simple Explanation
            </h3>
            <p className="text-lg sm:text-xl text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed bg-emerald-50/60 dark:bg-zinc-900 p-5 rounded-2xl border border-emerald-200 dark:border-zinc-700">
              {response.simpleAnswer}
            </p>
          </div>

          {/* Key Points */}
          {response.keyPoints.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-200">
                Key Points to Remember
              </h4>
              <ul className="space-y-2">
                {response.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl font-semibold text-base sm:text-lg">
                    <span className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* DYNAMIC CONTEXTUAL FOLLOW-UP CONTROLS */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-zinc-900 border border-emerald-200 dark:border-zinc-700 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Follow-up with Saathi (Contextual Memory)
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAsk("Give me an everyday example for this.")}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-zinc-600 font-semibold text-sm hover:border-emerald-600 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" /> Give me an example
              </button>
              <button
                onClick={() => handleAsk("Make this even simpler for me.")}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-zinc-600 font-semibold text-sm hover:border-emerald-600 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-emerald-600" /> Make it simpler
              </button>
              <button
                onClick={() => handleAsk(`Translate this explanation into ${settings.language === "Hindi" ? "Punjabi" : "Hindi"}.`)}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-zinc-600 font-semibold text-sm hover:border-emerald-600 flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-blue-600" /> Translate explanation
              </button>
            </div>
          </div>

          {/* Suggested Primary Action */}
          {response.suggestedAction && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  if (response.suggestedAction?.action === "guide") {
                    router.push(`/guide?task=${encodeURIComponent(response.suggestedAction.prompt || query)}`);
                  } else if (response.suggestedAction?.action === "simplify") {
                    router.push(`/simplify?q=${encodeURIComponent(response.suggestedAction.prompt || query)}`);
                  } else if (response.suggestedAction?.action === "safety") {
                    router.push(`/safety?q=${encodeURIComponent(response.suggestedAction.prompt || query)}`);
                  }
                }}
                className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-lg flex items-center gap-2 shadow-md min-h-[48px] cursor-pointer"
              >
                {response.suggestedAction.label} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AskPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-lg font-bold">Loading Ask Saathi V3...</div>}>
      <AskContent />
    </Suspense>
  );
}
