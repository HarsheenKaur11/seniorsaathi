"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { VoiceInput } from "@/components/voice-input";
import { TTSButton } from "@/components/tts-button";
import { SafeShareModal } from "@/components/safe-share-modal";
import { StuckModal } from "@/components/stuck-modal";
import { getStoredSettings, AccessibilitySettings, DEFAULT_SETTINGS, addRecentActivity } from "@/lib/storage";
import { TRANSLATIONS } from "@/lib/translations";
import { SafetyResponse } from "@/lib/ai/schemas";
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  ArrowLeft,
  Loader2,
  ArrowRight,
  Lock,
  HelpCircle,
  CheckCircle2,
  ListChecks,
  Share2,
  Globe,
} from "lucide-react";

function SafetyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [messageInput, setMessageInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SafetyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Safe Share Modal
  const [shareOpen, setShareOpen] = useState(false);
  // Stuck Modal
  const [stuckOpen, setStuckOpen] = useState(false);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const handleCheckSafety = async (overrideText?: string) => {
    const textToUse = overrideText !== undefined ? overrideText : messageInput;
    if (!textToUse.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/ai/safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToUse.trim(),
          language: settings.language,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Could not check safety.");
      }

      setResponse(json.data);
      addRecentActivity(`Safety Check: ${textToUse.slice(0, 20)}...`, "safety");
    } catch (e: any) {
      setError(e?.message || "Error analyzing message.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleCheckSafety(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheckSafety();
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
        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-200 flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-amber-600" />
          Safety Check V2
        </h2>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="bg-amber-50/70 dark:bg-zinc-800 p-6 sm:p-8 rounded-3xl border-3 border-amber-300 dark:border-amber-800 shadow-md space-y-4">
        <label className="block text-xl font-bold text-amber-950 dark:text-amber-100">
          Paste any message, link, SMS, WhatsApp message, or payment request:
        </label>
        <textarea
          rows={4}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="e.g. URGENT: Your account will be blocked today. Click link to verify OTP immediately..."
          className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium text-lg border-2 border-amber-300 dark:border-zinc-600 focus:outline-hidden focus:ring-4 focus:ring-amber-400"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <VoiceInput
            onTranscript={(text) => {
              setMessageInput(text);
              handleCheckSafety(text);
            }}
            language={settings.language}
          />

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-black text-xl rounded-2xl shadow-lg flex items-center gap-2 min-h-[56px] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Check Safety Now"}
          </button>
        </div>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="bg-amber-50 dark:bg-zinc-800 border-2 border-amber-400 p-8 rounded-3xl text-center space-y-3">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto" />
          <p className="text-xl font-bold text-amber-950 dark:text-amber-200">
            “Checking this message carefully against security patterns...”
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-400 p-6 rounded-3xl text-red-800 dark:text-red-200">
          <p className="text-lg font-bold">{error}</p>
        </div>
      )}

      {/* Safety Analysis Result */}
      {response && !loading && (
        <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-3xl border-3 border-amber-400 dark:border-zinc-700 shadow-xl space-y-8">
          {/* Risk Badge Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-700 pb-6">
            <div className="flex items-center gap-3">
              {response.riskLevel === "High risk" ? (
                <div className="p-3 bg-red-100 dark:bg-red-950 text-red-700 rounded-2xl border-2 border-red-500">
                  <AlertOctagon className="w-10 h-10" />
                </div>
              ) : response.riskLevel === "Be cautious" ? (
                <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-700 rounded-2xl border-2 border-amber-500">
                  <ShieldAlert className="w-10 h-10" />
                </div>
              ) : (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 rounded-2xl border-2 border-emerald-500">
                  <ShieldCheck className="w-10 h-10" />
                </div>
              )}

              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                  Safety Assessment
                </p>
                <h3
                  className={`text-2xl sm:text-3xl font-black ${
                    response.riskLevel === "High risk"
                      ? "text-red-600 dark:text-red-400"
                      : response.riskLevel === "Be cautious"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  Risk Level: {response.riskLevel}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TTSButton
                text={`Risk level: ${response.riskLevel}. ${response.overallExplanation}`}
                language={settings.language}
              />
              <button
                onClick={() => setShareOpen(true)}
                className="px-4 py-3 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 text-amber-950 dark:text-amber-200 rounded-xl font-bold border border-amber-400 flex items-center gap-2 min-h-[48px]"
                title="Safe Share with Family"
              >
                <Share2 className="w-5 h-5" />
                <span>Safe Share</span>
              </button>
            </div>
          </div>

          {/* Encouragement note */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-300 font-bold text-lg text-amber-900 dark:text-amber-200">
            👏 You were right to check before acting! Checking messages first keeps you completely safe online.
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Overview
            </h4>
            <p className="text-lg sm:text-xl font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 leading-relaxed">
              {response.overallExplanation}
            </p>
          </div>

          {/* Extracted Domain Warnings */}
          {response.extractedDomains && response.extractedDomains.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-300 rounded-2xl space-y-2">
              <p className="font-bold text-lg text-blue-950 dark:text-blue-200 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Website Domain Analysis
              </p>
              <div className="flex flex-wrap gap-2">
                {response.extractedDomains.map((dom, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white dark:bg-zinc-800 rounded-xl font-mono text-sm font-bold text-blue-900 dark:text-blue-300 border border-blue-200">
                    🌐 {dom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* WHY? Warning Signs */}
          {response.warningSigns.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xl font-black text-red-700 dark:text-red-400 uppercase tracking-wide">
                WHY IS THIS RISKY? (WARNING SIGNS)
              </h4>
              <div className="space-y-2">
                {response.warningSigns.map((sign, idx) => (
                  <div key={idx} className="p-4 bg-red-50 dark:bg-red-950/50 rounded-2xl border border-red-300 font-semibold text-lg text-red-950 dark:text-red-200 flex items-start gap-3">
                    <AlertOctagon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                    <span>{sign}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WHAT SHOULD I DO? Safe Actions */}
          <div className="space-y-3">
            <h4 className="text-xl font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
              WHAT SHOULD YOU DO RIGHT NOW?
            </h4>
            <div className="space-y-2">
              {response.safeActions.map((act, idx) => (
                <div key={idx} className="p-4 bg-emerald-50/70 dark:bg-zinc-900 rounded-2xl border border-emerald-300 font-semibold text-lg text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* NEVER SHARE Safeguards */}
          <div className="bg-zinc-900 text-white p-6 rounded-3xl space-y-4 border-2 border-red-500 shadow-lg">
            <div className="flex items-center gap-3 text-red-400 font-black text-xl">
              <Lock className="w-7 h-7" />
              NEVER SHARE THESE SECRETS WITH ANYONE
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {response.neverShare.map((item, idx) => (
                <div key={idx} className="p-3 bg-zinc-800 rounded-xl font-bold text-amber-300 border border-zinc-700">
                  🚫 {item}
                </div>
              ))}
            </div>
          </div>

          {/* Launch Guided Task Mode & Stuck Handler */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setStuckOpen(true)}
              className="px-5 py-4 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 text-amber-950 dark:text-amber-200 font-bold text-lg rounded-2xl border border-amber-300 flex items-center gap-2 min-h-[56px]"
            >
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <span>I’m stuck</span>
            </button>

            <button
              onClick={() => {
                const taskPrompt = response.guideTaskTitle || `How to safely handle this message: ${messageInput.slice(0, 50)}`;
                router.push(`/guide?task=${encodeURIComponent(taskPrompt)}`);
              }}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xl rounded-2xl flex items-center gap-3 shadow-xl hover:scale-105 transition-all min-h-[56px]"
            >
              <ListChecks className="w-7 h-7" />
              <span>Guide me through what to do next</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Safe Share Modal */}
      {response && (
        <SafeShareModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          messageText={messageInput}
          riskLevel={response.riskLevel}
          warningSigns={response.warningSigns}
        />
      )}

      {/* Stuck Modal */}
      <StuckModal
        isOpen={stuckOpen}
        onClose={() => setStuckOpen(false)}
        contextText={messageInput}
        language={settings.language}
        onSelectOption={(actionType) => {
          if (actionType === "explain_simpler") {
            router.push(`/simplify?q=${encodeURIComponent(messageInput)}`);
          } else {
            router.push(`/guide?task=${encodeURIComponent(messageInput)}`);
          }
        }}
      />
    </div>
  );
}

export default function SafetyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-lg font-bold">Loading Safety Check...</div>}>
      <SafetyContent />
    </Suspense>
  );
}
