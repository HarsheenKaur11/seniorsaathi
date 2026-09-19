"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Language } from "@/lib/storage";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language?: Language;
  className?: string;
}

export function VoiceInput({ onTranscript, language = "English", className = "" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcriptPreview, setTranscriptPreview] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const startListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      if (language === "Hindi") recognition.lang = "hi-IN";
      else if (language === "Punjabi") recognition.lang = "pa-IN";
      else recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setTranscriptPreview("");
      };

      recognition.onresult = (event: any) => {
        let current = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscriptPreview(current);
        if (event.results[0].isFinal) {
          onTranscript(current);
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          alert("Microphone permission was denied. Please allow microphone access to speak.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        title="Speech recognition is not available in this browser"
        className={`p-3 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-400 min-w-[52px] min-h-[52px] flex items-center justify-center cursor-not-allowed ${className}`}
      >
        <MicOff className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={startListening}
        aria-label={isListening ? "Listening to your voice..." : "Click to speak with microphone"}
        aria-pressed={isListening}
        className={`p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all min-w-[56px] min-h-[56px] ${
          isListening
            ? "bg-red-600 text-white animate-pulse shadow-lg scale-105"
            : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-md active:scale-95"
        } ${className}`}
      >
        {isListening ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="hidden sm:inline text-base">Listening...</span>
          </>
        ) : (
          <>
            <Mic className="w-6 h-6" />
            <span className="hidden sm:inline text-base">Speak</span>
          </>
        )}
      </button>

      {isListening && transcriptPreview && (
        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap shadow-xl z-50">
          🗣️ "{transcriptPreview}"
        </div>
      )}
    </div>
  );
}
