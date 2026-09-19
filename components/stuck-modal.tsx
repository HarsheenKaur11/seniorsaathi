"use client";

import React, { useState, useEffect } from "react";
import { StuckResponse } from "@/lib/ai/schemas";
import { HelpCircle, X, Loader2, RefreshCw, ArrowLeft, Lightbulb } from "lucide-react";

interface StuckModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextText: string;
  currentStep?: any;
  language?: string;
  onSelectOption: (actionType: "explain_simpler" | "step_by_step" | "previous_step") => void;
}

export function StuckModal({
  isOpen,
  onClose,
  contextText,
  currentStep,
  language = "English",
  onSelectOption,
}: StuckModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StuckResponse | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchRecovery = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/stuck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: contextText,
            step: currentStep,
            language,
          }),
        });
        const json = await res.json();
        if (res.ok) {
          setData(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchRecovery();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stuck-title"
    >
      <div className="bg-white dark:bg-zinc-900 border-3 border-teal-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-zinc-900 dark:text-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 id="stuck-title" className="text-2xl font-black text-teal-950 dark:text-teal-200">
                I’m Stuck — Saathi Helper
              </h3>
              <p className="text-xs text-zinc-500">Take a deep breath. We will help you recover.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 rounded-full min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label="Close helper"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto" />
            <p className="text-lg font-bold">Finding the easiest way forward...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="p-4 bg-teal-50/70 dark:bg-zinc-800 border border-teal-200 rounded-2xl text-lg font-semibold text-teal-950 dark:text-teal-200">
              💡 {data?.contextSummary || "Feeling stuck is completely normal. What would make this easiest right now?"}
            </p>

            <div className="space-y-3">
              {(data?.options || [
                { label: "Explain this differently", actionType: "explain_simpler", explanation: "Break down into shorter words." },
                { label: "Show me what to do", actionType: "step_by_step", explanation: "Describe on-screen location." },
                { label: "Go back one step", actionType: "previous_step", explanation: "Return to previous step." },
              ]).map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectOption(opt.actionType);
                    onClose();
                  }}
                  className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-teal-500 dark:hover:border-teal-400 text-left transition-all hover:shadow-md space-y-1 min-h-[64px]"
                >
                  <p className="font-extrabold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    {opt.label}
                  </p>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {opt.explanation}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
