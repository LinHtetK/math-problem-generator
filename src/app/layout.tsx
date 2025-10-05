import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Math Problem Generator",
  description: "AI-powered math problem generator for Primary 5 students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
