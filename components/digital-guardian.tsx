"use client";

import React from "react";
import { ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import { GuardianScanResult } from "@/lib/ai/guardian";

interface DigitalGuardianModalProps {
  scanResult: GuardianScanResult | null;
  onCheckSafety: () => void;
  onProceedAnyway: () => void;
  onClose: () => void;
}

export function DigitalGuardianModal({
  scanResult,
  onCheckSafety,
  onProceedAnyway,
  onClose,
}: DigitalGuardianModalProps) {
  if (!scanResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        role="dialog" 
        aria-labelledby="guardian-title" 
        className="w-full max-w-lg rounded-3xl bg-[var(--surface)] p-6 md:p-8 shadow-2xl border-2 border-amber-500/40 space-y-6"
      >
        {/* Header Icon */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-400">
              Digital Guardian Alert
            </span>
            <h2 id="guardian-title" className="text-2xl font-bold text-[var(--foreground)]">
              {scanResult.warningTitle}
            </h2>
          </div>
        </div>

        {/* Warning Body */}
        <div className="rounded-2xl bg-amber-500/10 p-5 space-y-3 border border-amber-500/20">
          <p className="text-base font-semibold text-[var(--foreground)]">
            {scanResult.warningMessage}
          </p>
          <p className="text-sm leading-relaxed text-[var(--foreground)]/80">
            {scanResult.recommendation}
          </p>
        </div>

        {/* Advice Pill */}
        <div className="flex items-start gap-3 rounded-xl bg-[var(--background)] p-4 border border-[var(--border)]">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--foreground)]/90">
            SeniorSaathi recommends checking this message with Safety Check first before taking any digital action.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onCheckSafety}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-6 text-base shadow-lg transition-colors cursor-pointer"
          >
            <span>Check this message for scams</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={onProceedAnyway}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--background)] text-[var(--foreground)] font-medium py-3 px-5 text-sm transition-colors cursor-pointer"
          >
            Continue anyway
          </button>
        </div>
      </div>
    </div>
  );
}
