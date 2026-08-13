import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-sans",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Growdex AI App",
  description:
    "Increase efficiency & automate your multi Ad platform campaigns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body className="antialiased">
        <Providers>
          <main>{children}</main>
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
