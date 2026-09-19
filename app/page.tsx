"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VoiceInput } from "@/components/voice-input";
import { getStoredSettings, AccessibilitySettings, DEFAULT_SETTINGS, getStoredRecentActivities, RecentActivityItem } from "@/lib/storage";
import { TRANSLATIONS } from "@/lib/translations";
import { HelpCircle, FileText, ShieldAlert, ListChecks, Bell, ArrowRight, Sparkles, Clock, MessageSquareQuote } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [askQuery, setAskQuery] = useState("");
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);

  useEffect(() => {
    setSettings(getStoredSettings());
    setRecentActivities(getStoredRecentActivities());
  }, []);

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.English;

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;
    router.push(`/ask?q=${encodeURIComponent(askQuery.trim())}`);
  };

  const handleVoiceTranscript = (text: string) => {
    setAskQuery(text);
    if (text.trim()) {
      router.push(`/ask?q=${encodeURIComponent(text.trim())}`);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Greeting Banner & Quick Search */}
      <section className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-emerald-900 space-y-6">
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-amber-400 text-emerald-950 rounded-full font-black text-xs uppercase tracking-wider">
            Daily Companion
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome to SeniorSaathi 👋
          </h2>
          <p className="text-lg sm:text-xl text-emerald-100 max-w-2xl">
            How can Saathi help you today? Type or speak your question below.
          </p>
        </div>

        {/* Prominent Ask Input */}
        <form onSubmit={handleAskSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <input
              type="text"
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              placeholder={t.askPlaceholder}
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
              className="h-16 px-6 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-lg sm:text-xl rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 min-w-[100px] active:scale-95"
            >
              Ask <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </form>
      </section>

      {/* Primary Action Cards (4-5 Dominant Cards Above Fold) */}
      <section className="space-y-4">
        <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-amber-500" />
          Primary Companion Services
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Ask Saathi */}
          <Link
            href="/ask"
            className="group bg-white dark:bg-zinc-800 p-6 rounded-3xl border-3 border-emerald-300 dark:border-zinc-700 shadow-md hover:shadow-xl hover:border-emerald-600 transition-all flex flex-col justify-between space-y-4 focus:ring-4 focus:ring-amber-400"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                {t.askSaathiCardTitle}
              </h4>
              <p className="text-zinc-600 dark:text-zinc-300 font-medium text-base sm:text-lg">
                {t.askSaathiCardDesc}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400">
              Start Chat <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Simplify */}
          <Link
            href="/simplify"
            className="group bg-white dark:bg-zinc-800 p-6 rounded-3xl border-3 border-emerald-300 dark:border-zinc-700 shadow-md hover:shadow-xl hover:border-emerald-600 transition-all flex flex-col justify-between space-y-4 focus:ring-4 focus:ring-amber-400"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black group-hover:text-blue-700 dark:group-hover:text-blue-400">
                {t.simplifyCardTitle}
              </h4>
              <p className="text-zinc-600 dark:text-zinc-300 font-medium text-base sm:text-lg">
                {t.simplifyCardDesc}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 font-bold text-blue-800 dark:text-blue-400">
              Simplify Message or Image <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Safety Check */}
          <Link
            href="/safety"
            className="group bg-amber-50 dark:bg-amber-950/40 p-6 rounded-3xl border-3 border-amber-300 dark:border-amber-800 shadow-md hover:shadow-xl hover:border-amber-500 transition-all flex flex-col justify-between space-y-4 focus:ring-4 focus:ring-amber-400"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black text-amber-950 dark:text-amber-200 group-hover:text-amber-700">
                {t.safetyCardTitle}
              </h4>
              <p className="text-amber-900/80 dark:text-amber-200/80 font-medium text-base sm:text-lg">
                {t.safetyCardDesc}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
              Check Message Safety <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Guide Me */}
          <Link
            href="/guide"
            className="group bg-white dark:bg-zinc-800 p-6 rounded-3xl border-3 border-emerald-300 dark:border-zinc-700 shadow-md hover:shadow-xl hover:border-emerald-600 transition-all flex flex-col justify-between space-y-4 focus:ring-4 focus:ring-amber-400"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
                <ListChecks className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black group-hover:text-teal-700 dark:group-hover:text-teal-400">
                {t.guideCardTitle}
              </h4>
              <p className="text-zinc-600 dark:text-zinc-300 font-medium text-base sm:text-lg">
                {t.guideCardDesc}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 font-bold text-teal-800 dark:text-teal-400">
              Start Step-by-Step Task <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Reminders */}
          <Link
            href="/reminders"
            className="group bg-white dark:bg-zinc-800 p-6 rounded-3xl border-3 border-emerald-300 dark:border-zinc-700 shadow-md hover:shadow-xl hover:border-emerald-600 transition-all flex flex-col justify-between space-y-4 focus:ring-4 focus:ring-amber-400"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold">
                <Bell className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black group-hover:text-purple-700 dark:group-hover:text-purple-400">
                {t.remindersCardTitle}
              </h4>
              <p className="text-zinc-600 dark:text-zinc-300 font-medium text-base sm:text-lg">
                {t.remindersCardDesc}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 font-bold text-purple-800 dark:text-purple-400">
              Manage Reminders <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Today with Saathi Section (Real contextual prompts) */}
      <section className="bg-emerald-50 dark:bg-zinc-900 border-2 border-emerald-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
          <MessageSquareQuote className="w-6 h-6 text-emerald-700" />
          {t.todayWithSaathi}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/safety?q=URGENT: Your bank account will be blocked today. Click link to verify OTP"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-emerald-200 dark:border-zinc-700 hover:border-emerald-500 font-bold text-emerald-900 dark:text-emerald-200 transition-all hover:shadow-md flex items-center justify-between"
          >
            <span>"Check a message about urgent bank blockage"</span>
            <ArrowRight className="w-5 h-5 text-emerald-700 shrink-0" />
          </Link>

          <Link
            href="/simplify?q=Dear Customer, your electricity bill of Rs 1450 is due on 25th Sep. Pay online to avoid disconnection."
            className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-emerald-200 dark:border-zinc-700 hover:border-emerald-500 font-bold text-emerald-900 dark:text-emerald-200 transition-all hover:shadow-md flex items-center justify-between"
          >
            <span>"Simplify an electricity bill notice"</span>
            <ArrowRight className="w-5 h-5 text-emerald-700 shrink-0" />
          </Link>

          <Link
            href="/guide?task=How to increase font size on my phone"
            className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-emerald-200 dark:border-zinc-700 hover:border-emerald-500 font-bold text-emerald-900 dark:text-emerald-200 transition-all hover:shadow-md flex items-center justify-between"
          >
            <span>"Guide me: How to enlarge text on phone"</span>
            <ArrowRight className="w-5 h-5 text-emerald-700 shrink-0" />
          </Link>
        </div>

        {/* Recent Activities if available */}
        {recentActivities.length > 0 && (
          <div className="pt-4 border-t border-emerald-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-lg text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Recent Activities
            </h4>
            <div className="flex flex-wrap gap-2">
              {recentActivities.map((act) => (
                <span
                  key={act.id}
                  className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-xl border border-emerald-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  {act.title} ({act.timestamp})
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
