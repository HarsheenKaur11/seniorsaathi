"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredReminders, saveStoredReminders, ReminderItem } from "@/lib/storage";
import { Bell, Plus, Check, Trash2, Edit3, ArrowLeft, Calendar, Clock, CheckCircle2, Circle } from "lucide-react";

export default function RemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [notificationPermission, setNotificationPermission] = useState<string>("default");

  useEffect(() => {
    setReminders(getStoredReminders());
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
    }
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time) {
      alert("Please fill in the title, date, and time for your reminder.");
      return;
    }

    let updated: ReminderItem[];
    if (editingId) {
      updated = reminders.map((item) =>
        item.id === editingId ? { ...item, title, date, time } : item
      );
      setEditingId(null);
    } else {
      const newItem: ReminderItem = {
        id: Date.now().toString(),
        title: title.trim(),
        date,
        time,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      updated = [newItem, ...reminders];
    }

    setReminders(updated);
    saveStoredReminders(updated);

    // Reset form
    setTitle("");
    setDate("");
    setTime("");
    setShowAddForm(false);
  };

  const handleToggleComplete = (id: string) => {
    const updated = reminders.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setReminders(updated);
    saveStoredReminders(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this reminder?")) {
      const updated = reminders.filter((item) => item.id !== id);
      setReminders(updated);
      saveStoredReminders(updated);
    }
  };

  const handleStartEdit = (item: ReminderItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDate(item.date);
    setTime(item.time);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 rounded-xl font-bold hover:bg-emerald-200 min-h-[48px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h2 className="text-2xl sm:text-3xl font-black text-purple-950 dark:text-purple-200 flex items-center gap-2">
          <Bell className="w-8 h-8 text-purple-600" />
          Reminders
        </h2>
      </div>

      {/* Notification Banner */}
      {notificationPermission !== "granted" && (
        <div className="bg-purple-50 dark:bg-zinc-800 border-2 border-purple-300 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-purple-700" />
            <p className="font-semibold text-purple-950 dark:text-purple-200 text-base sm:text-lg">
              Allow notifications to receive alerts on your phone or computer.
            </p>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-sm min-h-[44px]"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {/* Add Reminder Button / Form */}
      <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-3xl border-3 border-purple-300 dark:border-zinc-700 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-black text-purple-950 dark:text-purple-200">
            {editingId ? "Edit Reminder" : "My Reminders"}
          </h3>
          {!showAddForm && (
            <button
              onClick={() => {
                setEditingId(null);
                setTitle("");
                setDate("");
                setTime("");
                setShowAddForm(true);
              }}
              className="px-5 py-3 bg-purple-700 hover:bg-purple-800 text-white font-black text-lg rounded-2xl flex items-center gap-2 shadow-md min-h-[52px]"
            >
              <Plus className="w-6 h-6" /> Add Reminder
            </button>
          )}
        </div>

        {/* Form Modal / Inline */}
        {showAddForm && (
          <form onSubmit={handleSaveReminder} className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <div className="space-y-2">
              <label className="block font-bold text-lg text-zinc-900 dark:text-white">
                Reminder Title:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Doctor appointment, Take medicine, Pay bill"
                className="w-full h-14 px-4 rounded-xl bg-purple-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold text-lg border-2 border-purple-300 dark:border-zinc-600 focus:outline-hidden focus:ring-4 focus:ring-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-700" /> Date:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-14 px-4 rounded-xl bg-purple-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold text-lg border-2 border-purple-300 dark:border-zinc-600"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-700" /> Time:
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-14 px-4 rounded-xl bg-purple-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold text-lg border-2 border-purple-300 dark:border-zinc-600"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-lg rounded-xl shadow-md min-h-[48px]"
              >
                {editingId ? "Update Reminder" : "Save Reminder"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-lg rounded-xl min-h-[48px]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* List of Reminders */}
        {reminders.length === 0 && !showAddForm ? (
          <div className="p-8 text-center space-y-3 bg-purple-50/50 dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-purple-300">
            <Bell className="w-12 h-12 text-purple-400 mx-auto" />
            <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300">
              No reminders yet.
            </p>
            <p className="text-base text-zinc-500">
              Add one when there’s something important you don’t want to forget!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border-2 transition-all flex flex-wrap items-center justify-between gap-4 ${
                  item.completed
                    ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 opacity-60 line-through"
                    : "bg-purple-50/60 dark:bg-zinc-900 border-purple-200 dark:border-zinc-700 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleComplete(item.id)}
                    aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                    className="p-1 rounded-full text-purple-700 min-w-[40px] min-h-[40px] flex items-center justify-center"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    ) : (
                      <Circle className="w-8 h-8 text-purple-400 hover:text-purple-600" />
                    )}
                  </button>

                  <div>
                    <h4 className="text-xl font-black text-zinc-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-base font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-3">
                      <span>📅 {item.date}</span>
                      <span>⏰ {item.time}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-3 bg-purple-100 hover:bg-purple-200 dark:bg-zinc-800 text-purple-800 dark:text-purple-300 rounded-xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Edit"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-3 bg-red-100 hover:bg-red-200 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Delete"
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
