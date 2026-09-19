"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AccessibilityCenter } from "./accessibility-center";
import {
  AccessibilitySettings,
  DEFAULT_SETTINGS,
  getStoredSettings,
  applyDOMAccessibilitySettings,
} from "@/lib/storage";
import { TRANSLATIONS } from "@/lib/translations";
import { Settings, ShieldCheck, Home, HelpCircle, Bell, Sparkles } from "lucide-react";

export function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loaded = getStoredSettings();
    setSettings(loaded);
    applyDOMAccessibilitySettings(loaded);
  }, []);

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.English;

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-amber-50 shadow-md border-b-4 border-emerald-950">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-hidden focus:ring-4 focus:ring-amber-400 rounded-xl p-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-105 transition-transform">
            S
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-white">
              {t.appName}
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-extrabold uppercase bg-amber-400 text-emerald-950 rounded-full">
                Companion
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200 font-medium">{t.tagline}</p>
          </div>
        </Link>

        {/* Quick Actions / Accessibility */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/reminders"
            className="p-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors focus:ring-4 focus:ring-amber-400"
            title="Reminders"
            aria-label="View Reminders"
          >
            <Bell className="w-6 h-6" />
          </Link>

          <Link
            href="/privacy"
            className="p-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors focus:ring-4 focus:ring-amber-400"
            title="Privacy & Safety Info"
            aria-label="Privacy and Safety Info"
          >
            <ShieldCheck className="w-6 h-6" />
          </Link>

          <button
            onClick={() => setSettingsOpen(true)}
            className="px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-md transition-all min-h-[48px] focus:ring-4 focus:ring-amber-200"
            aria-label="Open Accessibility Settings"
          >
            <Settings className="w-6 h-6" />
            <span className="hidden md:inline">{t.accessibilitySettings}</span>
          </button>
        </div>
      </div>

      {/* Accessibility Settings Modal */}
      <AccessibilityCenter
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSettingsChange={(newSettings) => setSettings(newSettings)}
      />
    </header>
  );
}
