import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileWrapper from "@/components/layout/MobileWrapper";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Klasszy – Student LMS",
  description: "A modern Learning Management System for students. Track attendance, homework, and academic progress.",
  keywords: ["LMS", "learning management system", "student app", "attendance tracker", "homework diary", "Klasszy"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-[#f5f5f7] antialiased">
        <MobileWrapper>
          {children}
        </MobileWrapper>
      </body>
    </html>
  );
}
