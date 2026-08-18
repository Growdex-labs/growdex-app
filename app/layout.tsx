import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { isAnalyticsEnabled } from "@/lib/analytics";
import Providers from "./providers";

const lexend = localFont({
  src: [
    {
      path: "../public/fonts/gilroy/Gilroy-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/gilroy/Gilroy-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/gilroy/Gilroy-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/gilroy/Gilroy-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
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
        {isAnalyticsEnabled() && (
          <Script
            src="https://app.rybbit.io/api/script.js"
            data-site-id="bdb1f1da5e57"
            data-mask-patterns='["/panel/campaigns/**","/panel/billing/budget/**"]'
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
