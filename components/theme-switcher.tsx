"use client";

import React, { useState, useEffect } from "react";
import { ThemeMode, getStoredSettings, saveStoredSettings } from "@/lib/storage";
import { Sun, Moon, Laptop, Check } from "lucide-react";

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className = "" }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<ThemeMode>("system");

  useEffect(() => {
    const loaded = getStoredSettings();
    setTheme(loaded.theme || "system");
  }, []);

  const handleSelect = (mode: ThemeMode) => {
    setTheme(mode);
    const settings = getStoredSettings();
    saveStoredSettings({ ...settings, theme: mode });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block font-bold text-lg text-emerald-950 dark:text-emerald-200">
        Display Theme
      </label>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => handleSelect("light")}
          aria-pressed={theme === "light"}
          className={`py-3 px-3 rounded-xl border-2 font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 min-h-[48px] transition-all ${
            theme === "light"
              ? "bg-amber-400 text-emerald-950 border-amber-500 shadow-md"
              : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-emerald-500"
          }`}
        >
          <Sun className="w-5 h-5 text-amber-600" />
          <span>Light</span>
          {theme === "light" && <Check className="w-4 h-4 ml-auto" />}
        </button>

        <button
          type="button"
          onClick={() => handleSelect("dark")}
          aria-pressed={theme === "dark"}
          className={`py-3 px-3 rounded-xl border-2 font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 min-h-[48px] transition-all ${
            theme === "dark"
              ? "bg-emerald-800 text-white border-emerald-900 shadow-md"
              : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-emerald-500"
          }`}
        >
          <Moon className="w-5 h-5 text-emerald-400" />
          <span>Dark</span>
          {theme === "dark" && <Check className="w-4 h-4 ml-auto" />}
        </button>

        <button
          type="button"
          onClick={() => handleSelect("system")}
          aria-pressed={theme === "system"}
          className={`py-3 px-3 rounded-xl border-2 font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 min-h-[48px] transition-all ${
            theme === "system"
              ? "bg-emerald-800 text-white border-emerald-900 shadow-md"
              : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-emerald-500"
          }`}
        >
          <Laptop className="w-5 h-5 text-blue-400" />
          <span>System</span>
          {theme === "system" && <Check className="w-4 h-4 ml-auto" />}
        </button>
      </div>
    </div>
  );
}
