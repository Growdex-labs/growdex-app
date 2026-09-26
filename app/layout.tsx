import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { isAnalyticsEnabled } from "@/lib/analytics";
import { APP_TITLE } from "@/lib/site-metadata";
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

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.growdex.ai";
const previewImage = new URL("/growdex-link-preview.png", appUrl).toString();
const previewImage = new URL("/opengraph-image.png", appUrl).toString();
const title = "Growdex-The Smart Ad Management tool for Modern Businesses";
const description =
  "Create, launch, manage, and optimize Meta and TikTok campaigns from one intelligent platform.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { absolute: APP_TITLE },
  applicationName: APP_TITLE,
  description,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    title: APP_TITLE,
  },
  openGraph: {
    title: APP_TITLE,
    description,
    url: appUrl,
    siteName: "Growdex",
    type: "website",
    images: [
      {
        url: previewImage,
        secureUrl: previewImage,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: description,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description,
    images: [previewImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lexend.variable}>
      <head>
        {isAnalyticsEnabled() && (
          <>
            <Script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-FKRPJZZ7X8"
              strategy="afterInteractive"
            />
            <Script id="google-tag" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', 'G-FKRPJZZ7X8', { send_page_view: false });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="antialiased">
        <Providers>
          <main>{children}</main>
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
