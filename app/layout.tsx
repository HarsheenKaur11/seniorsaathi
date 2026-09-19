import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "SeniorSaathi — Digital life, made simple.",
  description: "An intelligent, accessible, trustworthy GenAI-powered daily companion for senior citizens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-text-size="standard" data-contrast="standard">
      <body className="antialiased min-h-screen flex flex-col bg-[#FDFBF7] text-zinc-900">
        <Header />
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="bg-emerald-950 text-emerald-200 py-6 px-4 text-center text-sm border-t-2 border-emerald-900">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-medium">
              SeniorSaathi — Digital companion for seniors. Privacy-first & Safe.
            </p>
            <div className="flex items-center gap-4 font-semibold text-amber-300">
              <a href="/privacy" className="hover:underline">Privacy Policy</a>
              <span>•</span>
              <a href="/reminders" className="hover:underline">My Reminders</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
