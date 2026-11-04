import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Cormorant_Garamond, Manrope, Amiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/i18n/locale-provider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-display-latin",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-latin",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["700"],
  variable: "--font-display-arabic",
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-body-arabic",
  display: "swap",
});

const themeInitScript = `try{const s=localStorage.getItem("dental-demo-theme");const t=s==="dark"||s==="light"?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.dataset.theme=t}catch{const t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.dataset.theme=t}`;

export const metadata: Metadata = {
  title: "Dental care, made easier",
  description: "A welcoming preview of a simpler dental appointment booking experience.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-US"
      className={`${cormorant.variable} ${manrope.variable} ${amiri.variable} ${ibmPlexArabic.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-body">
        <Script id="theme-init" strategy="beforeInteractive">{themeInitScript}</Script>
        <LocaleProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
