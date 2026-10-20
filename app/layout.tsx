import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpendSense — Make money make sense",
  description: "A calmer, smarter money dashboard built for student life.",
  applicationName: "SpendSense"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
