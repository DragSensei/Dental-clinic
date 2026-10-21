import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { SiteNav } from "@/shared/components/site-nav";
import { SiteFooter } from "@/shared/components/site-footer";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { LocaleProvider } from "@/shared/i18n/locale-provider";
import "./globals.css";

const themeInitScript = `try{const s=localStorage.getItem("dental-demo-theme");const t=s==="dark"||s==="light"?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.dataset.theme=t}catch{const t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.dataset.theme=t}`;

export const metadata: Metadata = {
  title: "Dental care, made easier",
  description: "A welcoming preview of a simpler dental appointment booking experience.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-US"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">{themeInitScript}</Script>
        <LocaleProvider>
          <ThemeProvider>
            <SiteNav />
            {children}
            <SiteFooter />
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
