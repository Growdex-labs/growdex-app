import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";

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
    <html lang="en" className={lexend.variable}>
      <body className="antialiased">
        <Providers>
          <main>{children}</main>
        </Providers>
        <Toaster position="top-center" richColors />
        <Script
          src="https://rybbit.cyberverse.cloud/api/script.js"
          data-site-id="050370fdb8f7"
          data-mask-patterns='["/panel/campaigns/**","/panel/billing/budget/**"]'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
