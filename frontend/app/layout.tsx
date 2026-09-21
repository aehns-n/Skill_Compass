import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PrototypeProvider } from "@/context/PrototypeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillCompass — Know the gap. Learn what matters. Measure the growth.",
  description:
    "AI Competency Intelligence & Adaptive Learning Platform (frontend prototype)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrototypeProvider>{children}</PrototypeProvider>
      </body>
    </html>
  );
}
