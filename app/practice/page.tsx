"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { 
  ShieldCheck, 
  QrCode, 
  Wifi, 
  ExternalLink, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  RotateCcw,
  Sparkles
} from "lucide-react";

interface PracticeScenario {
  id: string;
  title: string;
  category: "Security" | "Banking" | "Settings" | "Browsing";
  icon: any;
  description: string;
  simulatedScreen: {
    title: string;
    senderOrUrl: string;
    messageText: string;
    choiceOptions: Array<{
      label: string;
      isSafe: boolean;
      feedback: string;
    }>;
  };
  keyTakeaway: string;
}

const SCENARIOS: PracticeScenario[] = [
  {
    id: "otp-scam",
    title: "Spotting an OTP Scam Call or SMS",
    category: "Security",
    icon: ShieldCheck,
    description: "Practice how to react when someone asks for an OTP code.",
    simulatedScreen: {
      title: "Incoming SMS Alert",
      senderOrUrl: "SMS from Unknown Number (+91 98765 00000)",
      messageText: "URGENT: Your bank account will be suspended today due to KYC delay. Share OTP 584920 with customer executive immediately to update.",
      choiceOptions: [
        {
          label: "Share OTP 584920 to fix account",
          isSafe: false,
          feedback: "❌ Never share an OTP! Real banks will NEVER ask for an OTP over SMS or phone calls. Sharing an OTP allows scammers to steal money.",
        },
        {
          label: "Do not share OTP & ignore/delete message",
          isSafe: true,
          feedback: "✅ Perfect choice! An OTP is strictly private. Ignoring and deleting suspicious OTP requests keeps your bank account completely safe.",
        },
      ],
    },
    keyTakeaway: "OTP = Private. Never read it aloud or send it to anyone who contacts you.",
  },
  {
    id: "qr-payment",
    title: "Understanding QR Code Payments",
    category: "Banking",
    icon: QrCode,
    description: "Understand whether scanning a QR code sends money or receives money.",
    simulatedScreen: {
      title: "Payment Screen Prompt",
      senderOrUrl: "Scanner App Prompt",
      messageText: "Someone claims they want to send you ₹2,000 as a refund. They ask you to scan a QR code and enter your UPI PIN.",
      choiceOptions: [
        {
          label: "Scan QR code and enter UPI PIN to receive ₹2,000",
          isSafe: false,
          feedback: "❌ Be careful! You NEVER need to enter your UPI PIN to RECEIVE money. Entering your UPI PIN will DEDUCT money from your bank account.",
        },
        {
          label: "Refuse to enter UPI PIN to receive money",
          isSafe: true,
          feedback: "✅ Excellent! Money comes directly into your account without entering a PIN. Scanning a QR code + entering a PIN is ONLY for paying out.",
        },
      ],
    },
    keyTakeaway: "UPI PIN is ONLY required when SENDING money, never when receiving.",
  },
  {
    id: "wifi-settings",
    title: "Connecting to Wi-Fi Safely",
    category: "Settings",
    icon: Wifi,
    description: "Learn how to spot safe home Wi-Fi versus unknown open networks.",
    simulatedScreen: {
      title: "Wi-Fi Networks Available",
      senderOrUrl: "Phone Settings",
      messageText: "You see two networks: 1) 'Free_Public_Unsecured_WiFi' and 2) 'MyHome_WiFi (Secured with Password)'.",
      choiceOptions: [
        {
          label: "Connect to 'Free_Public_Unsecured_WiFi'",
          isSafe: false,
          feedback: "⚠️ Open public Wi-Fi networks in unknown places can be unsafe for banking or private passwords.",
        },
        {
          label: "Connect to 'MyHome_WiFi' using private password",
          isSafe: true,
          feedback: "✅ Great choice! Private password-protected networks are much safer for everyday digital tasks.",
        },
      ],
    },
    keyTakeaway: "Use password-protected Wi-Fi for banking or sensitive activities.",
  },
  {
    id: "suspicious-link",
    title: "Checking Suspicious Web Links",
    category: "Browsing",
    icon: ExternalLink,
    description: "Learn to spot fake website addresses in messages.",
    simulatedScreen: {
      title: "Message with Link",
      senderOrUrl: "Notice from Electricity Dept?",
      messageText: "Your bill of ₹450 is unpaid. Pay now at http://bit.ly/pay-bill-fast or power cut tonight at 9 PM.",
      choiceOptions: [
        {
          label: "Tap the bit.ly link immediately and pay",
          isSafe: false,
          feedback: "❌ Shortened links like bit.ly hide the real destination address and are frequently used in electricity bill scams.",
        },
        {
          label: "Pay through official bill payment app or website",
          isSafe: true,
          feedback: "✅ Smart choice! Always open official electricity provider apps or websites directly instead of tapping links in random SMS messages.",
        },
      ],
    },
    keyTakeaway: "Shortened or strange web links in urgent texts are red flags.",
  },
];

