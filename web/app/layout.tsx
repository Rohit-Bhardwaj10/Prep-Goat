import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PREP-G | Master System Design",
    template: "%s | PREP-G",
  },
  description: "Master system design patterns and ace your technical interview. Practice canonical system design problems with instant AI-powered feedback.",
  keywords: ["System Design", "Interview Prep", "Software Engineering", "FAANG", "LLD", "HLD", "Architecture"],
  authors: [{ name: "PREP-G Team" }],
  creator: "PREP-G",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prepg.com",
    title: "PREP-G | Master System Design",
    description: "Master system design patterns and ace your technical interview with instant AI feedback.",
    siteName: "PREP-G",
  },
  twitter: {
    card: "summary_large_image",
    title: "PREP-G | Master System Design",
    description: "Master system design patterns and ace your technical interview with instant AI feedback.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

import { PostHogProvider } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white selection:bg-white/20 font-sans">
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
