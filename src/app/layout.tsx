import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EduTrack – Student LMS",
  description: "A modern Learning Management System for students. Track attendance, homework, and academic progress.",
  keywords: ["LMS", "learning management system", "student app", "attendance tracker", "homework diary"],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-[#f5f5f7] antialiased">{children}</body>
    </html>
  );
}