export default function PracticePage() {
  const [activeScenario, setActiveScenario] = useState<PracticeScenario | null>(null);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);

  const handleSelectScenario = (sc: PracticeScenario) => {
    setActiveScenario(sc);
    setSelectedChoiceIndex(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Practice Environment • Zero Risk
          </span>
        </div>

        {/* Title Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-transparent p-6 md:p-8 border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Practice with Saathi</h1>
              <p className="text-sm text-[var(--foreground)]/80">
                Practice everyday digital situations safely. No real money or real passwords—just pure confidence.
              </p>
            </div>
          </div>
        </div>

        {/* Active Scenario Interactive View */}
        {activeScenario ? (
          <div className="rounded-3xl bg-[var(--surface)] p-6 md:p-8 border border-[var(--border)] shadow-xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-3">
                <activeScenario.icon className="h-7 w-7 text-[var(--accent)]" />
                <div>
                  <span className="text-xs font-semibold uppercase text-emerald-600">
                    {activeScenario.category} Practice
                  </span>
                  <h2 className="text-xl font-bold">{activeScenario.title}</h2>
                </div>
              </div>
              <button
                onClick={() => setActiveScenario(null)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--foreground)]/70 hover:text-[var(--foreground)] cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Choose another topic</span>
              </button>
            </div>

            {/* Simulated Screen Box */}
            <div className="rounded-2xl bg-[var(--background)] p-5 md:p-6 border-2 border-dashed border-[var(--border)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  PRACTICE SCREEN SIMULATION
                </span>
                <span className="text-xs text-[var(--foreground)]/60">
                  {activeScenario.simulatedScreen.senderOrUrl}
                </span>
              </div>

              <div className="rounded-xl bg-[var(--surface)] p-4 border border-[var(--border)] font-sans text-base leading-relaxed font-medium">
                "{activeScenario.simulatedScreen.messageText}"
              </div>

              <p className="text-sm font-semibold text-[var(--foreground)]/90 pt-2">
                What is the safest action to take?
              </p>

              {/* Options */}
              <div className="space-y-3">
                {activeScenario.simulatedScreen.choiceOptions.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedChoiceIndex(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer font-semibold ${
                      selectedChoiceIndex === idx
                        ? choice.isSafe
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                          : "border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-100"
                        : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--background)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{choice.label}</span>
                      {selectedChoiceIndex === idx && (
                        <CheckCircle2 className={`h-5 w-5 shrink-0 ${choice.isSafe ? "text-emerald-600" : "text-rose-600"}`} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Box */}
            {selectedChoiceIndex !== null && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div 
                  className={`rounded-2xl p-5 border ${
                    activeScenario.simulatedScreen.choiceOptions[selectedChoiceIndex].isSafe
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100"
                  }`}
                >
                  <p className="text-base font-semibold">
                    {activeScenario.simulatedScreen.choiceOptions[selectedChoiceIndex].feedback}
                  </p>
                </div>

                {/* What did we learn? */}
                <div className="rounded-2xl bg-[var(--background)] p-5 border border-[var(--border)] space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
                    <Sparkles className="h-4 w-4" />
                    <span>What did we learn?</span>
                  </div>
                  <p className="text-base font-medium text-[var(--foreground)]">
                    {activeScenario.keyTakeaway}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveScenario(null)}
                    className="rounded-xl bg-[var(--accent)] text-white font-semibold py-3 px-6 text-sm hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Try another practice topic
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Topic Grid */
          <div className="grid gap-4 sm:grid-cols-2">
            {SCENARIOS.map((sc) => {
              const IconComp = sc.icon;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc)}
                  className="group flex flex-col text-left p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] group-hover:scale-105 transition-transform">
                      <IconComp className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      {sc.category}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-[var(--accent)] transition-colors">
                      {sc.title}
                    </h3>
                    <p className="text-sm text-[var(--foreground)]/70 mt-1">
                      {sc.description}
                    </p>
                  </div>
                  <div className="pt-2 text-xs font-semibold text-[var(--accent)] flex items-center gap-1">
                    <span>Start Practice</span>
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
