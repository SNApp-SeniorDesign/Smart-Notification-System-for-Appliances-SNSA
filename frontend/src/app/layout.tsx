import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UseDialSign } from "@/components/useComp/UseDialSign";
import {UseDeleteButton} from "@/components/useComp/UseDeleteButton"
import {UseDialLog} from "@/components/useComp/UseDialLog"
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Notification System for Appliances (SNSA)",
  description: "SNSA is a smart notification system for appliances that provides users with real-time updates and alerts about their appliances' status and performance. It helps users stay informed about their appliances' health, energy consumption, and maintenance needs, allowing them to optimize their usage and reduce energy costs.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}
        < UseDialSign />
        < UseDialLog />
        < UseDeleteButton />
        < Toaster />
      </body>
    </html>
  );
}
