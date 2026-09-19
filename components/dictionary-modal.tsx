"use client";

import React, { useState } from "react";
import { BookOpen, X, Search, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

export interface DictionaryEntry {
  term: string;
  category: "Security" | "Banking" | "Internet" | "Device";
  whatItMeans: string;
  simpleExample: string;
  safetyCaution: string;
  isHighRisk: boolean;
}

export const DICTIONARY_ENTRIES: DictionaryEntry[] = [
  {
    term: "OTP",
    category: "Security",
    whatItMeans: "One-Time Password. A secret 4 or 6-digit number sent to your phone to verify identity.",
    simpleExample: "Like a single-use key sent via SMS to confirm you are logging in.",
    safetyCaution: "VERY CRITICAL: Never share your OTP with anyone over phone or text. Real banks never ask for your OTP.",
    isHighRisk: true,
  },
  {
    term: "UPI",
    category: "Banking",
    whatItMeans: "Unified Payments Interface. A fast way to transfer money directly between bank accounts using your phone.",
    simpleExample: "Google Pay, PhonePe, or Paytm transactions.",
    safetyCaution: "Entering your UPI PIN is ONLY needed when SENDING money, never to receive money.",
    isHighRisk: true,
  },
  {
    term: "QR Code",
    category: "Banking",
    whatItMeans: "Quick Response Code. A square pattern of black and white boxes that your phone camera scans.",
    simpleExample: "Scanned at shop counters or bills to pay directly.",
    safetyCaution: "Scanning a QR code plus entering a PIN pays money out of your account.",
    isHighRisk: true,
  },
  {
    term: "PIN",
    category: "Security",
    whatItMeans: "Personal Identification Number. A secret secret code (usually 4 or 6 digits) that unlocks your SIM, card, or UPI app.",
    simpleExample: "Your secret key to unlock your ATM card or payment app.",
    safetyCaution: "Keep your PIN completely secret. Never write it on your phone or card.",
    isHighRisk: true,
  },
  {
    term: "Wi-Fi",
    category: "Internet",
    whatItMeans: "Wireless Internet. Connects your mobile phone or computer to the internet without cables.",
    simpleExample: "Home broadband internet signal.",
    safetyCaution: "Avoid using open, un-passworded public Wi-Fi for bank transactions.",
    isHighRisk: false,
  },
  {
    term: "Browser",
    category: "Internet",
    whatItMeans: "An app on your phone used to view websites on the internet.",
    simpleExample: "Google Chrome, Apple Safari, or Microsoft Edge.",
    safetyCaution: "Check the top address bar to make sure you are on official websites.",
    isHighRisk: false,
  },
  {
    term: "URL / Link",
    category: "Internet",
    whatItMeans: "A website address (e.g. https://www.bank.com) that opens a page when tapped.",
    simpleExample: "A blue underlined text link in a message.",
    safetyCaution: "Be careful tapping unknown links in unexpected SMS messages.",
    isHighRisk: true,
  },
  {
    term: "Permission",
    category: "Device",
    whatItMeans: "An app asking your phone for permission to access your Camera, Location, Contacts, or Photos.",
    simpleExample: "WhatsApp asking to use your Camera to take a photo.",
    safetyCaution: "Only give permissions to trusted apps that actually require them.",
    isHighRisk: false,
  },
  {
    term: "PDF",
    category: "Device",
    whatItMeans: "Portable Document Format. A digital document file like a bill, bank statement, or receipt.",
    simpleExample: "Your monthly electricity bill document file.",
    safetyCaution: "Safe to read, but avoid opening PDF attachments from unknown senders.",
    isHighRisk: false,
  },
  {
    term: "Cloud",
    category: "Internet",
    whatItMeans: "Secure digital storage on the internet so you don't lose photos or contacts if your phone is lost.",
    simpleExample: "Google Photos or Apple iCloud.",
    safetyCaution: "Requires a strong account password.",
    isHighRisk: false,
  },
];

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTerm?: string;
}

export function DictionaryModal({ isOpen, onClose, initialTerm }: DictionaryModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialTerm || "");
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(
    initialTerm
      ? DICTIONARY_ENTRIES.find((e) => e.term.toLowerCase() === initialTerm.toLowerCase()) || DICTIONARY_ENTRIES[0]
      : DICTIONARY_ENTRIES[0]
  );

  if (!isOpen) return null;

  const filteredEntries = DICTIONARY_ENTRIES.filter(
    (e) =>
      e.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.whatItMeans.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        role="dialog" 
        aria-labelledby="dict-title" 
        className="w-full max-w-2xl rounded-3xl bg-[var(--surface)] p-6 md:p-8 shadow-2xl border border-[var(--border)] space-y-6 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 id="dict-title" className="text-xl font-bold">Digital Word Dictionary</h2>
              <p className="text-xs text-[var(--foreground)]/70">
                Simple everyday explanations for technology terms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--background)] text-[var(--foreground)]/70 hover:text-[var(--foreground)] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative shrink-0">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-[var(--foreground)]/50" />
          <input
            type="text"
            placeholder="Search word (e.g. OTP, UPI, Wi-Fi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-medium"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0 overflow-hidden">
          {/* Word List Column */}
          <div className="space-y-1.5 overflow-y-auto pr-1 md:border-r border-[var(--border)] max-h-48 md:max-h-full">
            {filteredEntries.map((entry) => (
              <button
                key={entry.term}
                onClick={() => setSelectedEntry(entry)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                  selectedEntry?.term === entry.term
                    ? "bg-[var(--accent)] text-white"
                    : "hover:bg-[var(--background)] text-[var(--foreground)]"
                }`}
              >
                <span>{entry.term}</span>
                {entry.isHighRisk && (
                  <ShieldAlert className={`h-3.5 w-3.5 ${selectedEntry?.term === entry.term ? "text-white" : "text-amber-500"}`} />
                )}
              </button>
            ))}
          </div>

          {/* Word Detail View */}
          <div className="md:col-span-2 overflow-y-auto pl-1 space-y-4">
            {selectedEntry ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[var(--accent)]">{selectedEntry.term}</h3>
                  <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    {selectedEntry.category}
                  </span>
                </div>

                <div className="rounded-2xl bg-[var(--background)] p-4 border border-[var(--border)] space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                    What it means
                  </span>
                  <p className="text-base font-medium leading-relaxed">
                    {selectedEntry.whatItMeans}
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--background)] p-4 border border-[var(--border)] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Everyday Example</span>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--foreground)]/90">
                    {selectedEntry.simpleExample}
                  </p>
                </div>

                <div className={`rounded-2xl p-4 border space-y-2 ${selectedEntry.isHighRisk ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"}`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                    {selectedEntry.isHighRisk ? <ShieldAlert className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    <span>Be Careful About</span>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed">
                    {selectedEntry.safetyCaution}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--foreground)]/60 italic">Select a word to view its simple explanation.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
