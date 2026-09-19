"use client";

import React, { useState, useEffect } from "react";
import { Users, Share2, Copy, Check, X, ShieldCheck, Phone, Plus, Trash2 } from "lucide-react";
import { getStoredTrustedContacts, saveStoredTrustedContacts, TrustedContact } from "@/lib/storage";
import { redactSensitiveSecrets } from "@/lib/ai/deterministic-safety";

interface SaathiCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawSummaryToShare?: string;
}

export function SaathiCircleModal({
  isOpen,
  onClose,
  rawSummaryToShare,
}: SaathiCircleModalProps) {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactRelation, setNewContactRelation] = useState("Family");
  const [newContactPhone, setNewContactPhone] = useState("");

  const [shareText, setShareText] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedContactPhone, setSelectedContactPhone] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredTrustedContacts();
      setContacts(stored);
      if (stored.length > 0) {
        setSelectedContactPhone(stored[0].phone || "");
      }

      if (rawSummaryToShare) {
        const sanitized = redactSensitiveSecrets(rawSummaryToShare);
        setShareText(`Hi! I am using SeniorSaathi to check a digital message.\n\nSummary:\n"${sanitized}"\n\nCould you please help me confirm this?`);
      } else {
        setShareText("Hi! I'm using SeniorSaathi for step-by-step assistance with my phone.");
      }
    }
  }, [isOpen, rawSummaryToShare]);

  if (!isOpen) return null;

  const handleAddContact = () => {
    if (!newContactName.trim()) return;
    const newContact: TrustedContact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      relation: newContactRelation,
      phone: newContactPhone.trim(),
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    saveStoredTrustedContacts(updated);
    setNewContactName("");
    setNewContactPhone("");
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveStoredTrustedContacts(updated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    const phoneClean = selectedContactPhone.replace(/[^0-9]/g, "");
    if (phoneClean) {
      window.open(`https://wa.me/${phoneClean}?text=${encoded}`, "_blank");
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        role="dialog" 
        aria-labelledby="circle-title" 
        className="w-full max-w-lg rounded-3xl bg-[var(--surface)] p-6 md:p-8 shadow-2xl border border-[var(--border)] space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 id="circle-title" className="text-xl font-bold">Saathi Circle</h2>
              <p className="text-xs text-[var(--foreground)]/70">
                Ask Someone You Trust for calm human assistance
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

        {/* Message Preview Box */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/80">
              Message to Share with Trusted Contact
            </label>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Passwords & OTPs Redacted</span>
            </span>
          </div>

          <textarea
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--background)] py-3 px-4 text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Message"}</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 text-xs font-semibold cursor-pointer shadow-md"
            >
              <Share2 className="h-4 w-4" />
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Trusted Contacts List */}
        <div className="space-y-3 pt-2 border-t border-[var(--border)]">
          <h3 className="text-sm font-bold text-[var(--foreground)]">My Trusted People</h3>
          
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {contacts.map((c) => (
              <div 
                key={c.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-sm"
              >
                <div>
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-xs text-[var(--foreground)]/60 ml-2">({c.relation})</span>
                  {c.phone && <div className="text-xs font-mono text-[var(--foreground)]/70">{c.phone}</div>}
                </div>
                <button
                  onClick={() => handleDeleteContact(c.id)}
                  className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Contact Form */}
          <div className="rounded-2xl bg-[var(--background)] p-4 border border-[var(--border)] space-y-3">
            <span className="text-xs font-semibold text-[var(--foreground)]/80">Add Trusted Person</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Name (e.g. Daughter)"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs focus:outline-none"
              />
              <input
                type="text"
                placeholder="Phone Number (Optional)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddContact}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] text-white py-2.5 text-xs font-semibold cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add to Saathi Circle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
