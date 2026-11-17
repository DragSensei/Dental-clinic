import { Suspense, type ReactNode } from "react";
import { AppTopBar } from "@/components/app-top-bar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<header className="sticky top-0 z-50 h-14 w-full border-b border-border bg-background/95" />}>
        <AppTopBar />
      </Suspense>
      {children}
    </>
  );
}
