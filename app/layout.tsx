import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CRMProvider } from "@/lib/store";
import { SidebarNav } from "@/components/SidebarNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Friends of Finance Activity CRM",
  description:
    "Community Intelligence Without the Sales Pitch. Track activity, identify follow-ups, and suggest human-reviewed next actions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
        <CRMProvider>
          <div className="flex w-full min-h-screen">
            <SidebarNav />
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              {children}
            </main>
          </div>
        </CRMProvider>
      </body>
    </html>
  );
}
