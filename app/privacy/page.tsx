"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { clearAllPreferences } from "@/lib/storage";
import { ShieldCheck, ArrowLeft, Trash2, Lock, EyeOff, Server } from "lucide-react";

export default function PrivacyPage() {
  const router = useRouter();

  const handleReset = () => {
    if (confirm("Reset all saved accessibility preferences, reminders, and activity history from your browser?")) {
      clearAllPreferences();
      alert("All local storage has been cleared successfully.");
      router.push("/");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 rounded-xl font-bold hover:bg-emerald-200 min-h-[48px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-emerald-700" />
          Privacy & Data Handling
        </h2>
      </div>

      <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-3xl border-3 border-emerald-300 dark:border-zinc-700 shadow-md space-y-8">
        <div className="space-y-3">
          <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
            <Lock className="w-6 h-6 text-emerald-700" />
            Our Privacy Principle
          </h3>
          <p className="text-lg text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed bg-emerald-50/50 dark:bg-zinc-900 p-5 rounded-2xl border border-emerald-200 dark:border-zinc-700">
            SeniorSaathi is built to protect your peace of mind and your digital security. We store your preferences locally inside your web browser and never sell or misuse your data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-3">
            <h4 className="text-xl font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <EyeOff className="w-6 h-6 text-emerald-700" />
              What is Stored Locally
            </h4>
            <ul className="list-disc pl-5 space-y-2 font-semibold text-base text-zinc-700 dark:text-zinc-300">
              <li>Accessibility settings (Text size, Contrast, Language, Voice preferences).</li>
              <li>Your personal reminders (Medicines, Doctor appointments, Bills).</li>
              <li>Recent activity titles for quick navigation.</li>
            </ul>
          </div>

          <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-3">
            <h4 className="text-xl font-black text-red-700 dark:text-red-400 flex items-center gap-2">
              <Server className="w-6 h-6 text-red-600" />
              What We NEVER Store or Ask For
            </h4>
            <ul className="list-disc pl-5 space-y-2 font-semibold text-base text-zinc-700 dark:text-zinc-300">
              <li>Never enter OTP (One-Time Passwords).</li>
              <li>Never enter ATM PINs or netbanking passwords.</li>
              <li>Never enter full credit card numbers or CVV.</li>
              <li>We do not store your passwords or financial credentials.</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg text-zinc-900 dark:text-white">
              Want to start fresh?
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You can clear all stored preferences and reminders anytime.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-6 py-4 bg-red-100 hover:bg-red-200 dark:bg-red-950 text-red-700 dark:text-red-300 font-black text-lg rounded-2xl border-2 border-red-300 flex items-center gap-2 min-h-[52px]"
          >
            <Trash2 className="w-5 h-5" /> Reset & Clear All Local Data
          </button>
        </div>
      </div>
    </div>
  );
}
