"use client";

import React, { useState } from "react";
import { redactSensitiveSecrets } from "@/lib/ai/deterministic-safety";
import { Share2, Copy, Check, X, ShieldAlert, Lock } from "lucide-react";

interface SafeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageText: string;
  riskLevel: string;
  warningSigns: string[];
}

export function SafeShareModal({
  isOpen,
  onClose,
  messageText,
  riskLevel,
  warningSigns,
}: SafeShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Redact any potential secrets from the raw text
  const sanitizedInput = redactSensitiveSecrets(messageText);

  const shareSummary = `SeniorSaathi Safety Notice:
I checked a suspicious message with SeniorSaathi.
Risk Level: ${riskLevel}
Original Snippet: "${sanitizedInput.slice(0, 120)}${sanitizedInput.length > 120 ? "..." : ""}"
Detected Warning Signs: ${warningSigns.slice(0, 2).join("; ") || "Urgent request or link"}

Can you please check this with me when you get a chance?`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "SeniorSaathi Safety Summary",
          text: shareSummary,
        });
      } catch (e) {
        console.log("Share dismissed");
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="safe-share-title"
    >
      <div className="bg-white dark:bg-zinc-900 border-2 border-amber-400 dark:border-amber-600 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-zinc-900 dark:text-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded-2xl">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 id="safe-share-title" className="text-2xl font-black text-amber-950 dark:text-amber-200">
              Share with Family (Safe Share)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Privacy Promise */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-950 dark:text-emerald-200 text-sm font-semibold">
          <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            Safe Share automatically removes sensitive passwords, PINs, and OTPs before generating this summary for your family.
          </span>
        </div>

        {/* Summary Preview */}
        <div className="space-y-2">
          <label className="block text-sm font-bold uppercase text-zinc-500 tracking-wider">
            Preview of message to share:
          </label>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-300 dark:border-zinc-700 font-mono text-sm whitespace-pre-wrap text-zinc-800 dark:text-zinc-200 leading-relaxed">
            {shareSummary}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {"share" in (typeof navigator !== "undefined" ? navigator : {}) && (
            <button
              onClick={handleNativeShare}
              className="flex-1 py-4 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-lg rounded-2xl shadow-md flex items-center justify-center gap-2 min-h-[52px]"
            >
              <Share2 className="w-5 h-5" />
              <span>Share via WhatsApp / Messages</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 min-h-[52px]"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copy Summary Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
