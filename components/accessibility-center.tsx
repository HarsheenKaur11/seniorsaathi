"use client";

import React, { useState, useEffect } from "react";
import {
  AccessibilitySettings,
  DEFAULT_SETTINGS,
  getStoredSettings,
  saveStoredSettings,
  clearAllPreferences,
  TextSize,
  ContrastMode,
  Language,
  AssistanceLevel,
} from "@/lib/storage";
import { ThemeSwitcher } from "./theme-switcher";
import { TRANSLATIONS } from "@/lib/translations";
import { SUPPORTED_LANGUAGES } from "@/lib/translation/provider";
import { Settings, Eye, Type, Volume2, Globe, Trash2, X, Check, HeartHandshake, Feather, Layers } from "lucide-react";

interface AccessibilityCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
}

export function AccessibilityCenter({ isOpen, onClose, onSettingsChange }: AccessibilityCenterProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loaded = getStoredSettings();
    setSettings(loaded);
  }, [isOpen]);

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveStoredSettings(next);
    if (onSettingsChange) onSettingsChange(next);
  };

  const handleForget = () => {
    if (confirm("Reset all stored accessibility, reminders, and confidence tips preferences?")) {
      clearAllPreferences();
      setSettings(DEFAULT_SETTINGS);
      if (onSettingsChange) onSettingsChange(DEFAULT_SETTINGS);
      onClose();
    }
  };

  if (!isOpen) return null;

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.English;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="acc-title"
    >
      <div className="bg-emerald-50 dark:bg-zinc-900 border-2 border-emerald-700 dark:border-emerald-500 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 text-zinc-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-emerald-200 dark:border-zinc-700 pb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-emerald-800 dark:text-emerald-400" />
            <h2 id="acc-title" className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t.accessibilitySettings}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-3 bg-emerald-100 hover:bg-emerald-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Display Theme */}
          <ThemeSwitcher />

          {/* Calm Mode & One Thing At A Time Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between bg-white dark:bg-zinc-800 p-4 rounded-2xl border-2 border-emerald-200 dark:border-zinc-700">
              <div className="flex items-center gap-2.5">
                <Feather className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <p className="font-bold text-sm">Calm Mode</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Low cognitive load</p>
                </div>
              </div>
              <button
                onClick={() => updateSetting("calmMode", !settings.calmMode)}
                aria-checked={settings.calmMode}
                role="switch"
                className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center cursor-pointer ${
                  settings.calmMode ? "bg-emerald-700 justify-end" : "bg-zinc-300 dark:bg-zinc-600 justify-start"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-md block" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-zinc-800 p-4 rounded-2xl border-2 border-emerald-200 dark:border-zinc-700">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <p className="font-bold text-sm">One Thing At A Time</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Focus on single action</p>
                </div>
              </div>
              <button
                onClick={() => updateSetting("oneThingAtATime", !settings.oneThingAtATime)}
                aria-checked={settings.oneThingAtATime}
                role="switch"
                className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center cursor-pointer ${
                  settings.oneThingAtATime ? "bg-emerald-700 justify-end" : "bg-zinc-300 dark:bg-zinc-600 justify-start"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-md block" />
              </button>
            </div>
          </div>

          {/* Assistance Level */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-bold text-lg text-emerald-950 dark:text-emerald-200">
              <HeartHandshake className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              How Much Help Would You Like?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["gentle", "standard", "independent"] as AssistanceLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => updateSetting("assistanceLevel", lvl)}
                  className={`py-3 px-3 rounded-xl border-2 font-semibold capitalize text-sm sm:text-base min-h-[52px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    settings.assistanceLevel === lvl
                      ? "bg-emerald-800 text-white border-emerald-900 shadow-md"
                      : "bg-white dark:bg-zinc-800 border-emerald-300 dark:border-zinc-600 hover:border-emerald-600"
                  }`}
                >
                  {settings.assistanceLevel === lvl && <Check className="w-4 h-4" />}
                  {lvl === "gentle" ? "Gentle" : lvl === "standard" ? "Standard" : "Independent"}
                </button>
              ))}
            </div>
          </div>

          {/* Text Size */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-bold text-lg text-emerald-950 dark:text-emerald-200">
              <Type className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              {t.textSize}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["standard", "large", "xlarge"] as TextSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateSetting("textSize", size)}
                  className={`py-3 px-3 rounded-xl border-2 font-semibold capitalize text-sm sm:text-base min-h-[52px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    settings.textSize === size
                      ? "bg-emerald-800 text-white border-emerald-900 shadow-md"
                      : "bg-white dark:bg-zinc-800 border-emerald-300 dark:border-zinc-600 hover:border-emerald-600"
                  }`}
                >
                  {settings.textSize === size && <Check className="w-4 h-4" />}
                  {size === "standard" ? "Standard" : size === "large" ? "Large" : "Extra Large"}
                </button>
              ))}
            </div>
          </div>

          {/* Contrast Mode */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-bold text-lg text-emerald-950 dark:text-emerald-200">
              <Eye className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              {t.contrast}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["standard", "high"] as ContrastMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => updateSetting("contrast", mode)}
                  className={`py-3 px-4 rounded-xl border-2 font-semibold text-base min-h-[52px] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    settings.contrast === mode
                      ? "bg-emerald-800 text-white border-emerald-900 shadow-md"
                      : "bg-white dark:bg-zinc-800 border-emerald-300 dark:border-zinc-600 hover:border-emerald-600"
                  }`}
                >
                  {settings.contrast === mode && <Check className="w-4 h-4" />}
                  {mode === "standard" ? "Standard Colors" : "High Contrast"}
                </button>
              ))}
            </div>
          </div>

          {/* Global Searchable Language Selector */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-bold text-lg text-emerald-950 dark:text-emerald-200">
              <Globe className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              {t.language} (Speak My Language)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-emerald-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-800">
              {SUPPORTED_LANGUAGES.map((langObj) => {
                const isSelected = settings.language === langObj.name;
                return (
                  <button
                    key={langObj.code}
                    type="button"
                    onClick={() => updateSetting("language", langObj.name as Language)}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-800 text-white border-emerald-900 shadow-sm"
                        : "bg-emerald-50/50 dark:bg-zinc-900/50 border-emerald-200 dark:border-zinc-700 hover:border-emerald-600"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{langObj.nativeName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto Read Aloud */}
          <div className="flex items-center justify-between bg-white dark:bg-zinc-800 p-4 rounded-2xl border-2 border-emerald-200 dark:border-zinc-700">
            <div className="flex items-center gap-3">
              <Volume2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
              <div>
                <p className="font-bold text-base sm:text-lg">{t.autoReadAloud}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Automatically read AI responses out loud</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting("autoReadAloud", !settings.autoReadAloud)}
              aria-checked={settings.autoReadAloud}
              role="switch"
              className={`w-14 h-8 rounded-full p-1 transition-colors min-w-[56px] min-h-[32px] flex items-center cursor-pointer ${
                settings.autoReadAloud ? "bg-emerald-700 justify-end" : "bg-zinc-300 dark:bg-zinc-600 justify-start"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          {/* Forget My Preferences */}
          <div className="pt-4 border-t border-emerald-200 dark:border-zinc-700 flex justify-end">
            <button
              onClick={handleForget}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 text-red-700 dark:text-red-300 font-bold border-2 border-red-300 dark:border-red-800 transition-colors min-h-[48px] cursor-pointer"
            >
              <Trash2 className="w-5 h-5" />
              {t.forgetPreferences}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
