import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Growdex AI App",
  description: "Increase efficiency & automate your multi platform campaigns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-hidden">
      <body
        className="antialiased"
      >
        <main>{children}</main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
