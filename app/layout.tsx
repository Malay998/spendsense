import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpendSense — Make money make sense",
  description: "A calmer, smarter money dashboard built for student life.",
  applicationName: "SpendSense",
  keywords: ["student finance", "expense tracker", "budget planner", "personal finance"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><ThemeProvider>{children}</ThemeProvider></body></html>;
}
