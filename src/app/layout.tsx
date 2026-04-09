import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CompanyDataProvider } from "@/lib/company-data";
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
  title: "WorkflowAI Intelligence — Company AI Readiness Platform",
  description: "Map your organization, find AI workflow opportunities, and build an implementation roadmap.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full"><CompanyDataProvider>{children}</CompanyDataProvider></body>
    </html>
  );
}
