export type TextSize = "standard" | "large" | "xlarge";
export type ContrastMode = "standard" | "high";
export type Language = "English" | "Hindi" | "Punjabi";

export interface AccessibilitySettings {
  textSize: TextSize;
  contrast: ContrastMode;
  simplified: boolean;
  autoReadAloud: boolean;
  language: Language;
}

export interface ReminderItem {
  id: string;
  title: string;
  date: string;
  time: string;
  completed: boolean;
  createdAt: string;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  type: "simplify" | "safety" | "guide" | "ask";
  timestamp: string;
}

const SETTINGS_KEY = "seniorsaathi_accessibility_settings";
const REMINDERS_KEY = "seniorsaathi_reminders";
const RECENT_KEY = "seniorsaathi_recent_activity";

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  textSize: "standard",
  contrast: "standard",
  simplified: false,
  autoReadAloud: false,
  language: "English",
};

export function getStoredSettings(): AccessibilitySettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AccessibilitySettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applyDOMAccessibilitySettings(settings);
  } catch (e) {
    console.error("Could not save accessibility settings:", e);
  }
}

export function applyDOMAccessibilitySettings(settings: AccessibilitySettings): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-text-size", settings.textSize);
  root.setAttribute("data-contrast", settings.contrast);
  root.setAttribute("data-simplified", settings.simplified ? "true" : "false");
}

export function getStoredReminders(): ReminderItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredReminders(reminders: ReminderItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error("Could not save reminders:", e);
  }
}

export function getStoredRecentActivities(): RecentActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addRecentActivity(title: string, type: "simplify" | "safety" | "guide" | "ask"): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredRecentActivities();
    const newItem: RecentActivityItem = {
      id: Date.now().toString(),
      title,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [newItem, ...existing.filter(item => item.title !== title)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Could not add recent activity:", e);
  }
}

export function clearAllPreferences(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(REMINDERS_KEY);
    localStorage.removeItem(RECENT_KEY);
    applyDOMAccessibilitySettings(DEFAULT_SETTINGS);
  } catch (e) {
    console.error("Could not clear preferences:", e);
  }
}
