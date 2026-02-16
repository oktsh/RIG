import type { Metadata } from "next";
import { Inter, Space_Mono } from 'next/font/google'
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "RIG — Reactive Intelligence Gateway",
  description: "Orchestrate Intelligence. Build, deploy, and orchestrate autonomous AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
      <body className="font-sans bg-neural-bg text-text-primary antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
