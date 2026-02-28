import type { Metadata } from "next";
import "./globals.css";
import { DM_Mono, Syne } from "next/font/google";

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
});

const syne = Syne({
  weight: ['700', '800'],
  subsets: ['latin'],
  variable: '--font-syne',
});

export const metadata: Metadata = {
  title: "Nutrition Tracker",
  description: "Track your daily nutrition with AI",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmMono.variable} ${syne.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
