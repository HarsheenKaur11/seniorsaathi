"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import { Language } from "@/lib/storage";

interface TTSButtonProps {
  text: string;
  language?: Language;
  className?: string;
}

export function TTSButton({ text, language = "English", className = "" }: TTSButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
      setIsSupported(false);
    }
  }, []);

  const cleanTextForSpeech = (raw: string) => {
    return raw
      .replace(/[*_#`~]/g, "")
      .replace(/https?:\/\/[^\s]+/g, "a website link")
      .trim();
  };

  const handleTogglePlay = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    if (isPlaying) {
      if (isPaused) {
        synth.resume();
        setIsPaused(false);
      } else {
        synth.pause();
        setIsPaused(true);
      }
      return;
    }

    // Start speaking
    synth.cancel(); // stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));

    if (language === "Hindi") utterance.lang = "hi-IN";
    else if (language === "Punjabi") utterance.lang = "pa-IN";
    else utterance.lang = "en-US";

    utterance.rate = 0.9; // Slightly slower speed for seniors

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
  };

  const handleStop = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported || !text) return null;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleTogglePlay}
        aria-label={isPlaying ? (isPaused ? "Resume read aloud" : "Pause read aloud") : "Read text out loud"}
        className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 border-2 transition-all min-h-[48px] ${
          isPlaying
            ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-800 shadow-md"
            : "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border-emerald-400 dark:border-emerald-700"
        }`}
      >
        {isPlaying ? (
          isPaused ? (
            <>
              <Play className="w-5 h-5" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </>
          )
        ) : (
          <>
            <Volume2 className="w-5 h-5" />
            <span>🔊 Read Aloud</span>
          </>
        )}
      </button>

      {isPlaying && (
        <button
          type="button"
          onClick={handleStop}
          aria-label="Stop reading out loud"
          className="p-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 min-w-[48px] min-h-[48px] flex items-center justify-center"
        >
          <VolumeX className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
