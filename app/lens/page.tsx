"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TTSButton } from "@/components/tts-button";
import { getStoredSettings, AccessibilitySettings, DEFAULT_SETTINGS, addRecentActivity } from "@/lib/storage";
import { TRANSLATIONS } from "@/lib/translations";
import { LensResponse } from "@/lib/ai/schemas";
import { Camera, ArrowLeft, Upload, X, Loader2, AlertTriangle, ArrowRight, ListChecks, ShieldAlert, Eye, MapPin } from "lucide-react";

export default function SaathiLensPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userNote, setUserNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<LensResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size is too large. Please select an image under 5MB.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setResponse(null);
  };

  const handleInspectScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      alert("Please upload a screenshot or photo to inspect.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/lens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imagePreview,
          imageMimeType: imageFile?.type || "image/jpeg",
          text: userNote.trim(),
          language: settings.language,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Could not inspect screen image.");
      }

      setResponse(json.data);
      addRecentActivity(`Saathi Lens: ${json.data.whatItIs.slice(0, 20)}`, "lens");
    } catch (e: any) {
      setError(e?.message || "Error analyzing image.");
    } finally {
      setLoading(false);
    }
  };

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.English;

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
        <h2 className="text-2xl sm:text-3xl font-black text-blue-950 dark:text-blue-100 flex items-center gap-2">
          <Camera className="w-8 h-8 text-amber-500" />
          Saathi Lens
        </h2>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleInspectScreen} className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-3xl border-3 border-blue-300 dark:border-zinc-700 shadow-md space-y-5">
        <div className="space-y-2">
          <label className="block text-xl font-bold text-blue-950 dark:text-blue-100">
            Upload a photo or screenshot of any screen or document:
          </label>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You can upload banking screenshots, phone settings, web pages, bills, or app errors.
          </p>
        </div>

        {!imagePreview ? (
          <label className="border-3 border-dashed border-blue-300 dark:border-zinc-600 hover:border-blue-500 bg-blue-50/50 dark:bg-zinc-900 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors min-h-[200px]">
            <Upload className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xl font-bold text-blue-950 dark:text-blue-200">
                Tap to Select Photo or Screenshot
              </p>
              <p className="text-sm text-zinc-500">Supports JPG, PNG, WEBP (Max 5MB)</p>
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        ) : (
          <div className="relative inline-block border-3 border-blue-400 rounded-3xl overflow-hidden p-2 bg-blue-50 dark:bg-zinc-900 w-full text-center">
            <img src={imagePreview} alt="Screenshot preview" className="max-h-80 mx-auto rounded-2xl object-contain" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xl min-w-[48px] min-h-[48px] flex items-center justify-center"
              title="Remove image"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {imagePreview && (
          <div className="space-y-4 pt-2">
            <input
              type="text"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="Optional: What specific question do you have about this screen?"
              className="w-full h-14 px-4 rounded-xl bg-blue-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold text-lg border-2 border-blue-300 dark:border-zinc-600"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-black text-xl rounded-2xl shadow-lg flex items-center justify-center gap-2 min-h-[56px] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Inspect Screen with Saathi Lens"}
            </button>
          </div>
        )}
      </form>

      {/* Loading state */}
      {loading && (
        <div className="bg-blue-50 dark:bg-zinc-800 border-2 border-blue-300 p-8 rounded-3xl text-center space-y-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="text-xl font-bold text-blue-950 dark:text-blue-100">
            “Saathi Lens is looking at your screen image carefully...”
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-300 p-6 rounded-3xl text-red-800 dark:text-red-200">
          <p className="text-lg font-bold">{error}</p>
        </div>
      )}

      {/* Saathi Lens Inspection Output */}
      {response && !loading && (
        <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-3xl border-3 border-blue-500 dark:border-zinc-700 shadow-xl space-y-8">
          {/* Top Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-700 pb-4">
            <span className="px-3 py-1 bg-amber-400 text-blue-950 rounded-full font-black text-xs uppercase">
              Saathi Lens Analysis
            </span>

            <TTSButton
              text={`${response.whatItIs}. ${response.whatItMeans}`}
              language={settings.language}
            />
          </div>

          {/* WHAT AM I LOOKING AT? */}
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-blue-900 dark:text-blue-300 uppercase tracking-wide">
              WHAT AM I LOOKING AT?
            </h3>
            <p className="text-xl font-bold text-zinc-900 dark:text-white bg-blue-50 dark:bg-zinc-900 p-4 rounded-2xl border border-blue-200 dark:border-zinc-700">
              🔍 {response.whatItIs}
            </p>
          </div>

          {/* WHAT DOES IT MEAN? */}
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-wide">
              WHAT DOES IT MEAN?
            </h3>
            <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200 bg-emerald-50/60 dark:bg-zinc-900 p-5 rounded-2xl border border-emerald-200 dark:border-zinc-700 leading-relaxed">
              {response.whatItMeans}
            </p>
          </div>

          {/* SCREEN CONTROL LOCATOR HINT */}
          {response.screenControlHint && (
            <div className="p-5 bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400 rounded-2xl space-y-1">
              <p className="font-black text-lg text-amber-950 dark:text-amber-200 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-amber-600" />
                Screen Location Hint
              </p>
              <p className="text-lg font-semibold text-amber-900 dark:text-amber-300">
                {response.screenControlHint}
              </p>
            </div>
          )}

          {/* IMPORTANT DETAILS */}
          {response.importantDetails.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-wide">
                KEY DETAILS ON THIS SCREEN
              </h3>
              <div className="space-y-2">
                {response.importantDetails.map((detail, idx) => (
                  <div key={idx} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 font-semibold text-lg text-zinc-800 dark:text-zinc-200">
                    📌 {detail}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUSPICIOUS FLAGS */}
          {response.suspiciousFlags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-black text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                SUSPICIOUS FLAGS DETECTED
              </h3>
              <div className="bg-red-50 dark:bg-red-950/60 border-2 border-red-300 p-4 rounded-2xl space-y-2 text-red-900 dark:text-red-200">
                <ul className="list-disc pl-6 space-y-1 font-semibold text-lg">
                  {response.suspiciousFlags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700 flex flex-wrap gap-4 items-center justify-between">
            <button
              onClick={() => router.push(`/safety?q=${encodeURIComponent(response.whatItIs)}`)}
              className="px-5 py-3 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200 rounded-xl font-bold border border-amber-300 flex items-center gap-2 min-h-[48px]"
            >
              <ShieldAlert className="w-5 h-5" /> Check Safety of Screen
            </button>

            <button
              onClick={() => router.push(`/guide?task=${encodeURIComponent(response.guidedTaskPrompt || response.whatItIs)}`)}
              className="px-8 py-4 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xl rounded-2xl flex items-center gap-2 shadow-lg min-h-[56px]"
            >
              <ListChecks className="w-6 h-6 text-amber-300" /> Guide me step-by-step
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
