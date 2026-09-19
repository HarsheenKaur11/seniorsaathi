"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { VoiceInput } from "@/components/voice-input";
import { TTSButton } from "@/components/tts-button";
import { getStoredSettings, AccessibilitySettings, DEFAULT_SETTINGS, addRecentActivity } from "@/lib/storage";
import { TRANSLATIONS } from "@/lib/translations";
import { SimplifyResponse } from "@/lib/ai/schemas";
import { FileText, ArrowLeft, Upload, X, Loader2, AlertTriangle, ArrowRight, ShieldAlert, ListChecks, Image as ImageIcon } from "lucide-react";

function SimplifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [inputText, setInputText] = useState(initialQuery);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SimplifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 5MB.");
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
  };

  const handleSimplify = async (overrideText?: string) => {
    const textToUse = overrideText !== undefined ? overrideText : inputText;
    if (!textToUse.trim() && !imagePreview) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const payload: any = {
        text: textToUse.trim(),
        language: settings.language,
      };

      if (imagePreview) {
        payload.imageBase64 = imagePreview;
        payload.imageMimeType = imageFile?.type || "image/jpeg";
      }

      const res = await fetch("/api/ai/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Could not simplify input.");
      }

      setResponse(json.data);
      addRecentActivity(`Simplify: ${textToUse.slice(0, 20) || "Screenshot"}`, "simplify");
    } catch (e: any) {
      setError(e?.message || "Error processing request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSimplify(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSimplify();
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
          {t.back}
        </button>
        <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          Simplify Anything
        </h2>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-3xl border-3 border-emerald-200 dark:border-zinc-700 shadow-md space-y-5">
        <div className="space-y-2">
          <label className="block text-xl font-bold text-emerald-950 dark:text-emerald-100">
            Paste confusing text, SMS, bill notice, or upload a photo:
          </label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your confusing message, bill details, or letter here..."
            className="w-full p-4 rounded-2xl bg-emerald-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium text-lg border-2 border-emerald-300 dark:border-zinc-600 focus:outline-hidden focus:ring-4 focus:ring-amber-400"
          />
        </div>

        {/* Image Preview if uploaded */}
        {imagePreview && (
          <div className="relative inline-block border-2 border-blue-400 rounded-2xl overflow-hidden p-2 bg-blue-50 dark:bg-zinc-900">
            <img src={imagePreview} alt="Uploaded screenshot preview" className="max-h-48 rounded-xl object-contain" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 min-w-[36px] min-h-[36px] flex items-center justify-center shadow-lg"
              title="Remove photo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Action bar for Upload, Voice, and Simplify */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-100 dark:border-zinc-700">
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer px-4 py-3 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 hover:bg-blue-200 rounded-2xl font-bold border-2 border-blue-300 flex items-center gap-2 min-h-[52px]">
              <Upload className="w-5 h-5" />
              <span>{imageFile ? "Change Photo" : "Upload Photo / Screenshot"}</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            <VoiceInput
              onTranscript={(text) => {
                setInputText(text);
                handleSimplify(text);
              }}
              language={settings.language}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xl rounded-2xl shadow-lg flex items-center gap-2 min-h-[56px] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Simplify Now"}
          </button>
        </div>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="bg-emerald-50 dark:bg-zinc-800 border-2 border-emerald-300 p-8 rounded-3xl text-center space-y-3">
          <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mx-auto" />
          <p className="text-xl font-bold text-emerald-950 dark:text-emerald-100">
            “Saathi is simplifying this information for you...”
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-300 p-6 rounded-3xl text-red-800 dark:text-red-200 space-y-2">
          <p className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" /> {error}
          </p>
        </div>
      )}

      {/* Structured Output */}
      {response && !loading && (
        <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-3xl border-3 border-blue-400 dark:border-zinc-700 shadow-xl space-y-8">
          {/* Top Bar with Read Aloud */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-700 pb-4">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 rounded-full font-bold text-sm uppercase">
              Simplified Overview
            </span>
            <TTSButton
              text={`What this means: ${response.whatThisMeans}. What you need to do: ${response.actionSteps.join(", ")}`}
              language={settings.language}
            />
          </div>

          {/* Section 1: WHAT THIS MEANS */}
          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-wide uppercase text-blue-900 dark:text-blue-400">
              WHAT THIS MEANS
            </h3>
            <p className="text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 font-medium bg-blue-50/70 dark:bg-zinc-900 p-5 rounded-2xl border border-blue-200 dark:border-zinc-700 leading-relaxed">
              {response.whatThisMeans}
            </p>
          </div>

          {/* Section 2: WHAT YOU NEED TO DO */}
          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-wide uppercase text-emerald-900 dark:text-emerald-400">
              WHAT YOU NEED TO DO
            </h3>
            <div className="space-y-3">
              {response.actionSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-emerald-50/60 dark:bg-zinc-900 rounded-2xl border border-emerald-200 dark:border-zinc-700">
                  <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-lg font-semibold text-emerald-950 dark:text-emerald-100 pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: IMPORTANT INFORMATION */}
          {response.importantInfo.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-purple-900 dark:text-purple-400">
                IMPORTANT INFORMATION
              </h3>
              <ul className="space-y-2">
                {response.importantInfo.map((info, idx) => (
                  <li key={idx} className="p-4 bg-purple-50 dark:bg-zinc-900 rounded-2xl border border-purple-200 dark:border-zinc-700 font-semibold text-lg text-purple-950 dark:text-purple-200">
                    📌 {info}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 4: BE CAREFUL ABOUT */}
          {response.caution.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-black tracking-wide uppercase text-amber-900 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                BE CAREFUL ABOUT
              </h3>
              <div className="bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 p-5 rounded-2xl space-y-2">
                <ul className="list-disc pl-6 space-y-1 font-semibold text-lg text-amber-950 dark:text-amber-200">
                  {response.caution.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Cross-Feature Continuities */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSimplify(`Explain this even more simply in shorter words: ${inputText}`)}
                className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 rounded-xl font-bold text-zinc-900 dark:text-zinc-100 min-h-[48px]"
              >
                Make it even simpler
              </button>

              <button
                onClick={() => router.push(`/safety?q=${encodeURIComponent(inputText)}`)}
                className="px-4 py-3 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200 rounded-xl font-bold border border-amber-300 flex items-center gap-2 min-h-[48px]"
              >
                <ShieldAlert className="w-5 h-5" />
                Check if suspicious
              </button>
            </div>

            <button
              onClick={() => router.push(`/guide?task=${encodeURIComponent(response.whatThisMeans)}`)}
              className="px-6 py-4 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl flex items-center gap-2 shadow-md min-h-[52px]"
            >
              <ListChecks className="w-6 h-6 text-amber-300" />
              Guide me step-by-step
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SimplifyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-lg font-bold">Loading Simplify...</div>}>
      <SimplifyContent />
    </Suspense>
  );
}
