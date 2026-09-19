"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredSavedTips, deleteStoredTip, SavedTipItem, getStoredSettings, DEFAULT_SETTINGS } from "@/lib/storage";
import { TTSButton } from "@/components/tts-button";
import { Lightbulb, ArrowLeft, Trash2, Search, Sparkles, BookOpen } from "lucide-react";

export default function TipsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [tips, setTips] = useState<SavedTipItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSettings(getStoredSettings());
    setTips(getStoredSavedTips());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Remove this confidence tip from your saved cards?")) {
      deleteStoredTip(id);
      setTips(getStoredSavedTips());
    }
  };

  const filteredTips = tips.filter(
    (t) =>
      t.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tip.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-200 flex items-center gap-2">
          <Lightbulb className="w-8 h-8 text-amber-500" />
          My Confidence Cards
        </h2>
      </div>

      <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-3xl border-3 border-amber-300 dark:border-zinc-700 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
              Saved Safety Lessons & Tips
            </h3>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Reusable digital confidence cards saved from completed tasks.
            </p>
          </div>

          {tips.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tips..."
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-semibold text-sm"
              />
            </div>
          )}
        </div>

        {tips.length === 0 ? (
          <div className="p-8 text-center space-y-3 bg-amber-50/50 dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-amber-300">
            <Lightbulb className="w-12 h-12 text-amber-400 mx-auto" />
            <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
              No Confidence Cards saved yet.
            </p>
            <p className="text-base text-zinc-500 max-w-md mx-auto">
              Complete a guided task or safety check to save memorable digital confidence lessons!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTips.map((card) => (
              <div
                key={card.id}
                className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-950 p-6 rounded-3xl border-2 border-amber-300 dark:border-amber-900/60 shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-amber-400 text-amber-950 font-black text-xs uppercase rounded-full">
                      Confidence Card
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">{card.createdAt}</span>
                  </div>

                  <h4 className="text-lg font-black text-amber-950 dark:text-amber-100">
                    {card.taskTitle}
                  </h4>

                  <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed bg-white/80 dark:bg-zinc-800 p-4 rounded-2xl border border-amber-200 dark:border-zinc-700">
                    💡 "{card.tip}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-amber-200 dark:border-zinc-800 pt-3">
                  <TTSButton text={card.tip} language={settings.language} />

                  <button
                    onClick={() => handleDelete(card.id)}
                    className="p-3 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Remove tip"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
