"use client";

import React, { useState, useEffect } from "react";
import { getStoredSettings, saveStoredSettings, TextSize, Language } from "@/lib/storage";
import { Sparkles, Check, ArrowRight, X } from "lucide-react";

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>("standard");
  const [language, setLanguage] = useState<Language>("English");

  useEffect(() => {
    const settings = getStoredSettings();
    if (!settings.hasCompletedOnboarding) {
      setIsOpen(true);
      setTextSize(settings.textSize);
      setLanguage(settings.language);
    }
  }, []);

  const handleSave = () => {
    const settings = getStoredSettings();
    saveStoredSettings({
      ...settings,
      textSize,
      language,
      hasCompletedOnboarding: true,
    });
    setIsOpen(false);
  };

  const handleSkip = () => {
    const settings = getStoredSettings();
    saveStoredSettings({ ...settings, hasCompletedOnboarding: true });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="bg-emerald-50 dark:bg-zinc-900 border-3 border-emerald-600 dark:border-emerald-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-zinc-900 dark:text-zinc-100">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-3xl mx-auto shadow-md">
            S
          </div>
          <h2 id="onboarding-title" className="text-3xl font-black tracking-tight text-emerald-950 dark:text-emerald-100">
            Hi, I’m SeniorSaathi 👋
          </h2>
          <p className="text-lg font-medium text-emerald-900 dark:text-emerald-200">
            I can help you understand messages, check suspicious links, and guide you step-by-step.
          </p>
        </div>

        <div className="space-y-5 bg-white dark:bg-zinc-800 p-5 rounded-2xl border-2 border-emerald-200 dark:border-zinc-700">
          <div className="space-y-2">
            <label className="block font-bold text-lg text-emerald-950 dark:text-emerald-200">
              How would you like text displayed?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTextSize("standard")}
                className={`py-3 px-4 rounded-xl border-2 font-bold text-base min-h-[48px] ${
                  textSize === "standard"
                    ? "bg-emerald-800 text-white border-emerald-900"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-300"
                }`}
              >
                Standard Text
              </button>
              <button
                type="button"
                onClick={() => setTextSize("xlarge")}
                className={`py-3 px-4 rounded-xl border-2 font-bold text-base min-h-[48px] ${
                  textSize === "xlarge"
                    ? "bg-emerald-800 text-white border-emerald-900"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-300"
                }`}
              >
                Larger & Simpler
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-lg text-emerald-950 dark:text-emerald-200">
              Preferred Language:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["English", "Hindi", "Punjabi"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`py-3 px-2 rounded-xl border-2 font-bold text-sm min-h-[48px] ${
                    language === lang
                      ? "bg-emerald-800 text-white border-emerald-900"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-300"
                  }`}
                >
                  {lang === "English" ? "English" : lang === "Hindi" ? "हिंदी" : "ਪੰਜਾਬੀ"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="px-5 py-3 text-zinc-600 dark:text-zinc-400 font-bold hover:underline"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xl rounded-2xl shadow-lg flex items-center gap-2 min-h-[52px]"
          >
            Get Started <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
